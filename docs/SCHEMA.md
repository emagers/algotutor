# Interview Questions Dataset — Schema & Test Harness

## Files

- `index.json` — lightweight index of all questions (id, title, difficulty, categories, sources, file path).
- `questions/<id>.json` — one file per question with full prompt, optimal solution, and the comprehensive test suite.
- `solutions.mjs` — runnable reference solutions (plain JS), shared `ListNode` / `TreeNode` classes, input/output **adapters**, and **comparators**. Single source of truth used by the build script and the test runner.
- `build-dataset.mjs` — generates expected outputs by running the reference solutions on each test input and writes the JSON files.
- `run-tests.mjs` — validates every test against any solution module that exports the function names declared in each question's `signature.fn`.

## Per-question JSON shape

```jsonc
{
  "id": "two-sum",
  "number": 1,
  "title": "Two Sum",
  "difficulty": "Easy",
  "categories": ["Array", "Hash Table"],
  "sources": ["", "", ""],

  "prompt": "...",
  "constraints": ["..."],
  "hints": ["progressive hint 1", "hint 2", "hint 3"],

  "optimal":      { "time": "O(n)", "space": "O(n)", "approach": "..." },
  "alternatives": [{ "approach": "...", "time": "...", "space": "...", "note": "..." }],
  "pitfalls":     ["..."],
  "followups":    ["..."],

  "signature": {
    "fn": "twoSum",
    "params": [
      { "name": "nums",   "adapt": "identity" },
      { "name": "target", "adapt": "identity" }
    ],
    "returnAdapt": "identity"
  },
  "comparison": "sortedArray",

  "solution": { "language": "TypeScript", "code": "function twoSum(...) { ... }" },

  "tests": [
    {
      "name": "example-1",
      "category": "example",
      "input":  { "nums": [2,7,11,15], "target": 9 },
      "output": [0, 1],
      "note":   "optional human note"
    }
  ]
}
```

### Adapters (defined in `solutions.mjs`)

| Adapter | Effect |
|---|---|
| `identity` | Pass through unchanged. |
| `arrayToLinkedList` | `[1,2,3]` → `ListNode` chain. |
| `linkedListToArray` | `ListNode` chain → `[1,2,3]`. |
| `arrayToBinaryTree` | level-order (null placeholders for absent children) with `null` placeholders → `TreeNode`. |
| `binaryTreeToLevelOrder` | `TreeNode` → trimmed level-order array. |

The runner **always deep-clones each input before invocation**, so problems that mutate (e.g., Number of Islands) are safe.

### Comparators

| Strategy | Use when |
|---|---|
| `exact` | Output is a number, boolean, string, or order-significant array/object. |
| `sortedArray` | Output is an array whose element order is unspecified (e.g., Two Sum indices, Top K Frequent). |
| `setOfArrays` | Output is a list of lists where neither inner nor outer order is specified (e.g., 3Sum, Group Anagrams). |
| `stringLength` | Output is a string and only its length matters (any string of optimal length is accepted, e.g., Longest Palindromic Substring, Minimum Window Substring). |

## Test categories

- **`example`** — illustrative cases similar to the prompt's worked examples.
- **`edge`** — boundary inputs: empty / single element / all duplicates / all negatives / extremes / known traps (catastrophic backtracking, off-by-one, pivot at boundary, diagonal-not-connected, greedy-fails, dup-roles, etc.).
- **`stress`** — large deterministically-generated inputs near the constraint limits (e.g., 100k elements, 300×300 grids, 5k rotated arrays, 2k-node DAGs/cycles).

Stress inputs are produced by a seeded Mulberry32 RNG so the dataset is fully reproducible.

## Running the tests

```bash
node docs/build-dataset.mjs                   # regenerate JSON from solutions
node docs/run-tests.mjs                       # all questions, all categories
node docs/run-tests.mjs --filter=two-sum      # one question
node docs/run-tests.mjs --category=stress     # only stress tests
```

To validate **your own** solution module instead of the reference, replace the import at the top of `run-tests.mjs` (or extend it with a CLI flag) — your module must export functions whose names match each question's `signature.fn`.

## Canonical category list

`Array`, `String`, `Hash Table`, `Two Pointers`, `Sliding Window`, `Binary Search`,
`Stack`, `Queue`, `Monotonic Stack`, `Linked List`, `Tree`, `Binary Tree`,
`Binary Search Tree`, `Heap / Priority Queue`, `Graph`, `BFS`, `DFS`,
`Topological Sort`, `Union-Find`, `Trie`, `Backtracking`, `Dynamic Programming`,
`Greedy`, `Bit Manipulation`, `Math`, `Intervals`, `Matrix`, `Sorting`, `Design`,
`Recursion`, `Divide & Conquer`, `Prefix Sum`.
