# Project conventions — hard rules

These are the invariants that have been earned through prior iterations.
Violating one of these will almost certainly require reverting.

## 1. No trademarked or copyrighted names — anywhere

The codebase must not mention third-party platforms or curated lists by name.
This includes (non-exhaustive): LeetCode, NeetCode, Blind 75, Grind 75,
AlgoExpert, "Top Interview 150", and similar. This rule applies to:

- Problem JSONs (`docs/questions/*.json`)
- Phase source files (`docs/phase*-questions.mjs`)
- Test data (input/output values)
- Source code comments
- README, SCHEMA, in-repo docs
- Frontend strings

If you must reference a third-party data source in a one-shot maintenance
script (e.g., to import video links), keep the script *outside the committed
codebase* (run it locally, commit only the resulting data file).

**Verification command:**
```sh
rg -i "leetcode|neetcode|blind ?75|grind ?75|algoexpert" --glob '!node_modules' --glob '!data'
```
Should return zero matches.

## 2. Problem numbers are sequential 1..200 and decoupled from any source

- IDs (`id`) are stable kebab-case slugs (e.g., `two-sum`).
- Numbers (`number`) are derived deterministically (currently alphabetical by id).
- **User-visible state is keyed by slug**, not by number, so renumbering never
  breaks progress data.
- The field is `number` in source files, JSONs, and the index. The legacy name
  was `leetcode_number` — do not reintroduce it.

## 3. Frontend is vanilla JS + CSS only

- No build step for the frontend. No bundler, no transpiler, no framework.
- ES modules served as-is by `docs/serve.mjs`.
- Allowed dependencies: CodeMirror 6 (already vendored). That's it.
- No CDN-required scripts (the app must work on a fully air-gapped localhost).
- No analytics, telemetry, error reporting.

## 4. State is local, not user-bound

- No accounts, no logins, no auth.
- All state (submissions, drafts, language preference, UI collapse state) is
  stored on disk in the local SQLite DB or in `localStorage`.
- The DB is mounted into the backend container at `data/algotutor.db`. If it
  doesn't exist, `npm run up` creates and migrates it.

## 5. Runtime sandbox: stdlib only, single-process timeouts

- User code in Rust/Go is compiled with **no third-party crates / modules**
  permitted. The runner harness is the only generated boilerplate.
- Each compile/run is wrapped in a hard timeout (`COMPILE_TIMEOUT_MS`,
  `RUN_TIMEOUT_MS` in `backend/languages/<lang>.mjs`).
- Per-language work is *serialized* server-side (`serialized(fn)` chain) to
  avoid racing on the shared cargo target / go cache.

## 6. Don't reveal the optimal solution before the user submits

- The "Optimal complexity" panel shows only `time` and `space` — it must NOT
  show the approach name, hints about data structures, or pseudocode. Those
  are revealed only on the submission summary page.
- Hints are shown collapsed; user must click to reveal each one.

## 7. Commits

- Always include the trailer:
  ```
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

## 8. Style

- Comment only what needs clarification. Don't narrate every line.
- Prefer ecosystem tools (npm, cargo, etc.) over hand-rolled pipelines.

## 9. Verification before declaring "done"

A change is not done until:
1. `npm run build` succeeds (if you touched the dataset or phase files).
2. `npm test` shows `1647 passed, 0 failed` (or the new total after adding problems).
3. Docker stack comes up (`npm run up`) and frontend at `http://localhost:8080` returns 200.
4. `npx playwright test` is green.
5. A grep for trademarked names returns no matches.
