# Build and test

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 22+ | Uses `--experimental-sqlite` natively. |
| Docker | 24+ | With Compose v2 (`docker compose`, not `docker-compose`). |
| Playwright browsers | latest | `npx playwright install --with-deps` (one-time). |

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

# 6. End-to-end suite
npx playwright test --reporter=line

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
npx playwright test e2e/03-problem-page.spec.js          # single file
npx playwright test -g "invalid JSON"                    # by test name
npx playwright test --workers=1                          # serial, easier to debug
npx playwright show-trace test-results/<dir>/trace.zip   # post-mortem
```

E2E tests assume:
- Frontend at `http://localhost:8080`.
- Backend at `http://localhost:9090` with `ALGOTUTOR_E2E=1` (which exposes
  `/api/state/reset` for `clearStorage` in `e2e/helpers.js`).

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
| `node backend/acceptance-all.mjs` | Run the reference solution for every problem against the live runner in every supported language. |
| `node backend/sweep-rust.mjs` / `sweep-go.mjs` | Stress-run a single language across the dataset, surfacing slow / failing items. |

These do not run in CI by default but are the right tool when you've changed
the harness code-gen or runner shell.

## When tests fail

See [`debugging-playbook.md`](./debugging-playbook.md).
