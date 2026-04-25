// Phase 6 — Heap / Priority Queue / Trie cluster (10 problems)

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randInt(r, lo, hi) {
  return Math.floor(r() * (hi - lo + 1)) + lo;
}

export const phase6Questions = [];
function add(q) { phase6Questions.push(q); }

// 1. Kth Largest Element in an Array
add({
  id: "kth-largest-element-in-an-array",
  leetcode_number: 215,
  title: "Kth Largest Element in an Array",
  difficulty: "Medium",
  categories: ["Array", "Heap / Priority Queue", "Divide & Conquer", "Sorting"],
  sources: ["Blind 75", "LeetCode Top Interview 150"],
  prompt:
    "Given an integer array `nums` and an integer `k`, return the kth largest element in the array. Note that it is the kth largest element in sorted order, not the kth distinct element.",
  constraints: ["1 <= k <= nums.length <= 1e5", "-1e4 <= nums[i] <= 1e4"],
  hints: [
    "Maintain a min-heap of size k while scanning; the heap top at the end is the answer.",
    "Quickselect (partition-based) gives O(n) average time, O(n^2) worst.",
    "Sorting is the simplest O(n log n) baseline.",
  ],
  optimal: { time: "O(n log k)", space: "O(k)", approach: "Min-heap of size k." },
  alternatives: [
    { approach: "Quickselect", time: "O(n) avg / O(n^2) worst", space: "O(1)" },
    { approach: "Sort and index", time: "O(n log n)", space: "O(1)" },
  ],
  pitfalls: ["Off-by-one: kth largest at sorted index n-k, not n-k+1."],
  followups: ["What if the array is huge and you can only stream it?"],
  signature: { fn: "findKthLargest", params: [{ name: "nums", adapt: "identity" }, { name: "k", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function findKthLargest(nums: number[], k: number): number {
  // Min-heap of size k; the top is the kth largest seen so far.
  const h: number[] = [];
  const up = (i: number) => { while (i > 0) { const p = (i - 1) >> 1; if (h[i] < h[p]) { [h[i], h[p]] = [h[p], h[i]]; i = p; } else break; } };
  const down = (i: number) => { for (;;) { const l = 2*i+1, r = 2*i+2; let m = i;
    if (l < h.length && h[l] < h[m]) m = l; if (r < h.length && h[r] < h[m]) m = r;
    if (m === i) break; [h[i], h[m]] = [h[m], h[i]]; i = m; } };
  for (const x of nums) {
    if (h.length < k) { h.push(x); up(h.length - 1); }
    else if (x > h[0]) { h[0] = x; down(0); }
  }
  return h[0];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [3,2,1,5,6,4], k: 2 } });
    t.push({ name: "example-2", category: "example", input: { nums: [3,2,3,1,2,4,5,5,6], k: 4 } });
    t.push({ name: "single", category: "edge", input: { nums: [1], k: 1 } });
    t.push({ name: "all-equal", category: "edge", input: { nums: [5,5,5,5], k: 3 } });
    t.push({ name: "k-equals-n", category: "edge", input: { nums: [7,1,3,9,2], k: 5 } });
    t.push({ name: "negatives", category: "edge", input: { nums: [-1,-5,-3,-2,-4], k: 2 } });
    t.push({ name: "mixed-signs", category: "edge", input: { nums: [-10, 0, 10, 5, -5], k: 3 } });
    t.push({ name: "sorted-asc", category: "edge", input: { nums: [1,2,3,4,5,6,7,8,9,10], k: 4 } });
    t.push({ name: "sorted-desc", category: "edge", input: { nums: [10,9,8,7,6,5,4,3,2,1], k: 7 } });
    {
      const r = rng(101);
      const nums = Array.from({ length: 10000 }, () => randInt(r, -10000, 10000));
      t.push({ name: "stress-10k", category: "stress", input: { nums, k: 1234 } });
    }
    {
      const r = rng(202);
      const nums = Array.from({ length: 50000 }, () => randInt(r, -10000, 10000));
      t.push({ name: "stress-50k-k1", category: "stress", input: { nums, k: 1 } });
    }
    return t;
  },
});

// 2. Kth Largest Element in a Stream
add({
  id: "kth-largest-element-in-a-stream",
  leetcode_number: 703,
  title: "Kth Largest Element in a Stream",
  difficulty: "Easy",
  categories: ["Heap / Priority Queue", "Design", "Data Stream"],
  sources: ["LeetCode Top Interview 150"],
  prompt:
    "Design a class that finds the kth largest element in a stream. Implement `KthLargest(k, nums)` initializer and `add(val) -> number` which returns the kth largest after adding val. Inputs are op protocols of the form `[['KthLargest', k, nums], ['add', v], ...]`; outputs include `null` for the constructor and the kth-largest after each add.",
  constraints: ["1 <= k <= 1e4", "0 <= nums.length <= 1e4", "-1e4 <= val <= 1e4", "There will be at least k elements in the heap when add returns."],
  hints: [
    "Keep a min-heap of size k. The top is always the kth largest.",
    "On add: push if size<k; else if val>top, pop and push.",
    "Initialization: feed nums through the same process.",
  ],
  optimal: { time: "O(log k) per add", space: "O(k)", approach: "Min-heap of size k." },
  alternatives: [],
  pitfalls: ["Adding to a sorted array is O(n) per op, too slow at scale."],
  followups: ["Support `remove(val)` as well."],
  signature: { fn: "kthLargestStreamOps", params: [{ name: "ops", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class KthLargest {
  private h: number[] = [];
  constructor(private k: number, nums: number[]) {
    for (const x of nums) this.add(x);
  }
  add(val: number): number {
    if (this.h.length < this.k) { this.h.push(val); this.up(this.h.length - 1); }
    else if (val > this.h[0]) { this.h[0] = val; this.down(0); }
    return this.h[0];
  }
  private up(i: number) { while (i > 0) { const p = (i - 1) >> 1; if (this.h[i] < this.h[p]) { [this.h[i], this.h[p]] = [this.h[p], this.h[i]]; i = p; } else break; } }
  private down(i: number) { for (;;) { const l = 2*i+1, r = 2*i+2; let m = i;
    if (l < this.h.length && this.h[l] < this.h[m]) m = l; if (r < this.h.length && this.h[r] < this.h[m]) m = r;
    if (m === i) break; [this.h[i], this.h[m]] = [this.h[m], this.h[i]]; i = m; } }
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { ops: [["KthLargest", 3, [4,5,8,2]], ["add", 3], ["add", 5], ["add", 10], ["add", 9], ["add", 4]] } });
    t.push({ name: "k-1", category: "edge", input: { ops: [["KthLargest", 1, []], ["add", -3], ["add", -2], ["add", -4], ["add", 0], ["add", 4]] } });
    t.push({ name: "init-empty", category: "edge", input: { ops: [["KthLargest", 2, []], ["add", 5], ["add", 3], ["add", 7]] } });
    t.push({ name: "duplicates", category: "edge", input: { ops: [["KthLargest", 2, [5,5,5]], ["add", 5], ["add", 6], ["add", 5]] } });
    t.push({ name: "negatives", category: "edge", input: { ops: [["KthLargest", 3, [-10,-5,-1]], ["add", -3], ["add", -7]] } });
    t.push({ name: "decreasing-stream", category: "edge", input: { ops: [["KthLargest", 2, []], ["add", 10], ["add", 9], ["add", 8], ["add", 7]] } });
    t.push({ name: "increasing-stream", category: "edge", input: { ops: [["KthLargest", 2, []], ["add", 1], ["add", 2], ["add", 3], ["add", 4]] } });
    {
      const r = rng(303);
      const init = Array.from({ length: 100 }, () => randInt(r, -10000, 10000));
      const ops = [["KthLargest", 50, init]];
      for (let i = 0; i < 5000; i++) ops.push(["add", randInt(r, -10000, 10000)]);
      t.push({ name: "stress-5k-ops", category: "stress", input: { ops } });
    }
    return t;
  },
});

// 3. K Closest Points to Origin
add({
  id: "k-closest-points-to-origin",
  leetcode_number: 973,
  title: "K Closest Points to Origin",
  difficulty: "Medium",
  categories: ["Array", "Heap / Priority Queue", "Math", "Divide & Conquer", "Sorting"],
  sources: ["LeetCode Top Interview 150", "Grind 75"],
  prompt:
    "Given an array of points where points[i] = [xi, yi] and an integer k, return the k closest points to the origin (0,0). The distance is the Euclidean distance. Any order is acceptable.",
  constraints: ["1 <= k <= points.length <= 1e4", "-1e4 <= xi, yi <= 1e4"],
  hints: [
    "Compare squared distances; no need for sqrt.",
    "Max-heap of size k: pop when over-size.",
    "Quickselect by squared distance gives O(n) average.",
  ],
  optimal: { time: "O(n log k)", space: "O(k)", approach: "Max-heap of size k by x²+y²." },
  alternatives: [
    { approach: "Sort by distance", time: "O(n log n)", space: "O(1)" },
    { approach: "Quickselect", time: "O(n) avg", space: "O(1)" },
  ],
  pitfalls: ["Computing sqrt is unnecessary and risks fp imprecision.", "Order of returned points is not specified — comparator uses set semantics."],
  followups: ["Stream of points: maintain top-k closest."],
  signature: { fn: "kClosest", params: [{ name: "points", adapt: "identity" }, { name: "k", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function kClosest(points: number[][], k: number): number[][] {
  // Max-heap of size k by squared distance.
  type E = [number, number, number]; // [dist², x, y]
  const h: E[] = [];
  const less = (a: E, b: E) => a[0] > b[0]; // max-heap
  const up = (i: number) => { while (i > 0) { const p = (i - 1) >> 1; if (less(h[i], h[p])) { [h[i], h[p]] = [h[p], h[i]]; i = p; } else break; } };
  const down = (i: number) => { for (;;) { const l = 2*i+1, r = 2*i+2; let m = i;
    if (l < h.length && less(h[l], h[m])) m = l; if (r < h.length && less(h[r], h[m])) m = r;
    if (m === i) break; [h[i], h[m]] = [h[m], h[i]]; i = m; } };
  for (const [x, y] of points) {
    const d = x*x + y*y;
    if (h.length < k) { h.push([d, x, y]); up(h.length - 1); }
    else if (d < h[0][0]) { h[0] = [d, x, y]; down(0); }
  }
  return h.map(([, x, y]) => [x, y]);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { points: [[1,3],[-2,2]], k: 1 } });
    t.push({ name: "example-2", category: "example", input: { points: [[3,3],[5,-1],[-2,4]], k: 2 } });
    t.push({ name: "single", category: "edge", input: { points: [[0,0]], k: 1 } });
    t.push({ name: "k-equals-n", category: "edge", input: { points: [[1,2],[3,4],[5,6]], k: 3 } });
    t.push({ name: "duplicates", category: "edge", input: { points: [[1,1],[1,1],[2,2]], k: 2 } });
    t.push({ name: "negatives", category: "edge", input: { points: [[-1,-1],[-2,-2],[-3,-3]], k: 1 } });
    t.push({ name: "ties", category: "edge", input: { points: [[3,4],[-3,-4],[5,0],[0,5]], k: 2 } });
    {
      const r = rng(404);
      const points = Array.from({ length: 5000 }, () => [randInt(r, -10000, 10000), randInt(r, -10000, 10000)]);
      t.push({ name: "stress-5k", category: "stress", input: { points, k: 100 } });
    }
    return t;
  },
});

// 4. Last Stone Weight
add({
  id: "last-stone-weight",
  leetcode_number: 1046,
  title: "Last Stone Weight",
  difficulty: "Easy",
  categories: ["Array", "Heap / Priority Queue"],
  sources: ["Grind 75"],
  prompt:
    "You are given an array of integers stones where stones[i] is the weight of the ith stone. We are playing a game with the stones: on each turn, choose the two heaviest stones x ≤ y and smash them. If x == y, both are destroyed; else the new stone has weight y - x. Return the weight of the last remaining stone, or 0 if none remain.",
  constraints: ["1 <= stones.length <= 30", "1 <= stones[i] <= 1000"],
  hints: [
    "Use a max-heap; repeatedly pop two and push the difference.",
    "Stop when ≤1 stones remain.",
  ],
  optimal: { time: "O(n log n)", space: "O(n)", approach: "Max-heap simulation." },
  alternatives: [{ approach: "Sorted array (resort each step)", time: "O(n² log n)", space: "O(n)" }],
  pitfalls: ["Forgetting to push when x == y (correctly: don't push)."],
  followups: ["Last Stone Weight II — partition / DP variant."],
  signature: { fn: "lastStoneWeight", params: [{ name: "stones", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function lastStoneWeight(stones: number[]): number {
  const h = [...stones];
  const less = (a: number, b: number) => a > b; // max-heap
  const up = (i: number) => { while (i > 0) { const p = (i - 1) >> 1; if (less(h[i], h[p])) { [h[i], h[p]] = [h[p], h[i]]; i = p; } else break; } };
  const down = (i: number) => { for (;;) { const l = 2*i+1, r = 2*i+2; let m = i;
    if (l < h.length && less(h[l], h[m])) m = l; if (r < h.length && less(h[r], h[m])) m = r;
    if (m === i) break; [h[i], h[m]] = [h[m], h[i]]; i = m; } };
  for (let i = (h.length >> 1) - 1; i >= 0; i--) down(i);
  const pop = () => { const top = h[0]; const last = h.pop()!; if (h.length) { h[0] = last; down(0); } return top; };
  while (h.length > 1) {
    const y = pop(), x = pop();
    if (y !== x) { h.push(y - x); up(h.length - 1); }
  }
  return h.length ? h[0] : 0;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { stones: [2,7,4,1,8,1] } });
    t.push({ name: "example-2", category: "example", input: { stones: [1] } });
    t.push({ name: "all-equal-pairs", category: "edge", input: { stones: [3,3,3,3] } });
    t.push({ name: "two-equal", category: "edge", input: { stones: [5,5] } });
    t.push({ name: "two-different", category: "edge", input: { stones: [9,2] } });
    t.push({ name: "single-stone", category: "edge", input: { stones: [42] } });
    t.push({ name: "all-ones", category: "edge", input: { stones: [1,1,1,1,1,1] } });
    t.push({ name: "all-ones-odd", category: "edge", input: { stones: [1,1,1,1,1] } });
    {
      const r = rng(505);
      const stones = Array.from({ length: 30 }, () => randInt(r, 1, 1000));
      t.push({ name: "stress-30", category: "stress", input: { stones } });
    }
    return t;
  },
});

// 5. Task Scheduler
add({
  id: "task-scheduler",
  leetcode_number: 621,
  title: "Task Scheduler",
  difficulty: "Medium",
  categories: ["Array", "Hash Table", "Heap / Priority Queue", "Greedy"],
  sources: ["LeetCode Top Interview 150"],
  prompt:
    "Given a character array tasks (each character is a task type) and a non-negative integer n (cooldown), return the least number of intervals the CPU needs to finish all tasks, where the same task type must be at least n intervals apart.",
  constraints: ["1 <= tasks.length <= 1e4", "tasks[i] is uppercase English letter", "0 <= n <= 100"],
  hints: [
    "Frequency-only matters; let M = max frequency, k = count of tasks with that max frequency.",
    "Build a skeleton: (M-1)*(n+1) + k slots.",
    "Answer is max(skeleton, len(tasks)) — when many distinct tasks exist, no idle slots are needed.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Greedy formula on max frequency and ties." },
  alternatives: [{ approach: "Heap simulation with cooldown queue", time: "O(t log 26)", space: "O(26)" }],
  pitfalls: ["Forgetting tasks.length lower bound (when there are many distinct tasks)."],
  followups: ["What if n is very large?", "What if you must preserve task order?"],
  signature: { fn: "leastInterval", params: [{ name: "tasks", adapt: "identity" }, { name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function leastInterval(tasks: string[], n: number): number {
  const cnt = new Map<string, number>();
  for (const t of tasks) cnt.set(t, (cnt.get(t) || 0) + 1);
  let maxCnt = 0, ties = 0;
  for (const v of cnt.values()) {
    if (v > maxCnt) { maxCnt = v; ties = 1; }
    else if (v === maxCnt) ties++;
  }
  return Math.max(tasks.length, (maxCnt - 1) * (n + 1) + ties);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { tasks: ["A","A","A","B","B","B"], n: 2 } });
    t.push({ name: "example-2-no-cooldown", category: "example", input: { tasks: ["A","C","A","B","D","B"], n: 1 } });
    t.push({ name: "example-3", category: "example", input: { tasks: ["A","A","A","B","B","B"], n: 0 } });
    t.push({ name: "single-task", category: "edge", input: { tasks: ["A"], n: 5 } });
    t.push({ name: "all-distinct", category: "edge", input: { tasks: ["A","B","C","D","E"], n: 2 } });
    t.push({ name: "many-tied-max", category: "edge", input: { tasks: ["A","A","B","B","C","C"], n: 2 } });
    t.push({ name: "high-cooldown", category: "edge", input: { tasks: ["A","A","A"], n: 100 } });
    t.push({ name: "long-balanced", category: "edge", input: { tasks: Array.from({length: 20}, (_, i) => "ABCDE"[i % 5]), n: 4 } });
    {
      const r = rng(606);
      const tasks = Array.from({ length: 10000 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[randInt(r, 0, 25)]);
      t.push({ name: "stress-10k", category: "stress", input: { tasks, n: 50 } });
    }
    return t;
  },
});

// 6. Find Median from Data Stream
add({
  id: "find-median-from-data-stream",
  leetcode_number: 295,
  title: "Find Median from Data Stream",
  difficulty: "Hard",
  categories: ["Heap / Priority Queue", "Design", "Data Stream"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt:
    "Design a data structure that supports `addNum(num)` and `findMedian()` in a streaming fashion. The median is the middle value of an ordered list (or average of two middle values). Inputs are op protocols of the form `[['MedianFinder'], ['addNum', n], ['findMedian'], ...]`; outputs are `null` for ctor/addNum and the current median for findMedian.",
  constraints: ["At most 5e4 calls", "-1e5 <= num <= 1e5"],
  hints: [
    "Maintain two heaps: a max-heap for the lower half and min-heap for the upper half.",
    "Balance so that |lo| - |hi| ∈ {0, 1}.",
    "Median = lo.top() if lo bigger, else (lo.top()+hi.top())/2.",
  ],
  optimal: { time: "O(log n) addNum, O(1) findMedian", space: "O(n)", approach: "Two heaps (lower max-heap, upper min-heap)." },
  alternatives: [
    { approach: "Sorted array w/ binary insertion", time: "O(n) addNum / O(1) findMedian", space: "O(n)" },
  ],
  pitfalls: ["Off-by-one when the lower half should always have ≥ size of upper.", "Returning integer division for the average."],
  followups: ["What if all numbers are in [0, 100]?", "What if 99% of numbers are in [0, 100]?"],
  signature: { fn: "medianFinderOps", params: [{ name: "ops", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class MedianFinder {
  private lo: number[] = []; // max-heap
  private hi: number[] = []; // min-heap
  addNum(num: number): void {
    this.pushLo(num);
    this.pushHi(this.popLo()!);
    if (this.hi.length > this.lo.length) this.pushLo(this.popHi()!);
  }
  findMedian(): number {
    return this.lo.length > this.hi.length ? this.lo[0] : (this.lo[0] + this.hi[0]) / 2;
  }
  // ... heap helpers (max-heap on lo, min-heap on hi)
  private pushLo(x: number) { this.lo.push(x); this.upMax(this.lo, this.lo.length-1); }
  private popLo() { const t = this.lo[0]; const last = this.lo.pop()!; if (this.lo.length) { this.lo[0] = last; this.downMax(this.lo, 0); } return t; }
  private pushHi(x: number) { this.hi.push(x); this.upMin(this.hi, this.hi.length-1); }
  private popHi() { const t = this.hi[0]; const last = this.hi.pop()!; if (this.hi.length) { this.hi[0] = last; this.downMin(this.hi, 0); } return t; }
  private upMax(h: number[], i: number) { while (i>0) { const p=(i-1)>>1; if (h[i]>h[p]) { [h[i],h[p]]=[h[p],h[i]]; i=p; } else break; } }
  private downMax(h: number[], i: number) { for(;;) { const l=2*i+1,r=2*i+2; let m=i;
    if (l<h.length&&h[l]>h[m]) m=l; if (r<h.length&&h[r]>h[m]) m=r; if (m===i) break; [h[i],h[m]]=[h[m],h[i]]; i=m; } }
  private upMin(h: number[], i: number) { while (i>0) { const p=(i-1)>>1; if (h[i]<h[p]) { [h[i],h[p]]=[h[p],h[i]]; i=p; } else break; } }
  private downMin(h: number[], i: number) { for(;;) { const l=2*i+1,r=2*i+2; let m=i;
    if (l<h.length&&h[l]<h[m]) m=l; if (r<h.length&&h[r]<h[m]) m=r; if (m===i) break; [h[i],h[m]]=[h[m],h[i]]; i=m; } }
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { ops: [["MedianFinder"],["addNum",1],["addNum",2],["findMedian"],["addNum",3],["findMedian"]] } });
    t.push({ name: "single", category: "edge", input: { ops: [["MedianFinder"],["addNum",5],["findMedian"]] } });
    t.push({ name: "negatives", category: "edge", input: { ops: [["MedianFinder"],["addNum",-1],["addNum",-2],["addNum",-3],["findMedian"]] } });
    t.push({ name: "duplicates", category: "edge", input: { ops: [["MedianFinder"],["addNum",2],["addNum",2],["addNum",2],["findMedian"],["addNum",2],["findMedian"]] } });
    t.push({ name: "alternating", category: "edge", input: { ops: [["MedianFinder"],["addNum",1],["addNum",10],["addNum",2],["addNum",9],["findMedian"],["addNum",3],["findMedian"]] } });
    t.push({ name: "increasing", category: "edge", input: { ops: [["MedianFinder"],["addNum",1],["addNum",2],["addNum",3],["addNum",4],["addNum",5],["findMedian"]] } });
    t.push({ name: "decreasing", category: "edge", input: { ops: [["MedianFinder"],["addNum",5],["addNum",4],["addNum",3],["addNum",2],["addNum",1],["findMedian"]] } });
    {
      const r = rng(707);
      const ops = [["MedianFinder"]];
      for (let i = 0; i < 10000; i++) {
        if (i % 7 === 6) ops.push(["findMedian"]);
        else ops.push(["addNum", randInt(r, -100000, 100000)]);
      }
      ops.push(["findMedian"]);
      t.push({ name: "stress-10k", category: "stress", input: { ops } });
    }
    return t;
  },
});

// 7. Implement Trie
add({
  id: "implement-trie",
  leetcode_number: 208,
  title: "Implement Trie (Prefix Tree)",
  difficulty: "Medium",
  categories: ["String", "Trie", "Hash Table", "Design"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt:
    "Implement a Trie with `insert(word)`, `search(word) -> bool` (exact match), and `startsWith(prefix) -> bool`. Inputs are op protocols of the form `[['Trie'], ['insert', w], ['search', w], ['startsWith', p], ...]`; outputs are `null` for ctor/insert and the boolean for search/startsWith.",
  constraints: ["1 <= word.length, prefix.length <= 2000", "Lowercase English letters", "At most 3e4 calls"],
  hints: [
    "Each node has up to 26 children + an `isEnd` flag.",
    "search(word) walks the path and returns isEnd; startsWith returns true if the path exists.",
    "Hash-map-of-children is simpler than fixed array for sparse alphabets.",
  ],
  optimal: { time: "O(L) per op", space: "O(total chars)", approach: "Tree of nodes with children map and end flag." },
  alternatives: [{ approach: "Sorted set + binary search prefix", time: "O(L log n)", space: "O(n*L)" }],
  pitfalls: ["search vs startsWith confusion: search requires isEnd=true."],
  followups: ["Add `delete(word)`.", "Compress to a radix tree."],
  signature: { fn: "trieOps", params: [{ name: "ops", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class TrieNode { children = new Map<string, TrieNode>(); end = false; }
class Trie {
  private root = new TrieNode();
  insert(word: string): void {
    let cur = this.root;
    for (const c of word) {
      if (!cur.children.has(c)) cur.children.set(c, new TrieNode());
      cur = cur.children.get(c)!;
    }
    cur.end = true;
  }
  search(word: string): boolean { const n = this.walk(word); return !!n && n.end; }
  startsWith(p: string): boolean { return !!this.walk(p); }
  private walk(s: string): TrieNode | null {
    let cur = this.root;
    for (const c of s) { const nxt = cur.children.get(c); if (!nxt) return null; cur = nxt; }
    return cur;
  }
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { ops: [["Trie"],["insert","apple"],["search","apple"],["search","app"],["startsWith","app"],["insert","app"],["search","app"]] } });
    t.push({ name: "empty-search", category: "edge", input: { ops: [["Trie"],["search","x"],["startsWith","x"]] } });
    t.push({ name: "duplicate-insert", category: "edge", input: { ops: [["Trie"],["insert","ab"],["insert","ab"],["search","ab"]] } });
    t.push({ name: "shared-prefix", category: "edge", input: { ops: [["Trie"],["insert","car"],["insert","card"],["insert","care"],["search","car"],["search","care"],["search","carb"],["startsWith","ca"]] } });
    t.push({ name: "single-letter", category: "edge", input: { ops: [["Trie"],["insert","a"],["search","a"],["startsWith","a"]] } });
    t.push({ name: "long-words", category: "edge", input: { ops: [["Trie"],["insert","abcdefghij"],["search","abcdefghi"],["search","abcdefghij"],["startsWith","abcde"]] } });
    {
      const r = rng(808);
      const ops = [["Trie"]];
      const dict = [];
      for (let i = 0; i < 1000; i++) {
        const len = randInt(r, 3, 12);
        let w = "";
        for (let j = 0; j < len; j++) w += "abcdefghijklmnopqrstuvwxyz"[randInt(r, 0, 25)];
        dict.push(w);
        ops.push(["insert", w]);
      }
      for (let i = 0; i < 2000; i++) {
        const w = dict[randInt(r, 0, dict.length - 1)];
        ops.push([i % 2 ? "search" : "startsWith", w]);
      }
      for (let i = 0; i < 500; i++) {
        let w = "";
        const len = randInt(r, 3, 12);
        for (let j = 0; j < len; j++) w += "abcdefghijklmnopqrstuvwxyz"[randInt(r, 0, 25)];
        ops.push(["search", w]);
      }
      t.push({ name: "stress-3500", category: "stress", input: { ops } });
    }
    return t;
  },
});

// 8. Design Add and Search Words Data Structure
add({
  id: "design-add-and-search-words-data-structure",
  leetcode_number: 211,
  title: "Design Add and Search Words Data Structure",
  difficulty: "Medium",
  categories: ["String", "Trie", "DFS", "Design"],
  sources: ["Blind 75"],
  prompt:
    "Design a data structure with `addWord(word)` and `search(word) -> bool` where word may contain '.' which matches any single letter. Inputs are op protocols `[['WordDictionary'], ['addWord', w], ['search', w], ...]`; outputs are `null` for ctor/addWord and bool for search.",
  constraints: ["1 <= word.length <= 25", "word in addWord uses lowercase letters", "word in search uses lowercase letters or '.'", "At most 1e4 calls", "At most 3 dots in any search word."],
  hints: [
    "Trie + DFS: when you see '.', recurse over all children at the current node.",
    "Cap on '.' count keeps worst-case manageable.",
  ],
  optimal: { time: "O(L) addWord; O(26^d * L) search where d=dots", space: "O(N*L)", approach: "Trie + DFS with wildcard." },
  alternatives: [{ approach: "Per-length bucketed lists + regex", time: "varies", space: "O(N*L)" }],
  pitfalls: ["Forgetting to require isEnd at the recursion's deepest match.", "Iterating over absent children."],
  followups: ["Many wildcards: prune dead branches.", "Support '*' (zero or more)."],
  signature: { fn: "wordDictionaryOps", params: [{ name: "ops", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class WDNode { children = new Map<string, WDNode>(); end = false; }
class WordDictionary {
  private root = new WDNode();
  addWord(word: string): void {
    let cur = this.root;
    for (const c of word) {
      if (!cur.children.has(c)) cur.children.set(c, new WDNode());
      cur = cur.children.get(c)!;
    }
    cur.end = true;
  }
  search(word: string): boolean { return this.dfs(word, 0, this.root); }
  private dfs(w: string, i: number, node: WDNode): boolean {
    if (i === w.length) return node.end;
    const c = w[i];
    if (c === ".") {
      for (const nxt of node.children.values()) if (this.dfs(w, i+1, nxt)) return true;
      return false;
    }
    const nxt = node.children.get(c);
    return !!nxt && this.dfs(w, i+1, nxt);
  }
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { ops: [["WordDictionary"],["addWord","bad"],["addWord","dad"],["addWord","mad"],["search","pad"],["search","bad"],["search",".ad"],["search","b.."]] } });
    t.push({ name: "all-dots", category: "edge", input: { ops: [["WordDictionary"],["addWord","abc"],["search","..."],["search","...."]] } });
    t.push({ name: "no-words", category: "edge", input: { ops: [["WordDictionary"],["search","..."],["search","abc"]] } });
    t.push({ name: "duplicate-add", category: "edge", input: { ops: [["WordDictionary"],["addWord","cat"],["addWord","cat"],["search","cat"]] } });
    t.push({ name: "single-letter-dot", category: "edge", input: { ops: [["WordDictionary"],["addWord","a"],["search","."],["search","a"],["search",".."]] } });
    t.push({ name: "shared-prefix", category: "edge", input: { ops: [["WordDictionary"],["addWord","car"],["addWord","card"],["search","ca."],["search","car."],["search","car"]] } });
    {
      const r = rng(909);
      const ops = [["WordDictionary"]];
      for (let i = 0; i < 500; i++) {
        const len = randInt(r, 3, 10);
        let w = "";
        for (let j = 0; j < len; j++) w += "abcdefghijklmnop"[randInt(r, 0, 15)];
        ops.push(["addWord", w]);
      }
      for (let i = 0; i < 800; i++) {
        const len = randInt(r, 3, 10);
        let w = "";
        for (let j = 0; j < len; j++) {
          if (randInt(r, 0, 9) === 0) w += "."; // ~10% dots, max ~3 over len 10
          else w += "abcdefghijklmnop"[randInt(r, 0, 15)];
        }
        ops.push(["search", w]);
      }
      t.push({ name: "stress-1300", category: "stress", input: { ops } });
    }
    return t;
  },
});

// 9. Word Search II
add({
  id: "word-search-ii",
  leetcode_number: 212,
  title: "Word Search II",
  difficulty: "Hard",
  categories: ["Array", "String", "Trie", "Backtracking", "Matrix"],
  sources: ["LeetCode Top Interview 150"],
  prompt:
    "Given an m x n board of characters and a list of words, return all words that can be constructed from letters of sequentially adjacent cells (horizontally/vertically), where the same cell may not be used more than once in a word. Order of returned words is not specified.",
  constraints: ["1 <= m, n <= 12", "1 <= words.length <= 3e4", "1 <= words[i].length <= 10", "All inputs are lowercase letters."],
  hints: [
    "Build a trie of all words; do DFS from each cell, walking the trie alongside.",
    "When you hit a node with a word, record it and clear it to avoid duplicates.",
    "Prune dead branches by removing exhausted children to speed up later DFS.",
  ],
  optimal: { time: "O(m*n*4^L)", space: "O(N*L)", approach: "Trie + DFS with pruning." },
  alternatives: [{ approach: "Per-word DFS", time: "O(W * m*n*4^L)", space: "O(L)" }],
  pitfalls: ["Returning duplicates if the same word is reachable two ways.", "Forgetting to restore the cell after DFS (visited marker)."],
  followups: ["Words with wildcards.", "Match in all 8 directions."],
  signature: { fn: "findWords", params: [{ name: "board", adapt: "identity" }, { name: "words", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "sortedArray",
  solutionTs:
`function findWords(board: string[][], words: string[]): string[] {
  type Node = { children: Map<string, Node>; word: string | null };
  const root: Node = { children: new Map(), word: null };
  for (const w of words) {
    let cur = root;
    for (const c of w) {
      if (!cur.children.has(c)) cur.children.set(c, { children: new Map(), word: null });
      cur = cur.children.get(c)!;
    }
    cur.word = w;
  }
  const m = board.length, n = board[0].length;
  const out: string[] = [];
  const dfs = (i: number, j: number, node: Node): void => {
    if (i < 0 || j < 0 || i >= m || j >= n) return;
    const c = board[i][j];
    if (c === "#") return;
    const nxt = node.children.get(c);
    if (!nxt) return;
    if (nxt.word) { out.push(nxt.word); nxt.word = null; }
    board[i][j] = "#";
    dfs(i+1,j,nxt); dfs(i-1,j,nxt); dfs(i,j+1,nxt); dfs(i,j-1,nxt);
    board[i][j] = c;
    if (nxt.children.size === 0) node.children.delete(c);
  };
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) dfs(i, j, root);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { board: [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words: ["oath","pea","eat","rain"] } });
    t.push({ name: "example-2-none", category: "example", input: { board: [["a","b"],["c","d"]], words: ["abcb"] } });
    t.push({ name: "single-cell-match", category: "edge", input: { board: [["a"]], words: ["a","b"] } });
    t.push({ name: "single-cell-no-match", category: "edge", input: { board: [["a"]], words: ["aa"] } });
    t.push({ name: "all-same-letter", category: "edge", input: { board: [["a","a","a"],["a","a","a"],["a","a","a"]], words: ["aaa","aaaa","aaaaaaaaaa"] } });
    t.push({ name: "duplicates-in-words", category: "edge", input: { board: [["a","b"],["c","d"]], words: ["ab","ab","ac","cd"] } });
    t.push({ name: "long-snake", category: "edge", input: { board: [["a","b","c","e"],["s","f","c","s"],["a","d","e","e"]], words: ["abcced","see","abcb"] } });
    {
      const r = rng(1010);
      const m = 12, n = 12;
      const board = Array.from({ length: m }, () => Array.from({ length: n }, () => "abcdefg"[randInt(r, 0, 6)]));
      const words = [];
      for (let i = 0; i < 200; i++) {
        const len = randInt(r, 3, 8);
        let w = "";
        for (let j = 0; j < len; j++) w += "abcdefg"[randInt(r, 0, 6)];
        words.push(w);
      }
      t.push({ name: "stress-12x12", category: "stress", input: { board, words } });
    }
    return t;
  },
});

// 10. Reorganize String
add({
  id: "reorganize-string",
  leetcode_number: 767,
  title: "Reorganize String",
  difficulty: "Medium",
  categories: ["String", "Hash Table", "Heap / Priority Queue", "Greedy", "Sorting"],
  sources: ["Grind 75"],
  prompt:
    "Given a string s, rearrange its characters so that no two adjacent characters are the same. Return any valid rearrangement, or `\"\"` if impossible. The reference produces a deterministic output: at each step, pick the two highest-frequency characters; ties broken alphabetically.",
  constraints: ["1 <= s.length <= 500", "s contains lowercase English letters."],
  hints: [
    "Impossible iff max-count > ceil(n/2).",
    "Greedy with a max-heap by count: pop two, append, decrement, push back.",
    "Or place the most frequent char first into even positions, then fill the rest.",
  ],
  optimal: { time: "O(n log k)", space: "O(k)", approach: "Max-heap; pop two, append, push back if remaining." },
  alternatives: [{ approach: "Place most-frequent at even indices first", time: "O(n)", space: "O(k)" }],
  pitfalls: ["Multiple valid outputs exist on LeetCode; this dataset uses the deterministic heap-with-alphabetical-tiebreak output."],
  followups: ["k-distance apart variant: Task Scheduler-style spacing."],
  signature: { fn: "reorganizeString", params: [{ name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function reorganizeString(s: string): string {
  const cnt = new Map<string, number>();
  for (const c of s) cnt.set(c, (cnt.get(c) || 0) + 1);
  // Max-heap by count, then alphabetical tiebreak.
  const less = (a: [number, string], b: [number, string]) => a[0] > b[0] || (a[0] === b[0] && a[1] < b[1]);
  const h: [number, string][] = [];
  const up = (i: number) => { while (i > 0) { const p = (i - 1) >> 1; if (less(h[i], h[p])) { [h[i], h[p]] = [h[p], h[i]]; i = p; } else break; } };
  const down = (i: number) => { for (;;) { const l = 2*i+1, r = 2*i+2; let m = i;
    if (l < h.length && less(h[l], h[m])) m = l; if (r < h.length && less(h[r], h[m])) m = r;
    if (m === i) break; [h[i], h[m]] = [h[m], h[i]]; i = m; } };
  for (const [c, v] of cnt) { h.push([v, c]); up(h.length - 1); }
  if (h[0] && h[0][0] > Math.ceil(s.length / 2)) return "";
  const pop = () => { const t = h[0]; const last = h.pop()!; if (h.length) { h[0] = last; down(0); } return t; };
  let out = "";
  while (h.length >= 2) {
    const a = pop(), b = pop();
    out += a[1] + b[1];
    if (a[0] - 1 > 0) { h.push([a[0]-1, a[1]]); up(h.length - 1); }
    if (b[0] - 1 > 0) { h.push([b[0]-1, b[1]]); up(h.length - 1); }
  }
  if (h.length) out += h[0][1];
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "aab" } });
    t.push({ name: "example-2-impossible", category: "example", input: { s: "aaab" } });
    t.push({ name: "single-char", category: "edge", input: { s: "a" } });
    t.push({ name: "two-same", category: "edge", input: { s: "aa" } });
    t.push({ name: "two-different", category: "edge", input: { s: "ab" } });
    t.push({ name: "all-different", category: "edge", input: { s: "abcdef" } });
    t.push({ name: "balanced", category: "edge", input: { s: "aabb" } });
    t.push({ name: "long-mostly-one", category: "edge", input: { s: "aaaaabbbbcc" } });
    t.push({ name: "exactly-half", category: "edge", input: { s: "aaaabbbb" } });
    {
      const r = rng(1111);
      let s = "";
      for (let i = 0; i < 500; i++) s += "abcdefghijklmnopqrstuvwxyz"[randInt(r, 0, 25)];
      t.push({ name: "stress-500", category: "stress", input: { s } });
    }
    return t;
  },
});
