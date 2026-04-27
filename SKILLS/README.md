# SKILLS — AI Development Guide

Curated skill files for any AI agent (or human) contributing to AlgoTutor.
Read the relevant skill **before** making changes — they encode the conventions
and constraints the project has accumulated.

| File | When to read it |
|---|---|
| [`project-conventions.md`](./project-conventions.md) | **Always.** Hard rules: no trademarks, no telemetry, no logins, vanilla JS only, etc. |
| [`build-and-test.md`](./build-and-test.md) | Before running anything locally — covers `npm` scripts, dataset tests, Docker stack, E2E suite. |
| [`adding-a-problem.md`](./adding-a-problem.md) | Before adding a new problem to the 200-problem dataset. |
| [`new-problem-requirements.md`](./new-problem-requirements.md) | Quality bar for a new problem (test coverage, prompt rules, edge cases). |
| [`adding-a-language.md`](./adding-a-language.md) | Before wiring a new language (e.g. Python, C++) into the backend runner. |
| [`frontend-conventions.md`](./frontend-conventions.md) | Before editing anything under `docs/app/` — UI rules, persistence, page wiring. |
| [`backend-conventions.md`](./backend-conventions.md) | Before editing anything under `backend/` — runner contracts, harness, sandboxing. |
| [`debugging-playbook.md`](./debugging-playbook.md) | When something breaks — common failure modes and how to inspect. |

## Project at a glance

- **AlgoTutor** is a local interview-prep web app: 200 problems, 1647 tests, runnable in JS / Rust / Go (all 600 problem×language pairs supported).
- **Frontend**: vanilla JS + CSS, served from `docs/` via a tiny Node static server (`docs/serve.mjs`) inside a Docker container on port `8080`.
- **Backend**: Node.js HTTP server (`backend/server.mjs`), SQLite for state, in-Docker Rust + Go toolchains for compile/run on port `9090`.
- **Dataset**: source-of-truth lives in `docs/phase*-questions.mjs` and `docs/solutions.mjs`. `npm run build` produces `docs/questions/*.json` and `docs/index.json`.
- **Persistence**: SQLite at `data/algotutor.db`, mounted into the backend container. Keyed by problem **slug**, not number.
- **Tests**: four validation gates — `npm test` (dataset, 1647), `node backend/sweep-all.mjs` (600 stub-compile pairs), `node backend/acceptance-all.mjs` (reference solutions for every archetype, 39), and `npm run e2e` (Playwright headless E2E, 37).

## Operating principles

1. **Run all four validation gates before and after every change.** Never assume; verify.
2. **Stay surgical.** Don't refactor unrelated code. If you touch a file, leave it cleaner than you found it but no broader.
3. **Idempotence > cleverness.** Maintenance scripts (renumber, scrub, video-map) should be re-runnable without breaking anything.
4. **Slug is the user-stable identifier.** Problem numbers can be re-derived. User progress and submissions are keyed by slug.
5. **No external services at runtime.** No analytics, no CDN-required scripts, no logins, no third-party APIs the user must talk to. Everything runs locally on `localhost`.
6. **Every problem must work in every supported language.** No `backendUnsupported` escape hatch. If a kind doesn't fit a language's harness yet, extend the harness — don't opt out.
7. **For new UI features, add an E2E test.** The Playwright suite at `e2e/` is the compatibility contract — it covers the user flow end-to-end through the live Docker stack.
