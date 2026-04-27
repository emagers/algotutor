# Build and test

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 22+ | Uses `--experimental-sqlite` natively. |
| Docker | 24+ | With Compose v2 (`docker compose`, not `docker-compose`). |
| Playwright + browsers | latest | `npm install` + `./node_modules/.bin/playwright install chromium` (one-time). |

⚠ **Do not use `npx playwright …`** for tests — if `@playwright/test` isn't
already in `node_modules`, npx will silently prompt to install the standalone
`playwright` package each invocation, which hangs in non-TTY shells with no
visible output. Always use the locally installed binary
(`./node_modules/.bin/playwright …`) or the `npm run e2e` script.

No global Rust or Go install is needed; both toolchains live inside the
backend container image (`Dockerfile`).

## NPM scripts (canonical)

| Script | What it does |
|---|---|
| `npm run build` | Regenerate `docs/questions/*.json` + `docs/index.json` from `docs/phase*-questions.mjs` and `docs/solutions.mjs`. |
| `npm test` | Run all reference solutions against all dataset tests (1647 currently). Pure Node, no Docker. |
| `npm run serve` | Serve `docs/` at `http://localhost:8080` *without* Docker (frontend only; Rust/Go execution will be unavailable). |
| `npm run up` | `docker compose up -d` for the full stack. Prints the URLs. Creates `data/` if missing. |
| `npm run down` | Stop the stack. |
| `npm run logs` | Tail Docker logs. |
| `npm run backend:up` / `:down` / `:logs` | Backend-only equivalents. |
| `npm run e2e` | Bring stack up (with `ALGOTUTOR_E2E=1`) and run Playwright. |
| `npm run e2e:up` | Bring stack up only, in E2E mode. |

## Standard workflow for a code change

```bash
# 1. Sanity baseline
npm test                         # confirm 1647/1647 before touching anything

# 2. Make changes...

# 3. Rebuild dataset if you touched phase files or solutions.mjs
npm run build

# 4. Re-run the dataset tests
npm test                         # MUST stay green

# 5. Bring up Docker stack
npm run up

# 6. End-to-end suite (the script also recreates the backend with E2E=1
#    if it was started without that env var — see "E2E preflight" below).
npm run e2e

# 7. Tear down
npm run down
```

## Targeted dataset testing

```bash
node docs/run-tests.mjs --filter=two-sum         # one problem
node docs/run-tests.mjs --category=stress        # only stress tests across all problems
node docs/run-tests.mjs --filter=word-break --category=example
```

## Targeted E2E

```bash
./node_modules/.bin/playwright test e2e/03-problem-page.spec.js   # single file
./node_modules/.bin/playwright test -g "invalid JSON"             # by test name
./node_modules/.bin/playwright show-trace test-results/<dir>/trace.zip
```

The Playwright config already pins `workers: 1` and `fullyParallel: false`
because all tests share the single backend SQLite DB and use
`/api/state/reset` to isolate state. Don't try to parallelize unless you
also shard the backend.

## E2E preflight (`npm run e2e`)

`npm run e2e` runs `e2e/ensure-stack.mjs` first. That helper:
1. `docker compose up -d` with `ALGOTUTOR_E2E=1`.
2. Probes the backend container's actual env: `echo $ALGOTUTOR_E2E`.
3. If it isn't `1` (e.g., the stack was previously brought up without the
   flag), force-recreates the backend with the flag set.

This guards the most painful silent failure mode in the suite:
`/api/state/reset` returns 403 without `ALGOTUTOR_E2E=1`, so `clearStorage`
in `e2e/helpers.js` is a no-op, tests bleed state into each other, and
half the suite mysteriously fails. **Always check docker state matches
what you expect before running E2E.**

E2E tests assume:
- Frontend at `http://localhost:8080`.
- Backend at `http://localhost:9090` with `ALGOTUTOR_E2E=1`.
- Playwright + Chromium installed locally (`./node_modules/.bin/playwright install chromium`).

## Backend-only iteration

If you're iterating on backend code with hot reload:

```bash
npm run backend:up
docker compose logs -f algotutor-backend
# Edit backend/*.mjs — bind mount picks up changes; restart container if needed:
docker compose restart algotutor-backend
```

The frontend container bind-mounts `docs/` read-only, so HTML / JS / CSS edits
are picked up on page refresh without restart.

## Build the backend image

```bash
npm run backend:build       # docker compose build
```

The image pre-builds Rust dependencies (serde) into the cargo target dir so
cold compiles in user containers don't take ~30s. The named volume
`rust-target` is populated from this image on first run — if you change the
crate dependencies, you must `docker compose down -v` to drop the volume so
the new image's pre-built target gets re-seeded.

## Smoke / acceptance / sweep tools

These live in `backend/` and validate the runner end-to-end against the
dataset:

| Script | Purpose |
|---|---|
| `node backend/smoke.mjs` | Quick JS-runner sanity check on a few problems. |
| `node backend/smoke-rust.mjs` | Same for the Rust path. |
| `node backend/acceptance-all.mjs` | Run the reference solution for every problem-archetype against the live runner in every supported language. Covers all signature kinds: function, mutation, design, codec round-trip, GraphRepr, RandomList. |
| `node backend/sweep-all.mjs` | Generate a default-returning stub for every problem × every language (600 pairs) and confirm each one compiles + runs end-to-end through the backend. |
| `node backend/sweep-rust.mjs` / `sweep-go.mjs` | Per-language version of the sweep. |

These do not run in CI by default but are the right tool when you've changed
the harness code-gen or runner shell.

## Validation gates

Before declaring any change "done", all four must be green. This is the
canonical happy-path sequence; copy it into PR descriptions verbatim.

```bash
npm test                          # 1647/1647 dataset tests
node backend/sweep-all.mjs        # 600/600 problem-language pairs
node backend/acceptance-all.mjs   # 39/39 reference solutions
npm run e2e                       # all Playwright specs (≈35s)
```

## When tests fail

See [`debugging-playbook.md`](./debugging-playbook.md).
