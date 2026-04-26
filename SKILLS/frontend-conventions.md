# Frontend conventions

All frontend code lives under `docs/`. The runtime is the browser; there is
no build step.

## Stack

- Vanilla JS, ES modules, served by `docs/serve.mjs` (a tiny static server).
- Vanilla CSS in `docs/app/styles.css` (single stylesheet, custom-property
  driven theme — see `:root` block at the top).
- CodeMirror 6 (the only third-party dependency) for the code editor.
- No bundler, no transpiler, no JSX, no TypeScript on the client.

## Page model

| HTML | JS module | Purpose |
|---|---|---|
| `docs/index.html` | inline | Landing page. |
| `docs/problems.html` | `app/pages/problems.js` | Filterable problem list. |
| `docs/problem.html` | `app/pages/problem.js` | Single-problem editor + runner. |
| `docs/submission.html` | `app/pages/submission.js` | Post-submit results page. |
| `docs/lessons.html` | `app/pages/lessons.js` | Topic index. |
| `docs/lesson.html` | `app/pages/lesson.js` | Per-topic page (overview + problem list). |

## Shared modules

```
docs/app/
├── data.js              # fetchIndex(), fetchQuestion(slug), fetchVideoMap()
├── storage.js           # Storage.getCode/setCode/getLang/setLang/saveSubmission/...
├── editor.js            # CodeEditor wrapper around CodeMirror; starterCode()
├── runner.js            # runAllForLanguage(), runCustomForLanguage(), isBackendUp()
├── lesson-content.js    # per-topic educational content map (39 entries)
└── styles.css           # single global stylesheet
```

## Persistence — backend-first, localStorage as UI cache

State that survives across reloads/devices (when DB is mounted) lives in
SQLite, accessed via `Storage.*`:

- Problem submissions (most recent + history)
- Per-(slug, language) code drafts
- Last-selected language

State that's *purely* UI ergonomics lives in `localStorage`:

- Pane collapse/resize state on the problem page (`algotutor:problem-ui`)
- Filters / sort selections on the problem list

`Storage.init()` is called from every page that reads state — it bootstraps
the schema if needed.

## UI rules

### Problem page tabs (Description / Video)
The two pane bodies (`#problem-body`, `#video-body`) toggle via the global
`.hidden { display: none !important; }` rule. Don't reintroduce a
class-scoped `.hidden` like the legacy `.output-area.hidden` — it bit us
hard once.

### Optimal complexity reveal
The problem page may show only `optimal.time` and `optimal.space`. The
*approach name*, alternative algorithms, and pitfalls are revealed only on
the **submission summary page** after the user has submitted. Don't surface
solution-revealing prose on the problem page.

### Hints
Always rendered inside `<details><summary>` so the user has to click each
hint to reveal. Don't pre-expand them.

### Language tabs
On switch:
1. Flush the *outgoing* language's draft to the backend (`Storage.setCode`).
2. Update CodeMirror's language extension (`editor.setLanguage`).
3. Load the *incoming* language's draft (or starter code if none).
4. Persist the selection (`Storage.setLang`) so it sticks across pages.

The language tabs are disabled mid-switch to avoid races.

### Run / Submit availability
A language is "supported" when:
- `lang === "javascript"` (always), OR
- `backend is up` AND `!signature.backendUnsupported[lang]`.

When unsupported, both buttons are disabled and `#lang-warning` shows the
reason.

### Custom input format
The "Custom input" textarea takes a JSON object whose keys match the
problem's `signature.params[].name`. The Run path JSON-parses, deep-clones
(via the runner), and invokes the function. Display parse errors in the
output panel — don't `alert()`.

## Styling

- Use the CSS custom properties in `:root` (`--bg`, `--accent`, `--pass`,
  `--fail`, etc.). Don't hard-code colors.
- Spacing: 4 / 8 / 12 / 16 / 20 / 24 px scale.
- Mobile breakpoint: `max-width: 900px`. The two-pane problem layout
  collapses to single-column there.
- All collapsibles use the section-header / section-body / `.collapsed`
  pattern (see `.run-area`, `.output-area` in `styles.css`). Don't roll
  your own.

## Don'ts

- **Don't** add a CDN-hosted script tag. Vendor the file or do without.
- **Don't** add framework dependencies (React, Vue, Lit, etc.).
- **Don't** add a CSS preprocessor. Vanilla CSS only.
- **Don't** introduce a build step. ES modules served as-is.
- **Don't** fetch from the public internet at runtime. The video iframe is
  the *only* off-localhost network call, and it's user-initiated by clicking
  the Video tab.
- **Don't** assume the backend is up — `runner.js` probes it; many flows
  must work in JS-only mode (e.g., reading the dataset, viewing problems).
