# Adding a new language

This is the largest expansion you can make. Plan it as a sequence of
discrete merges — don't ship it half-built.

## Architecture recap

The backend has three layers per language:

```
backend/
├── languages/<lang>.mjs       # orchestration: spawn process, parse output
├── harness/generate-<lang>.<ext>  # code-gen: user fn + harness → main file
├── harness/<lang>/            # static support code (runtime helpers)
└── runner/<lang>/             # the project that gets compiled
```

The frontend has:
```
docs/app/
├── editor.js                  # CodeMirror 6 lang setup
└── runner.js                  # routes "Run / Submit" through the backend
```

And the dataset has, per problem:
```
signature.types.<lang>: { params: [...], ret: "..." }
signature.backendUnsupported.<lang>: true   // opt-out per problem
```

## Process

### 1. Provision the toolchain in the Docker image

Edit `Dockerfile` (the backend image):

```dockerfile
# After the existing rustup / golang installs:
RUN curl -fsSL https://… | bash -s -- --version <pinned>     # install <lang>
ENV PATH=/opt/<lang>/bin:$PATH
```

- Pin the version. Reproducibility matters.
- Pre-warm any package cache the runner will need (analogous to how the
  Rust image pre-builds `serde` into a shared `target/` so user runs are
  link-only).

### 2. Decide on the runner shape

Two patterns, pick the one that matches the language:

**a) Compile once per problem**: like Rust. Generate a single `main.<ext>`
   that includes both the user code and a harness loop over all tests.
   Compile + run once per submission.

**b) Compile once per process, exec inline**: like Go. Same idea —
   `go run ./...` against a generated package.

Avoid:
- Spinning up the toolchain per test (massive overhead — Rust would take
  >30s for 12 tests).
- Embedding user source in shell strings (escape hell — always write to a
  file first).

### 3. Write the harness generator

`backend/harness/generate-<lang>.mjs` exports `generate<Lang>Harness(question, userCode)`
returning the full source string for the runner.

Mandatory contract:
- Read JSON test inputs from stdin or a generated `tests.json`.
- Run the user's function once per test.
- For each test, print **exactly one** line to stdout:
  ```
  __HARNESS_RESULT__:{"name":"…","ok":true,"actual":<json>,"timeMs":<n>}
  ```
- On a parse / setup error: a single line:
  ```
  __HARNESS_PARSE_ERROR__:<error message>
  ```
- On a panic / runtime error caught in-harness: an `ok:false` result with
  `error: "..."` field.
- Exit code 0 on success; non-zero only for crashes the harness couldn't
  catch.

The orchestration layer parses these tagged lines from stdout. Anything
else is treated as user-program noise (printed to logs but not the result
stream).

### 4. Write the static runtime helpers

`backend/harness/<lang>/runtime.<ext>` should contain:
- JSON parsing / serialization helpers (esp. for `Vec<Vec<i32>>`-style
  nested arrays the dataset uses).
- `ListNode` / `TreeNode` definitions if the language supports them.
- Adapter functions matching every adapter name from `SCHEMA.md`
  (`arrayToLinkedList`, `arrayToBinaryTree`, etc.).
- Comparators corresponding to the four comparison strategies.

These are reused by the generated `main.<ext>` per problem.

### 5. Write the orchestration layer

`backend/languages/<lang>.mjs` exports `run<Lang>({ slug, code, tests }) → results`:

- Resolve `RUNNER_DIR` based on `existsSync("/work/...")` (in container) vs
  the source path (local `npm test` invocations).
- Generate the source via `generate<Lang>Harness(...)`.
- Spawn the build process with `COMPILE_TIMEOUT_MS`.
- Spawn the run process with `RUN_TIMEOUT_MS`, piping the test inputs.
- Parse stdout for `__HARNESS_RESULT__:` and `__HARNESS_PARSE_ERROR__:`.
- Wrap with `serialized(fn)` to ensure only one build is in flight per
  language at a time. This avoids cargo / go-build cache thrash.
- Wrap with `runWithMetrics(...)` to capture peak CPU / RSS for the
  submission summary.

### 6. Wire it into the server

Edit `backend/server.mjs`:

```js
import { run<Lang> } from "./languages/<lang>.mjs";

// In /api/run and /api/submit handlers, add the case:
case "<lang>": return run<Lang>(req);

// In /api/health, append "<lang>" to the languages array.
```

### 7. Frontend wiring

#### `docs/app/editor.js`
Register CodeMirror 6 syntax highlighting for the language. CodeMirror has
modes for most popular languages — import the relevant package or vendor
its mode file.

#### `docs/app/runner.js`
The router already dispatches by `lang`; no change needed unless the
backend route differs.

#### `docs/app/editor.js` — starter code
Add a `starterCode(signature, "<lang>")` branch that emits an empty function
body matching `signature.types.<lang>`. Use the existing branches as a
template; the function name is `signature.fn`, the param list comes from
`signature.types.<lang>.params`.

#### `docs/problem.html`
Add a new `<button class="lang-tab" data-lang="<lang>">…</button>` next to
the existing JavaScript / Rust / Go tabs.

#### `docs/problems.html` (problem list)
Add a `<lang-chip>` for the new language so the list shows JS / RS / GO /
NEW per row. The chip is greyed out when `signature.backendUnsupported.<lang>`
is true.

### 8. Dataset annotations

For every problem, decide:
- Is the language supported? If not, set
  `signature.backendUnsupported.<lang>: true` in the phase file.
- Add `signature.types.<lang>` with the typed parameters and return.

Run a sweep: `node backend/sweep-<lang>.mjs` (you'll need to create this
analogous to `sweep-go.mjs`) to surface problems where the reference
solution doesn't compile or doesn't pass.

### 9. Tests

#### Acceptance smoke
Add `backend/acceptance-<lang>.mjs` that loops the dataset, generates the
language's reference solution (if any) or a known-correct hand-written one,
and runs every problem through the live runner.

#### E2E
Add a Playwright test mirroring the existing two-sum-Rust / two-sum-Go
patterns:
```js
test("<lang> submission for two-sum is accepted via Docker backend", …)
```

### 10. Documentation

- Update `README.md` "How code execution works" section.
- Update `SCHEMA.md` adapter table if you added new adapters.
- Update this skill's table of contents reference.
- Update `docs/app/lesson-content.js` ONLY if a category gains new patterns
  specific to the language (rare).

## Don'ts

- **Don't** allow third-party crates / packages / modules. The runner is a
  closed sandbox using only the language's standard library.
- **Don't** allow user code to spawn subprocesses, open sockets, write
  outside the runner directory. The runner doesn't *enforce* this (it's a
  localhost dev tool, not a production sandbox), but the harness must not
  *expose* such APIs in its template.
- **Don't** hard-code per-problem code paths in the orchestrator. All
  per-problem logic must be derivable from the question JSON + signature.
- **Don't** ship without `acceptance-<lang>.mjs` going green for every
  problem that isn't `backendUnsupported`.
