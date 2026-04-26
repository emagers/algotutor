# Requirements for a new problem

Before writing the entry, confirm the problem clears all of these bars.
The dataset is a *quality* artifact; underspecified problems make the
runner brittle and the test suite untrustworthy.

## 1. Identification

- **Slug** (`id`): kebab-case, descriptive, short. Stable forever — never rename.
  Examples: `two-sum`, `valid-anagram`, `longest-substring-without-repeating-characters`.
- **Title**: human-readable Title Case.
- **Difficulty**: `Easy` | `Medium` | `Hard`. Match the consensus difficulty.
- **Categories**: 1–4 entries from the canonical list in `SCHEMA.md`. Avoid
  inventing new categories without coordinating with the existing 39 — they
  drive the Lessons pages.
- **Number**: do **not** set manually; the renumber step handles it.

## 2. Prompt

- ASCII or simple Unicode. No images. No external links.
- Use backtick-quoted code spans for parameter names and literal values.
- State input bounds (`1 <= n <= 10^5`) — they justify your stress test sizes.
- State the *exact* contract: return value type, mutation expectations,
  ordering of results.
- **Must not contain**: any third-party trademark (see `project-conventions.md`).

## 3. Constraints, hints, pitfalls, follow-ups

- **Constraints**: bullet list of input bounds. Used by the renderer.
- **Hints**: 2–4 progressive hints. Each hint is *clickable to reveal* — they
  must not give away the answer in the first hint.
- **Pitfalls**: common bugs (off-by-one, integer overflow, mutation surprise).
- **Followups**: 1–3 harder variants to think about.

## 4. Optimal + alternatives

- `optimal.time` and `optimal.space` are *displayed* on the problem page —
  keep them in standard big-O notation (`O(n)`, `O(n log n)`, `O(n*m)`).
- `optimal.approach` and `alternatives` are shown only on the **submission
  summary**, after the user has submitted. Don't put solution-revealing prose
  in `optimal.time` or `optimal.space`.

## 5. Signature

The signature is the contract the runner uses to wire your function:

```js
{
  fn: "twoSum",
  params: [
    { name: "nums",   adapt: "identity" },
    { name: "target", adapt: "identity" }
  ],
  returnAdapt: "identity"
}
```

- `fn` matches the function name in `solutions.mjs` (and in user starter code
  for every supported language).
- `adapt` controls how the JSON test input is converted before the function
  is called. See `SCHEMA.md` for the full adapter list (`identity`,
  `arrayToLinkedList`, `arrayToBinaryTree`, etc.).
- `returnAdapt` is the inverse for the function's return value.
- For Rust/Go, you may also need `signature.types` declaring the typed
  parameters / return for those languages, AND `signature.backendUnsupported`
  if a language path isn't viable yet (e.g., problems that require returning
  a custom class instance).

## 6. Comparator

Pick the most permissive comparator that's still correct:

| Comparator | Use when |
|---|---|
| `exact` | A unique answer exists — number, boolean, string, or order-sensitive structure. |
| `sortedArray` | An array whose **element order is unspecified** (Two Sum indices, Top K Frequent). |
| `setOfArrays` | A list of lists where neither inner nor outer order matters (3Sum, Group Anagrams). |
| `stringLength` | A string where only the length matters (Longest Palindromic Substring). |

Picking `exact` for a multi-valid-answer problem will fail every alternative
correct solution — be deliberate.

## 7. Tests — the heart of the entry

Three categories, **all required**:

### `example`
- 2–4 small cases, including the one(s) printed in the prompt.
- Each must demonstrate a different aspect of the problem.

### `edge`
- Boundary inputs:
  - empty / single-element / size-1
  - all duplicates / all the same
  - all extremes (min, max, all-negatives, all-zeros)
  - known traps for the algorithm (off-by-one near boundaries, pivot at
    rotation point, diagonal-not-connected, tied-priority, greedy-fails-here)
- 4–8 entries typically.

### `stress`
- Large deterministically-generated inputs near the constraint limits.
  - Examples: 100k-element arrays, 300×300 grids, 5k-node DAGs.
- Generated via a **seeded Mulberry32 RNG** (already in `solutions.mjs`) so
  the dataset is reproducible.
- 2–5 entries typically. Each should exercise a different stress scenario
  (worst case for greedy, deep recursion, near-cycle, etc.).

### Per-test fields

```js
{
  name: "edge-all-same",            // unique within the problem
  category: "edge",                 // example | edge | stress
  input: { /* keyed by signature.params[].name */ },
  output: /* expected; computed by build-dataset.mjs from solutions.mjs */
}
```

You typically write only `name`, `category`, `input` in the phase file; the
build step *computes* `output` by running the reference solution.

## 8. Reference solution

- Add to `docs/solutions.mjs` keyed by `signature.fn`.
- It must be **correct**, not optimal-on-paper. The build step uses its
  output as ground truth.
- For mutation-style problems, the runner **deep-clones inputs before each
  call** — your solution may mutate freely.
- Avoid heavy library deps; use what's in standard JS.

## 9. Acceptance bar

Before you commit:
- [ ] `npm run build` regenerates the JSON for your problem with no errors.
- [ ] `npm test --filter=<your-slug>` shows all your tests pass.
- [ ] Difficulty and categories pass the eyeball test.
- [ ] No category outside the canonical list.
- [ ] No trademarked names anywhere in the entry.
- [ ] Test count: `example >= 2`, `edge >= 4`, `stress >= 2`.
- [ ] If any language is intentionally unsupported, set
      `signature.backendUnsupported.<lang> = true` so the UI greys out the
      Run/Submit buttons for that language.
