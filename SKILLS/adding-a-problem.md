# Adding a new problem — process

Read [`new-problem-requirements.md`](./new-problem-requirements.md) first to
make sure the problem clears the quality bar.

## Where things live

```
docs/
├── solutions.mjs              # all reference solutions (keyed by signature.fn)
├── phase2-questions.mjs       # source of truth for problem entries
├── phase3-questions.mjs       # …split into phases for manageability
├── …
├── phase10-questions.mjs
├── build-dataset.mjs          # consumes phase files + solutions, writes JSON
├── run-tests.mjs              # validates solutions against the JSON dataset
├── questions/<slug>.json      # generated; do not edit by hand
└── index.json                 # generated index
```

## Step-by-step

### 1. Pick the right phase file

The phase split is logical, not chronological — group by topic:

- `phase2`: fundamentals (array, string, two-pointer)
- `phase3`: hash table, sliding window, prefix sum
- `phase4`: linked list, stack, queue
- `phase5`: graph, BFS/DFS, topological sort, union-find
- `phase6`: tree, trie, BST
- `phase7`: dynamic programming
- `phase8`: backtracking, divide-and-conquer
- `phase9`: greedy, intervals, math, bit
- `phase10`: design, simulation, sliding-window-on-streams

If unsure, append to the phase that already contains the most adjacent
problems by category.

### 2. Write the reference solution in `solutions.mjs`

Export a function whose name matches your `signature.fn`:

```js
export function twoSum(nums, target) {
  const m = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (m.has(target - nums[i])) return [m.get(target - nums[i]), i];
    m.set(nums[i], i);
  }
}
```

If the problem operates on linked lists or trees, use the existing
`ListNode` / `TreeNode` classes — `signature.params[i].adapt` will convert
the JSON-friendly array form to the node form for you.

### 3. Add the problem entry to the phase file

```js
{
  id: "your-slug",
  title: "Your Problem",
  difficulty: "Medium",
  categories: ["Array", "Hash Table"],

  prompt: `Given …`,
  constraints: ["1 <= n <= 10^5", "…"],
  hints: ["Think about …", "…", "…"],
  pitfalls: ["Off-by-one when …"],
  followups: ["What if …"],

  optimal: { time: "O(n)", space: "O(n)" },
  alternatives: [
    { approach: "Brute force", time: "O(n^2)", space: "O(1)" }
  ],

  signature: {
    fn: "yourFn",
    params: [
      { name: "nums", adapt: "identity" }
    ],
    returnAdapt: "identity",
    types: {
      rust: { params: [{ name: "nums", type: "Vec<i32>" }], ret: "i32" },
      go:   { params: [{ name: "nums", type: "[]int" }],    ret: "int"  }
    }
  },
  comparison: "exact",

  tests: [
    { name: "example-1", category: "example", input: { nums: [1,2,3] } },
    { name: "edge-empty", category: "edge",    input: { nums: [] } },
    { name: "edge-single", category: "edge",   input: { nums: [42] } },
    { name: "stress-100k", category: "stress", input: { nums: rng100k(/*seed=*/1) } },
  ]
}
```

Note: `output` is computed automatically by `build-dataset.mjs` from your
reference solution. Don't write it.

### 4. Regenerate the dataset

```sh
npm run build
```

This writes `docs/questions/<your-slug>.json` and updates `docs/index.json`.
If a number reshuffle is desired (e.g., you want to lock numbers
alphabetically again), only the alphabetical re-numbering step needs to run
— numbers are derived from sorted slugs.

### 5. Validate

```sh
npm test                                      # full suite stays green
node docs/run-tests.mjs --filter=your-slug    # focused run for your tests
```

### 6. Smoke through the runner for each language

```sh
npm run up
# Open http://localhost:8080/problem.html?id=your-slug
# Submit the reference solution in JS, Rust, and Go.
```

If a language's submission fails, check:
- Is `signature.codeTypes.<lang>` set correctly?
- Does the harness generator (`backend/harness/generate-<lang>.mjs`) handle
  the parameter / return types involved?
- For new wire types in Rust, did you derive `Default` so sweep stubs
  compile?

### 7. Run all four validation gates

Mandatory before commit:

```sh
npm test                          # 1647/1647
node backend/sweep-all.mjs        # 600/600 ✓ in JS / Rust / Go
node backend/acceptance-all.mjs   # 39/39 (or +N if you added a new SUITE entry)
npm run e2e                       # all Playwright specs
```

If your problem introduces a new archetype (a kind/wire combination not
already covered), add an entry to `backend/acceptance-all.mjs` `SUITE`
with reference solutions in all three languages.

### 8. Commit

```
Add problem: <slug>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

## Special cases

### Mutation problems (e.g., "fill-in-place")

If the function mutates its input *and* the mutation is the answer:
- `returnAdapt: "mutateInPlace"` — runner inspects the input post-call.
- The reference solution may safely mutate; the runner deep-clones each test
  input before invocation.

### Multi-valid-answer problems

Choose `comparison: "sortedArray"`, `"setOfArrays"`, or `"stringLength"`
according to which dimensions of the answer are unconstrained.

### Linked list / tree inputs

- Use `adapt: "arrayToLinkedList"` / `"arrayToBinaryTree"` and write inputs
  as plain arrays (with `null` placeholders for missing tree children).
- Use the matching `returnAdapt` to convert back to a comparable form.

### Adding a brand-new category

Don't, unless you've coordinated with the lessons content map.
`docs/app/lesson-content.js` must contain an entry for every category that
appears on any problem; otherwise the lesson page renders the bare problem
list with no overview.
