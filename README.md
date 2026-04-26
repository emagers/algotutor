# AlgoTutor

A local interview-prep web app for the top 200 programming interview questions, with **JavaScript / Rust / Go** code execution against a comprehensive test suite.

- 200 problems, 1647 tests (examples + edge + stress).
- Vanilla JS frontend with CodeMirror 6 syntax highlighting.
- Local Docker-backed runner for Rust and Go (real `cargo`/`go` toolchains, std-lib only).
- Submissions, code drafts, and progress persisted to a SQLite database on disk.
- Headless E2E suite (Playwright) covering every interactive flow.

## Quick start

```sh
git clone <this repo>
cd algotutor
npm install              # one-time: pulls Playwright (only used for tests)
npm run up               # build + start the stack
```

Once `npm run up` finishes you'll see:

```
  AlgoTutor is running:
    Frontend  http://localhost:8080
    Backend   http://localhost:9090/api/health
    Database  ./data/algotutor.db
```

Open <http://localhost:8080> and start solving.

To stop:

```sh
npm run down
```

## Prerequisites

| Tool           | Version          | Notes                                           |
| -------------- | ---------------- | ----------------------------------------------- |
| Docker         | 24+              | With Compose v2 (`docker compose`, not `docker-compose`). |
| Node.js        | 22.x             | Only needed if you want to run dev tools / tests on the host. |
| ~3 GB free disk | for image + caches | Rust toolchain and pre-warmed cargo target are heavy.        |

The first `npm run up` builds a Docker image with `rustc`, `cargo`, `go`, and Node 22 inside, plus a pre-cached `serde`/`serde_json` Rust target for fast cold-start compiles. Expect 3–5 minutes the first time; subsequent starts are seconds.

## Architecture

```
┌─────────────────────────┐        ┌─────────────────────────────────┐
│  Browser (localhost:8080) │        │  Backend container (:9090)      │
│  ─────────────────────  │        │  ─────────────────────────────  │
│  Vanilla JS + CodeMirror │  HTTP  │  Node 22 HTTP server            │
│  Web Worker for JS exec  │ ◄────► │   POST /api/run                 │
│                          │        │     spawns rustc / go / node    │
│                          │        │   GET /api/state, etc.          │
│                          │        │     SQLite at /work/data/       │
└─────────────────────────┘        └─────────────────────────────────┘
        │                                            │
        │     served by docs/serve.mjs               │  bind-mount
        ▼                                            ▼
   docs/ (static)                            ./data/algotutor.db
```

- **Frontend container** (`Dockerfile.frontend`) — Node-based static server for `docs/`.
- **Backend container** (`Dockerfile`) — full Rust + Go + Node toolchain. Compiles user code per submission, runs it against the dataset's tests, returns per-test pass/fail/time.
- **State** is stored exclusively in the backend's SQLite DB (`progress`, `code` drafts per (slug, lang), `submissions`, `settings`). The frontend has no persistent state — clearing your browser data won't lose anything.

## Project layout

```
algotutor/
├── Dockerfile             # Backend image (Rust + Go + Node)
├── Dockerfile.frontend    # Frontend image (static server)
├── docker-compose.yml
├── docs/                  # Frontend
│   ├── index.html         # Landing
│   ├── problems.html      # Problem list
│   ├── problem.html       # Problem detail + editor
│   ├── submission.html    # Submission results
│   ├── lessons.html       # Topic overview
│   ├── lesson.html        # Per-topic detail
│   ├── app/               # Vanilla JS modules
│   │   ├── pages/         # one module per page
│   │   ├── editor.js      # CodeMirror wrapper
│   │   ├── runner.js      # JS dispatcher (worker / backend)
│   │   ├── worker.js      # In-browser JS test runner
│   │   ├── backend.js     # Backend HTTP client
│   │   ├── storage.js     # State client (calls /api/state)
│   │   └── data.js        # Loads dataset + index
│   ├── questions/         # 200 question JSON files
│   ├── dataset.json       # Aggregated index (built from questions/)
│   ├── build-dataset.mjs  # Regenerates dataset.json
│   └── run-tests.mjs      # Runs the dataset's reference solutions
├── backend/
│   ├── server.mjs         # HTTP server, routes
│   ├── db.mjs             # SQLite layer (node:sqlite)
│   ├── languages/         # Per-language runners
│   │   ├── javascript.mjs
│   │   ├── rust.mjs
│   │   └── go.mjs
│   ├── runner/rust/       # Rust runner cargo project (pre-built in image)
│   ├── runner/go/         # Go runner module
│   └── sweep-all.mjs      # 200 × 3 lang sweep harness
├── data/                  # SQLite database (gitignored)
├── e2e/                   # Playwright tests
└── playwright.config.js
```

## NPM scripts

| Script              | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `npm run up`        | Build (if needed) and start frontend + backend.      |
| `npm run down`      | Stop and remove containers.                          |
| `npm run logs`      | Tail logs for both services.                         |
| `npm run e2e:up`    | Start the stack with the test-only reset endpoint enabled. |
| `npm run e2e`       | Run the Playwright E2E suite (autostarts the stack). |
| `npm test`          | Run the dataset's reference-solution tests (1647 cases). |
| `npm run build`     | Regenerate `docs/dataset.json` from `docs/questions/`. |
| `npm run serve`     | Run the static frontend server outside Docker.       |
| `npm run backend:start` | Run the backend on the host (needs Node 22 + Rust + Go). |

## Development

### Edit the frontend

The compose file bind-mounts `./docs` into the frontend container as read-only, so any change to HTML/JS/CSS is picked up on the next page reload — **no rebuild needed**. Cache is disabled by `serve.mjs` to keep this snappy.

### Edit the backend

`./backend` is bind-mounted into the backend container too. To pick up source changes:

```sh
docker compose restart algotutor-backend
```

Prefer this to a full rebuild — restart is ~2s, rebuild is minutes (it re-pulls the Rust toolchain layer).

### Add or edit a problem

Each problem is a JSON file in `docs/questions/<slug>.json`. Schema lives implicitly in the existing files; the easiest way to add one is to copy a problem of similar shape and adjust:

- `id`, `title`, `number`, `difficulty`, `categories`
- `prompt`, `examples`, `constraints`, `hints`
- `optimal` (`time`, `space`)
- `signature` — function name, parameters, types per language
- `tests` — array of `{ name, category, input, output }`
- `referenceSolutions` (used by `npm test`)

Then run:

```sh
npm run build       # regenerates docs/dataset.json
npm test            # validates reference solutions
```

### Running the full validation matrix

```sh
node backend/sweep-all.mjs
```

This generates a typed stub for every (problem × language) pair and verifies the backend can compile and run all 590 of them.

### Running the headless suite

```sh
npm run e2e         # one-shot run; spins up the stack with reset enabled
```

### Resetting your data

```sh
npm run down
rm -rf data/        # nuke the SQLite store
npm run up
```

Or, with the stack already up and `ALGOTUTOR_E2E=1` set:

```sh
curl -X POST -H "x-algotutor-test: 1" http://localhost:9090/api/state/reset
```

## How code execution works

### JavaScript

Runs in a Web Worker in the browser — no backend round trip. Fast and sandboxed by the browser. Covers all 200 problems.

### Rust / Go

Goes to the backend. The backend wraps your function in a typed harness, builds it with the real toolchain (single shared `cargo target/` per problem, hot recompile = re-link only), and runs it once per test serialized inside that single binary. Stdout JSON lines per test → adapted to the same shape JS uses, so the submission UI is language-agnostic.

5 problems are marked `backendUnsupported` (custom data structure semantics that don't round-trip cleanly through JSON) — those show a warning and only support JS.

## Security notes

This is a localhost-only single-user dev tool. That said:

- CORS is locked to `http://localhost:8080` and `http://127.0.0.1:8080` — random sites you visit can't read or write your AlgoTutor state.
- The reset endpoint is double-gated: requires `ALGOTUTOR_E2E=1` env AND an `x-algotutor-test: 1` header. The custom header forces a CORS preflight that foreign origins can't pass.
- User code runs **inside the backend container** with the full Rust/Go toolchain. There's no extra sandbox — don't paste hostile code into the editor.

## Troubleshooting

| Symptom                                              | Fix                                                   |
| ---------------------------------------------------- | ----------------------------------------------------- |
| `npm run up` says ports are in use                   | Kill what's on `:8080` / `:9090`, or change them in `docker-compose.yml`. |
| Custom-input "Error: missing field input"            | The backend expects test-shaped JSON. The frontend now wraps automatically; pull latest. |
| Rust compile errors in green-path tests              | First Rust submission per cold-start container takes ~5s for serde to link. Subsequent runs are ~1s. |
| Submission page says "No submission found"          | The submit didn't finish — check `npm run logs algotutor-backend`. |
| `npm run e2e` resets fail with 403                   | You ran with `npm run up` instead of `npm run e2e:up`. The reset endpoint requires `ALGOTUTOR_E2E=1`. |

## License

This project is released into the public domain under [The Unlicense](./UNLICENSE).
You are free to copy, modify, publish, use, compile, sell, or distribute
this software for any purpose, commercial or non-commercial, without
restriction or attribution.
