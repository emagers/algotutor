// Phase 7 — Dynamic Programming cluster (23 problems)
// Note: longest-palindromic-substring and palindromic-substrings are in Phase 2.

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

export const phase7Questions = [];
function add(q) { phase7Questions.push(q); }

// 1. Climbing Stairs
add({
  id: "climbing-stairs",
  leetcode_number: 70,
  title: "Climbing Stairs",
  difficulty: "Easy",
  categories: ["Dynamic Programming", "Math", "Memoization"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb either 1 or 2 steps. In how many distinct ways can you climb to the top?",
  constraints: ["1 <= n <= 45"],
  hints: ["f(n) = f(n-1) + f(n-2) — Fibonacci.", "Iterate with two rolling variables."],
  optimal: { time: "O(n)", space: "O(1)", approach: "Bottom-up DP (Fibonacci)." },
  alternatives: [{ approach: "Recursion + memo", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Stack overflow on naive recursion at n=45 (no memo)."],
  followups: ["k steps allowed at a time."],
  signature: { fn: "climbStairs", params: [{ name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function climbStairs(n: number): number {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) { const c = a + b; a = b; b = c; }
  return b;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "n-1", category: "example", input: { n: 1 } });
    t.push({ name: "n-2", category: "example", input: { n: 2 } });
    t.push({ name: "n-3", category: "example", input: { n: 3 } });
    t.push({ name: "n-5", category: "edge", input: { n: 5 } });
    t.push({ name: "n-10", category: "edge", input: { n: 10 } });
    t.push({ name: "n-20", category: "edge", input: { n: 20 } });
    t.push({ name: "n-45", category: "stress", input: { n: 45 } });
    return t;
  },
});

// 2. House Robber
add({
  id: "house-robber",
  leetcode_number: 198,
  title: "House Robber",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt: "You are a robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have connected security systems and will alert police if both are robbed. Given nums where nums[i] is the money in house i, return the maximum amount you can rob without alerting police.",
  constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
  hints: ["dp[i] = max(dp[i-1], dp[i-2] + nums[i]).", "Two rolling variables suffice."],
  optimal: { time: "O(n)", space: "O(1)", approach: "Rolling DP: prev/cur." },
  alternatives: [],
  pitfalls: ["Forgetting prev when computing the new state."],
  followups: ["Houses arranged in a circle (House Robber II)."],
  signature: { fn: "rob", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function rob(nums: number[]): number {
  let prev = 0, cur = 0;
  for (const x of nums) { const nxt = Math.max(cur, prev + x); prev = cur; cur = nxt; }
  return cur;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,2,3,1] } });
    t.push({ name: "example-2", category: "example", input: { nums: [2,7,9,3,1] } });
    t.push({ name: "single", category: "edge", input: { nums: [5] } });
    t.push({ name: "two-pick-larger", category: "edge", input: { nums: [3,7] } });
    t.push({ name: "all-zero", category: "edge", input: { nums: [0,0,0,0] } });
    t.push({ name: "alternating", category: "edge", input: { nums: [10,1,10,1,10] } });
    t.push({ name: "decreasing", category: "edge", input: { nums: [5,4,3,2,1] } });
    {
      const r = rng(1);
      const nums = Array.from({ length: 100 }, () => randInt(r, 0, 400));
      t.push({ name: "stress-100", category: "stress", input: { nums } });
    }
    return t;
  },
});

// 3. House Robber II
add({
  id: "house-robber-ii",
  leetcode_number: 213,
  title: "House Robber II",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming"],
  sources: ["Blind 75", "LeetCode Top Interview 150"],
  prompt: "Same as House Robber, but the houses are arranged in a circle (the first and last houses are adjacent). Return the maximum amount you can rob.",
  constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 1000"],
  hints: ["Run linear House-Robber twice: once on nums[0..n-2], once on nums[1..n-1].", "Take the max — circular constraint reduces to two linear cases."],
  optimal: { time: "O(n)", space: "O(1)", approach: "Two linear DP runs over slices." },
  alternatives: [],
  pitfalls: ["Single-element edge case: handle separately."],
  followups: [],
  signature: { fn: "robII", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function rob(nums: number[]): number {
  if (nums.length === 1) return nums[0];
  const lin = (arr: number[]) => {
    let p = 0, c = 0;
    for (const x of arr) { const n = Math.max(c, p + x); p = c; c = n; }
    return c;
  };
  return Math.max(lin(nums.slice(0, -1)), lin(nums.slice(1)));
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [2,3,2] } });
    t.push({ name: "example-2", category: "example", input: { nums: [1,2,3,1] } });
    t.push({ name: "single", category: "edge", input: { nums: [5] } });
    t.push({ name: "two-elements", category: "edge", input: { nums: [3,7] } });
    t.push({ name: "three-equal", category: "edge", input: { nums: [4,4,4] } });
    t.push({ name: "all-zero", category: "edge", input: { nums: [0,0,0,0,0] } });
    {
      const r = rng(2);
      const nums = Array.from({ length: 100 }, () => randInt(r, 0, 1000));
      t.push({ name: "stress-100", category: "stress", input: { nums } });
    }
    return t;
  },
});

// 4. Decode Ways
add({
  id: "decode-ways",
  leetcode_number: 91,
  title: "Decode Ways",
  difficulty: "Medium",
  categories: ["String", "Dynamic Programming"],
  sources: ["Blind 75", "LeetCode Top Interview 150"],
  prompt: "A message containing letters from A-Z can be encoded into numbers using A=1, B=2, ..., Z=26. Given a string s containing only digits, return the number of ways to decode it.",
  constraints: ["1 <= s.length <= 100", "s contains only digits and may contain leading zeros."],
  hints: [
    "dp[i] depends on dp[i-1] (single char if not '0') and dp[i-2] (two-char if 10..26).",
    "Leading '0' or invalid two-digit windows make the answer 0.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Rolling DP with two predecessors." },
  alternatives: [{ approach: "Recursion + memo", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Treat '0' specially — it can't stand alone.", "Two-digit windows must be 10..26 inclusive."],
  followups: ["Decode Ways II with '*' wildcards."],
  signature: { fn: "numDecodings", params: [{ name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function numDecodings(s: string): number {
  if (!s || s[0] === "0") return 0;
  let p2 = 1, p1 = 1;
  for (let i = 1; i < s.length; i++) {
    let cur = 0;
    if (s[i] !== "0") cur += p1;
    const two = parseInt(s.slice(i - 1, i + 1), 10);
    if (two >= 10 && two <= 26) cur += p2;
    p2 = p1; p1 = cur;
  }
  return p1;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "12" } });
    t.push({ name: "example-2", category: "example", input: { s: "226" } });
    t.push({ name: "leading-zero", category: "edge", input: { s: "06" } });
    t.push({ name: "single-zero", category: "edge", input: { s: "0" } });
    t.push({ name: "single-digit", category: "edge", input: { s: "9" } });
    t.push({ name: "embedded-zero-valid", category: "edge", input: { s: "10" } });
    t.push({ name: "embedded-zero-invalid", category: "edge", input: { s: "100" } });
    t.push({ name: "high-digits", category: "edge", input: { s: "27" } });
    t.push({ name: "many-twos", category: "edge", input: { s: "1111111111" } });
    {
      const r = rng(3);
      let s = "1"; // ensure no leading zero
      for (let i = 0; i < 99; i++) s += String(randInt(r, 0, 9));
      t.push({ name: "stress-100", category: "stress", input: { s } });
    }
    return t;
  },
});

// 5. Maximum Product Subarray
add({
  id: "maximum-product-subarray",
  leetcode_number: 152,
  title: "Maximum Product Subarray",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming"],
  sources: ["Blind 75", "LeetCode Top Interview 150"],
  prompt: "Given an integer array nums, find a contiguous non-empty subarray that has the largest product, and return that product.",
  constraints: ["1 <= nums.length <= 2*1e4", "-10 <= nums[i] <= 10", "Product fits in a 32-bit integer."],
  hints: [
    "Track both max and min product ending at i — a negative number flips them.",
    "max[i] = max(nums[i], nums[i]*max[i-1], nums[i]*min[i-1]).",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Track running max & min product." },
  alternatives: [],
  pitfalls: ["Ignoring zero (resets both max and min to nums[i])."],
  followups: ["Allow non-contiguous; or longest subarray with product > 0."],
  signature: { fn: "maxProduct", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function maxProduct(nums: number[]): number {
  let maxP = nums[0], minP = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const candidates = [x, x * maxP, x * minP];
    maxP = Math.max(...candidates);
    minP = Math.min(...candidates);
    best = Math.max(best, maxP);
  }
  return best;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [2,3,-2,4] } });
    t.push({ name: "example-2", category: "example", input: { nums: [-2,0,-1] } });
    t.push({ name: "single", category: "edge", input: { nums: [-5] } });
    t.push({ name: "all-negative-even-count", category: "edge", input: { nums: [-2,-3,-4,-5] } });
    t.push({ name: "all-negative-odd-count", category: "edge", input: { nums: [-2,-3,-4] } });
    t.push({ name: "with-zeros", category: "edge", input: { nums: [0,2,-3,0,4,5] } });
    t.push({ name: "all-zeros", category: "edge", input: { nums: [0,0,0] } });
    t.push({ name: "all-positive", category: "edge", input: { nums: [1,2,3,4,5] } });
    {
      const r = rng(4);
      const nums = Array.from({ length: 20000 }, () => randInt(r, -10, 10));
      t.push({ name: "stress-20k", category: "stress", input: { nums } });
    }
    return t;
  },
});

// 6. Longest Increasing Subsequence
add({
  id: "longest-increasing-subsequence",
  leetcode_number: 300,
  title: "Longest Increasing Subsequence",
  difficulty: "Medium",
  categories: ["Array", "Binary Search", "Dynamic Programming"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
  constraints: ["1 <= nums.length <= 2500", "-1e4 <= nums[i] <= 1e4"],
  hints: [
    "O(n²) DP: dp[i] = max over j<i of dp[j]+1 if nums[j]<nums[i].",
    "O(n log n): patience sorting — keep the smallest tail for each LIS length.",
  ],
  optimal: { time: "O(n log n)", space: "O(n)", approach: "Patience sort: binary-search insert into tails array." },
  alternatives: [{ approach: "DP", time: "O(n²)", space: "O(n)" }],
  pitfalls: ["Strictly increasing vs non-decreasing (use lower_bound, not upper_bound)."],
  followups: ["Reconstruct the actual LIS.", "Number of LIS."],
  signature: { fn: "lengthOfLIS", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function lengthOfLIS(nums: number[]): number {
  const tails: number[] = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (tails[m] < x) lo = m + 1; else hi = m; }
    tails[lo] = x;
  }
  return tails.length;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [10,9,2,5,3,7,101,18] } });
    t.push({ name: "example-2", category: "example", input: { nums: [0,1,0,3,2,3] } });
    t.push({ name: "all-equal", category: "edge", input: { nums: [7,7,7,7,7] } });
    t.push({ name: "single", category: "edge", input: { nums: [42] } });
    t.push({ name: "strictly-increasing", category: "edge", input: { nums: [1,2,3,4,5,6,7,8] } });
    t.push({ name: "strictly-decreasing", category: "edge", input: { nums: [8,7,6,5,4,3,2,1] } });
    t.push({ name: "negatives", category: "edge", input: { nums: [-5,-3,-4,-2,-1] } });
    {
      const r = rng(5);
      const nums = Array.from({ length: 2500 }, () => randInt(r, -10000, 10000));
      t.push({ name: "stress-2500", category: "stress", input: { nums } });
    }
    return t;
  },
});

// 7. Partition Equal Subset Sum
add({
  id: "partition-equal-subset-sum",
  leetcode_number: 416,
  title: "Partition Equal Subset Sum",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given a non-empty array of positive integers nums, return true if you can partition it into two subsets with equal sums.",
  constraints: ["1 <= nums.length <= 200", "1 <= nums[i] <= 100"],
  hints: ["If total is odd, false.", "Else: subset-sum DP for target = total/2 (boolean knapsack)."],
  optimal: { time: "O(n*S)", space: "O(S)", approach: "Boolean subset-sum DP rolled to 1D, iterate descending." },
  alternatives: [{ approach: "Bitset DP", time: "O(n*S/64)", space: "O(S/64)" }],
  pitfalls: ["Iterate s descending in the inner loop to avoid reusing items."],
  followups: ["Partition into k equal subsets."],
  signature: { fn: "canPartition", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function canPartition(nums: number[]): boolean {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  const dp = new Uint8Array(target + 1);
  dp[0] = 1;
  for (const x of nums) {
    for (let s = target; s >= x; s--) if (dp[s - x]) dp[s] = 1;
  }
  return !!dp[target];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,5,11,5] } });
    t.push({ name: "example-2", category: "example", input: { nums: [1,2,3,5] } });
    t.push({ name: "single-even-impossible", category: "edge", input: { nums: [2] } });
    t.push({ name: "two-equal", category: "edge", input: { nums: [3,3] } });
    t.push({ name: "two-different", category: "edge", input: { nums: [2,4] } });
    t.push({ name: "odd-total", category: "edge", input: { nums: [1,2,3,4,5,6,7] } });
    t.push({ name: "all-equal-even-count", category: "edge", input: { nums: [4,4,4,4] } });
    {
      const r = rng(6);
      const nums = Array.from({ length: 200 }, () => randInt(r, 1, 100));
      t.push({ name: "stress-200", category: "stress", input: { nums } });
    }
    return t;
  },
});

// 8. Unique Paths
add({
  id: "unique-paths",
  leetcode_number: 62,
  title: "Unique Paths",
  difficulty: "Medium",
  categories: ["Math", "Dynamic Programming", "Combinatorics"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "There is a robot on an m x n grid at top-left (0,0). It tries to reach the bottom-right (m-1, n-1). The robot can only move down or right. Return the number of unique paths.",
  constraints: ["1 <= m, n <= 100"],
  hints: ["dp[i][j] = dp[i-1][j] + dp[i][j-1].", "Closed form: C(m+n-2, m-1)."],
  optimal: { time: "O(m*n)", space: "O(n)", approach: "Rolling 1D DP." },
  alternatives: [{ approach: "Combinatorics", time: "O(min(m,n))", space: "O(1)" }],
  pitfalls: ["Integer overflow at extreme sizes — fits in 64-bit but not 32-bit at 100x100."],
  followups: ["With obstacles (Unique Paths II)."],
  signature: { fn: "uniquePaths", params: [{ name: "m", adapt: "identity" }, { name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function uniquePaths(m: number, n: number): number {
  const dp = new Array(n).fill(1);
  for (let i = 1; i < m; i++) for (let j = 1; j < n; j++) dp[j] += dp[j - 1];
  return dp[n - 1];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { m: 3, n: 7 } });
    t.push({ name: "example-2", category: "example", input: { m: 3, n: 2 } });
    t.push({ name: "1x1", category: "edge", input: { m: 1, n: 1 } });
    t.push({ name: "1xn", category: "edge", input: { m: 1, n: 50 } });
    t.push({ name: "mx1", category: "edge", input: { m: 50, n: 1 } });
    t.push({ name: "square-10", category: "edge", input: { m: 10, n: 10 } });
    t.push({ name: "stress-23x12", category: "stress", input: { m: 23, n: 12 } });
    return t;
  },
});

// 9. Unique Paths II
add({
  id: "unique-paths-ii",
  leetcode_number: 63,
  title: "Unique Paths II",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming", "Matrix"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Same as Unique Paths but obstacleGrid[i][j] == 1 marks a blocked cell. Return the number of unique paths from top-left to bottom-right.",
  constraints: ["1 <= m, n <= 100", "obstacleGrid[i][j] is 0 or 1."],
  hints: ["Same DP — set dp[j]=0 when obstacleGrid[i][j]==1.", "Watch the start cell: if blocked, answer is 0."],
  optimal: { time: "O(m*n)", space: "O(n)", approach: "Rolling 1D DP with obstacle zeroing." },
  alternatives: [],
  pitfalls: ["Initial cell may itself be an obstacle (return 0)."],
  followups: [],
  signature: { fn: "uniquePathsWithObstacles", params: [{ name: "grid", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function uniquePathsWithObstacles(grid: number[][]): number {
  const m = grid.length, n = grid[0].length;
  const dp = new Array(n).fill(0);
  dp[0] = grid[0][0] === 0 ? 1 : 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 1) dp[j] = 0;
      else if (j > 0) dp[j] += dp[j - 1];
    }
  }
  return dp[n - 1];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { grid: [[0,0,0],[0,1,0],[0,0,0]] } });
    t.push({ name: "example-2", category: "example", input: { grid: [[0,1],[0,0]] } });
    t.push({ name: "start-blocked", category: "edge", input: { grid: [[1,0],[0,0]] } });
    t.push({ name: "end-blocked", category: "edge", input: { grid: [[0,0],[0,1]] } });
    t.push({ name: "single-clear", category: "edge", input: { grid: [[0]] } });
    t.push({ name: "single-blocked", category: "edge", input: { grid: [[1]] } });
    t.push({ name: "wall-row", category: "edge", input: { grid: [[0,0,0],[1,1,1],[0,0,0]] } });
    {
      const r = rng(7);
      const grid = Array.from({ length: 100 }, () => Array.from({ length: 100 }, () => randInt(r, 0, 9) === 0 ? 1 : 0));
      grid[0][0] = 0; grid[99][99] = 0;
      t.push({ name: "stress-100x100", category: "stress", input: { grid } });
    }
    return t;
  },
});

// 10. Minimum Path Sum
add({
  id: "minimum-path-sum",
  leetcode_number: 64,
  title: "Minimum Path Sum",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming", "Matrix"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given a non-empty m x n grid filled with non-negative numbers, find a path from top-left to bottom-right that minimizes the sum of all numbers along its path. You can only move right or down.",
  constraints: ["1 <= m, n <= 200", "0 <= grid[i][j] <= 100"],
  hints: ["dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]).", "Roll to 1D."],
  optimal: { time: "O(m*n)", space: "O(n)", approach: "1D DP across rows." },
  alternatives: [],
  pitfalls: [],
  followups: [],
  signature: { fn: "minPathSum", params: [{ name: "grid", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function minPathSum(grid: number[][]): number {
  const m = grid.length, n = grid[0].length;
  const dp = grid[0].slice();
  for (let j = 1; j < n; j++) dp[j] += dp[j - 1];
  for (let i = 1; i < m; i++) {
    dp[0] += grid[i][0];
    for (let j = 1; j < n; j++) dp[j] = Math.min(dp[j], dp[j - 1]) + grid[i][j];
  }
  return dp[n - 1];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { grid: [[1,3,1],[1,5,1],[4,2,1]] } });
    t.push({ name: "example-2", category: "example", input: { grid: [[1,2,3],[4,5,6]] } });
    t.push({ name: "single", category: "edge", input: { grid: [[7]] } });
    t.push({ name: "single-row", category: "edge", input: { grid: [[1,2,3,4,5]] } });
    t.push({ name: "single-col", category: "edge", input: { grid: [[1],[2],[3],[4]] } });
    t.push({ name: "all-zero", category: "edge", input: { grid: [[0,0],[0,0]] } });
    {
      const r = rng(8);
      const grid = Array.from({ length: 200 }, () => Array.from({ length: 200 }, () => randInt(r, 0, 100)));
      t.push({ name: "stress-200x200", category: "stress", input: { grid } });
    }
    return t;
  },
});

// 11. Jump Game
add({
  id: "jump-game",
  leetcode_number: 55,
  title: "Jump Game",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming", "Greedy"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt: "You are given an integer array nums. You are initially at the first index, and each element represents your maximum jump length at that position. Return true if you can reach the last index.",
  constraints: ["1 <= nums.length <= 1e4", "0 <= nums[i] <= 1e5"],
  hints: ["Greedy: track the farthest reachable index. If i ever exceeds it, fail.", "DP also works but is unnecessary."],
  optimal: { time: "O(n)", space: "O(1)", approach: "Greedy reach." },
  alternatives: [{ approach: "DP from the end", time: "O(n²) or O(n)", space: "O(n)" }],
  pitfalls: ["Off-by-one: check i > reach (not >=)."],
  followups: ["Jump Game II — minimum jumps to reach end."],
  signature: { fn: "canJump", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function canJump(nums: number[]): boolean {
  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [2,3,1,1,4] } });
    t.push({ name: "example-2-stuck", category: "example", input: { nums: [3,2,1,0,4] } });
    t.push({ name: "single", category: "edge", input: { nums: [0] } });
    t.push({ name: "first-zero", category: "edge", input: { nums: [0,1] } });
    t.push({ name: "all-zero-after-start", category: "edge", input: { nums: [1,0,0] } });
    t.push({ name: "exact-jump", category: "edge", input: { nums: [2,0,0] } });
    t.push({ name: "all-ones", category: "edge", input: { nums: [1,1,1,1,1] } });
    {
      const r = rng(9);
      const nums = Array.from({ length: 10000 }, () => randInt(r, 0, 10));
      t.push({ name: "stress-10k", category: "stress", input: { nums } });
    }
    return t;
  },
});

// 12. Jump Game II
add({
  id: "jump-game-ii",
  leetcode_number: 45,
  title: "Jump Game II",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming", "Greedy", "BFS"],
  sources: ["LeetCode Top Interview 150", "Grind 75"],
  prompt: "Given a 0-indexed array of integers nums. You start at index 0. Each nums[i] is the maximum length of a forward jump from i. Return the minimum number of jumps to reach nums[n-1] (assumed reachable).",
  constraints: ["1 <= nums.length <= 1e4", "0 <= nums[i] <= 1000", "It's guaranteed you can reach the end."],
  hints: [
    "BFS-style greedy: maintain current end of jump and farthest reachable; increment jumps when i hits curEnd.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Greedy BFS layers." },
  alternatives: [{ approach: "DP", time: "O(n²)", space: "O(n)" }],
  pitfalls: ["Loop bound: i < n-1 (you don't jump from last index)."],
  followups: [],
  signature: { fn: "jumpII", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function jump(nums: number[]): number {
  let jumps = 0, curEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === curEnd) { jumps++; curEnd = farthest; }
  }
  return jumps;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [2,3,1,1,4] } });
    t.push({ name: "example-2", category: "example", input: { nums: [2,3,0,1,4] } });
    t.push({ name: "single", category: "edge", input: { nums: [0] } });
    t.push({ name: "two-elements", category: "edge", input: { nums: [1,1] } });
    t.push({ name: "exact-one-jump", category: "edge", input: { nums: [5,1,1,1,1,1] } });
    t.push({ name: "all-ones", category: "edge", input: { nums: [1,1,1,1,1] } });
    t.push({ name: "increasing", category: "edge", input: { nums: [1,2,3,4,5] } });
    {
      const r = rng(10);
      const nums = Array.from({ length: 10000 }, () => randInt(r, 1, 100));
      t.push({ name: "stress-10k", category: "stress", input: { nums } });
    }
    return t;
  },
});

// 13. Coin Change II
add({
  id: "coin-change-ii",
  leetcode_number: 518,
  title: "Coin Change II",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "You are given an integer array coins (denominations, infinite supply each) and an integer amount. Return the number of distinct combinations that make up amount. If impossible, return 0.",
  constraints: ["1 <= coins.length <= 300", "1 <= coins[i] <= 5000", "0 <= amount <= 5000", "All coin values unique."],
  hints: ["Unbounded knapsack — outer loop coins, inner loop sums ascending. Order matters: coins outside means combinations (sets), not permutations."],
  optimal: { time: "O(n*amount)", space: "O(amount)", approach: "1D DP, coins outer, sums inner." },
  alternatives: [],
  pitfalls: ["Loop order: coins outer, sums inner — the reverse counts permutations."],
  followups: ["Combination Sum IV (permutations)."],
  signature: { fn: "changeII", params: [{ name: "amount", adapt: "identity" }, { name: "coins", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function change(amount: number, coins: number[]): number {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const c of coins) for (let s = c; s <= amount; s++) dp[s] += dp[s - c];
  return dp[amount];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { amount: 5, coins: [1,2,5] } });
    t.push({ name: "example-2-impossible", category: "example", input: { amount: 3, coins: [2] } });
    t.push({ name: "amount-zero", category: "edge", input: { amount: 0, coins: [1,2,5] } });
    t.push({ name: "single-coin-fits", category: "edge", input: { amount: 10, coins: [10] } });
    t.push({ name: "single-coin-no-fit", category: "edge", input: { amount: 7, coins: [3] } });
    t.push({ name: "many-ways", category: "edge", input: { amount: 10, coins: [1,2,5] } });
    {
      const r = rng(11);
      const coins = Array.from(new Set(Array.from({ length: 50 }, () => randInt(r, 1, 100))));
      t.push({ name: "stress-amount-1000", category: "stress", input: { amount: 1000, coins } });
    }
    return t;
  },
});

// 14. Combination Sum IV
add({
  id: "combination-sum-iv",
  leetcode_number: 377,
  title: "Combination Sum IV",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an array of distinct integers nums and a target integer target, return the number of possible combinations that add up to target. Different orderings count as different combinations.",
  constraints: ["1 <= nums.length <= 200", "1 <= nums[i] <= 1000", "1 <= target <= 1000"],
  hints: ["Loop sums outer, nums inner — counts permutations."],
  optimal: { time: "O(target*n)", space: "O(target)", approach: "1D DP with sums outer." },
  alternatives: [],
  pitfalls: ["Different from Coin Change II — here loop order is reversed."],
  followups: ["Negative numbers would make answer infinite — clarify constraints."],
  signature: { fn: "combinationSum4", params: [{ name: "nums", adapt: "identity" }, { name: "target", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function combinationSum4(nums: number[], target: number): number {
  const dp = new Array(target + 1).fill(0);
  dp[0] = 1;
  for (let s = 1; s <= target; s++) for (const x of nums) if (s >= x) dp[s] += dp[s - x];
  return dp[target];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,2,3], target: 4 } });
    t.push({ name: "example-2-impossible", category: "example", input: { nums: [9], target: 3 } });
    t.push({ name: "target-equals-coin", category: "edge", input: { nums: [3], target: 3 } });
    t.push({ name: "small-target", category: "edge", input: { nums: [1,2], target: 1 } });
    t.push({ name: "many-ways", category: "edge", input: { nums: [1,2,3], target: 10 } });
    t.push({ name: "stress-target-1000", category: "stress", input: { nums: [1,2,3,4,5,6,7,8,9,10], target: 32 } });
    return t;
  },
});

// 15. Target Sum
add({
  id: "target-sum",
  leetcode_number: 494,
  title: "Target Sum",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming", "Backtracking"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "You are given an integer array nums and a target integer target. Build an expression by inserting '+' or '-' before each integer in nums. Return the number of expressions evaluating to target.",
  constraints: ["1 <= nums.length <= 20", "0 <= nums[i] <= 1000", "0 <= sum(nums) <= 1000", "-1000 <= target <= 1000"],
  hints: [
    "Let P be elements with + and N with -. P-N=target, P+N=sum → P=(sum+target)/2.",
    "Reduce to subset-sum: count subsets summing to P. Standard 1D knapsack.",
  ],
  optimal: { time: "O(n*S)", space: "O(S)", approach: "Subset sum reduction with 1D DP." },
  alternatives: [{ approach: "Memoized DFS", time: "O(n*S)", space: "O(n*S)" }],
  pitfalls: ["(total+target) must be even and non-negative.", "Element 0 doubles the count (both signs valid for it)."],
  followups: [],
  signature: { fn: "findTargetSumWays", params: [{ name: "nums", adapt: "identity" }, { name: "target", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function findTargetSumWays(nums: number[], target: number): number {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2) return 0;
  const subset = (total + target) / 2;
  if (subset < 0) return 0;
  const dp = new Array(subset + 1).fill(0);
  dp[0] = 1;
  for (const x of nums) for (let s = subset; s >= x; s--) dp[s] += dp[s - x];
  return dp[subset];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,1,1,1,1], target: 3 } });
    t.push({ name: "example-2", category: "example", input: { nums: [1], target: 1 } });
    t.push({ name: "single-impossible", category: "edge", input: { nums: [1], target: 2 } });
    t.push({ name: "with-zero", category: "edge", input: { nums: [0,0,0,0,0,0,0,0,1], target: 1 } });
    t.push({ name: "negative-target", category: "edge", input: { nums: [1,2,3], target: -2 } });
    t.push({ name: "all-zeros-target-zero", category: "edge", input: { nums: [0,0,0,0], target: 0 } });
    {
      const r = rng(12);
      const nums = Array.from({ length: 20 }, () => randInt(r, 0, 50));
      t.push({ name: "stress-20", category: "stress", input: { nums, target: 10 } });
    }
    return t;
  },
});

// 16. Longest Common Subsequence
add({
  id: "longest-common-subsequence",
  leetcode_number: 1143,
  title: "Longest Common Subsequence",
  difficulty: "Medium",
  categories: ["String", "Dynamic Programming"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt: "Given two strings text1 and text2, return the length of their longest common subsequence. A subsequence is derived by deleting some characters without changing the order. If there is no common subsequence, return 0.",
  constraints: ["1 <= text1.length, text2.length <= 1000", "Lowercase English letters."],
  hints: [
    "dp[i][j] = dp[i-1][j-1]+1 if a[i-1]==b[j-1], else max(dp[i-1][j], dp[i][j-1]).",
    "Roll to 1D with a 'prev' temp.",
  ],
  optimal: { time: "O(m*n)", space: "O(min(m,n))", approach: "Classic 2D DP rolled to 1D." },
  alternatives: [],
  pitfalls: ["Resetting prev each row."],
  followups: ["Reconstruct the LCS itself.", "Edit Distance / Shortest Common Supersequence."],
  signature: { fn: "longestCommonSubsequence", params: [{ name: "text1", adapt: "identity" }, { name: "text2", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function longestCommonSubsequence(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    let prev = 0;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      if (a[i - 1] === b[j - 1]) dp[j] = prev + 1;
      else dp[j] = Math.max(dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { text1: "abcde", text2: "ace" } });
    t.push({ name: "example-2-equal", category: "example", input: { text1: "abc", text2: "abc" } });
    t.push({ name: "example-3-no-common", category: "example", input: { text1: "abc", text2: "def" } });
    t.push({ name: "single-char-match", category: "edge", input: { text1: "a", text2: "a" } });
    t.push({ name: "single-char-mismatch", category: "edge", input: { text1: "a", text2: "b" } });
    t.push({ name: "one-empty-substr", category: "edge", input: { text1: "abc", text2: "a" } });
    t.push({ name: "interleaved", category: "edge", input: { text1: "abcbdab", text2: "bdcaba" } });
    {
      const r = rng(13);
      let a = "", b = "";
      for (let i = 0; i < 1000; i++) { a += "abcdef"[randInt(r, 0, 5)]; b += "abcdef"[randInt(r, 0, 5)]; }
      t.push({ name: "stress-1000", category: "stress", input: { text1: a, text2: b } });
    }
    return t;
  },
});

// 17. Best Time to Buy and Sell Stock with Cooldown
add({
  id: "best-time-to-buy-and-sell-stock-with-cooldown",
  leetcode_number: 309,
  title: "Best Time to Buy and Sell Stock with Cooldown",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming"],
  sources: ["Blind 75", "LeetCode Top Interview 150"],
  prompt: "You are given prices where prices[i] is the price of a given stock on day i. Find the maximum profit you can achieve. After you sell, you cannot buy on the next day (cooldown of 1 day). You may complete as many transactions as you like (must sell before buying again).",
  constraints: ["1 <= prices.length <= 5000", "0 <= prices[i] <= 1000"],
  hints: [
    "States: hold (own a share), sold (just sold today), rest (idle).",
    "Transitions: hold = max(hold, rest - p); sold = hold + p; rest = max(rest, prev_sold).",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "3-state DP rolled to scalars." },
  alternatives: [{ approach: "2D DP", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Use prev sold for the rest transition (not the just-updated value)."],
  followups: ["Buy/Sell with transaction fee (LC 714)."],
  signature: { fn: "maxProfitCooldown", params: [{ name: "prices", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function maxProfit(prices: number[]): number {
  let hold = -Infinity, sold = 0, rest = 0;
  for (const p of prices) {
    const prevSold = sold;
    sold = hold + p;
    hold = Math.max(hold, rest - p);
    rest = Math.max(rest, prevSold);
  }
  return Math.max(sold, rest);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { prices: [1,2,3,0,2] } });
    t.push({ name: "example-2-flat", category: "example", input: { prices: [1] } });
    t.push({ name: "decreasing", category: "edge", input: { prices: [5,4,3,2,1] } });
    t.push({ name: "increasing", category: "edge", input: { prices: [1,2,3,4,5] } });
    t.push({ name: "two-days", category: "edge", input: { prices: [3,8] } });
    t.push({ name: "with-zeros", category: "edge", input: { prices: [0,1,0,1,0,1] } });
    {
      const r = rng(14);
      const prices = Array.from({ length: 5000 }, () => randInt(r, 0, 1000));
      t.push({ name: "stress-5000", category: "stress", input: { prices } });
    }
    return t;
  },
});

// 18. Best Time to Buy and Sell Stock IV
add({
  id: "best-time-to-buy-and-sell-stock-iv",
  leetcode_number: 188,
  title: "Best Time to Buy and Sell Stock IV",
  difficulty: "Hard",
  categories: ["Array", "Dynamic Programming"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "You are given an integer array prices and an integer k. Find the maximum profit with at most k transactions (a transaction = buy then sell; you must sell before buying again).",
  constraints: ["0 <= k <= 100", "0 <= prices.length <= 1000", "0 <= prices[i] <= 1000"],
  hints: [
    "If k >= n/2, equivalent to unlimited transactions — sum all positive deltas.",
    "Else 2D DP: buy[j] = max(buy[j], sell[j-1] - p); sell[j] = max(sell[j], buy[j] + p).",
  ],
  optimal: { time: "O(n*k)", space: "O(k)", approach: "Two arrays buy[k+1] and sell[k+1]; fall back to greedy if k is large." },
  alternatives: [],
  pitfalls: ["k=0 → 0.", "Empty prices → 0."],
  followups: ["With cooldown / fee."],
  signature: { fn: "maxProfitIV", params: [{ name: "k", adapt: "identity" }, { name: "prices", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function maxProfit(k: number, prices: number[]): number {
  const n = prices.length;
  if (n === 0 || k === 0) return 0;
  if (k >= n / 2) {
    let p = 0;
    for (let i = 1; i < n; i++) if (prices[i] > prices[i - 1]) p += prices[i] - prices[i - 1];
    return p;
  }
  const buy = new Array(k + 1).fill(-Infinity);
  const sell = new Array(k + 1).fill(0);
  for (const p of prices) {
    for (let j = 1; j <= k; j++) {
      buy[j] = Math.max(buy[j], sell[j - 1] - p);
      sell[j] = Math.max(sell[j], buy[j] + p);
    }
  }
  return sell[k];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { k: 2, prices: [2,4,1] } });
    t.push({ name: "example-2", category: "example", input: { k: 2, prices: [3,2,6,5,0,3] } });
    t.push({ name: "k-zero", category: "edge", input: { k: 0, prices: [1,2,3] } });
    t.push({ name: "empty", category: "edge", input: { k: 5, prices: [] } });
    t.push({ name: "k-huge", category: "edge", input: { k: 100, prices: [1,5,2,8,3,9] } });
    t.push({ name: "decreasing", category: "edge", input: { k: 2, prices: [9,8,7,6,5] } });
    t.push({ name: "single-day", category: "edge", input: { k: 1, prices: [10] } });
    {
      const r = rng(15);
      const prices = Array.from({ length: 1000 }, () => randInt(r, 0, 1000));
      t.push({ name: "stress-k4-1000", category: "stress", input: { k: 4, prices } });
    }
    return t;
  },
});

// 19. Edit Distance
add({
  id: "edit-distance",
  leetcode_number: 72,
  title: "Edit Distance",
  difficulty: "Medium",
  categories: ["String", "Dynamic Programming"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You can insert, delete, or replace one character per operation.",
  constraints: ["0 <= word1.length, word2.length <= 500", "Lowercase English letters."],
  hints: [
    "dp[i][j] = dp[i-1][j-1] if equal; else 1 + min(insert, delete, replace).",
    "Roll to 1D with a 'prev' temp.",
  ],
  optimal: { time: "O(m*n)", space: "O(min(m,n))", approach: "Classic 2D DP rolled to 1D." },
  alternatives: [],
  pitfalls: ["Initialize dp[0][j]=j and dp[i][0]=i."],
  followups: ["Hirschberg's algorithm: O(m+n) space and reconstruction."],
  signature: { fn: "minDistance", params: [{ name: "word1", adapt: "identity" }, { name: "word2", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function minDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      if (a[i - 1] === b[j - 1]) dp[j] = prev;
      else dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { word1: "horse", word2: "ros" } });
    t.push({ name: "example-2", category: "example", input: { word1: "intention", word2: "execution" } });
    t.push({ name: "both-empty", category: "edge", input: { word1: "", word2: "" } });
    t.push({ name: "one-empty", category: "edge", input: { word1: "abc", word2: "" } });
    t.push({ name: "other-empty", category: "edge", input: { word1: "", word2: "xyz" } });
    t.push({ name: "equal", category: "edge", input: { word1: "abcdef", word2: "abcdef" } });
    t.push({ name: "single-char-diff", category: "edge", input: { word1: "a", word2: "b" } });
    {
      const r = rng(16);
      let a = "", b = "";
      for (let i = 0; i < 500; i++) { a += "abc"[randInt(r, 0, 2)]; b += "abc"[randInt(r, 0, 2)]; }
      t.push({ name: "stress-500", category: "stress", input: { word1: a, word2: b } });
    }
    return t;
  },
});

// 20. Burst Balloons
add({
  id: "burst-balloons",
  leetcode_number: 312,
  title: "Burst Balloons",
  difficulty: "Hard",
  categories: ["Array", "Dynamic Programming"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "You are given n balloons with numbers nums[i] painted on them. If you burst balloon i you gain nums[left] * nums[i] * nums[right] coins (using virtual nums[-1] = nums[n] = 1). Return the maximum coins you can collect by bursting balloons wisely.",
  constraints: ["1 <= n <= 300", "0 <= nums[i] <= 100"],
  hints: [
    "Reverse think: pick the LAST balloon to burst in interval (l, r).",
    "dp[l][r] = max over k in (l, r) of dp[l][k] + dp[k][r] + arr[l]*arr[k]*arr[r].",
    "Pad with 1s at both ends.",
  ],
  optimal: { time: "O(n³)", space: "O(n²)", approach: "Interval DP with last-burst trick." },
  alternatives: [],
  pitfalls: ["Naive 'first burst' DP doesn't decouple — last burst does.", "Padding boundary 1s simplifies edge cases."],
  followups: [],
  signature: { fn: "maxCoins", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function maxCoins(nums: number[]): number {
  const arr = [1, ...nums, 1];
  const n = arr.length;
  const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len < n; len++) {
    for (let l = 0; l + len < n; l++) {
      const r = l + len;
      let best = 0;
      for (let k = l + 1; k < r; k++) {
        const v = dp[l][k] + dp[k][r] + arr[l] * arr[k] * arr[r];
        if (v > best) best = v;
      }
      dp[l][r] = best;
    }
  }
  return dp[0][n - 1];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [3,1,5,8] } });
    t.push({ name: "example-2", category: "example", input: { nums: [1,5] } });
    t.push({ name: "single", category: "edge", input: { nums: [5] } });
    t.push({ name: "two", category: "edge", input: { nums: [3,4] } });
    t.push({ name: "all-zero", category: "edge", input: { nums: [0,0,0,0] } });
    t.push({ name: "all-equal", category: "edge", input: { nums: [5,5,5,5] } });
    {
      const r = rng(17);
      const nums = Array.from({ length: 100 }, () => randInt(r, 0, 100));
      t.push({ name: "stress-100", category: "stress", input: { nums } });
    }
    return t;
  },
});

// 21. Regular Expression Matching
add({
  id: "regular-expression-matching",
  leetcode_number: 10,
  title: "Regular Expression Matching",
  difficulty: "Hard",
  categories: ["String", "Dynamic Programming", "Recursion"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an input string s and a pattern p, implement regex matching with support for '.' (matches any single char) and '*' (zero or more of the preceding element). The match must cover the entire input string.",
  constraints: ["1 <= s.length <= 20", "1 <= p.length <= 20", "p uses lowercase letters, '.', and '*'.", "It is guaranteed that '*' is preceded by a valid character."],
  hints: [
    "2D DP: dp[i][j] = match of s[:i] vs p[:j].",
    "If p[j-1] == '*': dp[i][j] = dp[i][j-2] (zero copies) OR (s[i-1] matches p[j-2] AND dp[i-1][j]).",
    "Else: dp[i][j] = (chars match) AND dp[i-1][j-1].",
  ],
  optimal: { time: "O(m*n)", space: "O(m*n)", approach: "2D DP." },
  alternatives: [{ approach: "Recursion + memo", time: "O(m*n)", space: "O(m*n)" }],
  pitfalls: ["Initializing dp[0][j] for patterns like 'a*b*c*' — they match empty string."],
  followups: ["Wildcard matching with '?' and '*' that matches any sequence."],
  signature: { fn: "isMatchRegex", params: [{ name: "s", adapt: "identity" }, { name: "p", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isMatch(s: string, p: string): boolean {
  const m = s.length, n = p.length;
  const dp: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let j = 2; j <= n; j++) if (p[j - 1] === "*") dp[0][j] = dp[0][j - 2];
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === "*") {
        dp[i][j] = dp[i][j - 2] || ((p[j - 2] === "." || p[j - 2] === s[i - 1]) && dp[i - 1][j]);
      } else {
        dp[i][j] = (p[j - 1] === "." || p[j - 1] === s[i - 1]) && dp[i - 1][j - 1];
      }
    }
  }
  return dp[m][n];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "aa", p: "a" } });
    t.push({ name: "example-2", category: "example", input: { s: "aa", p: "a*" } });
    t.push({ name: "example-3", category: "example", input: { s: "ab", p: ".*" } });
    t.push({ name: "example-4", category: "example", input: { s: "aab", p: "c*a*b" } });
    t.push({ name: "example-5", category: "example", input: { s: "mississippi", p: "mis*is*p*." } });
    t.push({ name: "empty-s-empty-p", category: "edge", input: { s: "", p: "" } });
    t.push({ name: "empty-s-star-pattern", category: "edge", input: { s: "", p: "a*b*c*" } });
    t.push({ name: "dot-only", category: "edge", input: { s: "abc", p: "..." } });
    t.push({ name: "no-match", category: "edge", input: { s: "abc", p: "abcd" } });
    t.push({ name: "stress", category: "stress", input: { s: "aaaaaaaaaaaaaaaaaaab", p: "a*a*a*a*a*a*a*a*a*a*c" } });
    return t;
  },
});

// 22. Interleaving String
add({
  id: "interleaving-string",
  leetcode_number: 97,
  title: "Interleaving String",
  difficulty: "Medium",
  categories: ["String", "Dynamic Programming"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given strings s1, s2, s3, return true iff s3 can be formed by interleaving s1 and s2 (preserving each string's order).",
  constraints: ["0 <= s1.length, s2.length <= 100", "0 <= s3.length <= 200", "All lowercase letters."],
  hints: [
    "If |s1|+|s2|≠|s3|, false.",
    "dp[i][j] = (dp[i-1][j] && s1[i-1]==s3[i+j-1]) || (dp[i][j-1] && s2[j-1]==s3[i+j-1]).",
    "Roll to 1D over s2's length.",
  ],
  optimal: { time: "O(m*n)", space: "O(n)", approach: "1D DP rolled over s1." },
  alternatives: [],
  pitfalls: ["Length check must be first."],
  followups: ["Reconstruct an interleaving."],
  signature: { fn: "isInterleave", params: [{ name: "s1", adapt: "identity" }, { name: "s2", adapt: "identity" }, { name: "s3", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isInterleave(s1: string, s2: string, s3: string): boolean {
  if (s1.length + s2.length !== s3.length) return false;
  const m = s1.length, n = s2.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let j = 1; j <= n; j++) dp[j] = dp[j - 1] && s2[j - 1] === s3[j - 1];
  for (let i = 1; i <= m; i++) {
    dp[0] = dp[0] && s1[i - 1] === s3[i - 1];
    for (let j = 1; j <= n; j++) {
      dp[j] = (dp[j] && s1[i - 1] === s3[i + j - 1]) || (dp[j - 1] && s2[j - 1] === s3[i + j - 1]);
    }
  }
  return dp[n];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s1: "aabcc", s2: "dbbca", s3: "aadbbcbcac" } });
    t.push({ name: "example-2", category: "example", input: { s1: "aabcc", s2: "dbbca", s3: "aadbbbaccc" } });
    t.push({ name: "all-empty", category: "edge", input: { s1: "", s2: "", s3: "" } });
    t.push({ name: "one-empty-match", category: "edge", input: { s1: "", s2: "abc", s3: "abc" } });
    t.push({ name: "wrong-length", category: "edge", input: { s1: "a", s2: "b", s3: "abc" } });
    t.push({ name: "trivial-true", category: "edge", input: { s1: "a", s2: "b", s3: "ab" } });
    t.push({ name: "trivial-false", category: "edge", input: { s1: "a", s2: "b", s3: "ba" } });
    {
      const r = rng(18);
      let s1 = "", s2 = "";
      for (let i = 0; i < 100; i++) s1 += "ab"[randInt(r, 0, 1)];
      for (let i = 0; i < 100; i++) s2 += "ab"[randInt(r, 0, 1)];
      // Build a true interleaving by random merge.
      let i = 0, j = 0, s3 = "";
      while (i < s1.length || j < s2.length) {
        if (i === s1.length) s3 += s2[j++];
        else if (j === s2.length) s3 += s1[i++];
        else if (randInt(r, 0, 1) === 0) s3 += s1[i++];
        else s3 += s2[j++];
      }
      t.push({ name: "stress-100-interleave", category: "stress", input: { s1, s2, s3 } });
    }
    return t;
  },
});

// 23. Longest Increasing Path in a Matrix
add({
  id: "longest-increasing-path-in-a-matrix",
  leetcode_number: 329,
  title: "Longest Increasing Path in a Matrix",
  difficulty: "Hard",
  categories: ["Array", "Dynamic Programming", "DFS", "Memoization", "Matrix", "Topological Sort"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an m x n matrix of integers, return the length of the longest strictly increasing path. From each cell you can move up, down, left, or right.",
  constraints: ["1 <= m, n <= 200", "0 <= matrix[i][j] <= 2³¹ - 1"],
  hints: [
    "DFS + memo: each cell's longest path = 1 + max over neighbors with greater value.",
    "Topological sort (Kahn's): use in-degrees by 'greater neighbor' count and BFS layers.",
  ],
  optimal: { time: "O(m*n)", space: "O(m*n)", approach: "DFS with memoization on each cell." },
  alternatives: [{ approach: "Topo sort", time: "O(m*n)", space: "O(m*n)" }],
  pitfalls: ["Strictly increasing — equal values don't extend the path."],
  followups: ["Largest rectangle of increasing values."],
  signature: { fn: "longestIncreasingPath", params: [{ name: "matrix", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function longestIncreasingPath(matrix: number[][]): number {
  const m = matrix.length, n = matrix[0].length;
  const memo: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const dfs = (i: number, j: number): number => {
    if (memo[i][j]) return memo[i][j];
    let best = 1;
    for (const [di, dj] of dirs) {
      const ni = i + di, nj = j + dj;
      if (ni >= 0 && nj >= 0 && ni < m && nj < n && matrix[ni][nj] > matrix[i][j]) {
        best = Math.max(best, 1 + dfs(ni, nj));
      }
    }
    memo[i][j] = best;
    return best;
  };
  let ans = 0;
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) ans = Math.max(ans, dfs(i, j));
  return ans;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { matrix: [[9,9,4],[6,6,8],[2,1,1]] } });
    t.push({ name: "example-2", category: "example", input: { matrix: [[3,4,5],[3,2,6],[2,2,1]] } });
    t.push({ name: "single", category: "edge", input: { matrix: [[1]] } });
    t.push({ name: "all-equal", category: "edge", input: { matrix: [[5,5],[5,5]] } });
    t.push({ name: "single-row", category: "edge", input: { matrix: [[1,2,3,4,5]] } });
    t.push({ name: "single-col", category: "edge", input: { matrix: [[5],[4],[3],[2],[1]] } });
    {
      const r = rng(19);
      const matrix = Array.from({ length: 100 }, () => Array.from({ length: 100 }, () => randInt(r, 0, 1000)));
      t.push({ name: "stress-100x100", category: "stress", input: { matrix } });
    }
    return t;
  },
});
