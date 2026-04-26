// Phase 9 — Intervals + Greedy cluster (15 problems)

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

export const phase9Questions = [];
function add(q) { phase9Questions.push(q); }

// 1. Insert Interval
add({
  id: "insert-interval",
  number: 72,
  title: "Insert Interval",
  difficulty: "Medium",
  categories: ["Array", "Intervals"],
  prompt: "You are given an array of non-overlapping intervals sorted by start time and a new interval. Insert the new interval into the list (merging overlaps as needed). Return the resulting list of non-overlapping intervals sorted by start time.",
  constraints: ["0 <= intervals.length <= 1e4", "intervals[i].length == 2", "intervals[i][0] <= intervals[i][1]", "intervals are sorted by start"],
  hints: [
    "Three phases: append all that end before newInterval starts; merge all that overlap; append the rest.",
    "Track running start = min, end = max while merging.",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Single linear scan with merge phase." },
  alternatives: [{ approach: "Concatenate & merge", time: "O(n log n)", space: "O(n)" }],
  pitfalls: ["Boundary touch (intervals[i][1] == newInterval[0]) merges, not separates."],
  followups: [],
  signature: { fn: "insertInterval", params: [{ name: "intervals", adapt: "identity" }, { name: "newInterval", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function insert(intervals: number[][], newInterval: number[]): number[][] {
  const out: number[][] = [];
  let [s, e] = newInterval;
  let i = 0;
  while (i < intervals.length && intervals[i][1] < s) out.push(intervals[i++]);
  while (i < intervals.length && intervals[i][0] <= e) {
    s = Math.min(s, intervals[i][0]);
    e = Math.max(e, intervals[i][1]);
    i++;
  }
  out.push([s, e]);
  while (i < intervals.length) out.push(intervals[i++]);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { intervals: [[1,3],[6,9]], newInterval: [2,5] } });
    t.push({ name: "example-2", category: "example", input: { intervals: [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval: [4,8] } });
    t.push({ name: "empty-list", category: "edge", input: { intervals: [], newInterval: [5,7] } });
    t.push({ name: "before-all", category: "edge", input: { intervals: [[5,7],[10,12]], newInterval: [1,2] } });
    t.push({ name: "after-all", category: "edge", input: { intervals: [[1,2],[3,4]], newInterval: [10,12] } });
    t.push({ name: "swallow-all", category: "edge", input: { intervals: [[2,3],[5,7],[8,10]], newInterval: [1,11] } });
    t.push({ name: "touch-merge", category: "edge", input: { intervals: [[1,5]], newInterval: [5,7] } });
    {
      const r = rng(901);
      const intervals = [];
      let cur = 0;
      for (let i = 0; i < 1000; i++) {
        const s = cur + randInt(r, 1, 5);
        const e = s + randInt(r, 0, 4);
        intervals.push([s, e]);
        cur = e + randInt(r, 1, 3);
      }
      t.push({ name: "stress-1000", category: "stress", input: { intervals, newInterval: [intervals[100][0] - 2, intervals[800][1] + 2] } });
    }
    return t;
  },
});

// 2. Merge Intervals
add({
  id: "merge-intervals",
  number: 109,
  title: "Merge Intervals",
  difficulty: "Medium",
  categories: ["Array", "Sorting", "Intervals"],
  prompt: "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals and return an array of non-overlapping intervals that cover all the intervals in the input.",
  constraints: ["1 <= intervals.length <= 1e4", "0 <= start_i <= end_i <= 1e4"],
  hints: [
    "Sort by start; sweep, merging into the last interval if start <= last.end.",
  ],
  optimal: { time: "O(n log n)", space: "O(n)", approach: "Sort by start, then sweep merge." },
  alternatives: [],
  pitfalls: ["Touching intervals (a.end == b.start) overlap — merge them."],
  followups: ["Insert Interval (sorted input)."],
  signature: { fn: "mergeIntervals", params: [{ name: "intervals", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function merge(intervals: number[][]): number[][] {
  if (intervals.length === 0) return [];
  const arr = intervals.slice().sort((a, b) => a[0] - b[0]);
  const out: number[][] = [arr[0].slice()];
  for (let i = 1; i < arr.length; i++) {
    const last = out[out.length - 1];
    if (arr[i][0] <= last[1]) last[1] = Math.max(last[1], arr[i][1]);
    else out.push(arr[i].slice());
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { intervals: [[1,3],[2,6],[8,10],[15,18]] } });
    t.push({ name: "example-2-touch", category: "example", input: { intervals: [[1,4],[4,5]] } });
    t.push({ name: "single", category: "edge", input: { intervals: [[1,5]] } });
    t.push({ name: "all-overlap", category: "edge", input: { intervals: [[1,10],[2,5],[3,4]] } });
    t.push({ name: "no-overlap", category: "edge", input: { intervals: [[1,2],[3,4],[5,6]] } });
    t.push({ name: "reverse-order", category: "edge", input: { intervals: [[5,7],[1,3]] } });
    t.push({ name: "duplicates", category: "edge", input: { intervals: [[1,3],[1,3],[2,4]] } });
    {
      const r = rng(902);
      const intervals = Array.from({ length: 5000 }, () => { const s = randInt(r, 0, 10000); return [s, s + randInt(r, 0, 100)]; });
      t.push({ name: "stress-5000", category: "stress", input: { intervals } });
    }
    return t;
  },
});

// 3. Non-overlapping Intervals
add({
  id: "non-overlapping-intervals",
  number: 125,
  title: "Non-overlapping Intervals",
  difficulty: "Medium",
  categories: ["Array", "Greedy", "Intervals", "Sorting", "Dynamic Programming"],
  prompt: "Given an array of intervals, return the minimum number of intervals you need to remove to make the rest non-overlapping (touching at endpoints is allowed).",
  constraints: ["1 <= intervals.length <= 1e5", "intervals[i].length == 2", "-5e4 <= start_i < end_i <= 5e4"],
  hints: ["Sort by end; greedily keep intervals that don't overlap with the last kept end."],
  optimal: { time: "O(n log n)", space: "O(1) aux", approach: "Sort by end and greedy keep." },
  alternatives: [{ approach: "DP on sorted intervals", time: "O(n²)", space: "O(n)" }],
  pitfalls: ["Sort by end (not start) — start-sort gives wrong greedy.", "Touching (a.end == b.start) is not overlap."],
  followups: [],
  signature: { fn: "eraseOverlapIntervals", params: [{ name: "intervals", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function eraseOverlapIntervals(intervals: number[][]): number {
  if (intervals.length === 0) return 0;
  const arr = intervals.slice().sort((a, b) => a[1] - b[1]);
  let end = arr[0][1], removed = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i][0] < end) removed++;
    else end = arr[i][1];
  }
  return removed;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { intervals: [[1,2],[2,3],[3,4],[1,3]] } });
    t.push({ name: "example-2-all-same", category: "example", input: { intervals: [[1,2],[1,2],[1,2]] } });
    t.push({ name: "example-3-no-overlap", category: "example", input: { intervals: [[1,2],[2,3]] } });
    t.push({ name: "single", category: "edge", input: { intervals: [[1,5]] } });
    t.push({ name: "nested", category: "edge", input: { intervals: [[1,10],[2,3],[4,5],[6,7]] } });
    {
      const r = rng(903);
      const intervals = Array.from({ length: 5000 }, () => { const s = randInt(r, 0, 50000); return [s, s + randInt(r, 1, 100)]; });
      t.push({ name: "stress-5000", category: "stress", input: { intervals } });
    }
    return t;
  },
});

// 4. Meeting Rooms
add({
  id: "meeting-rooms",
  number: 107,
  title: "Meeting Rooms",
  difficulty: "Easy",
  categories: ["Array", "Sorting", "Intervals"],
  prompt: "Given an array of meeting time intervals, determine if a person could attend all meetings (no two meetings overlap; touching is allowed).",
  constraints: ["0 <= intervals.length <= 1e4", "0 <= start_i < end_i <= 1e6"],
  hints: ["Sort by start; check that each meeting's start >= previous meeting's end."],
  optimal: { time: "O(n log n)", space: "O(1)", approach: "Sort + linear sweep." },
  alternatives: [],
  pitfalls: ["Strict overlap: start < prev_end (touching is fine)."],
  followups: ["Meeting Rooms II."],
  signature: { fn: "canAttendMeetings", params: [{ name: "intervals", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function canAttendMeetings(intervals: number[][]): boolean {
  const arr = intervals.slice().sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < arr.length; i++) if (arr[i][0] < arr[i - 1][1]) return false;
  return true;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { intervals: [[0,30],[5,10],[15,20]] } });
    t.push({ name: "example-2", category: "example", input: { intervals: [[7,10],[2,4]] } });
    t.push({ name: "empty", category: "edge", input: { intervals: [] } });
    t.push({ name: "touching-ok", category: "edge", input: { intervals: [[1,5],[5,10]] } });
    t.push({ name: "single", category: "edge", input: { intervals: [[2,7]] } });
    t.push({ name: "duplicates", category: "edge", input: { intervals: [[1,2],[1,2]] } });
    {
      const r = rng(904);
      const intervals = [];
      let cur = 0;
      for (let i = 0; i < 1000; i++) { const s = cur + randInt(r, 0, 5); const e = s + randInt(r, 1, 5); intervals.push([s, e]); cur = e; }
      t.push({ name: "stress-1000-no-overlap", category: "stress", input: { intervals } });
    }
    return t;
  },
});

// 5. Meeting Rooms II
add({
  id: "meeting-rooms-ii",
  number: 108,
  title: "Meeting Rooms II",
  difficulty: "Medium",
  categories: ["Array", "Sorting", "Heap / Priority Queue", "Intervals"],
  prompt: "Given an array of meeting time intervals, return the minimum number of conference rooms required.",
  constraints: ["0 <= intervals.length <= 1e4", "0 <= start_i < end_i <= 1e6"],
  hints: [
    "Sweep line: sort starts and ends, walk simultaneously; track active count; peak = answer.",
    "Equivalent to: each new start that doesn't yet have a freed room needs a new room.",
  ],
  optimal: { time: "O(n log n)", space: "O(n)", approach: "Sweep line over sorted starts/ends." },
  alternatives: [{ approach: "Min-heap of end times", time: "O(n log n)", space: "O(n)" }],
  pitfalls: ["Touch handling: if start == end, room is freed first (use <= when releasing)."],
  followups: [],
  signature: { fn: "minMeetingRooms", params: [{ name: "intervals", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function minMeetingRooms(intervals: number[][]): number {
  if (intervals.length === 0) return 0;
  const starts = intervals.map((x) => x[0]).sort((a, b) => a - b);
  const ends = intervals.map((x) => x[1]).sort((a, b) => a - b);
  let rooms = 0, peak = 0, j = 0;
  for (let i = 0; i < starts.length; i++) {
    while (j < ends.length && ends[j] <= starts[i]) { rooms--; j++; }
    rooms++;
    if (rooms > peak) peak = rooms;
  }
  return peak;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { intervals: [[0,30],[5,10],[15,20]] } });
    t.push({ name: "example-2", category: "example", input: { intervals: [[7,10],[2,4]] } });
    t.push({ name: "empty", category: "edge", input: { intervals: [] } });
    t.push({ name: "single", category: "edge", input: { intervals: [[1,5]] } });
    t.push({ name: "all-overlap", category: "edge", input: { intervals: [[1,10],[2,8],[3,7]] } });
    t.push({ name: "touch-no-overlap", category: "edge", input: { intervals: [[1,5],[5,10],[10,15]] } });
    {
      const r = rng(905);
      const intervals = Array.from({ length: 10000 }, () => { const s = randInt(r, 0, 1000000); return [s, s + randInt(r, 1, 100)]; });
      t.push({ name: "stress-10000", category: "stress", input: { intervals } });
    }
    return t;
  },
});

// 6. Minimum Number of Arrows to Burst Balloons
add({
  id: "minimum-number-of-arrows-to-burst-balloons",
  number: 117,
  title: "Minimum Number of Arrows to Burst Balloons",
  difficulty: "Medium",
  categories: ["Array", "Greedy", "Sorting", "Intervals"],
  prompt: "Given balloons[i] = [x_start, x_end], find the minimum number of vertical arrows that must be shot to burst all balloons. An arrow at x bursts every balloon with x_start <= x <= x_end.",
  constraints: ["1 <= points.length <= 1e5", "x_start <= x_end", "-2³¹ <= x <= 2³¹ - 1"],
  hints: ["Sort by x_end; greedy: shoot at the smallest end; reset only when next.start > current arrow position."],
  optimal: { time: "O(n log n)", space: "O(1)", approach: "Sort by end, sweep." },
  alternatives: [],
  pitfalls: ["Touching (a.end == b.start) shares an arrow — use > (not >=) for the new-arrow check."],
  followups: [],
  signature: { fn: "findMinArrowShots", params: [{ name: "points", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function findMinArrowShots(points: number[][]): number {
  if (points.length === 0) return 0;
  const arr = points.slice().sort((a, b) => a[1] - b[1]);
  let arrows = 1, end = arr[0][1];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i][0] > end) { arrows++; end = arr[i][1]; }
  }
  return arrows;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { points: [[10,16],[2,8],[1,6],[7,12]] } });
    t.push({ name: "example-2", category: "example", input: { points: [[1,2],[3,4],[5,6],[7,8]] } });
    t.push({ name: "all-overlap", category: "edge", input: { points: [[1,10],[2,9],[3,8]] } });
    t.push({ name: "single", category: "edge", input: { points: [[5,7]] } });
    t.push({ name: "touching-end-start", category: "edge", input: { points: [[1,2],[2,3],[3,4]] } });
    {
      const r = rng(906);
      const points = Array.from({ length: 10000 }, () => { const s = randInt(r, 0, 100000); return [s, s + randInt(r, 0, 100)]; });
      t.push({ name: "stress-10k", category: "stress", input: { points } });
    }
    return t;
  },
});

// 7. Best Time to Buy and Sell Stock II
add({
  id: "best-time-to-buy-and-sell-stock-ii",
  number: 7,
  title: "Best Time to Buy and Sell Stock II",
  difficulty: "Medium",
  categories: ["Array", "Greedy", "Dynamic Programming"],
  prompt: "You are given an integer array prices where prices[i] is the price on day i. You may buy and sell as many times as you like (but only one share at a time). Return the maximum profit.",
  constraints: ["1 <= prices.length <= 3e4", "0 <= prices[i] <= 1e4"],
  hints: ["Sum every positive day-to-day delta — equivalent to picking every uphill segment."],
  optimal: { time: "O(n)", space: "O(1)", approach: "Greedy sum of positive deltas." },
  alternatives: [{ approach: "Peak-valley", time: "O(n)", space: "O(1)" }],
  pitfalls: ["Don't try to find peaks/valleys explicitly — sum of deltas is simpler and correct."],
  followups: [],
  signature: { fn: "maxProfitII", params: [{ name: "prices", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function maxProfit(prices: number[]): number {
  let p = 0;
  for (let i = 1; i < prices.length; i++) if (prices[i] > prices[i - 1]) p += prices[i] - prices[i - 1];
  return p;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { prices: [7,1,5,3,6,4] } });
    t.push({ name: "example-2-monotonic", category: "example", input: { prices: [1,2,3,4,5] } });
    t.push({ name: "example-3-no-profit", category: "example", input: { prices: [7,6,4,3,1] } });
    t.push({ name: "single", category: "edge", input: { prices: [5] } });
    t.push({ name: "two-down", category: "edge", input: { prices: [9,2] } });
    t.push({ name: "with-zeros", category: "edge", input: { prices: [0,1,0,2,0,3] } });
    {
      const r = rng(907);
      const prices = Array.from({ length: 30000 }, () => randInt(r, 0, 10000));
      t.push({ name: "stress-30k", category: "stress", input: { prices } });
    }
    return t;
  },
});

// 8. Gas Station
add({
  id: "gas-station",
  number: 61,
  title: "Gas Station",
  difficulty: "Medium",
  categories: ["Array", "Greedy"],
  prompt: "There are n gas stations along a circular route, where the amount of gas at station i is gas[i]. To travel from i to i+1 costs cost[i] units. Given gas and cost, return the starting gas station's index if you can travel around the circuit once in the clockwise direction; otherwise return -1. Solution is unique if it exists.",
  constraints: ["1 <= n <= 1e5", "0 <= gas[i], cost[i] <= 1e4"],
  hints: [
    "If sum(gas) < sum(cost), impossible.",
    "Otherwise: scan once, reset start to i+1 whenever the running tank goes negative.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Single pass with reset on negative tank." },
  alternatives: [],
  pitfalls: ["Need both checks: total >= 0 globally, AND the contiguous segment from the last reset works."],
  followups: [],
  signature: { fn: "canCompleteCircuit", params: [{ name: "gas", adapt: "identity" }, { name: "cost", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function canCompleteCircuit(gas: number[], cost: number[]): number {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const d = gas[i] - cost[i];
    total += d;
    tank += d;
    if (tank < 0) { start = i + 1; tank = 0; }
  }
  return total < 0 ? -1 : start;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { gas: [1,2,3,4,5], cost: [3,4,5,1,2] } });
    t.push({ name: "example-2-impossible", category: "example", input: { gas: [2,3,4], cost: [3,4,3] } });
    t.push({ name: "single-fits", category: "edge", input: { gas: [5], cost: [5] } });
    t.push({ name: "single-deficit", category: "edge", input: { gas: [2], cost: [3] } });
    t.push({ name: "exact-tie", category: "edge", input: { gas: [3,1,1], cost: [1,2,2] } });
    {
      const r = rng(908);
      const n = 100000;
      const gas = Array.from({ length: n }, () => randInt(r, 0, 100));
      const cost = Array.from({ length: n }, () => randInt(r, 0, 100));
      t.push({ name: "stress-100k", category: "stress", input: { gas, cost } });
    }
    return t;
  },
});

// 9. Hand of Straights
add({
  id: "hand-of-straights",
  number: 66,
  title: "Hand of Straights",
  difficulty: "Medium",
  categories: ["Array", "Hash Table", "Sorting", "Greedy"],
  prompt: "Alice has a hand of cards, given as an integer array. She wants to rearrange them into groups, where each group is of size groupSize and consists of groupSize consecutive cards. Return true if she can rearrange the cards.",
  constraints: ["1 <= hand.length <= 1e4", "0 <= hand[i] <= 1e9", "1 <= groupSize <= hand.length"],
  hints: [
    "Length must be divisible by groupSize.",
    "Count frequencies; iterate keys ascending; when a key has count > 0, deduct count from the next groupSize-1 keys.",
  ],
  optimal: { time: "O(n log n)", space: "O(n)", approach: "Frequency map + sorted keys + deduct." },
  alternatives: [{ approach: "Min-heap", time: "O(n log n)", space: "O(n)" }],
  pitfalls: ["If next key in sequence is missing or short, fail."],
  followups: [],
  signature: { fn: "isNStraightHand", params: [{ name: "hand", adapt: "identity" }, { name: "groupSize", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isNStraightHand(hand: number[], groupSize: number): boolean {
  if (hand.length % groupSize !== 0) return false;
  const cnt = new Map<number, number>();
  for (const x of hand) cnt.set(x, (cnt.get(x) || 0) + 1);
  const keys = [...cnt.keys()].sort((a, b) => a - b);
  for (const k of keys) {
    const c = cnt.get(k)!;
    if (c > 0) {
      for (let i = 0; i < groupSize; i++) {
        const v = (cnt.get(k + i) || 0) - c;
        if (v < 0) return false;
        cnt.set(k + i, v);
      }
    }
  }
  return true;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { hand: [1,2,3,6,2,3,4,7,8], groupSize: 3 } });
    t.push({ name: "example-2-impossible", category: "example", input: { hand: [1,2,3,4,5], groupSize: 4 } });
    t.push({ name: "size-1", category: "edge", input: { hand: [1,2,3], groupSize: 1 } });
    t.push({ name: "size-eq-len", category: "edge", input: { hand: [1,2,3,4], groupSize: 4 } });
    t.push({ name: "duplicates-fit", category: "edge", input: { hand: [1,1,2,2,3,3], groupSize: 3 } });
    t.push({ name: "duplicates-fail", category: "edge", input: { hand: [1,1,2,3], groupSize: 4 } });
    {
      const r = rng(909);
      const hand = [];
      for (let i = 0; i < 1000; i++) { const s = randInt(r, 0, 100); for (let j = 0; j < 5; j++) hand.push(s + j); }
      t.push({ name: "stress-5000-valid", category: "stress", input: { hand, groupSize: 5 } });
    }
    return t;
  },
});

// 10. Merge Triplets to Form Target Triplet
add({
  id: "merge-triplets-to-form-target-triplet",
  number: 112,
  title: "Merge Triplets to Form Target Triplet",
  difficulty: "Medium",
  categories: ["Array", "Greedy"],
  prompt: "Given a list of triplets and a target triplet [x,y,z], you may pick any subset of triplets and replace any pair of triplets [a,b,c] and [d,e,f] with [max(a,d), max(b,e), max(c,f)]. Return true if it is possible to obtain target.",
  constraints: ["1 <= triplets.length <= 1e5", "0 <= a,b,c,x,y,z <= 1000"],
  hints: [
    "Greedy: only consider triplets where every coord ≤ target's. From those, check if some has a==target[0], some has b==target[1], some has c==target[2].",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Linear scan with three flags." },
  alternatives: [],
  pitfalls: ["Reject any triplet exceeding target in any coordinate."],
  followups: [],
  signature: { fn: "mergeTriplets", params: [{ name: "triplets", adapt: "identity" }, { name: "target", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function mergeTriplets(triplets: number[][], target: number[]): boolean {
  let a = false, b = false, c = false;
  for (const [x, y, z] of triplets) {
    if (x > target[0] || y > target[1] || z > target[2]) continue;
    if (x === target[0]) a = true;
    if (y === target[1]) b = true;
    if (z === target[2]) c = true;
  }
  return a && b && c;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { triplets: [[2,5,3],[1,8,4],[1,7,5]], target: [2,7,5] } });
    t.push({ name: "example-2-impossible", category: "example", input: { triplets: [[3,4,5],[4,5,6]], target: [3,2,5] } });
    t.push({ name: "exact-match-single", category: "edge", input: { triplets: [[1,2,3]], target: [1,2,3] } });
    t.push({ name: "all-too-large", category: "edge", input: { triplets: [[10,10,10]], target: [5,5,5] } });
    t.push({ name: "need-all-three", category: "edge", input: { triplets: [[5,1,1],[1,5,1],[1,1,5]], target: [5,5,5] } });
    {
      const r = rng(910);
      const triplets = Array.from({ length: 100000 }, () => [randInt(r, 0, 100), randInt(r, 0, 100), randInt(r, 0, 100)]);
      t.push({ name: "stress-100k", category: "stress", input: { triplets, target: [50, 50, 50] } });
    }
    return t;
  },
});

// 11. Partition Labels
add({
  id: "partition-labels",
  number: 135,
  title: "Partition Labels",
  difficulty: "Medium",
  categories: ["String", "Hash Table", "Two Pointers", "Greedy"],
  prompt: "You are given a string s. Partition s into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts, in order.",
  constraints: ["1 <= s.length <= 500", "Lowercase English letters."],
  hints: [
    "Record last occurrence of each character.",
    "Sweep, extending current end to max(end, last[s[i]]); when i hits end, cut.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Last-occurrence map + greedy expansion." },
  alternatives: [],
  pitfalls: [],
  followups: [],
  signature: { fn: "partitionLabels", params: [{ name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function partitionLabels(s: string): number[] {
  const last = new Map<string, number>();
  for (let i = 0; i < s.length; i++) last.set(s[i], i);
  const out: number[] = [];
  let start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last.get(s[i])!);
    if (i === end) { out.push(end - start + 1); start = i + 1; }
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "ababcbacadefegdehijhklij" } });
    t.push({ name: "example-2", category: "example", input: { s: "eccbbbbdec" } });
    t.push({ name: "single-char", category: "edge", input: { s: "a" } });
    t.push({ name: "all-distinct", category: "edge", input: { s: "abcdef" } });
    t.push({ name: "all-same", category: "edge", input: { s: "aaaaa" } });
    t.push({ name: "two-blocks", category: "edge", input: { s: "aabbcc" } });
    {
      const r = rng(911);
      let s = "";
      for (let i = 0; i < 500; i++) s += "abcdefghij"[randInt(r, 0, 9)];
      t.push({ name: "stress-500", category: "stress", input: { s } });
    }
    return t;
  },
});

// 12. Valid Parenthesis String
add({
  id: "valid-parenthesis-string",
  number: 191,
  title: "Valid Parenthesis String",
  difficulty: "Medium",
  categories: ["String", "Stack", "Greedy", "Dynamic Programming"],
  prompt: "Given a string s containing only '(', ')', and '*', return true if s is valid. '*' may be treated as '(', ')', or empty.",
  constraints: ["1 <= s.length <= 100", "s consists of '(', ')', '*' only"],
  hints: [
    "Greedy: track lo/hi = min/max possible open count after processing prefix.",
    "If hi < 0 at any point, fail; clamp lo at 0; final lo must be 0.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Two-pointer interval of possible open counts." },
  alternatives: [{ approach: "Two stacks", time: "O(n)", space: "O(n)" }, { approach: "DP", time: "O(n²)", space: "O(n²)" }],
  pitfalls: ["When clamping lo, don't forget — '*' as '(' could rescue later."],
  followups: [],
  signature: { fn: "checkValidString", params: [{ name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function checkValidString(s: string): boolean {
  let lo = 0, hi = 0;
  for (const c of s) {
    if (c === "(") { lo++; hi++; }
    else if (c === ")") { lo--; hi--; }
    else { lo--; hi++; }
    if (hi < 0) return false;
    if (lo < 0) lo = 0;
  }
  return lo === 0;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "()" } });
    t.push({ name: "example-2", category: "example", input: { s: "(*)" } });
    t.push({ name: "example-3", category: "example", input: { s: "(*))" } });
    t.push({ name: "all-stars", category: "edge", input: { s: "****" } });
    t.push({ name: "single-star", category: "edge", input: { s: "*" } });
    t.push({ name: "single-open", category: "edge", input: { s: "(" } });
    t.push({ name: "single-close", category: "edge", input: { s: ")" } });
    t.push({ name: "deep-nesting", category: "edge", input: { s: "((((**))))" } });
    {
      const r = rng(912);
      let s = "";
      for (let i = 0; i < 100; i++) s += "()*"[randInt(r, 0, 2)];
      t.push({ name: "stress-100", category: "stress", input: { s } });
    }
    return t;
  },
});

// 13. Candy
add({
  id: "candy",
  number: 19,
  title: "Candy",
  difficulty: "Hard",
  categories: ["Array", "Greedy"],
  prompt: "There are n children standing in a line, each with a rating. You are giving candies subject to: each child has at least one candy; children with a higher rating get more than their immediate neighbors. Return the minimum number of candies you must give.",
  constraints: ["1 <= ratings.length <= 2*1e4", "0 <= ratings[i] <= 2*1e4"],
  hints: ["Two passes: left-to-right then right-to-left, taking max."],
  optimal: { time: "O(n)", space: "O(n)", approach: "Two-pass greedy." },
  alternatives: [{ approach: "Single-pass slope counting", time: "O(n)", space: "O(1)" }],
  pitfalls: ["Right pass must take max with current value (not overwrite)."],
  followups: [],
  signature: { fn: "candy", params: [{ name: "ratings", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function candy(ratings: number[]): number {
  const n = ratings.length;
  const c = new Array(n).fill(1);
  for (let i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
  for (let i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
  return c.reduce((a, b) => a + b, 0);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { ratings: [1,0,2] } });
    t.push({ name: "example-2", category: "example", input: { ratings: [1,2,2] } });
    t.push({ name: "single", category: "edge", input: { ratings: [5] } });
    t.push({ name: "all-equal", category: "edge", input: { ratings: [3,3,3,3] } });
    t.push({ name: "monotonic-up", category: "edge", input: { ratings: [1,2,3,4,5] } });
    t.push({ name: "monotonic-down", category: "edge", input: { ratings: [5,4,3,2,1] } });
    t.push({ name: "v-shape", category: "edge", input: { ratings: [3,2,1,2,3] } });
    {
      const r = rng(913);
      const ratings = Array.from({ length: 20000 }, () => randInt(r, 0, 100));
      t.push({ name: "stress-20k", category: "stress", input: { ratings } });
    }
    return t;
  },
});

// 14. Boats to Save People
add({
  id: "boats-to-save-people",
  number: 17,
  title: "Boats to Save People",
  difficulty: "Medium",
  categories: ["Array", "Two Pointers", "Greedy", "Sorting"],
  prompt: "You are given an array people and an integer limit. Each boat carries at most 2 people whose total weight ≤ limit. Return the minimum number of boats to carry every person.",
  constraints: ["1 <= people.length <= 5*1e4", "1 <= people[i] <= limit <= 3*1e4"],
  hints: ["Sort; two pointers from ends. Pair lightest with heaviest if they fit; otherwise heaviest goes alone."],
  optimal: { time: "O(n log n)", space: "O(1)", approach: "Sort + two pointers." },
  alternatives: [],
  pitfalls: [],
  followups: [],
  signature: { fn: "numRescueBoats", params: [{ name: "people", adapt: "identity" }, { name: "limit", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function numRescueBoats(people: number[], limit: number): number {
  const arr = people.slice().sort((a, b) => a - b);
  let lo = 0, hi = arr.length - 1, boats = 0;
  while (lo <= hi) {
    if (arr[lo] + arr[hi] <= limit) lo++;
    hi--;
    boats++;
  }
  return boats;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { people: [1,2], limit: 3 } });
    t.push({ name: "example-2", category: "example", input: { people: [3,2,2,1], limit: 3 } });
    t.push({ name: "example-3", category: "example", input: { people: [3,5,3,4], limit: 5 } });
    t.push({ name: "single", category: "edge", input: { people: [4], limit: 5 } });
    t.push({ name: "all-equal-fit-pairs", category: "edge", input: { people: [2,2,2,2], limit: 4 } });
    t.push({ name: "all-equal-no-pairs", category: "edge", input: { people: [5,5,5,5], limit: 6 } });
    {
      const r = rng(914);
      const people = Array.from({ length: 50000 }, () => randInt(r, 1, 30000));
      t.push({ name: "stress-50k", category: "stress", input: { people, limit: 30000 } });
    }
    return t;
  },
});

// 15. Minimum Interval to Include Each Query
add({
  id: "minimum-interval-to-include-each-query",
  number: 116,
  title: "Minimum Interval to Include Each Query",
  difficulty: "Hard",
  categories: ["Array", "Binary Search", "Heap / Priority Queue", "Sorting", "Intervals"],
  prompt: "Given a 2D array intervals where intervals[i] = [l_i, r_i] and an array queries, for each query q find the size (r-l+1) of the smallest interval such that l ≤ q ≤ r. If no such interval exists, return -1 for that query. Return an array of answers in the original query order.",
  constraints: ["1 <= intervals.length <= 1e5", "1 <= queries.length <= 1e5", "1 <= l <= r <= 1e7", "1 <= q <= 1e7"],
  hints: [
    "Sort intervals by start; sort queries; sweep and use a min-heap keyed by interval size.",
    "Pop intervals whose end < current query.",
  ],
  optimal: { time: "O((n + q) log n)", space: "O(n)", approach: "Sweep + min-heap of (size, end)." },
  alternatives: [{ approach: "Offline + segment tree", time: "O((n+q) log n)", space: "O(n)" }],
  pitfalls: ["Restore original order via index pairing."],
  followups: [],
  signature: { fn: "minInterval", params: [{ name: "intervals", adapt: "identity" }, { name: "queries", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function minInterval(intervals: number[][], queries: number[]): number[] {
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  const order = queries.map((q, i) => [q, i] as [number, number]).sort((a, b) => a[0] - b[0]);
  const h: [number, number][] = []; // [size, end]
  // ... binary heap helpers (min-heap by size)
  const out = new Array(queries.length).fill(-1);
  let p = 0;
  for (const [q, idx] of order) {
    while (p < sorted.length && sorted[p][0] <= q) {
      const [a, b] = sorted[p++];
      heapPush(h, [b - a + 1, b]);
    }
    while (h.length && h[0][1] < q) heapPop(h);
    out[idx] = h.length ? h[0][0] : -1;
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { intervals: [[1,4],[2,4],[3,6],[4,4]], queries: [2,3,4,5] } });
    t.push({ name: "example-2", category: "example", input: { intervals: [[2,3],[2,5],[1,8],[20,25]], queries: [2,19,5,22] } });
    t.push({ name: "no-match", category: "edge", input: { intervals: [[1,3]], queries: [5,6,7] } });
    t.push({ name: "single-interval", category: "edge", input: { intervals: [[1,10]], queries: [1,5,10,11] } });
    t.push({ name: "single-query", category: "edge", input: { intervals: [[1,3],[2,5],[4,8]], queries: [4] } });
    t.push({ name: "all-same-interval", category: "edge", input: { intervals: [[1,5],[1,5],[1,5]], queries: [1,3,5] } });
    {
      const r = rng(915);
      const intervals = Array.from({ length: 5000 }, () => { const s = randInt(r, 1, 100000); return [s, s + randInt(r, 0, 100)]; });
      const queries = Array.from({ length: 5000 }, () => randInt(r, 1, 100100));
      t.push({ name: "stress-5k", category: "stress", input: { intervals, queries } });
    }
    return t;
  },
});
