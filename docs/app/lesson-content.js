// Educational content for each topic. Rendered above the problem list on
// the per-topic lesson page. Markdown-ish: `code`, **bold**, *em*.

export const lessonContent = {
  "Array": {
    overview: "Arrays (and dynamic arrays like Vec/slice/[]) are the workhorse data structure: contiguous, indexable, cache-friendly. Most interview problems start by asking you to scan, partition, or rearrange an array.",
    whenToUse: [
      "Input is a sequence with random access by index.",
      "You can solve the problem with a single or double scan.",
      "You're tracking running aggregates (sum, min, max, count) over a window or prefix.",
      "Order matters and you can compute the answer in-place to save space.",
    ],
    keyPatterns: [
      { name: "Two pass", description: "Scan once to gather information (counts, sums, bounds), then scan again to produce the answer." },
      { name: "In-place rewrite", description: "Use a write index that lags the read index to overwrite elements without an aux buffer." },
      { name: "Index as hash", description: "When values are bounded `1..n`, you can use indices themselves as a hash by negating or swapping to mark presence." },
    ],
    complexity: "Reads/writes are `O(1)`. A single scan is `O(n)` time, `O(1)` extra space; a nested scan jumps to `O(n²)`. Watch out for accidental copies in languages like Rust/Go that may turn an `O(n)` algorithm into `O(n²)`.",
  },

  "String": {
    overview: "Strings are arrays of characters with extra semantics (encoding, immutability, comparison). Many string problems reduce to array techniques once you pick a clean character representation.",
    whenToUse: [
      "Input is text and you need to validate, transform, or count characters.",
      "Searching for a pattern, palindrome, anagram, or substring property.",
      "Building output by concatenation — prefer a buffer (`StringBuilder`, `Vec<u8>`, `strings.Builder`) over `+=`.",
    ],
    keyPatterns: [
      { name: "Char-count map", description: "26-element array (lowercase a-z) or hash map for frequency comparisons (anagrams, ransom note)." },
      { name: "Two-pointer expand", description: "From a center point, expand outward while matching — palindromes, longest palindromic substring." },
      { name: "Sliding window of distinct chars", description: "Hash-map of the last seen index lets you advance the window's left edge in `O(1)` amortized." },
    ],
    complexity: "Comparison is `O(n)`. Avoid quadratic concatenation: `s = s + c` inside a loop is `O(n²)` in most languages. Char arithmetic (`c - 'a'`) gives constant-time bucket indexing.",
  },

  "Hash Table": {
    overview: "Hash tables (HashMap, HashSet, dict, object) trade space for `O(1)` lookups, inserts, and deletes — the single biggest tool for turning `O(n²)` brute force into `O(n)`.",
    whenToUse: [
      "You're searching for the existence of an element you've seen before.",
      "You need to count occurrences or group values by a derived key.",
      "You want to memoize sub-results keyed by a value rather than an index.",
    ],
    keyPatterns: [
      { name: "Complement lookup", description: "While iterating, check if `target - x` is already in the map (Two Sum, 3Sum, pair sums)." },
      { name: "Frequency map", description: "Count how often each value appears, then iterate the map for `top-k`, `majority`, `first-unique`, etc." },
      { name: "Group by signature", description: "Group anagrams by sorted form; group points by slope; group strings by length & first char." },
    ],
    complexity: "Insert/lookup/delete are amortized `O(1)`. Iteration order is unspecified in most languages — sort the entries if you need a deterministic answer.",
  },

  "Two Pointers": {
    overview: "Two-pointer technique uses two indices that move toward each other, in lockstep, or at different speeds — usually replacing nested loops with a single linear pass.",
    whenToUse: [
      "Input is sorted and you need to find pairs/triples that satisfy a relation.",
      "You need to partition an array in-place (Dutch flag, move zeroes, remove duplicates).",
      "You're comparing two sequences character by character (palindrome, merge sorted arrays).",
    ],
    keyPatterns: [
      { name: "Opposite ends, converge", description: "`l = 0`, `r = n-1`. Move `l` or `r` based on the comparison. Used for `2Sum` on sorted input, `container-with-most-water`, valid palindrome." },
      { name: "Fast / slow pointers", description: "One pointer steps once, the other twice. Used to find cycles, midpoints, and `k`-th from end." },
      { name: "Read / write pointers", description: "Read advances every iteration; write only advances when you keep the value. Compacts in-place in `O(n)`." },
    ],
    complexity: "Single pass: `O(n)` time, `O(1)` space. Often requires the input to be sorted first (`O(n log n)`).",
  },

  "Sliding Window": {
    overview: "Sliding window maintains a contiguous range `[l, r]` whose state is updated incrementally as `r` advances and `l` retreats. Converts many quadratic substring problems into `O(n)`.",
    whenToUse: [
      "You're asked for the longest/shortest/min/max contiguous subarray or substring satisfying a property.",
      "The property is monotonic: extending the window can only make it 'worse'; shrinking can only make it 'better'.",
      "You can update the window's invariant (sum, count, distinct-chars) in `O(1)` per step.",
    ],
    keyPatterns: [
      { name: "Variable-size window", description: "Expand `r` until the invariant breaks, then shrink `l` until it holds again. Track best window seen so far." },
      { name: "Fixed-size window of size k", description: "Slide a window of fixed length `k`: add `nums[r]`, drop `nums[r-k]`. Used for averages, anagram detection." },
      { name: "Window with frequency map", description: "Counter for chars in the window plus a `formed` count makes 'window contains all of T' an `O(1)` check." },
    ],
    complexity: "Amortized `O(n)`: each element is added and removed at most once. Space `O(k)` where `k` is the alphabet or distinct value count.",
  },

  "Binary Search": {
    overview: "Binary search halves a search space each step. Beyond sorted arrays, it applies to any *monotonic predicate* over a numeric range — answer-on-the-domain rather than on the input.",
    whenToUse: [
      "Input is sorted (or rotated-sorted) and you need a value or its insertion point.",
      "You can phrase the answer as `the smallest x such that f(x) is true`, where `f` is monotonic.",
      "You need `O(log n)` lookups inside an outer loop.",
    ],
    keyPatterns: [
      { name: "Lower-bound template", description: "`while lo < hi: mid = (lo+hi)/2; if f(mid) hi = mid else lo = mid+1;` — returns the smallest `x` with `f(x)` true. Avoids off-by-one." },
      { name: "Binary search on the answer", description: "When the input is large but the answer space is small/numeric — Koko bananas, ship-within-D-days, split-array-largest-sum." },
      { name: "Rotated sorted array", description: "Compare `nums[mid]` to `nums[lo]` to decide which half is sorted, then check whether the target lies in that sorted half." },
    ],
    complexity: "`O(log n)` time, `O(1)` space. Beware of `mid = (lo+hi)/2` overflow in fixed-int languages (use `lo + (hi-lo)/2`).",
  },

  "Sorting": {
    overview: "Sorting is a powerful preprocessing step that often unlocks two-pointer, greedy, and binary-search solutions. Knowing when to sort (and by what key) is more important than implementing a sort yourself.",
    whenToUse: [
      "Order doesn't matter in the input but matters in the algorithm (intervals, meetings).",
      "You need to compare adjacent items (anagram check, duplicate detection).",
      "Greedy choices depend on a smallest/largest-first ordering.",
    ],
    keyPatterns: [
      { name: "Sort by custom key", description: "Sort intervals by start, jobs by deadline, points by polar angle. The key encodes the greedy choice." },
      { name: "Counting sort", description: "When values are small integers in a known range, count buckets in `O(n+k)` and skip comparison sorting entirely." },
      { name: "Partial sort / quickselect", description: "For top-k or median, partition around a pivot in `O(n)` average rather than fully sorting in `O(n log n)`." },
    ],
    complexity: "Comparison sort: `O(n log n)`. Counting/radix: `O(n + k)`. Sorts are stable in most modern languages — leverage stability for ties.",
  },

  "Stack": {
    overview: "A LIFO (last-in-first-out) container used to remember work to do later or to undo recent decisions. Many bracket/expression and 'next-greater-element' problems are stack-shaped.",
    whenToUse: [
      "You're matching nested structures (parentheses, tags, scopes).",
      "You're parsing or evaluating expressions with operator precedence.",
      "You need 'the most recent X that ...' answered in `O(1)` — push on the way in, pop on the way out.",
    ],
    keyPatterns: [
      { name: "Match-and-pop", description: "Push opening tokens; on a closing token, pop and verify it matches. Empty stack at the end means well-formed." },
      { name: "Defer-until-resolved", description: "Push items whose answer depends on something later (e.g., temperatures, asteroids). Pop and finalize when that 'later' arrives." },
      { name: "Two stacks for a queue", description: "Use one for input and one for output to amortize FIFO ops to `O(1)`." },
    ],
    complexity: "Push/pop/peek are `O(1)`. Total work over a stack-based loop is amortized `O(n)` because each item is pushed and popped at most once.",
  },

  "Monotonic Stack": {
    overview: "A stack whose contents are always in increasing or decreasing order. Maintaining the invariant by popping smaller (or larger) elements unlocks `O(n)` solutions to a class of 'next-greater'/'previous-smaller' problems.",
    whenToUse: [
      "You need, for each element, the next or previous element that is greater/smaller.",
      "You're computing the largest rectangle, max area in a histogram, or similar bounded-region area.",
      "You're processing a sequence and only the 'still-relevant' history matters.",
    ],
    keyPatterns: [
      { name: "Next greater element", description: "Iterate right-to-left, maintain a decreasing stack; for each `x`, pop all `<= x`, the top (if any) is the answer." },
      { name: "Largest rectangle", description: "Maintain an increasing stack of bar indices. When a smaller bar arrives, pop and compute width as `i - stack.top - 1`." },
      { name: "Stock span / temperatures", description: "Push indices; when a larger value arrives, pop and record `i - poppedIndex` as the answer for the popped index." },
    ],
    complexity: "Each element is pushed and popped at most once: `O(n)` time, `O(n)` space.",
  },

  "Queue": {
    overview: "A FIFO container. Comes up in BFS, level-order traversal, scheduling, and stream problems. Languages typically expose it as a deque (double-ended queue) for flexibility.",
    whenToUse: [
      "You're doing a level-by-level (breadth-first) traversal.",
      "Order of arrival matters and you need to process oldest-first.",
      "You're implementing a producer/consumer or rate-limited stream.",
    ],
    keyPatterns: [
      { name: "BFS with sentinel", description: "Push the source; loop while non-empty: pop, visit, push unvisited neighbors. A `null` or level marker delimits levels." },
      { name: "Sliding window with deque", description: "Monotonic deque keeps the window's max/min at the front in `O(1)` amortized." },
      { name: "Two-stack queue", description: "When only stacks are available, two stacks give amortized `O(1)` enqueue/dequeue." },
    ],
    complexity: "Enqueue/dequeue are `O(1)`. BFS over a graph is `O(V + E)`.",
  },

  "Linked List": {
    overview: "A linear sequence of nodes connected by pointers. Cheap insert/delete at known positions but no random access. Most interview questions test pointer manipulation, not list theory.",
    whenToUse: [
      "You're given the head of a list and asked to reverse, merge, partition, or detect a cycle.",
      "You need `O(1)` insertion/deletion at the front (or in the middle, given a pointer).",
      "Constant extra memory is required and array operations would be too costly.",
    ],
    keyPatterns: [
      { name: "Dummy head", description: "Allocate a `dummy = ListNode(0)` and treat its `next` as the result head — eliminates head-vs-non-head edge cases." },
      { name: "Prev / curr / next triplet", description: "Reversing in place requires three pointers stepped together: `next = curr.next; curr.next = prev; prev = curr; curr = next`." },
      { name: "Slow / fast pointers", description: "Fast moves twice per step. Detects cycles, finds the midpoint, and locates the cycle entry (Floyd's algorithm)." },
    ],
    complexity: "Traversal `O(n)`. Random access `O(n)`. Insert/delete given a pointer `O(1)`. `null`-check every dereference.",
  },

  "Tree": {
    overview: "A connected acyclic graph with `n-1` edges. Recursion is the natural traversal and you often write three almost-identical solutions: pre/in/post-order.",
    whenToUse: [
      "Input is a tree (or a graph that is implicitly a tree).",
      "You need to aggregate information up from leaves or push it down from the root.",
      "Subtree-level invariants matter (e.g., diameter, balanced-ness, max-path-sum).",
    ],
    keyPatterns: [
      { name: "DFS that returns a per-node tuple", description: "Each recursive call returns the subtree info needed by the parent (height, sum, count, valid flag)." },
      { name: "Carry state down (parameterized DFS)", description: "Pass running state (path-so-far, depth, ancestor min/max) into the recursion." },
      { name: "Iterative traversal with explicit stack", description: "Avoids stack-overflow on degenerate trees and mirrors the recursive version closely." },
    ],
    complexity: "DFS/BFS: `O(n)` time. Recursion uses `O(h)` stack space where `h` is height (`O(log n)` balanced, `O(n)` skewed).",
  },

  "Binary Search Tree": {
    overview: "A BST stores keys with the invariant `left < node < right`. In-order traversal yields a sorted sequence — a fact that solves a surprising number of problems.",
    whenToUse: [
      "You need to validate the BST property or repair it.",
      "You're asked for the k-th smallest, range-sum, lowest common ancestor, or successor/predecessor.",
      "Insertions and lookups must beat `O(n)` and you can assume balanced input.",
    ],
    keyPatterns: [
      { name: "In-order = sorted", description: "Most BST problems become 'process the in-order traversal' (validate by checking it's strictly increasing, find k-th, etc.)." },
      { name: "Compare-and-recurse", description: "At each node, the BST property tells you which half contains the target — half the work each step." },
      { name: "LCA via descent", description: "Walk down: if both targets are smaller go left, both bigger go right, otherwise the current node is the LCA." },
    ],
    complexity: "Balanced ops are `O(log n)`. Worst-case skewed BST degenerates to `O(n)`.",
  },

  "Heap / Priority Queue": {
    overview: "A heap maintains the min (or max) of its contents in `O(log n)` per insert and `O(log n)` per pop. The standard tool for 'top-k', merging streams, and Dijkstra-style problems.",
    whenToUse: [
      "You need the `k` smallest/largest items from a stream too large to sort.",
      "You're merging multiple sorted sources lazily.",
      "An algorithm needs to repeatedly select the current best/worst item.",
    ],
    keyPatterns: [
      { name: "Top-k with size-k min-heap", description: "Keep a min-heap of size `k`; for each new value, push and pop if size > k. `O(n log k)`." },
      { name: "Merge k sorted lists", description: "Push the heads of all `k` lists into a min-heap. Pop the smallest, push its `next`. `O(N log k)`." },
      { name: "Two heaps for median", description: "A max-heap of the lower half + a min-heap of the upper half keeps the median at one of the tops." },
    ],
    complexity: "Push/pop `O(log n)`. Peek `O(1)`. Build-heap from `n` items `O(n)`.",
  },

  "Greedy": {
    overview: "Make the locally optimal choice at each step and prove it leads to a global optimum. Powerful when applicable, but the proof matters — a greedy that 'looks right' can be wildly wrong.",
    whenToUse: [
      "You can rank choices by a single key (deadline, ratio, end-time) and that ranking is consistent throughout.",
      "An exchange argument shows that any optimal solution can be reshaped to match the greedy choice.",
      "DP would work but its sub-problems collapse to a single scan.",
    ],
    keyPatterns: [
      { name: "Earliest-deadline-first / smallest-end-time", description: "Sort by end time and pick non-overlapping intervals greedily — solves activity selection, non-overlapping intervals." },
      { name: "Largest-step-forward (jump game)", description: "Track the farthest reachable index as you walk; if `i` ever exceeds it, you fail." },
      { name: "Pair-largest-with-smallest", description: "Sort, then pair from both ends to bound a sum or split into balanced groups." },
    ],
    complexity: "Usually `O(n log n)` (for the sort) plus an `O(n)` scan. Never accept a greedy without convincing yourself or testing it on tricky inputs.",
  },

  "Dynamic Programming": {
    overview: "Break a problem into overlapping sub-problems and reuse their answers. Two ingredients: an *optimal substructure* (the answer composes from sub-answers) and *overlapping sub-problems* (the same sub-question appears many times).",
    whenToUse: [
      "Brute-force recursion has exponential blow-up because the same call repeats.",
      "Counting (`how many ways…`), optimizing (`min cost / max value`), or feasibility (`is X achievable?`) over a discrete state space.",
      "State can be described by a small tuple of integers/booleans.",
    ],
    keyPatterns: [
      { name: "Define state precisely", description: "`dp[i]` = answer when considering the first `i` items. Add a dimension only when the recurrence requires it." },
      { name: "Top-down memoization", description: "Write the recursion naturally, then add a cache keyed by the function args. Easiest to derive — convert to bottom-up if you need speed." },
      { name: "Bottom-up table", description: "Iterate states in dependency order. Often allows rolling-array optimization that drops a dimension of memory." },
      { name: "Knapsack-style 0/1 vs unbounded", description: "0/1: iterate items outer, weights inner *descending*. Unbounded: iterate weights *ascending*." },
    ],
    complexity: "`O(states × transitions)`. Memory often reducible from `O(n²)` to `O(n)` by keeping only the last row/column.",
  },

  "Memoization": {
    overview: "Top-down dynamic programming: write the recursion naturally, add a cache keyed by the function arguments, and let the cache prune repeated work.",
    whenToUse: [
      "The recursive formulation is natural and the bottom-up iteration order is awkward.",
      "Only a sparse subset of states are actually reached.",
      "You'd prototype quickly to verify a recurrence before tabulating.",
    ],
    keyPatterns: [
      { name: "Cache on (i, j, …) tuple", description: "Hash-map or n-D array keyed by exactly the arguments that determine the answer — no more, no less." },
      { name: "Hashable state", description: "If state includes a set or a list, convert to a tuple/bitmask before caching." },
      { name: "Watch the call stack", description: "Memoization is still recursion — deep inputs may hit the language's stack limit. Switch to iterative DP if so." },
    ],
    complexity: "`O(reachable states × per-state work)`. Memory grows with cache size.",
  },

  "Backtracking": {
    overview: "Systematic depth-first exploration of all candidate solutions, pruning a branch as soon as it can't lead to a valid answer. The 'try, recurse, undo' template covers permutations, combinations, and constraint puzzles.",
    whenToUse: [
      "You need to enumerate all valid configurations (subsets, permutations, board placements).",
      "Decisions are made one at a time and a partial solution can be invalidated early.",
      "The search space is exponential but pruning makes it tractable.",
    ],
    keyPatterns: [
      { name: "Choose / explore / un-choose", description: "Append to the path, recurse, pop. Mutating a single shared list is faster than copying." },
      { name: "Constraint pruning", description: "Before recursing, check whether the partial solution can still be extended (n-queens column/diag sets, sudoku row/col masks)." },
      { name: "Sort to skip duplicates", description: "Sort the input; when picking the i-th element, skip it if it equals the (i-1)-th and (i-1)-th was not picked." },
    ],
    complexity: "Worst case is exponential (`O(2^n)`, `O(n!)`). Effective complexity depends entirely on how aggressively you prune.",
  },

  "Recursion": {
    overview: "A function that calls itself on a smaller instance of the same problem. Recursion is the underlying mechanism for tree traversals, DFS, divide-and-conquer, and backtracking.",
    whenToUse: [
      "The problem has a clean self-similar definition (`solve(n) = combine(solve(n-1), …)`).",
      "Input is naturally tree-shaped (file system, expression, DOM).",
      "Iteration would require manually managing a stack and is harder to read.",
    ],
    keyPatterns: [
      { name: "Base case first", description: "Always handle the trivial case (`null`/empty/0/1) first — the recursion bottoms out cleanly." },
      { name: "Trust the recursion", description: "Assume the recursive call returns the correct answer for its sub-problem. Focus only on the combine step." },
      { name: "Tail recursion → loop", description: "If the recursive call is the very last thing, you can rewrite it iteratively to avoid stack-overflow." },
    ],
    complexity: "Time depends on the recurrence (`T(n) = 2T(n/2) + O(n)` is `O(n log n)`). Space is `O(depth)` for the call stack.",
  },

  "Divide & Conquer": {
    overview: "Split the input into independent sub-problems, solve them recursively, and combine. The split + combine cost is what determines the overall complexity (Master theorem).",
    whenToUse: [
      "The problem decomposes cleanly along a midpoint or a pivot.",
      "Sub-problems are independent (no cross-talk) so they can run in parallel or be combined cheaply.",
      "You're matching a famous template: merge-sort, quicksort, binary search, FFT, closest pair.",
    ],
    keyPatterns: [
      { name: "Merge-sort template", description: "Split in half, recurse, merge — `O(n log n)` for sorting, count-inversions, kth-smallest-pair-sum." },
      { name: "Quickselect", description: "Partition around a pivot, recurse only into the side that contains the answer — `O(n)` average." },
      { name: "Combine across the boundary", description: "When sub-results don't immediately combine (e.g., max-subarray in left, right, or crossing), explicitly handle the crossing case." },
    ],
    complexity: "By the Master theorem: `T(n) = aT(n/b) + f(n)`. Common results: `O(n log n)` for sort, `O(log n)` for binary search.",
  },

  "Graph": {
    overview: "Vertices and edges, directed or undirected, weighted or unweighted. Most graph problems are a thin wrapper around BFS, DFS, or one of the shortest-path / spanning-tree algorithms.",
    whenToUse: [
      "Input describes relationships between entities (followers, prerequisites, flights).",
      "You need to find connectivity, shortest path, cycles, or strongly-connected components.",
      "Implicit graph: the 'nodes' are board positions, words, or states, and 'edges' are valid transitions.",
    ],
    keyPatterns: [
      { name: "Build adjacency list once", description: "Convert edge list to `Map<node, List<neighbor>>` upfront. Direction matters — for undirected, add both `u→v` and `v→u`." },
      { name: "Visited set / coloring", description: "Track visited nodes (set, in-array flag, or 3-color for cycle detection in directed graphs)." },
      { name: "Component count via DFS", description: "Run DFS from each unvisited node; the number of starts equals the number of connected components." },
    ],
    complexity: "BFS/DFS: `O(V + E)`. Dijkstra: `O((V+E) log V)`. Floyd-Warshall: `O(V³)`. Always know your `V` and `E`.",
  },

  "DFS": {
    overview: "Depth-first search dives as deep as possible before backtracking. Recursive DFS is short to write; iterative DFS uses an explicit stack to avoid stack overflow.",
    whenToUse: [
      "You need to explore all reachable nodes/states (connected components, flood fill, islands).",
      "Path enumeration or a question that's naturally tree-shaped.",
      "Detecting cycles in a directed graph (3-coloring) or topological order (post-order DFS).",
    ],
    keyPatterns: [
      { name: "Visited-set guard", description: "Mark before recursing into neighbors, not after — prevents infinite loops on cycles." },
      { name: "Post-order accumulation", description: "Do work *after* the recursive calls return — gives subtree sums, post-order traversal, topological sort." },
      { name: "Explicit-stack DFS", description: "Push the start, loop while non-empty: pop, visit, push unvisited neighbors. Mirrors recursion without the stack-frame cost." },
    ],
    complexity: "`O(V + E)` time, `O(V)` space (visited set + recursion stack).",
  },

  "BFS": {
    overview: "Breadth-first search visits nodes in order of distance from the source, making it the right tool for unweighted shortest paths and level-by-level processing.",
    whenToUse: [
      "Shortest path in an unweighted graph (or grid where each step costs 1).",
      "Level-order traversal of a tree.",
      "Finding the minimum number of moves/transformations to reach a goal state.",
    ],
    keyPatterns: [
      { name: "Queue + visited set", description: "Mark *on enqueue* (not on dequeue), or you'll enqueue the same node many times." },
      { name: "Level marker / size snapshot", description: "Take `len(queue)` at the top of each level to know when one level ends." },
      { name: "Multi-source BFS", description: "Push *all* sources into the queue with distance `0`, then run normal BFS — solves 'rotting oranges', '01-matrix' in one pass." },
    ],
    complexity: "`O(V + E)` time, `O(V)` space. For grids, `V = rows × cols` and `E ≈ 4V`.",
  },

  "Shortest Path": {
    overview: "Find the minimum-cost path between nodes. The right algorithm depends on edge weights: BFS for unweighted, Dijkstra for non-negative, Bellman-Ford for negative edges.",
    whenToUse: [
      "Unweighted shortest path → BFS (`O(V+E)`).",
      "Non-negative weights → Dijkstra with a min-heap (`O((V+E) log V)`).",
      "Negative weights (but no negative cycles) → Bellman-Ford (`O(V·E)`); also detects negative cycles.",
      "All-pairs shortest paths on small graphs → Floyd-Warshall (`O(V³)`).",
    ],
    keyPatterns: [
      { name: "Dijkstra with stale-entry skip", description: "Don't pre-decrease keys; instead push duplicates and skip when the popped distance is greater than the recorded one." },
      { name: "Bidirectional BFS", description: "Search from both ends and meet in the middle — square-root the explored frontier on big graphs." },
      { name: "0-1 BFS with deque", description: "When edges have weight 0 or 1, push 0-weight edges to the *front* of the deque and 1-weight to the back. `O(V+E)`." },
    ],
    complexity: "BFS `O(V+E)`. Dijkstra `O((V+E) log V)`. Bellman-Ford `O(V·E)`. Floyd-Warshall `O(V³)`.",
  },

  "Topological Sort": {
    overview: "A linear ordering of vertices in a DAG such that every directed edge `u→v` has `u` appearing before `v`. Used for build orders, course schedules, task dependencies.",
    whenToUse: [
      "You're given dependencies between items and need a valid sequencing.",
      "You also want to detect whether the graph has a cycle.",
      "Any DP on a DAG that needs to evaluate sub-problems in dependency order.",
    ],
    keyPatterns: [
      { name: "Kahn's algorithm (BFS)", description: "Compute in-degrees; enqueue all zero-in-degree nodes; pop, append to order, decrement neighbors' in-degree, enqueue any that hit zero. If `|order| < n`, there's a cycle." },
      { name: "Post-order DFS", description: "DFS each unvisited node; append to a list when the recursion returns; the reversed list is a topological order." },
      { name: "Cycle detection by 3-coloring", description: "WHITE=unvisited, GRAY=on stack, BLACK=done. Encountering a GRAY neighbor during DFS means a back edge → cycle." },
    ],
    complexity: "`O(V + E)` time, `O(V)` space.",
  },

  "Union-Find": {
    overview: "Union-Find (Disjoint Set Union) maintains a partition of elements into sets and supports nearly-`O(1)` `union(a, b)` and `find(x)` (returns the set's representative).",
    whenToUse: [
      "Connectivity queries on a streaming list of edges (number of islands II, accounts merge).",
      "Detecting cycles in an undirected graph as edges arrive.",
      "Kruskal's MST: process edges in weight order, union if endpoints are in different sets.",
    ],
    keyPatterns: [
      { name: "Path compression", description: "During `find`, point each visited node directly at the root: `parent[x] = find(parent[x])`." },
      { name: "Union by rank/size", description: "Always attach the smaller tree under the larger root. Keeps the tree shallow." },
      { name: "Track component metadata", description: "Maintain `size[root]` or `count` to answer 'how many components?' or 'how big is `x`'s component?' in `O(α(n))`." },
    ],
    complexity: "Amortized `O(α(n))` per op (effectively constant). Building a DSU over `n` elements is `O(n)`.",
  },

  "Trie": {
    overview: "A tree where each edge represents a character; a path from root to a marked node spells a stored string. Prefix queries are `O(L)` where `L` is the query length.",
    whenToUse: [
      "Autocomplete, prefix search, longest-common-prefix queries.",
      "Word-search in a grid against a dictionary (DFS + trie prunes early).",
      "Replace-words / shortest-prefix style transformations.",
    ],
    keyPatterns: [
      { name: "Children = fixed-size array", description: "For lowercase a-z, `children[26]` is faster than a hash map and uses comparable memory at small scale." },
      { name: "isWord flag at terminal", description: "Mark the *node*, not the *edge*, as the end of a word. Lets you store both 'app' and 'apple'." },
      { name: "DFS the grid + walk the trie together", description: "Each grid step advances the trie pointer; if the trie has no matching child, prune." },
    ],
    complexity: "Insert/search/prefix-match: `O(L)` where `L` is word length. Space `O(total chars stored)` worst case.",
  },

  "Intervals": {
    overview: "Closed/half-open ranges `[start, end)` on a number line. The first move on almost every interval problem is to sort by `start` (or sometimes by `end`).",
    whenToUse: [
      "You're merging overlapping intervals or counting non-overlapping subsets.",
      "You're scheduling meetings, allocating resources, or computing room/CPU usage over time.",
      "A 'sweep line' over events (start = +1, end = -1) gives the running count.",
    ],
    keyPatterns: [
      { name: "Sort by start, sweep merge", description: "After sorting, walk the list keeping a running `[s, e]`. If next.start <= e, extend `e`; otherwise emit and reset." },
      { name: "Min-heap of end times", description: "For 'meeting rooms', push end times into a min-heap; if the next start ≥ heap.top, reuse that room (pop)." },
      { name: "Sort by end (greedy)", description: "For non-overlapping selection / activity selection, sort by end time and pick the earliest end that doesn't conflict." },
    ],
    complexity: "Sort dominates: `O(n log n)`. Sweep is `O(n)` after sorting.",
  },

  "Matrix": {
    overview: "A 2D grid of values. Many problems are 'graph problems on a grid' (BFS/DFS) or 'array problems applied row-by-row or column-by-column'.",
    whenToUse: [
      "Input is rows × cols of cells with neighbor relationships.",
      "You're doing flood-fill, island counting, shortest path on a grid, or rotation/transposition.",
      "DP where the state is a (row, col) pair.",
    ],
    keyPatterns: [
      { name: "Direction array", description: "`const dirs = [[-1,0],[1,0],[0,-1],[0,1]]` makes neighbor iteration uniform and bug-free." },
      { name: "In-place rotate via transpose + reverse", description: "Rotate 90° CW = transpose + reverse each row. `O(1)` extra space." },
      { name: "Markers in the matrix itself", description: "Use special values (`-1`, `'#'`) to mark visited cells — saves a separate `visited` matrix." },
    ],
    complexity: "Single pass: `O(rows × cols)`. BFS/DFS on a grid: `O(rows × cols)` time and space.",
  },

  "Math": {
    overview: "Number-theoretic and arithmetic problems: GCD, primes, powers, modular arithmetic, base conversion. Often there's a clever closed-form that beats any algorithm.",
    whenToUse: [
      "The problem is stated in terms of numbers and the answer has a formula.",
      "You can use modular arithmetic to keep numbers in range.",
      "Bit-level tricks (parity, last set bit, power of two) shortcut a loop.",
    ],
    keyPatterns: [
      { name: "GCD / LCM", description: "`gcd(a,b) = gcd(b, a%b)`; `lcm(a,b) = a/gcd(a,b)*b` (divide first to avoid overflow)." },
      { name: "Fast exponentiation", description: "`pow(x, n) = pow(x*x, n/2)` if n even, else `x * pow(x, n-1)`. `O(log n)`." },
      { name: "Sieve of Eratosthenes", description: "Mark composites in `O(n log log n)`. Standard tool for 'all primes up to n'." },
    ],
    complexity: "Most operations are `O(1)` or `O(log n)`. Watch for integer overflow — promote to `int64` or use `BigInt` early.",
  },

  "Bit Manipulation": {
    overview: "Treat an integer as a packed array of bits. Single-bit ops run in `O(1)` and replace whole loops; bitmask DP encodes subsets in a single integer.",
    whenToUse: [
      "Set/clear/test individual bits, count set bits, find the lone unique number.",
      "Subset/state DP where `n ≤ 20` (so `2^n ≤ 10⁶`).",
      "Roles/permissions/flags packed for cache and speed.",
    ],
    keyPatterns: [
      { name: "XOR self-cancellation", description: "`x ^ x = 0`, `x ^ 0 = x` — XOR all elements to find the lone non-paired one." },
      { name: "n & (n-1) clears the lowest set bit", description: "Loop and count to get popcount; or test `(n & (n-1)) == 0` for power of two." },
      { name: "Bitmask as subset", description: "Bit `i` of the mask = 'item `i` is in the subset'. Iterate `mask = 0..1<<n` to enumerate all subsets." },
    ],
    complexity: "Per-op `O(1)`. Bitmask DP: `O(2^n × n)` time, `O(2^n)` space.",
  },

  "Prefix Sum": {
    overview: "Pre-compute `prefix[i] = sum(arr[0..i])` so any range sum is `prefix[r] - prefix[l-1]` in `O(1)`. Generalizes to any associative aggregation (XOR, GCD, count).",
    whenToUse: [
      "Many range-sum/range-aggregate queries against a static array.",
      "Subarray problems where the desired property is a function of `prefix[j] - prefix[i]`.",
      "2D analogues: integral images, sub-matrix sums.",
    ],
    keyPatterns: [
      { name: "Subarray-sum equals K", description: "Walk the prefix; for each `prefix[i]`, count occurrences of `prefix[i] - k` in a hash map." },
      { name: "Equilibrium index", description: "An index where `prefix[i-1] == total - prefix[i]`. Single pass after computing total." },
      { name: "2D prefix sum", description: "`P[i][j] = arr[i][j] + P[i-1][j] + P[i][j-1] - P[i-1][j-1]`. Sub-rect query is `O(1)`." },
    ],
    complexity: "Build prefix: `O(n)`. Each query: `O(1)`. Space `O(n)`.",
  },

  "Counting": {
    overview: "Count occurrences of values, characters, or events — usually with a fixed-size array (when the universe is small) or a hash map.",
    whenToUse: [
      "Anagrams, character frequency, ransom-note style 'do I have enough of each?'",
      "Mode, top-k, majority element.",
      "Counting sort when values fall in a small known range.",
    ],
    keyPatterns: [
      { name: "Fixed-size bucket", description: "26 lowercase letters, 256 ASCII, 0..n digits — array indexing is faster than a hash map." },
      { name: "Boyer-Moore majority vote", description: "`O(n)` time, `O(1)` space algorithm for finding a strict-majority element." },
      { name: "Frequency map with tie-break", description: "Sort entries by `(-count, key)` for deterministic top-k results." },
    ],
    complexity: "`O(n)` to count, `O(k)` to summarize where `k` is the number of distinct values.",
  },

  "Combinatorics": {
    overview: "Counting arrangements without enumerating them: combinations, permutations, Catalan numbers, inclusion-exclusion. Typically a closed-form formula plus modular arithmetic.",
    whenToUse: [
      "'How many ways to …' with no algorithmic choice — pure counting.",
      "Computing nCr or nPr for problems with up to `~10⁶` terms.",
      "Recognizing classical sequences (Catalan for valid parens, Stirling for partitions).",
    ],
    keyPatterns: [
      { name: "Pascal's triangle DP", description: "`C[n][k] = C[n-1][k-1] + C[n-1][k]`. `O(n²)` space for all (n,k); `O(n)` rolling for a fixed `n`." },
      { name: "Modular inverse for nCr mod p", description: "`nCr % p = n! * inv(r!) * inv((n-r)!) % p`. Precompute factorials and Fermat's little inverse." },
      { name: "Stars and bars", description: "Number of ways to put `n` balls into `k` boxes = `C(n+k-1, k-1)`." },
    ],
    complexity: "Closed-form: `O(1)` to `O(log p)`. Pascal-table DP: `O(n²)`.",
  },

  "Design": {
    overview: "Implement a class/system with required methods at required complexities (LRU cache, time-bounded key-value store, randomized set, log rate-limiter). Tests your data-structure composition skills.",
    whenToUse: [
      "Problem statement is 'implement X with the following methods …'.",
      "Constraints dictate operation costs (e.g., `O(1)` get + `O(1)` put on an LRU).",
    ],
    keyPatterns: [
      { name: "HashMap + doubly-linked list", description: "LRU cache: map gives `O(1)` lookup, linked list gives `O(1)` reorder." },
      { name: "HashMap + dynamic array with swap-and-pop", description: "RandomizedSet: `O(1)` insert/remove/getRandom by swapping the removed item with the last and popping." },
      { name: "Treap / sorted structure", description: "When you need ordered iteration, range queries, or k-th element with mutations." },
    ],
    complexity: "State the per-method complexity in your design and verify each one — that's what the interviewer scores.",
  },

  "Simulation": {
    overview: "Faithfully execute the rules described by the problem. The challenge is correctness and clean code, not algorithmic cleverness.",
    whenToUse: [
      "Game of Life, robot on a grid, spiral matrix, Tic-Tac-Toe winner.",
      "The brute-force solution is the *intended* solution.",
      "Constraints are small enough that an `O(n²)` or even `O(n³)` simulation passes.",
    ],
    keyPatterns: [
      { name: "Direction state machine", description: "`(dr, dc)` updated by 90° turns. Avoids a giant if-else." },
      { name: "Snapshot-then-mutate", description: "When updates depend on the previous state of *all* cells, copy first, then write." },
      { name: "Bounded simulation", description: "Detect a cycle in state to short-circuit a simulation that would otherwise run for 10⁹ steps." },
    ],
    complexity: "Whatever the rules dictate — usually `O(n²)` or `O(steps × cells)`. Profile before optimizing.",
  },

  "Data Stream": {
    overview: "Process input one element at a time, keeping a small summary of state — you cannot store the whole stream. Tests your ability to maintain rolling invariants.",
    whenToUse: [
      "Median of a stream, moving average, count of unique recent items.",
      "Memory is the constraint: only the *summary* fits.",
    ],
    keyPatterns: [
      { name: "Two heaps for median", description: "Max-heap for the lower half + min-heap for the upper half; rebalance after each insert." },
      { name: "Sliding window with deque or queue", description: "Drop expired elements from the front; add new ones to the back. Amortized `O(1)` per element." },
      { name: "Reservoir sampling", description: "Keep a uniformly random sample of size `k` from a stream of unknown length." },
    ],
    complexity: "Per element should be `O(log k)` or `O(1)`; total memory is the size of the summary.",
  },

  "String Matching": {
    overview: "Find occurrences of a pattern within a text. Naive is `O(n·m)`; KMP, Z-algorithm, and Rabin-Karp give linear or near-linear time by exploiting structure in the pattern.",
    whenToUse: [
      "Substring search, pattern occurrence count, longest border.",
      "You need linear time over a long text.",
      "Multi-pattern: build an Aho-Corasick automaton.",
    ],
    keyPatterns: [
      { name: "KMP failure function", description: "Pre-compute `lps[i] = length of longest proper prefix of pattern[0..i] that is also a suffix`. Match in `O(n+m)`." },
      { name: "Rolling hash (Rabin-Karp)", description: "Hash a sliding window of the text in `O(1)` per step. Verify on hash collision." },
      { name: "Z-function", description: "`z[i]` = length of longest substring starting at `i` that matches a prefix of the string. Linear-time pattern search." },
    ],
    complexity: "Naive: `O(n·m)`. KMP/Z: `O(n+m)`. Rabin-Karp: `O(n+m)` average, `O(n·m)` worst.",
  },

  "Eulerian Path": {
    overview: "A path that uses every edge of a graph exactly once. Exists iff the graph is connected and has exactly 0 or 2 odd-degree vertices (undirected) — or balanced in/out-degrees with at most one offset (directed).",
    whenToUse: [
      "Reconstruct an itinerary from flight tickets.",
      "Walk a maze visiting every corridor exactly once.",
      "Genome assembly (de Bruijn graphs).",
    ],
    keyPatterns: [
      { name: "Hierholzer's algorithm", description: "Iterative DFS that splices in detour cycles whenever the current cycle gets stuck. `O(E)`." },
      { name: "Lexicographic priority queue", description: "When ties matter, use a min-heap or sorted list of neighbors so the resulting path is lexicographically smallest." },
    ],
    complexity: "`O(V + E)` time and space.",
  },
};
