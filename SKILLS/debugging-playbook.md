# Debugging playbook

Common failure modes, in rough order of how often they bite.

## Symptom: `npm test` fails after editing a problem

1. Did you regenerate? `npm run build` first; the JSON file is generated.
2. Reference solution mismatch — the build runs your reference solution to
   produce `expected output`. If the solution is wrong, every test will
   "pass" against itself but a *different* correct solution will fail.
   Spot-check the generated `output` field manually for a small case.
3. New adapter or comparator? Make sure it's registered in
   `docs/runtime.mjs` AND in `backend/harness/js/runtime.mjs` AND in the
   per-language harness runtimes.

## Symptom: Frontend shows "Loading problem…" forever

Almost always a JS exception during `init()` in `app/pages/problem.js`.

```sh
# Watch the browser console:
npx playwright test --headed --debug e2e/03-problem-page.spec.js
# Or open Chrome DevTools on http://localhost:8080/problem.html?id=<slug>
```

Usual culprits:
- Variable referenced in an `innerHTML` template that no longer exists
  (e.g., the `${sources}` regression after the trademark scrub).
- A re-render after `init()` blew away an element that another setup
  function holds a reference to (e.g., `renderProblem` overwriting
  `#problem-head` and destroying the collapse button — the
  `setupCollapseAndResize` function then threw a null-deref).
- `lessonContent[tag]` undefined for a brand-new tag.

**Diagnostic snippet** (drop into `_diag.mjs` and run with `node`):

```js
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message, e.stack));
page.on("console", (m) => console.log(`[${m.type()}]`, m.text()));
await page.goto("http://localhost:8080/problem.html?id=two-sum");
await page.waitForTimeout(2000);
await browser.close();
```

## Symptom: E2E suite times out on every test after frontend changes

Usually an exception in the page's `init()` (see above) — Playwright
can't find the elements it expects because the page never finishes
loading. Run the diagnostic snippet first; once the page renders cleanly,
re-run E2E.

## Symptom: Rust submission fails with `__HARNESS_PARSE_ERROR__: missing field "input"`

The harness expects test inputs as a JSON-encoded array of objects with a
top-level `input` field. If the orchestrator is sending the user's *value*
where the harness expects `{"input": <value>}`, you'll see this.

Check `backend/languages/rust.mjs` and the generator —
`generateRustHarness` constructs the test stream; both sides must agree.

## Symptom: Rust panics with `SyntaxError: Unexpected identifier 'std'`

That message is the JS *worker's* parser, not Rust. It means the orchestrator
fell back to the JS path even though the user picked Rust. Most common cause:
the language tab UI didn't flush before the user clicked Run. Verify
`runner.js` is dispatching by `currentLang`, not a stale captured variable.

## Symptom: `cargo build` cold-start takes 30+ seconds in user submissions

The named Docker volume `rust-target` was nuked. Restore it with a fresh
backend image build:

```sh
docker compose down -v          # destroys volumes — user state lost from data/!
                                # (use `docker volume rm algotutor_rust-target` to be surgical)
npm run backend:build
npm run up
```

The image bakes `serde` into the target on build; the volume is seeded from
the image on first container start.

## Symptom: Tests pass locally but fail in Docker (or vice versa)

Path resolution. The runner picks paths conditionally:

```js
const RUNNER_DIR = existsSync("/work/backend/runner/rust")
  ? "/work/backend/runner/rust"
  : resolve(__dirname, "..", "runner", "rust");
```

If you added a new resource, mirror this pattern.

## Symptom: SQLite "database is locked"

Another process holds a write transaction. Most often:
- A previous backend container didn't shut down cleanly. `docker compose
  down`, wait 2s, `npm run up`.
- You ran `npm run backend:start` (host-side) while a backend container is
  still up — both are writing to the same DB. Stop one.

## Symptom: Stale frontend after editing `docs/app/*.js`

The frontend container bind-mounts `docs/` — the fresh file is served, but
the *browser* may have cached the JS module.
- Hard reload (Ctrl+F5).
- In Playwright tests, `page.goto` is a fresh load every time; not the issue.
- If you edited `index.html` itself, ditto.

## Symptom: Trademark regression

Before declaring done, always:

```sh
rg -i "leetcode|neetcode|blind ?75|grind ?75|algoexpert|top interview" \
   --glob '!node_modules' --glob '!data' --glob '!test-results'
```

Should be empty. If a result is in `SKILLS/project-conventions.md` itself,
that's expected (the rule references the names so it can ban them).

## When stuck: read the relevant skill

| Problem area | Skill |
|---|---|
| Build / tests / commands | `build-and-test.md` |
| Adding/editing problems | `adding-a-problem.md`, `new-problem-requirements.md` |
| Language plumbing | `adding-a-language.md`, `backend-conventions.md` |
| UI behavior | `frontend-conventions.md` |
| Hard rules / scope creep | `project-conventions.md` |
