# Backend conventions

All backend code lives under `backend/`. Single Node.js HTTP server, no web
framework.

## Layout

```
backend/
├── server.mjs                       # HTTP entry point; routes /api/*
├── db.mjs                           # SQLite (uses node --experimental-sqlite)
├── languages/                       # one module per supported language
│   ├── javascript.mjs               # in-process; uses Worker
│   ├── rust.mjs                     # spawns cargo
│   ├── go.mjs                       # spawns go run
│   └── metrics.mjs                  # CPU / RSS sampling
├── harness/                         # code-gen + static runtime helpers
│   ├── generate-rust.mjs
│   ├── generate-go.mjs
│   ├── js/runtime.mjs               # adapters + comparators
│   ├── rust/                        # static Rust support code
│   └── go/                          # static Go support code
├── runner/                          # the actual projects that get compiled
│   ├── rust/                        # Cargo project (Cargo.toml + src/)
│   └── go/                          # Go module
├── smoke*.mjs                       # quick sanity scripts
├── acceptance-*.mjs                 # full-dataset acceptance per language
└── sweep-*.mjs                      # stress sweeps per language
```

## API surface

```
GET  /api/health                  → { ok: true, languages: [...] }
POST /api/run                     → run user code on one custom input
POST /api/submit                  → run user code on every test for a problem
GET  /api/state                   → load all UI state for the implicit user
POST /api/state/code              → upsert a (slug, lang, code) draft
POST /api/state/lang              → set the global last-selected language
POST /api/state/submission        → save a submission
POST /api/state/reset             → wipe state (E2E only; gated by ALGOTUTOR_E2E)
```

The "user" is implicit — there's no auth — and the DB has effectively one
record per key. Fine for a localhost-only dev tool.

## Hard rules

### 1. Serialize per-language work

All long-running work for a given language MUST go through the
`serialized(fn)` wrapper at the top of each `languages/<lang>.mjs`. Two
parallel `cargo build` invocations against the same target dir corrupt the
target.

### 2. Always set timeouts

Every `spawn` must have a `timeoutMs`. The accepted constants:

- `COMPILE_TIMEOUT_MS = 60_000`
- `RUN_TIMEOUT_MS = 25_000`

If the timeout fires, send `SIGKILL`. Don't try to "wait politely".

### 3. Never `eval` user code on the server

The JS runner spawns a Worker (`backend/runner/js/...`) — the user code is
never `Function`-eval'd in the server's own context. The Rust/Go paths
write user code to a file and invoke the toolchain.

### 4. Disk hygiene

- Generated source files (`main.rs`, `main.go`) live inside `runner/<lang>/`
  and are overwritten per submission. Don't accumulate `tmp-<uuid>` files.
- The cargo target dir is a Docker named volume (`rust-target`) so it
  survives container recreation. Same for the go cache.
- Don't write to `/tmp` from user code; the harness controls all I/O.

### 5. Stdout discipline

The harness's stdout is parsed by the orchestrator. Tagged lines:

```
__HARNESS_RESULT__:{"name":"…","ok":<bool>,"actual":<json>,"timeMs":<n>,"error":"…"}
__HARNESS_PARSE_ERROR__:<plain text>
```

User `println!` / `fmt.Println` is captured and routed to a separate logs
field on the result, not interleaved with results. The harness must never
print untagged JSON to stdout.

### 6. Metrics

`runWithMetrics(spawnArgs)` in `languages/metrics.mjs` samples CPU and RSS
during the run. Use it for `/api/submit`, not `/api/run` (custom-input
runs are too short to be meaningful and drown out the signal).

## Database

`db.mjs` uses Node's `--experimental-sqlite` (no `better-sqlite3`
dependency). Schema is created on first run via `Db.init()`:

- `submissions(slug, language, timestamp, passed, total, fatal, durationMs, metricsJson, resultsJson)`
- `code_drafts(slug, language, code, updatedAt)`
- `kv(key, value)` — for global preferences like last-selected language

DB file lives at `data/algotutor.db` on the host (mounted into the container
at `/work/data/algotutor.db` per `docker-compose.yml`).

When changing the schema, make `Db.init()` idempotent (`CREATE TABLE IF NOT
EXISTS`, then `ALTER TABLE … ADD COLUMN` in a try/catch). Never drop user
data.

## E2E mode

When `ALGOTUTOR_E2E=1`:
- `/api/state/reset` is exposed (otherwise it's a 403).
- The reset endpoint requires header `x-algotutor-test: 1` so a stray
  request can't wipe production state.

The flag must be set on the **backend container's environment**, not the
host shell. `docker-compose.yml` reads `ALGOTUTOR_E2E=${ALGOTUTOR_E2E:-0}`
at compose-up time, so once the container is created with the flag bound
to its env, the value is fixed for that container's lifetime. Restarting
won't change it — recreating will. `e2e/ensure-stack.mjs` does the
detection-and-recreate dance automatically.

## Signature kinds and how each is driven

The backend `runJavascript(...)` (and the per-language equivalents) dispatch
on `signature.kind`:

| Kind | JS path | Rust / Go path |
|---|---|---|
| `function` (default) | Web Worker via `runner.js`, calls `signature.fn` | Backend, generated `main.rs`/`main.go` calls `signature.fn` |
| `mutation` | Web Worker, mutates input arg, judged via `judgeSource: "param:N"` | Backend, same idea |
| `design` | **Backend** (`runDesignTest`) — drives `ops` ↔ method calls; the worker can't drive classes | Backend, generated harness drives the same op tuples |
| `codec-roundtrip` | **Backend** (`runCodecTest`) — instantiates `Codec`, calls `serialize(arrayToTree(input)) → deserialize → treeToLevelOrder` | Backend, same drive in the generated `main.<ext>` |

`docs/app/runner.js` enforces this routing: `jsNeedsBackend(question)`
returns true for `design` + `codec-roundtrip`. If you add a new kind,
update both `runner.js` AND `backend/languages/javascript.mjs`.

## Don'ts

- **Don't** add an HTTP framework (Express, Fastify, …). Native `http` is
  enough; no auth/middleware needed.
- **Don't** parse JSON manually for incoming bodies — there's a small
  `readJson(req)` helper in `server.mjs`. Use it.
- **Don't** introduce ORMs. The schema is 3 tables; raw SQL is clearer.
- **Don't** spawn the toolchain inside a request handler without `serialized`.
- **Don't** `console.log` in hot paths — both the harness *and* the
  orchestrator write to stdout, and the orchestrator's noise will show up
  in the user's "logs" output.
- **Don't** reach into the frontend filesystem from the backend (and vice
  versa). The shared contract is HTTP + the question JSONs.
