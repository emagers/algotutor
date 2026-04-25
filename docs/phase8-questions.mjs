// Phase 8 — Backtracking cluster (10 problems)

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

export const phase8Questions = [];
function add(q) { phase8Questions.push(q); }

// 1. Subsets
add({
  id: "subsets",
  leetcode_number: 78,
  title: "Subsets",
  difficulty: "Medium",
  categories: ["Array", "Backtracking", "Bit Manipulation"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt: "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Order does not matter.",
  constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "All numbers are unique."],
  hints: ["For each element, choose to include or exclude — DFS over 2^n branches.", "Bitmask iteration over 0..2^n-1 also works."],
  optimal: { time: "O(n * 2^n)", space: "O(n)", approach: "DFS include/exclude." },
  alternatives: [{ approach: "Iterative bitmask", time: "O(n * 2^n)", space: "O(1) aux" }],
  pitfalls: ["Push a copy of cur, not the reference itself."],
  followups: ["Subsets II with duplicates."],
  signature: { fn: "subsets", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function subsets(nums: number[]): number[][] {
  const out: number[][] = [];
  const cur: number[] = [];
  const dfs = (i: number): void => {
    if (i === nums.length) { out.push(cur.slice()); return; }
    cur.push(nums[i]); dfs(i + 1); cur.pop();
    dfs(i + 1);
  };
  dfs(0);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,2,3] } });
    t.push({ name: "example-2", category: "example", input: { nums: [0] } });
    t.push({ name: "single", category: "edge", input: { nums: [7] } });
    t.push({ name: "two", category: "edge", input: { nums: [1,2] } });
    t.push({ name: "negatives", category: "edge", input: { nums: [-1,-2] } });
    t.push({ name: "size-5", category: "edge", input: { nums: [1,2,3,4,5] } });
    t.push({ name: "size-10", category: "stress", input: { nums: [1,2,3,4,5,6,7,8,9,10] } });
    return t;
  },
});

// 2. Subsets II
add({
  id: "subsets-ii",
  leetcode_number: 90,
  title: "Subsets II",
  difficulty: "Medium",
  categories: ["Array", "Backtracking", "Bit Manipulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an integer array nums that may contain duplicates, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
  constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10"],
  hints: ["Sort first.", "At each level, skip nums[i] when i > start && nums[i] == nums[i-1]."],
  optimal: { time: "O(n * 2^n)", space: "O(n)", approach: "Sort + DFS with sibling-skip." },
  alternatives: [],
  pitfalls: ["Skip rule applies to siblings (same depth), not children."],
  followups: [],
  signature: { fn: "subsetsWithDup", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function subsetsWithDup(nums: number[]): number[][] {
  nums = nums.slice().sort((a, b) => a - b);
  const out: number[][] = [];
  const cur: number[] = [];
  const dfs = (i: number): void => {
    out.push(cur.slice());
    for (let j = i; j < nums.length; j++) {
      if (j > i && nums[j] === nums[j - 1]) continue;
      cur.push(nums[j]);
      dfs(j + 1);
      cur.pop();
    }
  };
  dfs(0);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,2,2] } });
    t.push({ name: "example-2", category: "example", input: { nums: [0] } });
    t.push({ name: "all-same", category: "edge", input: { nums: [4,4,4,4] } });
    t.push({ name: "all-distinct", category: "edge", input: { nums: [1,2,3] } });
    t.push({ name: "negatives-with-dup", category: "edge", input: { nums: [-1,-1,2] } });
    t.push({ name: "size-10", category: "stress", input: { nums: [1,2,2,3,3,3,4,4,4,4] } });
    return t;
  },
});

// 3. Permutations
add({
  id: "permutations",
  leetcode_number: 46,
  title: "Permutations",
  difficulty: "Medium",
  categories: ["Array", "Backtracking"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt: "Given an array nums of distinct integers, return all the possible permutations. Order does not matter.",
  constraints: ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10", "All integers are unique."],
  hints: ["DFS with a `used` boolean array; pick any unused element at each level."],
  optimal: { time: "O(n!)", space: "O(n)", approach: "DFS over n! leaves." },
  alternatives: [{ approach: "Heap's algorithm", time: "O(n!)", space: "O(n)" }],
  pitfalls: ["Reset used flag on backtrack."],
  followups: ["Permutations II with duplicates."],
  signature: { fn: "permute", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function permute(nums: number[]): number[][] {
  const out: number[][] = [];
  const cur: number[] = [];
  const used = new Array(nums.length).fill(false);
  const dfs = (): void => {
    if (cur.length === nums.length) { out.push(cur.slice()); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; cur.push(nums[i]);
      dfs();
      cur.pop(); used[i] = false;
    }
  };
  dfs();
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,2,3] } });
    t.push({ name: "example-2", category: "example", input: { nums: [0,1] } });
    t.push({ name: "single", category: "edge", input: { nums: [1] } });
    t.push({ name: "two", category: "edge", input: { nums: [1,2] } });
    t.push({ name: "negatives", category: "edge", input: { nums: [-1,-2,-3] } });
    t.push({ name: "size-6", category: "stress", input: { nums: [1,2,3,4,5,6] } });
    return t;
  },
});

// 4. Permutations II
add({
  id: "permutations-ii",
  leetcode_number: 47,
  title: "Permutations II",
  difficulty: "Medium",
  categories: ["Array", "Backtracking"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given a collection of numbers nums that might contain duplicates, return all possible unique permutations.",
  constraints: ["1 <= nums.length <= 8", "-10 <= nums[i] <= 10"],
  hints: ["Sort, then skip nums[i] if it equals nums[i-1] and nums[i-1] is not currently used (sibling-skip)."],
  optimal: { time: "O(n * n!)", space: "O(n)", approach: "Sort + DFS with sibling-skip." },
  alternatives: [],
  pitfalls: ["Use `!used[i-1]` (not `used[i-1]`) — the rule fixes the relative order of equal elements."],
  followups: [],
  signature: { fn: "permuteUnique", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function permuteUnique(nums: number[]): number[][] {
  nums = nums.slice().sort((a, b) => a - b);
  const out: number[][] = [];
  const cur: number[] = [];
  const used = new Array(nums.length).fill(false);
  const dfs = (): void => {
    if (cur.length === nums.length) { out.push(cur.slice()); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;
      used[i] = true; cur.push(nums[i]);
      dfs();
      cur.pop(); used[i] = false;
    }
  };
  dfs();
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,1,2] } });
    t.push({ name: "example-2", category: "example", input: { nums: [1,2,3] } });
    t.push({ name: "all-same", category: "edge", input: { nums: [5,5,5] } });
    t.push({ name: "two-pair", category: "edge", input: { nums: [1,1,2,2] } });
    t.push({ name: "size-8", category: "stress", input: { nums: [1,2,2,3,3,3,4,4] } });
    return t;
  },
});

// 5. Combination Sum
add({
  id: "combination-sum",
  leetcode_number: 39,
  title: "Combination Sum",
  difficulty: "Medium",
  categories: ["Array", "Backtracking"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt: "Given an array of distinct integers candidates and a target integer target, return all unique combinations of candidates where the chosen numbers sum to target. The same number may be chosen unlimited times. Two combinations are unique if their multiset of chosen numbers differs.",
  constraints: ["1 <= candidates.length <= 30", "1 <= candidates[i] <= 200", "1 <= target <= 500", "All elements distinct."],
  hints: ["Sort; DFS with a `start` index and remaining target.", "Keep `start` (not `start+1`) since reuse is allowed.", "Prune when arr[i] > rem."],
  optimal: { time: "O(2^t)", space: "O(t)", approach: "Sorted DFS with reuse and pruning." },
  alternatives: [],
  pitfalls: ["Avoid duplicates by passing `start = i` (not 0) on recursion."],
  followups: ["Combination Sum II (each used once + dedup)."],
  signature: { fn: "combinationSum", params: [{ name: "candidates", adapt: "identity" }, { name: "target", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function combinationSum(candidates: number[], target: number): number[][] {
  const arr = candidates.slice().sort((a, b) => a - b);
  const out: number[][] = [];
  const cur: number[] = [];
  const dfs = (start: number, rem: number): void => {
    if (rem === 0) { out.push(cur.slice()); return; }
    for (let i = start; i < arr.length; i++) {
      if (arr[i] > rem) break;
      cur.push(arr[i]);
      dfs(i, rem - arr[i]);
      cur.pop();
    }
  };
  dfs(0, target);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { candidates: [2,3,6,7], target: 7 } });
    t.push({ name: "example-2", category: "example", input: { candidates: [2,3,5], target: 8 } });
    t.push({ name: "example-3-impossible", category: "example", input: { candidates: [2], target: 1 } });
    t.push({ name: "single-coin-fits", category: "edge", input: { candidates: [3], target: 9 } });
    t.push({ name: "target-equals-element", category: "edge", input: { candidates: [4,5,6], target: 5 } });
    t.push({ name: "many-ways", category: "edge", input: { candidates: [1,2], target: 4 } });
    t.push({ name: "stress", category: "stress", input: { candidates: [2,3,5,7,11,13], target: 24 } });
    return t;
  },
});

// 6. Combination Sum II
add({
  id: "combination-sum-ii",
  leetcode_number: 40,
  title: "Combination Sum II",
  difficulty: "Medium",
  categories: ["Array", "Backtracking"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given a collection of candidate numbers (which may contain duplicates) and a target, find all unique combinations where the candidate numbers sum to target. Each number may only be used once. Solution set must not contain duplicates.",
  constraints: ["1 <= candidates.length <= 100", "1 <= candidates[i] <= 50", "1 <= target <= 30"],
  hints: ["Sort; DFS with start = i+1 (each used once).", "Skip nums[i] if i > start and nums[i] == nums[i-1] to dedupe."],
  optimal: { time: "O(2^n)", space: "O(n)", approach: "Sorted DFS with sibling-skip." },
  alternatives: [],
  pitfalls: ["Sibling-skip vs child-skip — only sibling skip dedupes correctly."],
  followups: [],
  signature: { fn: "combinationSum2", params: [{ name: "candidates", adapt: "identity" }, { name: "target", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function combinationSum2(candidates: number[], target: number): number[][] {
  const arr = candidates.slice().sort((a, b) => a - b);
  const out: number[][] = [];
  const cur: number[] = [];
  const dfs = (start: number, rem: number): void => {
    if (rem === 0) { out.push(cur.slice()); return; }
    for (let i = start; i < arr.length; i++) {
      if (arr[i] > rem) break;
      if (i > start && arr[i] === arr[i - 1]) continue;
      cur.push(arr[i]);
      dfs(i + 1, rem - arr[i]);
      cur.pop();
    }
  };
  dfs(0, target);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { candidates: [10,1,2,7,6,1,5], target: 8 } });
    t.push({ name: "example-2", category: "example", input: { candidates: [2,5,2,1,2], target: 5 } });
    t.push({ name: "no-solution", category: "edge", input: { candidates: [1,2], target: 10 } });
    t.push({ name: "all-same", category: "edge", input: { candidates: [3,3,3,3], target: 6 } });
    t.push({ name: "single-fits", category: "edge", input: { candidates: [5], target: 5 } });
    t.push({ name: "single-no-fit", category: "edge", input: { candidates: [5], target: 6 } });
    {
      const r = rng(801);
      const candidates = Array.from({ length: 100 }, () => randInt(r, 1, 10));
      t.push({ name: "stress-100", category: "stress", input: { candidates, target: 25 } });
    }
    return t;
  },
});

// 7. Word Search
add({
  id: "word-search",
  leetcode_number: 79,
  title: "Word Search",
  difficulty: "Medium",
  categories: ["Array", "String", "Backtracking", "Matrix"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt: "Given an m x n grid of characters and a word, return true if the word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically). The same cell may not be used more than once in a single word.",
  constraints: ["1 <= m, n <= 6 (LC bound; we test up to 12x12)", "1 <= word.length <= 15", "Letters and word are lowercase or uppercase English."],
  hints: ["DFS from each cell; mark visited (e.g., temporarily replace with '#').", "Restore the cell on backtrack."],
  optimal: { time: "O(m*n*4^L)", space: "O(L)", approach: "DFS with in-place visited marker." },
  alternatives: [{ approach: "Use a separate visited set", time: "same", space: "O(m*n)" }],
  pitfalls: ["Not restoring the cell on backtrack."],
  followups: ["Word Search II with a trie."],
  signature: { fn: "exist", params: [{ name: "board", adapt: "identity" }, { name: "word", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function exist(board: string[][], word: string): boolean {
  const m = board.length, n = board[0].length;
  const dfs = (i: number, j: number, k: number): boolean => {
    if (k === word.length) return true;
    if (i < 0 || j < 0 || i >= m || j >= n || board[i][j] !== word[k]) return false;
    const c = board[i][j];
    board[i][j] = "#";
    const ok = dfs(i+1,j,k+1) || dfs(i-1,j,k+1) || dfs(i,j+1,k+1) || dfs(i,j-1,k+1);
    board[i][j] = c;
    return ok;
  };
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (board[i][j] === word[0] && dfs(i, j, 0)) return true;
  return false;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { board: [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word: "ABCCED" } });
    t.push({ name: "example-2", category: "example", input: { board: [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word: "SEE" } });
    t.push({ name: "example-3-no-match", category: "example", input: { board: [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word: "ABCB" } });
    t.push({ name: "single-cell-match", category: "edge", input: { board: [["X"]], word: "X" } });
    t.push({ name: "single-cell-no-match", category: "edge", input: { board: [["X"]], word: "Y" } });
    t.push({ name: "longer-than-cells", category: "edge", input: { board: [["A","B"]], word: "ABA" } });
    t.push({ name: "wrap-needed", category: "edge", input: { board: [["A","B"],["C","D"]], word: "ABDC" } });
    {
      const r = rng(901);
      const m = 12, n = 12;
      const board = Array.from({ length: m }, () => Array.from({ length: n }, () => "abcd"[randInt(r, 0, 3)]));
      t.push({ name: "stress-12x12", category: "stress", input: { board, word: "abcdabcdabcd" } });
    }
    return t;
  },
});

// 8. Palindrome Partitioning
add({
  id: "palindrome-partitioning",
  leetcode_number: 131,
  title: "Palindrome Partitioning",
  difficulty: "Medium",
  categories: ["String", "Backtracking", "Dynamic Programming"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitions of s.",
  constraints: ["1 <= s.length <= 16", "Lowercase English letters."],
  hints: ["DFS: at each position, try every prefix that is a palindrome and recurse on the suffix.", "Optional: precompute isPal[i][j] in O(n²)."],
  optimal: { time: "O(n * 2^n)", space: "O(n)", approach: "DFS with on-the-fly palindrome checks." },
  alternatives: [{ approach: "Precompute isPal table", time: "O(n*2^n)", space: "O(n²)" }],
  pitfalls: ["Don't forget to push a copy of cur."],
  followups: ["Minimum cuts to partition into palindromes (LC 132)."],
  signature: { fn: "partitionPalindrome", params: [{ name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function partition(s: string): string[][] {
  const out: string[][] = [];
  const cur: string[] = [];
  const isPal = (l: number, r: number): boolean => { while (l < r) { if (s[l] !== s[r]) return false; l++; r--; } return true; };
  const dfs = (start: number): void => {
    if (start === s.length) { out.push(cur.slice()); return; }
    for (let end = start; end < s.length; end++) {
      if (isPal(start, end)) {
        cur.push(s.slice(start, end + 1));
        dfs(end + 1);
        cur.pop();
      }
    }
  };
  dfs(0);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "aab" } });
    t.push({ name: "example-2", category: "example", input: { s: "a" } });
    t.push({ name: "single-pair", category: "edge", input: { s: "aa" } });
    t.push({ name: "all-same", category: "edge", input: { s: "aaaa" } });
    t.push({ name: "no-multi-char-pals", category: "edge", input: { s: "abcd" } });
    t.push({ name: "long-palindrome", category: "edge", input: { s: "racecar" } });
    t.push({ name: "stress-16-aaaa", category: "stress", input: { s: "aaaaaaaaaaaaaaaa" } });
    return t;
  },
});

// 9. N-Queens
add({
  id: "n-queens",
  leetcode_number: 51,
  title: "N-Queens",
  difficulty: "Hard",
  categories: ["Array", "Backtracking"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order. Each solution is a list of n strings of length n, with 'Q' marking a queen and '.' marking an empty cell.",
  constraints: ["1 <= n <= 9"],
  hints: [
    "Place row by row.",
    "Maintain three boolean arrays: column-used, diag1 (i-j+n), diag2 (i+j).",
  ],
  optimal: { time: "O(n!)", space: "O(n)", approach: "Row-by-row DFS with column/diagonal pruning." },
  alternatives: [{ approach: "Bitmask diagonals", time: "O(n!)", space: "O(n)" }],
  pitfalls: ["Diagonal index offsets — use i-j+n to keep non-negative."],
  followups: ["N-Queens II — count only."],
  signature: { fn: "solveNQueens", params: [{ name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function solveNQueens(n: number): string[][] {
  const out: string[][] = [];
  const cols: boolean[] = new Array(n).fill(false);
  const d1: boolean[] = new Array(2 * n).fill(false);
  const d2: boolean[] = new Array(2 * n).fill(false);
  const placement: number[] = new Array(n).fill(-1);
  const dfs = (row: number): void => {
    if (row === n) {
      const board: string[] = [];
      for (let i = 0; i < n; i++) {
        board.push(".".repeat(placement[i]) + "Q" + ".".repeat(n - placement[i] - 1));
      }
      out.push(board);
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols[c] || d1[row - c + n] || d2[row + c]) continue;
      cols[c] = d1[row - c + n] = d2[row + c] = true;
      placement[row] = c;
      dfs(row + 1);
      cols[c] = d1[row - c + n] = d2[row + c] = false;
    }
  };
  dfs(0);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { n: 4 } });
    t.push({ name: "n-1", category: "edge", input: { n: 1 } });
    t.push({ name: "n-2-impossible", category: "edge", input: { n: 2 } });
    t.push({ name: "n-3-impossible", category: "edge", input: { n: 3 } });
    t.push({ name: "n-5", category: "edge", input: { n: 5 } });
    t.push({ name: "n-6", category: "edge", input: { n: 6 } });
    t.push({ name: "n-8-stress", category: "stress", input: { n: 8 } });
    t.push({ name: "n-9-stress", category: "stress", input: { n: 9 } });
    return t;
  },
});

// 10. Letter Combinations of a Phone Number
add({
  id: "letter-combinations-of-a-phone-number",
  leetcode_number: 17,
  title: "Letter Combinations of a Phone Number",
  difficulty: "Medium",
  categories: ["Hash Table", "String", "Backtracking"],
  sources: ["Blind 75", "LeetCode Top Interview 150", "Grind 75"],
  prompt: "Given a string containing digits from 2-9, return all possible letter combinations the number could represent (using the standard phone keypad). Return the answer in any order. If digits is empty, return an empty list.",
  constraints: ["0 <= digits.length <= 4", "digits[i] in '2'..'9'"],
  hints: ["DFS over the digits, choosing one letter at each step."],
  optimal: { time: "O(4^n)", space: "O(n)", approach: "DFS." },
  alternatives: [{ approach: "Iterative cartesian product", time: "O(4^n)", space: "O(4^n)" }],
  pitfalls: ["Empty input must return [], not [\"\"]."],
  followups: [],
  signature: { fn: "letterCombinations", params: [{ name: "digits", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "sortedArray",
  solutionTs:
`function letterCombinations(digits: string): string[] {
  if (!digits) return [];
  const map: Record<string, string> = { "2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz" };
  const out: string[] = [];
  const cur: string[] = [];
  const dfs = (i: number): void => {
    if (i === digits.length) { out.push(cur.join("")); return; }
    for (const c of map[digits[i]]) { cur.push(c); dfs(i + 1); cur.pop(); }
  };
  dfs(0);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { digits: "23" } });
    t.push({ name: "empty", category: "example", input: { digits: "" } });
    t.push({ name: "single-3", category: "edge", input: { digits: "2" } });
    t.push({ name: "single-4", category: "edge", input: { digits: "7" } });
    t.push({ name: "all-7-9", category: "edge", input: { digits: "79" } });
    t.push({ name: "max-length", category: "stress", input: { digits: "2345" } });
    t.push({ name: "all-4-letter", category: "stress", input: { digits: "7799" } });
    return t;
  },
});
