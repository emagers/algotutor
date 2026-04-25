// Phase 10 — Bit Manipulation, Math, Design, and Matrix/String classics (50 problems)

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
function randInt(r, lo, hi) { return Math.floor(r() * (hi - lo + 1)) + lo; }
function randStr(r, n, lo = 97, hi = 122) {
  let s = "";
  for (let i = 0; i < n; i++) s += String.fromCharCode(randInt(r, lo, hi));
  return s;
}

export const phase10Questions = [];
function add(q) { phase10Questions.push(q); }

add({
  id: "single-number",
  leetcode_number: 136,
  title: "Single Number",
  difficulty: "Easy",
  categories: ["Array", "Bit Manipulation"],
  sources: ["Blind 75", "LeetCode Top Interview 150"],
  prompt: "Every element in a non-empty integer array appears twice except for one. Find that single element. Your solution must run in linear time and use only constant extra space.",
  constraints: ["1 <= nums.length <= 3 * 1e4", "Every element appears twice except for one."],
  hints: [
    "What property of XOR makes paired duplicates cancel out?",
    "x ^ x = 0 and x ^ 0 = x.",
    "Fold XOR across the entire array — the lone element survives.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "XOR-fold across the array." },
  alternatives: [
    { approach: "Hash set add/remove", time: "O(n)", space: "O(n)" },
    { approach: "Sort then scan pairs", time: "O(n log n)", space: "O(1)" },
  ],
  pitfalls: ["Initializing the accumulator to anything other than 0 corrupts the XOR fold."],
  followups: ["Single Number II (every other appears 3 times).", "Two non-duplicates (LC 260)."],
  signature: { fn: "singleNumber", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function singleNumber(nums: number[]): number {
  let x = 0;
  for (const n of nums) x ^= n;
  return x;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [2,2,1] } });
    t.push({ name: "example-2", category: "example", input: { nums: [4,1,2,1,2] } });
    t.push({ name: "example-single", category: "example", input: { nums: [1] } });
    t.push({ name: "edge-negative", category: "edge", input: { nums: [-1,-2,-1,-2,-3] } });
    t.push({ name: "edge-large", category: "edge", input: { nums: [1000000, 999999, 1000000] } });
    {
      const r = rng(1001);
      const arr = [];
      for (let i = 0; i < 5000; i++) { const v = randInt(r, -100000, 100000); arr.push(v, v); }
      arr.push(987654321);
      // shuffle
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      t.push({ name: "stress-10001", category: "stress", input: { nums: arr } });
    }
    return t;
  },
});

add({
  id: "single-number-ii",
  leetcode_number: 137,
  title: "Single Number II",
  difficulty: "Medium",
  categories: ["Array", "Bit Manipulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "In a non-empty array of integers, every element appears exactly three times except for one element that appears once. Find that element in linear time and constant extra space.",
  constraints: ["1 <= nums.length <= 3 * 1e4", "-2^31 <= nums[i] <= 2^31 - 1"],
  hints: [
    "Counting bit-by-bit, sum mod 3 reveals the lonely element's bits.",
    "You can do it with two state variables (ones, twos) using bitwise tricks.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Two-state finite automaton tracking bits seen 1 and 2 times." },
  alternatives: [{ approach: "Bit-count mod 3 across 32 bits", time: "O(32n)", space: "O(1)" }],
  pitfalls: ["Updating ones and twos in the wrong order produces incorrect bit accounting."],
  followups: ["Generalize to k-times-except-one."],
  signature: { fn: "singleNumberII", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function singleNumber(nums: number[]): number {
  let ones = 0, twos = 0;
  for (const n of nums) {
    ones = (ones ^ n) & ~twos;
    twos = (twos ^ n) & ~ones;
  }
  return ones;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [2,2,3,2] } });
    t.push({ name: "example-2", category: "example", input: { nums: [0,1,0,1,0,1,99] } });
    t.push({ name: "single-elem", category: "edge", input: { nums: [42] } });
    t.push({ name: "negative-only", category: "edge", input: { nums: [-2,-2,-2,-7] } });
    t.push({ name: "answer-zero", category: "edge", input: { nums: [5,5,5,0] } });
    {
      const r = rng(1002);
      const arr = [];
      for (let i = 0; i < 3000; i++) { const v = randInt(r, -1000000, 1000000); arr.push(v, v, v); }
      arr.push(13579);
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      t.push({ name: "stress-9001", category: "stress", input: { nums: arr } });
    }
    return t;
  },
});

add({
  id: "number-of-1-bits",
  leetcode_number: 191,
  title: "Number of 1 Bits",
  difficulty: "Easy",
  categories: ["Bit Manipulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given a non-negative 32-bit integer, return the number of '1' bits in its binary representation (also known as the Hamming weight).",
  constraints: ["0 <= n <= 2^32 - 1"],
  hints: [
    "n & (n - 1) clears the lowest set bit.",
    "Loop while n is non-zero, counting iterations.",
  ],
  optimal: { time: "O(k)", space: "O(1)", approach: "Brian Kernighan: clear the lowest set bit each iteration (k = popcount)." },
  alternatives: [{ approach: "Test each of 32 bits", time: "O(32)", space: "O(1)" }],
  pitfalls: ["Right-shifting a signed JS number (>>) on values with the high bit set produces negative numbers — use >>> 0 first."],
  followups: ["Counting Bits (LC 338) — popcount of every 0..n."],
  signature: { fn: "hammingWeight", params: [{ name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function hammingWeight(n: number): number {
  let c = 0;
  let x = n >>> 0;
  while (x) { x &= x - 1; c++; }
  return c;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { n: 11 } });
    t.push({ name: "example-2", category: "example", input: { n: 128 } });
    t.push({ name: "example-3", category: "example", input: { n: 4294967293 } });
    t.push({ name: "zero", category: "edge", input: { n: 0 } });
    t.push({ name: "all-ones", category: "edge", input: { n: 4294967295 } });
    t.push({ name: "single-high-bit", category: "edge", input: { n: 2147483648 } });
    {
      const r = rng(1003);
      for (let i = 0; i < 3; i++) t.push({ name: `stress-${i}`, category: "stress", input: { n: randInt(r, 0, 4294967295) } });
    }
    return t;
  },
});

add({
  id: "counting-bits",
  leetcode_number: 338,
  title: "Counting Bits",
  difficulty: "Easy",
  categories: ["Bit Manipulation", "Dynamic Programming"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an integer n, return an array ans of length n + 1 where for each i (0 <= i <= n), ans[i] is the number of 1 bits in the binary representation of i.",
  constraints: ["0 <= n <= 1e5"],
  hints: [
    "ans[i] relates to ans[i >> 1] plus the parity of i.",
    "Build the array left to right in O(n) using one DP recurrence.",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "DP: ans[i] = ans[i>>1] + (i & 1)." },
  alternatives: [{ approach: "Call popcount on each i", time: "O(n log n)", space: "O(n)" }],
  pitfalls: ["Off-by-one — output length is n+1, not n."],
  followups: ["Find the 1-bit count of every range [l..r]."],
  signature: { fn: "countBits", params: [{ name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function countBits(n: number): number[] {
  const out = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) out[i] = out[i >> 1] + (i & 1);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { n: 2 } });
    t.push({ name: "example-2", category: "example", input: { n: 5 } });
    t.push({ name: "zero", category: "edge", input: { n: 0 } });
    t.push({ name: "one", category: "edge", input: { n: 1 } });
    t.push({ name: "boundary-power", category: "edge", input: { n: 16 } });
    t.push({ name: "stress-10k", category: "stress", input: { n: 10000 } });
    t.push({ name: "stress-100k", category: "stress", input: { n: 100000 } });
    return t;
  },
});

add({
  id: "reverse-bits",
  leetcode_number: 190,
  title: "Reverse Bits",
  difficulty: "Easy",
  categories: ["Bit Manipulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Reverse the bits of a given 32-bit unsigned integer. Example: input 43261596 (00000010100101000001111010011100) should produce 964176192 (00111001011110000010100101000000).",
  constraints: ["0 <= n <= 2^32 - 1"],
  hints: [
    "Loop 32 times, peeling off the low bit and pushing it onto the result.",
    "Be careful with JavaScript's signed bitwise shifts; use *2 or coerce with >>> 0.",
  ],
  optimal: { time: "O(32)", space: "O(1)", approach: "Bit-by-bit shift-and-peel for 32 iterations." },
  alternatives: [{ approach: "Cached byte-reversal lookup", time: "O(1)", space: "O(256)" }],
  pitfalls: ["Using r << 1 in JS turns r negative when bit 31 is set; multiply by 2 (numbers up to 2^32-1 stay safe) or coerce."],
  followups: ["What if reverseBits is called many times?"],
  signature: { fn: "reverseBits", params: [{ name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function reverseBits(n: number): number {
  let r = 0;
  let x = n >>> 0;
  for (let i = 0; i < 32; i++) {
    r = r * 2 + (x & 1);
    x >>>= 1;
  }
  return r;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { n: 43261596 } });
    t.push({ name: "example-2", category: "example", input: { n: 4294967293 } });
    t.push({ name: "zero", category: "edge", input: { n: 0 } });
    t.push({ name: "one", category: "edge", input: { n: 1 } });
    t.push({ name: "all-ones", category: "edge", input: { n: 4294967295 } });
    t.push({ name: "high-bit", category: "edge", input: { n: 2147483648 } });
    {
      const r = rng(1005);
      for (let i = 0; i < 3; i++) t.push({ name: `stress-${i}`, category: "stress", input: { n: randInt(r, 0, 4294967295) } });
    }
    return t;
  },
});

add({
  id: "missing-number",
  leetcode_number: 268,
  title: "Missing Number",
  difficulty: "Easy",
  categories: ["Array", "Bit Manipulation", "Math"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an array nums containing n distinct numbers in the range [0, n], return the only number that is missing from the range.",
  constraints: ["n == nums.length", "1 <= n <= 1e4", "0 <= nums[i] <= n", "all values distinct"],
  hints: [
    "Sum of 0..n minus sum of nums.",
    "Or XOR all indices and values together.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Gauss-sum minus actual sum, or XOR fold." },
  alternatives: [
    { approach: "Sort then scan", time: "O(n log n)", space: "O(1)" },
    { approach: "Hash set", time: "O(n)", space: "O(n)" },
  ],
  pitfalls: ["Integer overflow in other languages — fine in JS up to 2^53."],
  followups: ["Find all missing numbers (LC 448)."],
  signature: { fn: "missingNumber", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function missingNumber(nums: number[]): number {
  const n = nums.length;
  let s = (n * (n + 1)) / 2;
  for (const v of nums) s -= v;
  return s;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [3,0,1] } });
    t.push({ name: "example-2", category: "example", input: { nums: [0,1] } });
    t.push({ name: "example-3", category: "example", input: { nums: [9,6,4,2,3,5,7,0,1] } });
    t.push({ name: "single-missing-zero", category: "edge", input: { nums: [1] } });
    t.push({ name: "single-missing-one", category: "edge", input: { nums: [0] } });
    {
      const r = rng(1006);
      const n = 10000;
      const arr = Array.from({ length: n + 1 }, (_, i) => i);
      const miss = randInt(r, 0, n);
      arr.splice(miss, 1);
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      t.push({ name: "stress-10k", category: "stress", input: { nums: arr } });
    }
    return t;
  },
});

add({
  id: "sum-of-two-integers",
  leetcode_number: 371,
  title: "Sum of Two Integers",
  difficulty: "Medium",
  categories: ["Bit Manipulation", "Math"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given two integers a and b, return their sum without using the operators + and -.",
  constraints: ["-1000 <= a, b <= 1000"],
  hints: [
    "XOR computes addition without carry.",
    "AND followed by left shift produces the carry.",
    "Loop until carry is zero.",
  ],
  optimal: { time: "O(1)", space: "O(1)", approach: "Bitwise add: sum = a^b, carry = (a&b) << 1, repeat." },
  alternatives: [],
  pitfalls: ["Negative numbers in higher-level languages need 32-bit masking; in JS, |0 keeps results in 32-bit signed range."],
  followups: ["Subtract two integers without using - or +."],
  signature: { fn: "getSum", params: [{ name: "a", adapt: "identity" }, { name: "b", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function getSum(a: number, b: number): number {
  while (b !== 0) {
    const c = (a & b) << 1;
    a = (a ^ b) | 0;
    b = c | 0;
  }
  return a;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { a: 1, b: 2 } });
    t.push({ name: "example-2", category: "example", input: { a: 2, b: 3 } });
    t.push({ name: "negative-positive", category: "edge", input: { a: -1, b: 1 } });
    t.push({ name: "both-negative", category: "edge", input: { a: -7, b: -3 } });
    t.push({ name: "with-zero", category: "edge", input: { a: 0, b: 0 } });
    t.push({ name: "boundary", category: "edge", input: { a: 1000, b: -1000 } });
    {
      const r = rng(1007);
      for (let i = 0; i < 3; i++) t.push({ name: `stress-${i}`, category: "stress", input: { a: randInt(r, -1000, 1000), b: randInt(r, -1000, 1000) } });
    }
    return t;
  },
});

add({
  id: "bitwise-and-of-numbers-range",
  leetcode_number: 201,
  title: "Bitwise AND of Numbers Range",
  difficulty: "Medium",
  categories: ["Bit Manipulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given two integers left and right with left <= right, return the bitwise AND of all numbers in the inclusive range [left, right].",
  constraints: ["0 <= left <= right <= 2^31 - 1"],
  hints: [
    "Any bit that differs between left and right gets zeroed somewhere in the range.",
    "Find the common high-order prefix of left and right.",
  ],
  optimal: { time: "O(log n)", space: "O(1)", approach: "Right-shift both until equal, then shift back." },
  alternatives: [{ approach: "Iterate and AND", time: "O(right - left)", space: "O(1)" }],
  pitfalls: ["Iterating from left to right can blow up when the range is enormous."],
  followups: ["Bitwise OR of a range."],
  signature: { fn: "rangeBitwiseAnd", params: [{ name: "left", adapt: "identity" }, { name: "right", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function rangeBitwiseAnd(left: number, right: number): number {
  let s = 0;
  while (left !== right) { left >>>= 1; right >>>= 1; s++; }
  return left << s;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { left: 5, right: 7 } });
    t.push({ name: "example-2", category: "example", input: { left: 0, right: 0 } });
    t.push({ name: "example-3", category: "example", input: { left: 1, right: 2147483647 } });
    t.push({ name: "same", category: "edge", input: { left: 42, right: 42 } });
    t.push({ name: "adjacent", category: "edge", input: { left: 8, right: 9 } });
    t.push({ name: "powers", category: "edge", input: { left: 1024, right: 2047 } });
    return t;
  },
});

add({
  id: "hamming-distance",
  leetcode_number: 461,
  title: "Hamming Distance",
  difficulty: "Easy",
  categories: ["Bit Manipulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "The Hamming distance between two integers is the number of positions at which their bits differ. Given two non-negative integers x and y, return their Hamming distance.",
  constraints: ["0 <= x, y <= 2^31 - 1"],
  hints: [
    "x XOR y has 1s at exactly the differing positions.",
    "Now count the 1 bits.",
  ],
  optimal: { time: "O(1)", space: "O(1)", approach: "popcount(x ^ y)." },
  alternatives: [],
  pitfalls: ["Use unsigned shift after XOR to avoid sign-extension issues."],
  followups: ["Total Hamming Distance (LC 477) — sum over all pairs."],
  signature: { fn: "hammingDistance", params: [{ name: "x", adapt: "identity" }, { name: "y", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function hammingDistance(x: number, y: number): number {
  let v = (x ^ y) >>> 0, c = 0;
  while (v) { v &= v - 1; c++; }
  return c;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { x: 1, y: 4 } });
    t.push({ name: "example-2", category: "example", input: { x: 3, y: 1 } });
    t.push({ name: "same", category: "edge", input: { x: 0, y: 0 } });
    t.push({ name: "max-diff", category: "edge", input: { x: 0, y: 2147483647 } });
    t.push({ name: "all-bits", category: "edge", input: { x: 1431655765, y: 2863311530 } });
    return t;
  },
});

add({
  id: "power-of-two",
  leetcode_number: 231,
  title: "Power of Two",
  difficulty: "Easy",
  categories: ["Bit Manipulation", "Math"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an integer n, return true if it is a power of two; otherwise return false. An integer is a power of two if there exists an integer x such that n == 2^x.",
  constraints: ["-2^31 <= n <= 2^31 - 1"],
  hints: [
    "Powers of two have exactly one bit set.",
    "n & (n - 1) clears the lowest set bit.",
  ],
  optimal: { time: "O(1)", space: "O(1)", approach: "n > 0 && (n & (n-1)) === 0." },
  alternatives: [{ approach: "Repeatedly divide by 2", time: "O(log n)", space: "O(1)" }],
  pitfalls: ["Forgetting to exclude zero and negatives — both can pass naive checks."],
  followups: ["Power of Three / Power of Four."],
  signature: { fn: "isPowerOfTwo", params: [{ name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { n: 1 } });
    t.push({ name: "example-16", category: "example", input: { n: 16 } });
    t.push({ name: "example-3", category: "example", input: { n: 3 } });
    t.push({ name: "zero", category: "edge", input: { n: 0 } });
    t.push({ name: "negative", category: "edge", input: { n: -2 } });
    t.push({ name: "max-power", category: "edge", input: { n: 1073741824 } });
    t.push({ name: "off-by-one-large", category: "edge", input: { n: 1073741825 } });
    return t;
  },
});

add({
  id: "happy-number",
  leetcode_number: 202,
  title: "Happy Number",
  difficulty: "Easy",
  categories: ["Math", "Hash Table", "Two Pointers"],
  sources: ["LeetCode Top Interview 150", "Grind 75"],
  prompt: "Replace n by the sum of the squares of its digits and repeat. n is happy if this process eventually reaches 1; otherwise it loops forever in a cycle that does not include 1. Return true if n is happy.",
  constraints: ["1 <= n <= 2^31 - 1"],
  hints: [
    "Either you reach 1, or you enter a cycle.",
    "Detect the cycle with a set, or with Floyd's tortoise-and-hare.",
  ],
  optimal: { time: "O(log n)", space: "O(1)", approach: "Floyd cycle detection on the digit-square sequence." },
  alternatives: [{ approach: "Hash set of seen values", time: "O(log n)", space: "O(log n)" }],
  pitfalls: ["Forgetting to check for 1 inside the loop leads to infinite recursion."],
  followups: ["Generalize to k-th power of digits."],
  signature: { fn: "isHappy", params: [{ name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isHappy(n: number): boolean {
  const seen = new Set<number>();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    let s = 0;
    while (n > 0) { const d = n % 10; s += d * d; n = (n - d) / 10; }
    n = s;
  }
  return n === 1;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-true", category: "example", input: { n: 19 } });
    t.push({ name: "example-false", category: "example", input: { n: 2 } });
    t.push({ name: "one", category: "edge", input: { n: 1 } });
    t.push({ name: "seven", category: "edge", input: { n: 7 } });
    t.push({ name: "large-true", category: "edge", input: { n: 1111111 } });
    t.push({ name: "large-false", category: "edge", input: { n: 9999999 } });
    return t;
  },
});

add({
  id: "plus-one",
  leetcode_number: 66,
  title: "Plus One",
  difficulty: "Easy",
  categories: ["Array", "Math"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "You are given a large integer represented as an array of digits where digits[0] is the most significant digit. Increment the integer by one and return the resulting array of digits.",
  constraints: ["1 <= digits.length <= 100", "0 <= digits[i] <= 9", "no leading zeros except for the number 0 itself"],
  hints: [
    "Walk from the right, propagating the carry.",
    "If every digit was 9, you need a new leading 1.",
  ],
  optimal: { time: "O(n)", space: "O(1) extra (or O(n) on the all-9 case)", approach: "Right-to-left carry propagation." },
  alternatives: [],
  pitfalls: ["Forgetting the all-9 case where the result has one more digit than the input."],
  followups: ["Plus K (general increment)."],
  signature: { fn: "plusOne", params: [{ name: "digits", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function plusOne(digits: number[]): number[] {
  const out = digits.slice();
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i] < 9) { out[i]++; return out; }
    out[i] = 0;
  }
  out.unshift(1);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { digits: [1,2,3] } });
    t.push({ name: "example-2", category: "example", input: { digits: [4,3,2,1] } });
    t.push({ name: "single-zero", category: "edge", input: { digits: [0] } });
    t.push({ name: "single-nine", category: "edge", input: { digits: [9] } });
    t.push({ name: "all-nines", category: "edge", input: { digits: [9,9,9,9] } });
    t.push({ name: "trailing-nine", category: "edge", input: { digits: [1,9,9] } });
    {
      const r = rng(1012);
      const arr = [randInt(r, 1, 9)]; for (let i = 1; i < 100; i++) arr.push(randInt(r, 0, 9));
      t.push({ name: "stress-100", category: "stress", input: { digits: arr } });
    }
    return t;
  },
});

add({
  id: "pow-x-n",
  leetcode_number: 50,
  title: "Pow(x, n)",
  difficulty: "Medium",
  categories: ["Math", "Recursion"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Implement pow(x, n) which computes x raised to the power n (where n is a 32-bit signed integer).",
  constraints: ["-100.0 < x < 100.0", "-2^31 <= n <= 2^31 - 1"],
  hints: [
    "Naively multiplying n times is too slow when |n| is huge.",
    "Halve n at each step using x^n = (x^{n/2})^2 (with adjustment for odd n).",
    "Negative n: invert x and negate n (careful with INT_MIN).",
  ],
  optimal: { time: "O(log |n|)", space: "O(1)", approach: "Iterative fast exponentiation by squaring." },
  alternatives: [{ approach: "Recursive fast exponentiation", time: "O(log |n|)", space: "O(log |n|)" }],
  pitfalls: ["Negating INT_MIN overflows in fixed-width languages.", "0^0 returns 1 by convention."],
  followups: ["Modular exponentiation."],
  signature: { fn: "myPow", params: [{ name: "x", adapt: "identity" }, { name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function myPow(x: number, n: number): number {
  if (n === 0) return 1;
  let N = n;
  if (N < 0) { x = 1 / x; N = -N; }
  let r = 1, base = x;
  while (N > 0) {
    if (N & 1) r *= base;
    base *= base;
    N = Math.floor(N / 2);
  }
  return r;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { x: 2.0, n: 10 } });
    t.push({ name: "example-2", category: "example", input: { x: 2.1, n: 3 } });
    t.push({ name: "example-3-negative-n", category: "example", input: { x: 2.0, n: -2 } });
    t.push({ name: "n-zero", category: "edge", input: { x: 0.5, n: 0 } });
    t.push({ name: "x-one", category: "edge", input: { x: 1.0, n: 1000 } });
    t.push({ name: "x-neg-one-even", category: "edge", input: { x: -1.0, n: 1000000 } });
    t.push({ name: "x-neg-one-odd", category: "edge", input: { x: -1.0, n: 1000001 } });
    t.push({ name: "large-power", category: "edge", input: { x: 2.0, n: 30 } });
    return t;
  },
});

add({
  id: "sqrt-x",
  leetcode_number: 69,
  title: "Sqrt(x)",
  difficulty: "Easy",
  categories: ["Math", "Binary Search"],
  sources: ["LeetCode Top Interview 150", "Grind 75"],
  prompt: "Given a non-negative integer x, return the integer square root of x — the largest integer m such that m * m <= x. You may not use any built-in exponentiation.",
  constraints: ["0 <= x <= 2^31 - 1"],
  hints: [
    "Binary search the answer in [0, x].",
    "Check m * m <= x using division to avoid overflow: m <= x / m.",
  ],
  optimal: { time: "O(log x)", space: "O(1)", approach: "Binary search for the largest m with m*m <= x." },
  alternatives: [{ approach: "Newton's method", time: "O(log x)", space: "O(1)" }],
  pitfalls: ["m * m overflows for large m in fixed-width languages — compare via division."],
  followups: ["Cube root, k-th root."],
  signature: { fn: "mySqrt", params: [{ name: "x", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function mySqrt(x: number): number {
  if (x < 2) return x;
  let lo = 1, hi = x, ans = 0;
  while (lo <= hi) {
    const m = Math.floor((lo + hi) / 2);
    if (m <= Math.floor(x / m)) { ans = m; lo = m + 1; }
    else hi = m - 1;
  }
  return ans;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-perfect", category: "example", input: { x: 4 } });
    t.push({ name: "example-non-perfect", category: "example", input: { x: 8 } });
    t.push({ name: "zero", category: "edge", input: { x: 0 } });
    t.push({ name: "one", category: "edge", input: { x: 1 } });
    t.push({ name: "max", category: "edge", input: { x: 2147395599 } });
    t.push({ name: "near-perfect", category: "edge", input: { x: 2147483647 } });
    return t;
  },
});

add({
  id: "fizz-buzz",
  leetcode_number: 412,
  title: "Fizz Buzz",
  difficulty: "Easy",
  categories: ["Math", "String"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an integer n, return a string array answer of length n where answer[i] equals 'FizzBuzz' if i+1 is divisible by 15, 'Fizz' if divisible by 3, 'Buzz' if divisible by 5, and the decimal string of i+1 otherwise.",
  constraints: ["1 <= n <= 1e4"],
  hints: ["Check 15 first to short-circuit, or concatenate Fizz/Buzz parts."],
  optimal: { time: "O(n)", space: "O(n)", approach: "Linear scan with modulo checks." },
  alternatives: [{ approach: "String concat (Fizz | Buzz)", time: "O(n)", space: "O(n)", note: "Avoids the extra %15 branch." }],
  pitfalls: ["Forgetting that the divisible-by-15 case must be checked first when using if/else."],
  followups: ["Generalize to a list of (divisor, label) pairs."],
  signature: { fn: "fizzBuzz", params: [{ name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function fizzBuzz(n: number): string[] {
  const out: string[] = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push("FizzBuzz");
    else if (i % 3 === 0) out.push("Fizz");
    else if (i % 5 === 0) out.push("Buzz");
    else out.push(String(i));
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-3", category: "example", input: { n: 3 } });
    t.push({ name: "example-5", category: "example", input: { n: 5 } });
    t.push({ name: "example-15", category: "example", input: { n: 15 } });
    t.push({ name: "n-1", category: "edge", input: { n: 1 } });
    t.push({ name: "stress-10000", category: "stress", input: { n: 10000 } });
    return t;
  },
});

add({
  id: "roman-to-integer",
  leetcode_number: 13,
  title: "Roman to Integer",
  difficulty: "Easy",
  categories: ["Hash Table", "Math", "String"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Convert a roman numeral string to its integer value. Symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. A smaller symbol placed before a larger one is subtracted (e.g., IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900).",
  constraints: ["1 <= s.length <= 15", "valid roman numeral in [1, 3999]"],
  hints: [
    "Map each character to its value.",
    "If v[i] < v[i+1], subtract v[i] instead of adding.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Single pass with subtraction rule." },
  alternatives: [{ approach: "Table-driven longest match", time: "O(n)", space: "O(1)" }],
  pitfalls: ["Off-by-one when looking ahead at i+1 — handle the last character cleanly."],
  followups: ["Integer to Roman (LC 12)."],
  signature: { fn: "romanToInt", params: [{ name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function romanToInt(s: string): number {
  const m: Record<string, number> = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
  let r = 0;
  for (let i = 0; i < s.length; i++) {
    const v = m[s[i]], nx = m[s[i+1]] || 0;
    r += v < nx ? -v : v;
  }
  return r;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-III", category: "example", input: { s: "III" } });
    t.push({ name: "example-LVIII", category: "example", input: { s: "LVIII" } });
    t.push({ name: "example-MCMXCIV", category: "example", input: { s: "MCMXCIV" } });
    t.push({ name: "single-I", category: "edge", input: { s: "I" } });
    t.push({ name: "single-M", category: "edge", input: { s: "M" } });
    t.push({ name: "max-3999", category: "edge", input: { s: "MMMCMXCIX" } });
    t.push({ name: "all-subtractions", category: "edge", input: { s: "CDXLIV" } });
    return t;
  },
});

add({
  id: "integer-to-roman",
  leetcode_number: 12,
  title: "Integer to Roman",
  difficulty: "Medium",
  categories: ["Hash Table", "Math", "String"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an integer in [1, 3999], convert it to its roman numeral representation. Use the subtractive forms IV, IX, XL, XC, CD, CM where applicable.",
  constraints: ["1 <= num <= 3999"],
  hints: [
    "Greedily peel off the largest value that fits, including subtractive forms.",
    "A 13-entry table covers all cases neatly.",
  ],
  optimal: { time: "O(1)", space: "O(1)", approach: "Greedy table of (value, symbol) pairs." },
  alternatives: [{ approach: "Per-digit lookup", time: "O(1)", space: "O(1)" }],
  pitfalls: ["Forgetting the six subtractive entries leads to wrong forms (IIII instead of IV)."],
  followups: ["Roman to Integer (LC 13)."],
  signature: { fn: "intToRoman", params: [{ name: "num", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function intToRoman(num: number): string {
  const v = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const sym = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let out = "";
  for (let i = 0; i < v.length; i++) while (num >= v[i]) { out += sym[i]; num -= v[i]; }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-3", category: "example", input: { num: 3 } });
    t.push({ name: "example-58", category: "example", input: { num: 58 } });
    t.push({ name: "example-1994", category: "example", input: { num: 1994 } });
    t.push({ name: "min", category: "edge", input: { num: 1 } });
    t.push({ name: "max", category: "edge", input: { num: 3999 } });
    t.push({ name: "round-thousand", category: "edge", input: { num: 2000 } });
    t.push({ name: "subtractive", category: "edge", input: { num: 444 } });
    return t;
  },
});

add({
  id: "multiply-strings",
  leetcode_number: 43,
  title: "Multiply Strings",
  difficulty: "Medium",
  categories: ["Math", "String", "Simulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given two non-negative integers represented as strings num1 and num2 (no leading zeros except for the number '0' itself), return their product, also as a string. You must not use built-in big-integer libraries or convert directly to numbers.",
  constraints: ["1 <= num1.length, num2.length <= 200", "digits only", "no leading zeros (except '0')"],
  hints: [
    "Result has at most m + n digits.",
    "Multiply each digit pair into the right slot of a result array, propagating carries.",
  ],
  optimal: { time: "O(m·n)", space: "O(m+n)", approach: "Schoolbook multiplication into an integer array, then strip leading zeros." },
  alternatives: [{ approach: "Karatsuba", time: "O(n^log2 3)", space: "O(n)" }],
  pitfalls: ["Forgetting to strip leading zeros yields '0123' instead of '123'.", "Result of '0' × anything must be '0' (not '00')."],
  followups: ["Add Strings (LC 415).", "Implement bignum addition and subtraction."],
  signature: { fn: "multiplyStrings", params: [{ name: "num1", adapt: "identity" }, { name: "num2", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function multiply(num1: string, num2: string): string {
  if (num1 === "0" || num2 === "0") return "0";
  const m = num1.length, n = num2.length;
  const r = new Array(m + n).fill(0);
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const mul = (num1.charCodeAt(i) - 48) * (num2.charCodeAt(j) - 48);
      const p1 = i + j, p2 = i + j + 1;
      const sum = mul + r[p2];
      r[p2] = sum % 10;
      r[p1] += Math.floor(sum / 10);
    }
  }
  while (r.length > 1 && r[0] === 0) r.shift();
  return r.join("");
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-2x3", category: "example", input: { num1: "2", num2: "3" } });
    t.push({ name: "example-123x456", category: "example", input: { num1: "123", num2: "456" } });
    t.push({ name: "with-zero", category: "edge", input: { num1: "0", num2: "12345" } });
    t.push({ name: "single-digit-each", category: "edge", input: { num1: "9", num2: "9" } });
    t.push({ name: "powers-of-ten", category: "edge", input: { num1: "100", num2: "1000" } });
    {
      const r = rng(1018);
      let a = "", b = "";
      a += String(randInt(r, 1, 9));
      for (let i = 0; i < 99; i++) a += String(randInt(r, 0, 9));
      b += String(randInt(r, 1, 9));
      for (let i = 0; i < 99; i++) b += String(randInt(r, 0, 9));
      t.push({ name: "stress-100x100", category: "stress", input: { num1: a, num2: b } });
    }
    return t;
  },
});

add({
  id: "palindrome-number",
  leetcode_number: 9,
  title: "Palindrome Number",
  difficulty: "Easy",
  categories: ["Math"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an integer x, return true if it is a palindrome (reads the same forwards and backwards in base 10). Negative numbers are not palindromes.",
  constraints: ["-2^31 <= x <= 2^31 - 1"],
  hints: [
    "Negative numbers can never be palindromes due to the leading minus.",
    "Reverse half (or all) of the digits and compare.",
  ],
  optimal: { time: "O(log10 x)", space: "O(1)", approach: "Reverse the integer numerically and compare." },
  alternatives: [{ approach: "Convert to string and two-pointer", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Reversing all digits can overflow in fixed-width languages — reverse only half.", "x ending in 0 (and x != 0) cannot be a palindrome."],
  followups: ["What if you may not convert to a string?"],
  signature: { fn: "isPalindromeNumber", params: [{ name: "x", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isPalindrome(x: number): boolean {
  if (x < 0) return false;
  let rev = 0, n = x;
  while (n > 0) { rev = rev * 10 + n % 10; n = Math.floor(n / 10); }
  return rev === x;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-true", category: "example", input: { x: 121 } });
    t.push({ name: "example-false-negative", category: "example", input: { x: -121 } });
    t.push({ name: "example-trailing-zero", category: "example", input: { x: 10 } });
    t.push({ name: "zero", category: "edge", input: { x: 0 } });
    t.push({ name: "single-digit", category: "edge", input: { x: 7 } });
    t.push({ name: "long-palindrome", category: "edge", input: { x: 1234567654321 } });
    t.push({ name: "near-int-max", category: "edge", input: { x: 2147447412 } });
    return t;
  },
});

add({
  id: "add-binary",
  leetcode_number: 67,
  title: "Add Binary",
  difficulty: "Easy",
  categories: ["Math", "String", "Bit Manipulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given two binary strings a and b, return their sum as a binary string. Inputs may be very long (up to ~10^4 bits), so do not convert directly to a fixed-width number.",
  constraints: ["1 <= a.length, b.length <= 1e4", "characters are '0' or '1'", "no leading zeros except for '0' itself"],
  hints: [
    "Walk both strings from the right, tracking a carry.",
    "Don't forget to flush a final carry into a leading '1'.",
  ],
  optimal: { time: "O(max(m, n))", space: "O(max(m, n))", approach: "Two-pointer right-to-left addition with carry." },
  alternatives: [{ approach: "BigInt addition", time: "O(n)", space: "O(n)", note: "Cheating in interviews; use only as a sanity check." }],
  pitfalls: ["Stopping the loop while a non-zero carry remains."],
  followups: ["Add Strings (LC 415)."],
  signature: { fn: "addBinary", params: [{ name: "a", adapt: "identity" }, { name: "b", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function addBinary(a: string, b: string): string {
  let i = a.length - 1, j = b.length - 1, c = 0, out = "";
  while (i >= 0 || j >= 0 || c) {
    const x = i >= 0 ? a.charCodeAt(i--) - 48 : 0;
    const y = j >= 0 ? b.charCodeAt(j--) - 48 : 0;
    const s = x + y + c;
    out = (s & 1) + out;
    c = s >> 1;
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-11+1", category: "example", input: { a: "11", b: "1" } });
    t.push({ name: "example-1010+1011", category: "example", input: { a: "1010", b: "1011" } });
    t.push({ name: "zero+zero", category: "edge", input: { a: "0", b: "0" } });
    t.push({ name: "long-carry-chain", category: "edge", input: { a: "1111", b: "1" } });
    t.push({ name: "different-lengths", category: "edge", input: { a: "1", b: "111" } });
    {
      const r = rng(1020);
      let a = "1", b = "1";
      for (let i = 0; i < 999; i++) { a += String(randInt(r, 0, 1)); b += String(randInt(r, 0, 1)); }
      t.push({ name: "stress-1000bit", category: "stress", input: { a, b } });
    }
    return t;
  },
});

add({
  id: "excel-sheet-column-number",
  leetcode_number: 171,
  title: "Excel Sheet Column Number",
  difficulty: "Easy",
  categories: ["Math", "String"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given a string columnTitle representing an Excel sheet column title (A, B, ..., Z, AA, AB, ...), return its corresponding column number. 'A' is 1, 'B' is 2, ..., 'Z' is 26, 'AA' is 27, 'AB' is 28, etc.",
  constraints: ["1 <= columnTitle.length <= 7", "columnTitle consists of uppercase English letters", "result fits in 32-bit signed integer"],
  hints: ["This is base-26 with digits 1..26 instead of 0..25."],
  optimal: { time: "O(n)", space: "O(1)", approach: "Horner's method in base 26." },
  alternatives: [],
  pitfalls: ["Using digit value 0..25 instead of 1..26 is off by one for every column."],
  followups: ["Excel Column Number to Title (LC 168) — the inverse mapping."],
  signature: { fn: "titleToNumber", params: [{ name: "columnTitle", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function titleToNumber(columnTitle: string): number {
  let r = 0;
  for (let i = 0; i < columnTitle.length; i++) r = r * 26 + (columnTitle.charCodeAt(i) - 64);
  return r;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-A", category: "example", input: { columnTitle: "A" } });
    t.push({ name: "example-AB", category: "example", input: { columnTitle: "AB" } });
    t.push({ name: "example-ZY", category: "example", input: { columnTitle: "ZY" } });
    t.push({ name: "Z", category: "edge", input: { columnTitle: "Z" } });
    t.push({ name: "AA", category: "edge", input: { columnTitle: "AA" } });
    t.push({ name: "AAAAAAA", category: "edge", input: { columnTitle: "AAAAAAA" } });
    t.push({ name: "FXSHRXW", category: "edge", input: { columnTitle: "FXSHRXW" } });
    return t;
  },
});

add({
  id: "factorial-trailing-zeroes",
  leetcode_number: 172,
  title: "Factorial Trailing Zeroes",
  difficulty: "Medium",
  categories: ["Math"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an integer n, return the number of trailing zeroes in n! (n factorial).",
  constraints: ["0 <= n <= 1e4"],
  hints: [
    "Each trailing zero is produced by a factor of 5 paired with a factor of 2.",
    "There are always more 2s than 5s in factorial — count multiples of 5.",
    "Don't forget multiples of 25, 125, ...",
  ],
  optimal: { time: "O(log5 n)", space: "O(1)", approach: "Sum of floor(n/5) + floor(n/25) + floor(n/125) + ..." },
  alternatives: [{ approach: "Compute n! and count zeros", time: "O(n)", space: "O(n)", note: "Overflows for large n in fixed-width." }],
  pitfalls: ["Using only floor(n/5) misses higher multiples — every multiple of 25 contributes an extra 5, etc."],
  followups: ["Find smallest n such that n! has exactly k trailing zeroes."],
  signature: { fn: "trailingZeroes", params: [{ name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function trailingZeroes(n: number): number {
  let c = 0;
  while (n > 0) { n = Math.floor(n / 5); c += n; }
  return c;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-3", category: "example", input: { n: 3 } });
    t.push({ name: "example-5", category: "example", input: { n: 5 } });
    t.push({ name: "example-0", category: "example", input: { n: 0 } });
    t.push({ name: "n-25", category: "edge", input: { n: 25 } });
    t.push({ name: "n-125", category: "edge", input: { n: 125 } });
    t.push({ name: "n-10000", category: "stress", input: { n: 10000 } });
    return t;
  },
});

add({
  id: "count-primes",
  leetcode_number: 204,
  title: "Count Primes",
  difficulty: "Medium",
  categories: ["Math"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an integer n, return the number of prime numbers strictly less than n.",
  constraints: ["0 <= n <= 5 * 1e6"],
  hints: [
    "Sieve of Eratosthenes — mark composites in O(n log log n).",
    "Start crossing out from i*i (smaller multiples are already marked).",
  ],
  optimal: { time: "O(n log log n)", space: "O(n)", approach: "Sieve of Eratosthenes." },
  alternatives: [{ approach: "Trial division up to sqrt(n)", time: "O(n sqrt n / log n)", space: "O(1)" }],
  pitfalls: ["Off-by-one — count strictly less than n, not <= n."],
  followups: ["Linear sieve (Euler) for prime listing."],
  signature: { fn: "countPrimes", params: [{ name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function countPrimes(n: number): number {
  if (n <= 2) return 0;
  const sieve = new Uint8Array(n);
  let c = 0;
  for (let i = 2; i < n; i++) {
    if (!sieve[i]) {
      c++;
      for (let j = i * i; j < n; j += i) sieve[j] = 1;
    }
  }
  return c;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-10", category: "example", input: { n: 10 } });
    t.push({ name: "n-0", category: "edge", input: { n: 0 } });
    t.push({ name: "n-1", category: "edge", input: { n: 1 } });
    t.push({ name: "n-2", category: "edge", input: { n: 2 } });
    t.push({ name: "n-100", category: "edge", input: { n: 100 } });
    t.push({ name: "stress-100000", category: "stress", input: { n: 100000 } });
    t.push({ name: "stress-1000000", category: "stress", input: { n: 1000000 } });
    return t;
  },
});

add({
  id: "divide-two-integers",
  leetcode_number: 29,
  title: "Divide Two Integers",
  difficulty: "Medium",
  categories: ["Math", "Bit Manipulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given two integers dividend and divisor, divide them without using multiplication, division, or modulo operators. Truncate toward zero. If the result overflows the 32-bit signed integer range, return INT_MAX (2^31 - 1).",
  constraints: ["-2^31 <= dividend, divisor <= 2^31 - 1", "divisor != 0"],
  hints: [
    "Repeatedly double the divisor (via left shift / addition) to subtract big chunks at once.",
    "Track signs separately and work on absolute values.",
    "Watch for INT_MIN / -1 — that's the only overflow case.",
  ],
  optimal: { time: "O(log^2 |dividend|)", space: "O(1)", approach: "Repeatedly subtract the largest 2^k * divisor that still fits." },
  alternatives: [{ approach: "Subtract divisor one at a time", time: "O(|dividend|)", space: "O(1)", note: "TLE on big values." }],
  pitfalls: ["INT_MIN / -1 overflows — return INT_MAX.", "Negating INT_MIN overflows in 32-bit integer types."],
  followups: ["Implement modulo without %."],
  signature: { fn: "divideTwoIntegers", params: [{ name: "dividend", adapt: "identity" }, { name: "divisor", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function divide(dividend: number, divisor: number): number {
  const INT_MAX = 2147483647, INT_MIN = -2147483648;
  if (dividend === INT_MIN && divisor === -1) return INT_MAX;
  const sign = (dividend < 0) === (divisor < 0) ? 1 : -1;
  let dvd = Math.abs(dividend), dvs = Math.abs(divisor), q = 0;
  while (dvd >= dvs) {
    let t = dvs, m = 1;
    while (t * 2 <= dvd) { t *= 2; m *= 2; }
    dvd -= t; q += m;
  }
  const r = sign * q;
  if (r > INT_MAX) return INT_MAX;
  if (r < INT_MIN) return INT_MIN;
  return r;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-10/3", category: "example", input: { dividend: 10, divisor: 3 } });
    t.push({ name: "example-7/-3", category: "example", input: { dividend: 7, divisor: -3 } });
    t.push({ name: "overflow-INT_MIN/-1", category: "edge", input: { dividend: -2147483648, divisor: -1 } });
    t.push({ name: "INT_MIN/1", category: "edge", input: { dividend: -2147483648, divisor: 1 } });
    t.push({ name: "INT_MIN/2", category: "edge", input: { dividend: -2147483648, divisor: 2 } });
    t.push({ name: "zero-dividend", category: "edge", input: { dividend: 0, divisor: 7 } });
    t.push({ name: "abs-equal", category: "edge", input: { dividend: -7, divisor: -7 } });
    t.push({ name: "less-than-divisor", category: "edge", input: { dividend: 1, divisor: 2 } });
    return t;
  },
});

add({
  id: "reverse-integer",
  leetcode_number: 7,
  title: "Reverse Integer",
  difficulty: "Medium",
  categories: ["Math"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given a signed 32-bit integer x, return x with its digits reversed. If reversing causes the value to fall outside the 32-bit signed integer range [-2^31, 2^31 - 1], return 0.",
  constraints: ["-2^31 <= x <= 2^31 - 1"],
  hints: [
    "Repeatedly take x % 10 and rebuild.",
    "Check for overflow before each multiplication step.",
  ],
  optimal: { time: "O(log10 |x|)", space: "O(1)", approach: "Mod-10 rebuild with overflow check." },
  alternatives: [{ approach: "Convert to string and reverse", time: "O(n)", space: "O(n)", note: "Easier but uses extra space." }],
  pitfalls: ["Forgetting to detect overflow — must clamp to 0 in that case.", "Negative modulo behavior differs by language; abs first in JS to keep it consistent."],
  followups: ["Reverse a 64-bit integer with overflow handling."],
  signature: { fn: "reverseInteger", params: [{ name: "x", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function reverse(x: number): number {
  const INT_MAX = 2147483647, INT_MIN = -2147483648;
  const sign = x < 0 ? -1 : 1;
  let n = Math.abs(x), r = 0;
  while (n > 0) { r = r * 10 + n % 10; n = Math.floor(n / 10); }
  r *= sign;
  if (r > INT_MAX || r < INT_MIN) return 0;
  return r;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-pos", category: "example", input: { x: 123 } });
    t.push({ name: "example-neg", category: "example", input: { x: -123 } });
    t.push({ name: "example-trailing-zero", category: "example", input: { x: 120 } });
    t.push({ name: "zero", category: "edge", input: { x: 0 } });
    t.push({ name: "overflow-pos", category: "edge", input: { x: 1534236469 } });
    t.push({ name: "overflow-neg", category: "edge", input: { x: -2147483648 } });
    t.push({ name: "single-digit", category: "edge", input: { x: 7 } });
    return t;
  },
});

add({
  id: "lfu-cache",
  leetcode_number: 460,
  title: "LFU Cache",
  difficulty: "Hard",
  categories: ["Hash Table", "Linked List", "Design"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Design a data structure that follows the constraints of a Least Frequently Used (LFU) cache. Operations: LFUCache(int capacity), int get(int key) — returns the value if present and bumps its access frequency, else -1; void put(int key, int value) — inserts or updates; if capacity is exceeded, evict the least-frequently-used key, breaking ties by least-recently-used. The runnable variant accepts (operations, args) arrays mirroring LeetCode's design test format and returns the array of results (with null for void calls).",
  constraints: ["0 <= capacity <= 1e4", "0 <= key, value <= 1e9", "up to 2 * 1e5 operations"],
  hints: [
    "Maintain frequency buckets, each an ordered set keyed by recency.",
    "Track minFreq so eviction is O(1).",
    "Bumping a key's frequency moves it from bucket f to bucket f+1.",
  ],
  optimal: { time: "O(1) amortized per op", space: "O(capacity)", approach: "Hash map of key→{val, freq} plus map of freq→ordered map of keys; track minFreq." },
  alternatives: [{ approach: "Heap of (freq, key)", time: "O(log n)", space: "O(n)", note: "Simpler but slower." }],
  pitfalls: [
    "Capacity 0 must accept put() silently (no eviction errors).",
    "Tie-breaking by recency requires preserving insertion order within each freq bucket.",
    "Resetting minFreq to 1 on every new insert.",
  ],
  followups: ["LRU Cache (LC 146).", "All O(1) data structure (LC 432)."],
  signature: { fn: "lfuCacheOps", params: [{ name: "operations", adapt: "identity" }, { name: "args", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class LFUCache {
  cap: number;
  kv = new Map<number, { val: number; freq: number }>();
  fl = new Map<number, Map<number, true>>();
  minF = 0;
  constructor(capacity: number) { this.cap = capacity; }
  private touch(k: number) {
    const node = this.kv.get(k)!;
    const f = node.freq;
    this.fl.get(f)!.delete(k);
    if (this.fl.get(f)!.size === 0) {
      this.fl.delete(f);
      if (this.minF === f) this.minF++;
    }
    node.freq++;
    if (!this.fl.has(node.freq)) this.fl.set(node.freq, new Map());
    this.fl.get(node.freq)!.set(k, true);
  }
  get(k: number): number {
    if (!this.kv.has(k)) return -1;
    this.touch(k);
    return this.kv.get(k)!.val;
  }
  put(k: number, v: number): void {
    if (this.cap === 0) return;
    if (this.kv.has(k)) { this.kv.get(k)!.val = v; this.touch(k); return; }
    if (this.kv.size >= this.cap) {
      const list = this.fl.get(this.minF)!;
      const ev = list.keys().next().value!;
      list.delete(ev);
      if (list.size === 0) this.fl.delete(this.minF);
      this.kv.delete(ev);
    }
    this.kv.set(k, { val: v, freq: 1 });
    if (!this.fl.has(1)) this.fl.set(1, new Map());
    this.fl.get(1)!.set(k, true);
    this.minF = 1;
  }
}`,
  tests: () => {
    const t = [];
    t.push({
      name: "example-1",
      category: "example",
      input: {
        operations: ["LFUCache","put","put","get","put","get","get","put","get","get","get"],
        args: [[2],[1,1],[2,2],[1],[3,3],[2],[3],[4,4],[1],[3],[4]],
      },
    });
    t.push({
      name: "capacity-zero",
      category: "edge",
      input: { operations: ["LFUCache","put","get"], args: [[0],[0,0],[0]] },
    });
    t.push({
      name: "update-bumps-freq",
      category: "edge",
      input: {
        operations: ["LFUCache","put","put","put","put","get"],
        args: [[2],[1,1],[2,2],[1,3],[3,3],[2]],
      },
    });
    t.push({
      name: "lru-tiebreak",
      category: "edge",
      input: {
        operations: ["LFUCache","put","put","put","get"],
        args: [[2],[1,1],[2,2],[3,3],[1]],
      },
    });
    {
      const r = rng(1026);
      const ops = ["LFUCache"]; const ar = [[100]];
      for (let i = 0; i < 5000; i++) {
        const op = randInt(r, 0, 2);
        if (op === 0) { ops.push("put"); ar.push([randInt(r, 0, 200), randInt(r, 0, 1000)]); }
        else if (op === 1) { ops.push("get"); ar.push([randInt(r, 0, 200)]); }
        else { ops.push("put"); ar.push([randInt(r, 0, 200), randInt(r, 0, 1000)]); }
      }
      t.push({ name: "stress-5000", category: "stress", input: { operations: ops, args: ar } });
    }
    return t;
  },
});

add({
  id: "design-twitter",
  leetcode_number: 355,
  title: "Design Twitter",
  difficulty: "Medium",
  categories: ["Hash Table", "Heap / Priority Queue", "Design", "Linked List"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Design a simplified Twitter that supports four operations: postTweet(userId, tweetId), getNewsFeed(userId) returning the 10 most recent tweet IDs in the user's news feed (the user's own tweets and the tweets of users they follow, most recent first), follow(followerId, followeeId), and unfollow(followerId, followeeId). The runnable variant accepts (operations, args) arrays. Construct with operation 'Twitter' (no args).",
  constraints: ["1 <= userId, tweetId, followerId, followeeId <= 500", "up to 3 * 1e4 operations", "Tweet IDs are unique."],
  hints: [
    "Per-user list of (timestamp, tweetId).",
    "For getNewsFeed, merge the latest 10 from each followed user (a min-heap of size 10 works in O(k log 10)).",
    "A user implicitly follows themselves.",
  ],
  optimal: { time: "post O(1), feed O(F log 10) where F = #followees, follow/unfollow O(1)", space: "O(N)", approach: "Hash map from user → tweets list; per-user follow set." },
  alternatives: [{ approach: "Sort all matched tweets globally", time: "O(F · T log(FT))", space: "O(FT)", note: "Simpler but slower for long histories." }],
  pitfalls: [
    "Following yourself with follow(u, u) should be a no-op for the feed (already included).",
    "Unfollowing yourself must not actually remove yourself.",
    "The feed must respect ordering across followees, not just per-user recency.",
  ],
  followups: ["Twitter with edits/deletes.", "Streaming top-K with multiple writers."],
  signature: { fn: "twitterOps", params: [{ name: "operations", adapt: "identity" }, { name: "args", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class Twitter {
  timer = 0;
  tweets = new Map<number, { t: number; id: number }[]>();
  follows = new Map<number, Set<number>>();
  private ensure(u: number) {
    if (!this.tweets.has(u)) this.tweets.set(u, []);
    if (!this.follows.has(u)) this.follows.set(u, new Set([u]));
  }
  postTweet(userId: number, tweetId: number) {
    this.ensure(userId);
    this.tweets.get(userId)!.push({ t: this.timer++, id: tweetId });
  }
  getNewsFeed(userId: number): number[] {
    this.ensure(userId);
    const all: { t: number; id: number }[] = [];
    for (const u of this.follows.get(userId)!) {
      const list = this.tweets.get(u) || [];
      for (let j = list.length - 1, k = 0; j >= 0 && k < 10; j--, k++) all.push(list[j]);
    }
    all.sort((a, b) => b.t - a.t);
    return all.slice(0, 10).map((x) => x.id);
  }
  follow(a: number, b: number) { this.ensure(a); this.ensure(b); this.follows.get(a)!.add(b); }
  unfollow(a: number, b: number) { this.ensure(a); if (a !== b) this.follows.get(a)!.delete(b); }
}`,
  tests: () => {
    const t = [];
    t.push({
      name: "example-1",
      category: "example",
      input: {
        operations: ["Twitter","postTweet","getNewsFeed","follow","postTweet","getNewsFeed","unfollow","getNewsFeed"],
        args: [[],[1,5],[1],[1,2],[2,6],[1],[1,2],[1]],
      },
    });
    t.push({
      name: "self-follow-noop",
      category: "edge",
      input: {
        operations: ["Twitter","postTweet","follow","getNewsFeed"],
        args: [[],[1,10],[1,1],[1]],
      },
    });
    t.push({
      name: "unfollow-self-still-shows",
      category: "edge",
      input: {
        operations: ["Twitter","postTweet","unfollow","getNewsFeed"],
        args: [[],[3,99],[3,3],[3]],
      },
    });
    t.push({
      name: "feed-empty-for-new-user",
      category: "edge",
      input: { operations: ["Twitter","getNewsFeed"], args: [[],[42]] },
    });
    t.push({
      name: "more-than-ten",
      category: "edge",
      input: {
        operations: ["Twitter","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","getNewsFeed"],
        args: [[],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[1,10],[1,11],[1,12],[1]],
      },
    });
    return t;
  },
});

add({
  id: "time-based-key-value-store",
  leetcode_number: 981,
  title: "Time Based Key-Value Store",
  difficulty: "Medium",
  categories: ["Hash Table", "String", "Binary Search", "Design"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Design a time-based key-value store that supports: set(key, value, timestamp) — stores value at the given timestamp; get(key, timestamp) — returns the value associated with the largest timestamp ≤ the queried timestamp, or '' if no such record exists. All set timestamps for a given key are strictly increasing. The runnable variant accepts (operations, args) arrays.",
  constraints: ["1 <= key.length, value.length <= 100", "1 <= timestamp <= 1e7", "up to 2 * 1e5 operations"],
  hints: [
    "Per-key, the timestamps are strictly increasing — append-only.",
    "Use binary search for the largest timestamp ≤ query.",
  ],
  optimal: { time: "set O(1), get O(log n)", space: "O(n)", approach: "Per-key sorted list + binary search." },
  alternatives: [{ approach: "TreeMap / sorted dictionary", time: "O(log n)", space: "O(n)" }],
  pitfalls: ["Returning '' (empty) when no timestamp ≤ query exists, not throwing or returning null."],
  followups: ["Range queries / multi-version snapshots."],
  signature: { fn: "timeMapOps", params: [{ name: "operations", adapt: "identity" }, { name: "args", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class TimeMap {
  m = new Map<string, [number, string][]>();
  set(key: string, value: string, timestamp: number) {
    if (!this.m.has(key)) this.m.set(key, []);
    this.m.get(key)!.push([timestamp, value]);
  }
  get(key: string, timestamp: number): string {
    const list = this.m.get(key);
    if (!list) return "";
    let lo = 0, hi = list.length - 1, ans = "";
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (list[mid][0] <= timestamp) { ans = list[mid][1]; lo = mid + 1; }
      else hi = mid - 1;
    }
    return ans;
  }
}`,
  tests: () => {
    const t = [];
    t.push({
      name: "example-1",
      category: "example",
      input: {
        operations: ["TimeMap","set","get","get","set","get","get"],
        args: [[],["foo","bar",1],["foo",1],["foo",3],["foo","bar2",4],["foo",4],["foo",5]],
      },
    });
    t.push({
      name: "missing-key",
      category: "edge",
      input: { operations: ["TimeMap","get"], args: [[],["x",1]] },
    });
    t.push({
      name: "before-first-timestamp",
      category: "edge",
      input: {
        operations: ["TimeMap","set","get"],
        args: [[],["k","v",10],["k",1]],
      },
    });
    t.push({
      name: "exact-and-after",
      category: "edge",
      input: {
        operations: ["TimeMap","set","set","get","get","get"],
        args: [[],["k","v1",2],["k","v2",5],["k",2],["k",4],["k",100]],
      },
    });
    {
      const r = rng(1028);
      const ops = ["TimeMap"]; const ar = [[]];
      let ts = 0;
      const keys = ["a","b","c","d","e"];
      for (let i = 0; i < 2000; i++) {
        if (r() < 0.5) { ts++; const k = keys[randInt(r,0,4)]; ops.push("set"); ar.push([k, "v" + i, ts]); }
        else { ops.push("get"); ar.push([keys[randInt(r,0,4)], randInt(r, 0, ts + 5)]); }
      }
      t.push({ name: "stress-2000", category: "stress", input: { operations: ops, args: ar } });
    }
    return t;
  },
});

add({
  id: "insert-delete-getrandom-o1",
  leetcode_number: 380,
  title: "Insert Delete GetRandom O(1)",
  difficulty: "Medium",
  categories: ["Array", "Hash Table", "Math", "Design"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Implement RandomizedSet supporting insert(val) → bool (true if new), remove(val) → bool (true if existed), and getRandom() → element drawn uniformly from the current set, all in O(1) expected time. The runnable variant accepts (operations, args) arrays. NOTE: tests in this dataset omit getRandom because its output is non-deterministic; correctness of getRandom is validated by inspection or stochastic harness.",
  constraints: ["-2^31 <= val <= 2^31 - 1", "up to 2 * 1e5 operations", "getRandom only when the set is non-empty"],
  hints: [
    "Backing array provides O(1) random index lookup.",
    "Hash map from val → index lets you find an element to swap with the last entry on remove.",
  ],
  optimal: { time: "O(1) expected per op", space: "O(n)", approach: "Array + value→index hash map; swap-and-pop on remove." },
  alternatives: [{ approach: "Plain Set", time: "O(1) insert/remove, but O(n) random", space: "O(n)" }],
  pitfalls: [
    "Forgetting to update the moved element's index in the hash map after the swap.",
    "Removing an element that isn't present must return false without mutating state.",
  ],
  followups: ["Insert Delete GetRandom O(1) with duplicates allowed (LC 381)."],
  signature: { fn: "randomizedSetOps", params: [{ name: "operations", adapt: "identity" }, { name: "args", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class RandomizedSet {
  idx = new Map<number, number>();
  arr: number[] = [];
  insert(val: number): boolean {
    if (this.idx.has(val)) return false;
    this.idx.set(val, this.arr.length);
    this.arr.push(val);
    return true;
  }
  remove(val: number): boolean {
    if (!this.idx.has(val)) return false;
    const i = this.idx.get(val)!;
    const last = this.arr[this.arr.length - 1];
    this.arr[i] = last;
    this.idx.set(last, i);
    this.arr.pop();
    this.idx.delete(val);
    return true;
  }
  getRandom(): number {
    return this.arr[Math.floor(Math.random() * this.arr.length)];
  }
}`,
  tests: () => {
    const t = [];
    t.push({
      name: "example-no-getrandom",
      category: "example",
      input: {
        operations: ["RandomizedSet","insert","remove","insert","remove","insert"],
        args: [[],[1],[2],[2],[1],[2]],
      },
    });
    t.push({
      name: "duplicate-insert-fails",
      category: "edge",
      input: {
        operations: ["RandomizedSet","insert","insert"],
        args: [[],[5],[5]],
      },
    });
    t.push({
      name: "remove-missing",
      category: "edge",
      input: { operations: ["RandomizedSet","remove"], args: [[],[42]] },
    });
    t.push({
      name: "remove-last-then-insert",
      category: "edge",
      input: {
        operations: ["RandomizedSet","insert","insert","remove","insert"],
        args: [[],[1],[2],[2],[3]],
      },
    });
    {
      const r = rng(1029);
      const ops = ["RandomizedSet"]; const ar = [[]];
      const set = new Set();
      for (let i = 0; i < 5000; i++) {
        const op = randInt(r, 0, 1);
        const v = randInt(r, 0, 200);
        if (op === 0) { ops.push("insert"); ar.push([v]); set.add(v); }
        else { ops.push("remove"); ar.push([v]); set.delete(v); }
      }
      t.push({ name: "stress-5000", category: "stress", input: { operations: ops, args: ar } });
    }
    return t;
  },
});

add({
  id: "design-hit-counter",
  leetcode_number: 362,
  title: "Design Hit Counter",
  difficulty: "Medium",
  categories: ["Queue", "Design", "Binary Search"],
  sources: ["LeetCode Premium"],
  prompt: "Design a hit counter that counts the number of hits received in the past 5 minutes (300 seconds). Operations: hit(timestamp) — record a hit; getHits(timestamp) — return the number of hits in the past 300 seconds (i.e., timestamps strictly greater than timestamp - 300). All input timestamps are in seconds and are monotonically non-decreasing. The runnable variant accepts (operations, args) arrays.",
  constraints: ["1 <= timestamp <= 2 * 1e9", "timestamps are monotonically non-decreasing", "up to 1e5 operations"],
  hints: [
    "Append timestamps to a queue; getHits drops anything <= t - 300 from the front.",
    "Each hit is enqueued and dequeued at most once → amortized O(1).",
  ],
  optimal: { time: "amortized O(1)", space: "O(W) where W is the number of in-window hits", approach: "Monotone-time queue with head pointer." },
  alternatives: [{ approach: "Bucket array of 300 (count, timestamp) pairs", time: "O(1)", space: "O(300)", note: "Constant memory; nice for high QPS." }],
  pitfalls: ["Off-by-one — the window is 'past 300 seconds', i.e., > t - 300, not >= t - 300."],
  followups: ["Concurrent hit counter (locking / sharded buckets)."],
  signature: { fn: "hitCounterOps", params: [{ name: "operations", adapt: "identity" }, { name: "args", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class HitCounter {
  hits: number[] = [];
  head = 0;
  hit(timestamp: number) { this.hits.push(timestamp); }
  getHits(timestamp: number): number {
    const cutoff = timestamp - 300;
    while (this.head < this.hits.length && this.hits[this.head] <= cutoff) this.head++;
    return this.hits.length - this.head;
  }
}`,
  tests: () => {
    const t = [];
    t.push({
      name: "example-1",
      category: "example",
      input: {
        operations: ["HitCounter","hit","hit","hit","getHits","hit","getHits","getHits"],
        args: [[],[1],[2],[3],[4],[300],[300],[301]],
      },
    });
    t.push({
      name: "no-hits",
      category: "edge",
      input: { operations: ["HitCounter","getHits"], args: [[],[10]] },
    });
    t.push({
      name: "exact-boundary",
      category: "edge",
      input: {
        operations: ["HitCounter","hit","getHits","getHits"],
        args: [[],[1],[300],[301]],
      },
    });
    t.push({
      name: "many-at-same-second",
      category: "edge",
      input: {
        operations: ["HitCounter","hit","hit","hit","getHits"],
        args: [[],[5],[5],[5],[5]],
      },
    });
    {
      const r = rng(1030);
      const ops = ["HitCounter"]; const ar = [[]];
      let ts = 1;
      for (let i = 0; i < 10000; i++) {
        if (r() < 0.6) { ops.push("hit"); ar.push([ts]); }
        else { ops.push("getHits"); ar.push([ts]); }
        if (r() < 0.4) ts += randInt(r, 0, 5);
      }
      t.push({ name: "stress-10k", category: "stress", input: { operations: ops, args: ar } });
    }
    return t;
  },
});

add({
  id: "design-circular-queue",
  leetcode_number: 622,
  title: "Design Circular Queue",
  difficulty: "Medium",
  categories: ["Array", "Queue", "Design", "Linked List"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Implement a fixed-capacity circular queue (ring buffer) with operations: MyCircularQueue(k), enQueue(value) → bool, deQueue() → bool, Front() → int (-1 when empty), Rear() → int (-1 when empty), isEmpty() → bool, isFull() → bool. All operations should run in O(1). The runnable variant accepts (operations, args) arrays.",
  constraints: ["1 <= k <= 1000", "0 <= value <= 1000", "up to 3000 operations"],
  hints: [
    "Use a fixed-size array, a head index, and a count.",
    "enQueue writes at (head + count) % cap.",
  ],
  optimal: { time: "O(1) per op", space: "O(k)", approach: "Ring buffer indexed by head and count." },
  alternatives: [{ approach: "Doubly linked list", time: "O(1)", space: "O(k)" }],
  pitfalls: [
    "Returning a stale Front/Rear when the queue is empty.",
    "Off-by-one in isFull check (count vs cap-1).",
  ],
  followups: ["Design Circular Deque (LC 641)."],
  signature: { fn: "circularQueueOps", params: [{ name: "operations", adapt: "identity" }, { name: "args", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class MyCircularQueue {
  cap: number; buf: number[]; head = 0; count = 0;
  constructor(k: number) { this.cap = k; this.buf = new Array(k); }
  enQueue(value: number): boolean {
    if (this.count === this.cap) return false;
    this.buf[(this.head + this.count) % this.cap] = value; this.count++; return true;
  }
  deQueue(): boolean {
    if (this.count === 0) return false;
    this.head = (this.head + 1) % this.cap; this.count--; return true;
  }
  Front(): number { return this.count === 0 ? -1 : this.buf[this.head]; }
  Rear(): number { return this.count === 0 ? -1 : this.buf[(this.head + this.count - 1) % this.cap]; }
  isEmpty(): boolean { return this.count === 0; }
  isFull(): boolean { return this.count === this.cap; }
}`,
  tests: () => {
    const t = [];
    t.push({
      name: "example-1",
      category: "example",
      input: {
        operations: ["MyCircularQueue","enQueue","enQueue","enQueue","enQueue","Rear","isFull","deQueue","enQueue","Rear"],
        args: [[3],[1],[2],[3],[4],[],[],[],[4],[]],
      },
    });
    t.push({
      name: "single-capacity",
      category: "edge",
      input: {
        operations: ["MyCircularQueue","enQueue","enQueue","Front","deQueue","isEmpty"],
        args: [[1],[1],[2],[],[],[]],
      },
    });
    t.push({
      name: "deq-empty",
      category: "edge",
      input: { operations: ["MyCircularQueue","deQueue","Front","Rear","isEmpty"], args: [[3],[],[],[],[]] },
    });
    {
      const r = rng(1031);
      const ops = ["MyCircularQueue"]; const ar = [[50]];
      for (let i = 0; i < 3000; i++) {
        const op = randInt(r, 0, 5);
        if (op === 0) { ops.push("enQueue"); ar.push([randInt(r, 0, 1000)]); }
        else if (op === 1) { ops.push("deQueue"); ar.push([]); }
        else if (op === 2) { ops.push("Front"); ar.push([]); }
        else if (op === 3) { ops.push("Rear"); ar.push([]); }
        else if (op === 4) { ops.push("isEmpty"); ar.push([]); }
        else { ops.push("isFull"); ar.push([]); }
      }
      t.push({ name: "stress-3000", category: "stress", input: { operations: ops, args: ar } });
    }
    return t;
  },
});

add({
  id: "valid-sudoku",
  leetcode_number: 36,
  title: "Valid Sudoku",
  difficulty: "Medium",
  categories: ["Array", "Hash Table", "Matrix"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Determine whether a partially filled 9x9 Sudoku board is valid. Validation rules: each row contains digits 1-9 with no duplicates, each column contains digits 1-9 with no duplicates, and each of the nine 3x3 sub-boxes contains digits 1-9 with no duplicates. Empty cells are denoted '.'. You only need to validate the filled cells.",
  constraints: ["board.length == 9", "board[i].length == 9", "board[i][j] is a digit '1'-'9' or '.'"],
  hints: [
    "Use 9 row sets, 9 column sets, and 9 box sets.",
    "Box index = (row / 3) * 3 + (col / 3).",
  ],
  optimal: { time: "O(81) ≈ O(1)", space: "O(81)", approach: "Single sweep with 27 hash sets." },
  alternatives: [{ approach: "Encode (kind, value, group) tuples in one Set", time: "O(1)", space: "O(1)" }],
  pitfalls: ["Forgetting to check the box constraint — rows + columns alone aren't enough."],
  followups: ["Solve Sudoku via backtracking (LC 37)."],
  signature: { fn: "isValidSudoku", params: [{ name: "board", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isValidSudoku(board: string[][]): boolean {
  const rows = Array.from({length:9}, () => new Set<string>());
  const cols = Array.from({length:9}, () => new Set<string>());
  const boxes = Array.from({length:9}, () => new Set<string>());
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
    const v = board[i][j];
    if (v === ".") continue;
    const b = Math.floor(i/3)*3 + Math.floor(j/3);
    if (rows[i].has(v) || cols[j].has(v) || boxes[b].has(v)) return false;
    rows[i].add(v); cols[j].add(v); boxes[b].add(v);
  }
  return true;
}`,
  tests: () => {
    const t = [];
    const valid = [
      ["5","3",".",".","7",".",".",".","."],
      ["6",".",".","1","9","5",".",".","."],
      [".","9","8",".",".",".",".","6","."],
      ["8",".",".",".","6",".",".",".","3"],
      ["4",".",".","8",".","3",".",".","1"],
      ["7",".",".",".","2",".",".",".","6"],
      [".","6",".",".",".",".","2","8","."],
      [".",".",".","4","1","9",".",".","5"],
      [".",".",".",".","8",".",".","7","9"],
    ];
    t.push({ name: "example-valid", category: "example", input: { board: valid } });
    const invalid = valid.map((r) => r.slice());
    invalid[0][0] = "8"; // duplicate with row 4 col 0
    t.push({ name: "example-invalid-col", category: "example", input: { board: invalid } });
    const empty = Array.from({length:9}, () => Array(9).fill("."));
    t.push({ name: "all-empty", category: "edge", input: { board: empty } });
    const dupRow = empty.map((r) => r.slice());
    dupRow[0][0] = "5"; dupRow[0][8] = "5";
    t.push({ name: "dup-in-row", category: "edge", input: { board: dupRow } });
    const dupBox = empty.map((r) => r.slice());
    dupBox[0][0] = "5"; dupBox[2][2] = "5";
    t.push({ name: "dup-in-box", category: "edge", input: { board: dupBox } });
    return t;
  },
});

add({
  id: "spiral-matrix",
  leetcode_number: 54,
  title: "Spiral Matrix",
  difficulty: "Medium",
  categories: ["Array", "Matrix", "Simulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an m x n matrix, return all elements of the matrix in spiral order — start at the top-left, go right, then down, then left, then up, peeling off layers.",
  constraints: ["1 <= m, n <= 10", "-100 <= matrix[i][j] <= 100"],
  hints: [
    "Track four boundaries: top, bottom, left, right.",
    "After each side, shrink the corresponding boundary; stop when boundaries cross.",
  ],
  optimal: { time: "O(m·n)", space: "O(1) extra (output not counted)", approach: "Layer-by-layer with shrinking boundaries." },
  alternatives: [{ approach: "Direction array with rotation", time: "O(m·n)", space: "O(m·n)", note: "Use a visited matrix; cleaner code, more memory." }],
  pitfalls: [
    "Forgetting the t<=b / l<=r guard before the third and fourth sides — non-square matrices will repeat cells.",
  ],
  followups: ["Spiral Matrix II (fill 1..n^2 in spiral order, LC 59)."],
  signature: { fn: "spiralOrder", params: [{ name: "matrix", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function spiralOrder(matrix: number[][]): number[] {
  const out: number[] = [];
  if (!matrix.length) return out;
  let t = 0, b = matrix.length - 1, l = 0, r = matrix[0].length - 1;
  while (t <= b && l <= r) {
    for (let j = l; j <= r; j++) out.push(matrix[t][j]); t++;
    for (let i = t; i <= b; i++) out.push(matrix[i][r]); r--;
    if (t <= b) { for (let j = r; j >= l; j--) out.push(matrix[b][j]); b--; }
    if (l <= r) { for (let i = b; i >= t; i--) out.push(matrix[i][l]); l++; }
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-3x3", category: "example", input: { matrix: [[1,2,3],[4,5,6],[7,8,9]] } });
    t.push({ name: "example-3x4", category: "example", input: { matrix: [[1,2,3,4],[5,6,7,8],[9,10,11,12]] } });
    t.push({ name: "single-row", category: "edge", input: { matrix: [[1,2,3,4,5]] } });
    t.push({ name: "single-col", category: "edge", input: { matrix: [[1],[2],[3],[4]] } });
    t.push({ name: "single-cell", category: "edge", input: { matrix: [[42]] } });
    t.push({ name: "tall-2col", category: "edge", input: { matrix: [[1,2],[3,4],[5,6],[7,8]] } });
    t.push({ name: "wide-2row", category: "edge", input: { matrix: [[1,2,3,4,5],[6,7,8,9,10]] } });
    return t;
  },
});

add({
  id: "rotate-image",
  leetcode_number: 48,
  title: "Rotate Image",
  difficulty: "Medium",
  categories: ["Array", "Matrix", "Math"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Rotate an n x n 2D matrix representing an image 90 degrees clockwise in place. Do not allocate a second matrix.",
  constraints: ["n == matrix.length == matrix[i].length", "1 <= n <= 20"],
  hints: [
    "Transpose the matrix, then reverse each row.",
    "Equivalent: rotate four cells of each layer at once.",
  ],
  optimal: { time: "O(n²)", space: "O(1)", approach: "Transpose then reverse each row, in place." },
  alternatives: [{ approach: "4-way layer swap", time: "O(n²)", space: "O(1)", note: "Slightly faster constants but trickier indices." }],
  pitfalls: ["Transposing the whole matrix without restricting j > i swaps each pair twice and undoes the work."],
  followups: ["Rotate by 180 / 270 degrees.", "Rotate a non-square matrix (must allocate)."],
  signature: { fn: "rotateImage", params: [{ name: "matrix", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function rotate(matrix: number[][]): void {
  const n = matrix.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
  for (const row of matrix) row.reverse();
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-3x3", category: "example", input: { matrix: [[1,2,3],[4,5,6],[7,8,9]] } });
    t.push({ name: "example-4x4", category: "example", input: { matrix: [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]] } });
    t.push({ name: "1x1", category: "edge", input: { matrix: [[1]] } });
    t.push({ name: "2x2", category: "edge", input: { matrix: [[1,2],[3,4]] } });
    {
      const r = rng(1034);
      const n = 20;
      const m = Array.from({ length: n }, () => Array.from({ length: n }, () => randInt(r, -100, 100)));
      t.push({ name: "stress-20x20", category: "stress", input: { matrix: m } });
    }
    return t;
  },
});

add({
  id: "game-of-life",
  leetcode_number: 289,
  title: "Game of Life",
  difficulty: "Medium",
  categories: ["Array", "Matrix", "Simulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Conway's Game of Life: each cell is live (1) or dead (0). The next state of every cell is computed simultaneously from its 8 neighbors using these rules — live with <2 live neighbors dies, live with 2 or 3 stays alive, live with >3 dies, dead with exactly 3 becomes alive. Update the board in place to reflect the next state.",
  constraints: ["m == board.length", "n == board[i].length", "1 <= m, n <= 25", "board[i][j] is 0 or 1"],
  hints: [
    "Computing the next state in place trips you up because mutations affect neighbor counts.",
    "Encode old and new states in two bits: bit 0 is current, bit 1 is next.",
  ],
  optimal: { time: "O(m·n)", space: "O(1) extra", approach: "Bit-pack old/new state into the same cell, then shift right." },
  alternatives: [{ approach: "Copy of the board", time: "O(m·n)", space: "O(m·n)", note: "Cleaner code, more memory." }],
  pitfalls: ["Reading neighbors after they've been overwritten in the naive in-place attempt."],
  followups: ["Infinite-board variant.", "Toroidal (wrap-around) neighbors."],
  signature: { fn: "gameOfLife", params: [{ name: "board", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function gameOfLife(board: number[][]): void {
  const m = board.length, n = board[0].length;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let live = 0;
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
        if (di === 0 && dj === 0) continue;
        const ni = i+di, nj = j+dj;
        if (ni >= 0 && ni < m && nj >= 0 && nj < n && (board[ni][nj] & 1)) live++;
      }
      if ((board[i][j] & 1) && (live === 2 || live === 3)) board[i][j] |= 2;
      if (!(board[i][j] & 1) && live === 3) board[i][j] |= 2;
    }
  }
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) board[i][j] >>= 1;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { board: [[0,1,0],[0,0,1],[1,1,1],[0,0,0]] } });
    t.push({ name: "example-2", category: "example", input: { board: [[1,1],[1,0]] } });
    t.push({ name: "all-dead", category: "edge", input: { board: [[0,0],[0,0]] } });
    t.push({ name: "block-still-life", category: "edge", input: { board: [[1,1],[1,1]] } });
    t.push({ name: "blinker", category: "edge", input: { board: [[0,0,0],[1,1,1],[0,0,0]] } });
    {
      const r = rng(1035);
      const m = Array.from({ length: 25 }, () => Array.from({ length: 25 }, () => randInt(r, 0, 1)));
      t.push({ name: "stress-25x25", category: "stress", input: { board: m } });
    }
    return t;
  },
});

add({
  id: "first-missing-positive",
  leetcode_number: 41,
  title: "First Missing Positive",
  difficulty: "Hard",
  categories: ["Array", "Hash Table"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an unsorted integer array nums, return the smallest positive integer that does not appear in nums. Your algorithm must run in O(n) time and use O(1) auxiliary space.",
  constraints: ["1 <= nums.length <= 1e5", "-2^31 <= nums[i] <= 2^31 - 1"],
  hints: [
    "The answer must lie in [1, n+1].",
    "Use the array itself as a hash: place value v at index v-1 if 1 <= v <= n.",
    "Then scan once for the first index where nums[i] != i+1.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Cyclic in-place placement, then linear scan." },
  alternatives: [{ approach: "Hash set", time: "O(n)", space: "O(n)" }],
  pitfalls: [
    "Infinite loops when swapping equal values — guard with nums[nums[i]-1] !== nums[i].",
    "Negative or zero values must be ignored, not stored.",
  ],
  followups: ["First k missing positives."],
  signature: { fn: "firstMissingPositive", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function firstMissingPositive(nums: number[]): number {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const j = nums[i] - 1;
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
  }
  for (let i = 0; i < n; i++) if (nums[i] !== i + 1) return i + 1;
  return n + 1;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,2,0] } });
    t.push({ name: "example-2", category: "example", input: { nums: [3,4,-1,1] } });
    t.push({ name: "example-3", category: "example", input: { nums: [7,8,9,11,12] } });
    t.push({ name: "single-1", category: "edge", input: { nums: [1] } });
    t.push({ name: "single-2", category: "edge", input: { nums: [2] } });
    t.push({ name: "all-negative", category: "edge", input: { nums: [-1,-2,-3] } });
    t.push({ name: "duplicates", category: "edge", input: { nums: [1,1,1,1] } });
    {
      const r = rng(1036);
      const n = 5000;
      const arr = Array.from({ length: n }, () => randInt(r, -1000, 6000));
      t.push({ name: "stress-5000", category: "stress", input: { nums: arr } });
    }
    return t;
  },
});

add({
  id: "find-the-duplicate-number",
  leetcode_number: 287,
  title: "Find the Duplicate Number",
  difficulty: "Medium",
  categories: ["Array", "Two Pointers", "Binary Search", "Bit Manipulation"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an array nums of n + 1 integers where each integer is in the range [1, n] inclusive, exactly one number appears more than once. Find that duplicate without modifying the array and using O(1) extra space.",
  constraints: ["1 <= n <= 1e5", "nums.length == n + 1", "1 <= nums[i] <= n", "exactly one number is duplicated (it can appear more than twice)"],
  hints: [
    "Treat the array as a function i → nums[i] — a cycle must exist because there's a duplicate.",
    "Use Floyd's tortoise-and-hare to find the cycle entry.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Floyd cycle detection on the index→value graph." },
  alternatives: [
    { approach: "Sort then scan", time: "O(n log n)", space: "O(1)", note: "Mutates input." },
    { approach: "Hash set", time: "O(n)", space: "O(n)" },
    { approach: "Binary search on answer (count <= mid)", time: "O(n log n)", space: "O(1)" },
  ],
  pitfalls: ["Modifying nums (e.g., negating visited indices) is disallowed by the constraint."],
  followups: ["What if duplicates can be more than one element?"],
  signature: { fn: "findDuplicate", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function findDuplicate(nums: number[]): number {
  let slow = nums[0], fast = nums[0];
  do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow !== fast);
  slow = nums[0];
  while (slow !== fast) { slow = nums[slow]; fast = nums[fast]; }
  return slow;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,3,4,2,2] } });
    t.push({ name: "example-2", category: "example", input: { nums: [3,1,3,4,2] } });
    t.push({ name: "example-3", category: "example", input: { nums: [1,1] } });
    t.push({ name: "example-4-many-dups", category: "example", input: { nums: [2,2,2,2,2] } });
    t.push({ name: "dup-at-end", category: "edge", input: { nums: [1,2,3,4,5,6,7,8,9,9] } });
    {
      const r = rng(1037);
      const n = 10000;
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const dup = randInt(r, 1, n);
      arr.push(dup);
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      t.push({ name: "stress-10001", category: "stress", input: { nums: arr } });
    }
    return t;
  },
});

add({
  id: "majority-element",
  leetcode_number: 169,
  title: "Majority Element",
  difficulty: "Easy",
  categories: ["Array", "Hash Table", "Divide & Conquer", "Sorting"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an array nums of size n, return the majority element — the one that appears more than ⌊n / 2⌋ times. You may assume that a majority element always exists.",
  constraints: ["1 <= n <= 5 * 1e4", "-2^31 <= nums[i] <= 2^31 - 1"],
  hints: [
    "Boyer-Moore: pair off different elements; the majority will survive.",
    "Track a candidate and a count; whenever count hits 0, replace the candidate.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Boyer-Moore voting." },
  alternatives: [
    { approach: "Hash count", time: "O(n)", space: "O(n)" },
    { approach: "Sort and pick the middle", time: "O(n log n)", space: "O(1)" },
  ],
  pitfalls: ["The voting algorithm only works because a strict majority is guaranteed; without it you must verify."],
  followups: ["Majority Element II (LC 229) — appears more than n/3 times."],
  signature: { fn: "majorityElement", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function majorityElement(nums: number[]): number {
  let cand = 0, cnt = 0;
  for (const n of nums) {
    if (cnt === 0) cand = n;
    cnt += (n === cand) ? 1 : -1;
  }
  return cand;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [3,2,3] } });
    t.push({ name: "example-2", category: "example", input: { nums: [2,2,1,1,1,2,2] } });
    t.push({ name: "single", category: "edge", input: { nums: [7] } });
    t.push({ name: "all-same", category: "edge", input: { nums: [9,9,9,9] } });
    t.push({ name: "majority-at-end", category: "edge", input: { nums: [1,2,3,4,5,5,5,5,5] } });
    {
      const r = rng(1038);
      const n = 50000;
      const arr = [];
      for (let i = 0; i < Math.floor(n / 2) - 5; i++) arr.push(randInt(r, -1000, 1000));
      while (arr.length < n) arr.push(42);
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      t.push({ name: "stress-50k", category: "stress", input: { nums: arr } });
    }
    return t;
  },
});

add({
  id: "rotate-array",
  leetcode_number: 189,
  title: "Rotate Array",
  difficulty: "Medium",
  categories: ["Array", "Math", "Two Pointers"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an integer array nums and a non-negative integer k, rotate the array to the right by k steps in place. The function must mutate the input and return the same reference.",
  constraints: ["1 <= nums.length <= 1e5", "-2^31 <= nums[i] <= 2^31 - 1", "0 <= k <= 1e5"],
  hints: [
    "k can exceed the length — reduce k mod n.",
    "Reversing three sub-ranges achieves the rotation in place.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Reverse [0..n-1], reverse [0..k-1], reverse [k..n-1]." },
  alternatives: [
    { approach: "Cyclic replacements", time: "O(n)", space: "O(1)" },
    { approach: "Allocate a new array", time: "O(n)", space: "O(n)" },
  ],
  pitfalls: ["Forgetting to mod k by n — when k > n the naive triple reverse picks the wrong split point."],
  followups: ["Rotate to the left by k.", "Rotate a doubly linked list."],
  signature: { fn: "rotateArrayK", params: [{ name: "nums", adapt: "identity" }, { name: "k", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function rotate(nums: number[], k: number): void {
  const n = nums.length;
  k = ((k % n) + n) % n;
  const rev = (i: number, j: number) => { while (i < j) { [nums[i], nums[j]] = [nums[j], nums[i]]; i++; j--; } };
  rev(0, n - 1); rev(0, k - 1); rev(k, n - 1);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,2,3,4,5,6,7], k: 3 } });
    t.push({ name: "example-2", category: "example", input: { nums: [-1,-100,3,99], k: 2 } });
    t.push({ name: "k-zero", category: "edge", input: { nums: [1,2,3], k: 0 } });
    t.push({ name: "k-equals-n", category: "edge", input: { nums: [1,2,3,4], k: 4 } });
    t.push({ name: "k-larger-than-n", category: "edge", input: { nums: [1,2,3,4], k: 11 } });
    t.push({ name: "single", category: "edge", input: { nums: [42], k: 5 } });
    {
      const r = rng(1039);
      const arr = Array.from({ length: 10000 }, () => randInt(r, -1000, 1000));
      t.push({ name: "stress-10k", category: "stress", input: { nums: arr, k: 3333 } });
    }
    return t;
  },
});

add({
  id: "contains-duplicate-ii",
  leetcode_number: 219,
  title: "Contains Duplicate II",
  difficulty: "Easy",
  categories: ["Array", "Hash Table", "Sliding Window"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given an integer array nums and an integer k, return true if there are two distinct indices i and j with nums[i] == nums[j] and |i - j| <= k.",
  constraints: ["1 <= nums.length <= 1e5", "-1e9 <= nums[i] <= 1e9", "0 <= k <= 1e5"],
  hints: [
    "Slide a window of size k+1 with a hash set.",
    "Or store the most recent index of every value and check the gap when you see a repeat.",
  ],
  optimal: { time: "O(n)", space: "O(min(n, k))", approach: "Hash map of value → most recent index, gap check on each occurrence." },
  alternatives: [{ approach: "Sliding window set", time: "O(n)", space: "O(k)" }],
  pitfalls: ["k = 0 means duplicates at the same index — impossible — return false unless it's a misinterpretation."],
  followups: ["Contains Duplicate III (LC 220) — value distance ≤ t."],
  signature: { fn: "containsNearbyDuplicate", params: [{ name: "nums", adapt: "identity" }, { name: "k", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function containsNearbyDuplicate(nums: number[], k: number): boolean {
  const m = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    if (m.has(nums[i]) && i - m.get(nums[i])! <= k) return true;
    m.set(nums[i], i);
  }
  return false;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,2,3,1], k: 3 } });
    t.push({ name: "example-2", category: "example", input: { nums: [1,0,1,1], k: 1 } });
    t.push({ name: "example-3", category: "example", input: { nums: [1,2,3,1,2,3], k: 2 } });
    t.push({ name: "k-zero", category: "edge", input: { nums: [1,2,3], k: 0 } });
    t.push({ name: "no-dups", category: "edge", input: { nums: [5,6,7,8,9], k: 4 } });
    t.push({ name: "dup-far-apart", category: "edge", input: { nums: [1,2,3,4,5,6,1], k: 3 } });
    {
      const r = rng(1040);
      const arr = Array.from({ length: 10000 }, () => randInt(r, 0, 10000));
      t.push({ name: "stress-10k", category: "stress", input: { nums: arr, k: 50 } });
    }
    return t;
  },
});

add({
  id: "find-all-anagrams-in-a-string",
  leetcode_number: 438,
  title: "Find All Anagrams in a String",
  difficulty: "Medium",
  categories: ["String", "Hash Table", "Sliding Window"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given two strings s and p, return an array of every starting index in s where a substring of length p.length is an anagram of p. Indices may be returned in any order, but this dataset expects them in increasing order (the natural left-to-right scan).",
  constraints: ["1 <= s.length, p.length <= 3 * 1e4", "lowercase English letters"],
  hints: [
    "Slide a window of length p.length across s, maintaining a 26-letter count.",
    "When the count matches p's count, record the starting index.",
  ],
  optimal: { time: "O(n)", space: "O(1) (26-array)", approach: "Sliding window with character-count comparison." },
  alternatives: [{ approach: "Sort each window", time: "O(n m log m)", space: "O(m)", note: "TLE on long strings." }],
  pitfalls: ["Forgetting to decrement the outgoing character when sliding shifts off the left edge."],
  followups: ["Find all permutations / Permutation in String (LC 567)."],
  signature: { fn: "findAnagrams", params: [{ name: "s", adapt: "identity" }, { name: "p", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function findAnagrams(s: string, p: string): number[] {
  const out: number[] = [];
  if (s.length < p.length) return out;
  const need = new Array(26).fill(0);
  const have = new Array(26).fill(0);
  for (let i = 0; i < p.length; i++) {
    need[p.charCodeAt(i) - 97]++;
    have[s.charCodeAt(i) - 97]++;
  }
  const eq = () => { for (let i = 0; i < 26; i++) if (need[i] !== have[i]) return false; return true; };
  if (eq()) out.push(0);
  for (let i = p.length; i < s.length; i++) {
    have[s.charCodeAt(i) - 97]++;
    have[s.charCodeAt(i - p.length) - 97]--;
    if (eq()) out.push(i - p.length + 1);
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "cbaebabacd", p: "abc" } });
    t.push({ name: "example-2", category: "example", input: { s: "abab", p: "ab" } });
    t.push({ name: "p-longer", category: "edge", input: { s: "aa", p: "bbb" } });
    t.push({ name: "no-anagrams", category: "edge", input: { s: "abcdef", p: "gh" } });
    t.push({ name: "all-same-letter", category: "edge", input: { s: "aaaaa", p: "aa" } });
    {
      const r = rng(1041);
      const s = randStr(r, 20000);
      const p = randStr(r, 8);
      t.push({ name: "stress-20k", category: "stress", input: { s, p } });
    }
    return t;
  },
});

add({
  id: "string-to-integer-atoi",
  leetcode_number: 8,
  title: "String to Integer (atoi)",
  difficulty: "Medium",
  categories: ["String", "Math"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Implement myAtoi(s) which converts a string to a 32-bit signed integer. Steps: skip leading whitespace; read an optional '+' or '-' sign; read as many decimal digits as possible (the rest is ignored); convert to integer; clamp to the 32-bit signed range; if no digits were read, return 0.",
  constraints: ["0 <= s.length <= 200", "s is printable ASCII"],
  hints: [
    "State machine: whitespace → sign → digits → done.",
    "Detect overflow before it happens: if the partial result exceeds INT_MAX/10 (or equals it with a digit > 7), clamp.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Single pass with overflow guard against INT_MAX/INT_MIN." },
  alternatives: [{ approach: "Regex parse + clamp", time: "O(n)", space: "O(n)" }],
  pitfalls: [
    "Allowing whitespace between sign and digits — that's invalid per the spec.",
    "Treating '+-1' as -1 — the second sign breaks the parse.",
    "Forgetting the clamp on the negative side (INT_MIN).",
  ],
  followups: ["Localized number parsing (commas, locales)."],
  signature: { fn: "myAtoi", params: [{ name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function myAtoi(s: string): number {
  const INT_MAX = 2147483647, INT_MIN = -2147483648;
  let i = 0;
  while (i < s.length && s[i] === ' ') i++;
  let sign = 1;
  if (i < s.length && (s[i] === '+' || s[i] === '-')) { if (s[i] === '-') sign = -1; i++; }
  let r = 0;
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    r = r * 10 + (s.charCodeAt(i) - 48);
    if (r * sign >= INT_MAX) return INT_MAX;
    if (r * sign <= INT_MIN) return INT_MIN;
    i++;
  }
  return r * sign;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "42" } });
    t.push({ name: "example-2", category: "example", input: { s: "   -042" } });
    t.push({ name: "example-3", category: "example", input: { s: "1337c0d3" } });
    t.push({ name: "example-4-noise-prefix", category: "example", input: { s: "words and 987" } });
    t.push({ name: "empty", category: "edge", input: { s: "" } });
    t.push({ name: "only-sign", category: "edge", input: { s: "+" } });
    t.push({ name: "double-sign", category: "edge", input: { s: "+-12" } });
    t.push({ name: "overflow-pos", category: "edge", input: { s: "91283472332" } });
    t.push({ name: "overflow-neg", category: "edge", input: { s: "-91283472332" } });
    t.push({ name: "leading-zero", category: "edge", input: { s: "0000123" } });
    return t;
  },
});

add({
  id: "isomorphic-strings",
  leetcode_number: 205,
  title: "Isomorphic Strings",
  difficulty: "Easy",
  categories: ["String", "Hash Table"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Two strings s and t are isomorphic if there is a one-to-one mapping between every character of s and every character of t such that replacing all occurrences of each s-character with its mapped t-character produces t. No two distinct s-characters may map to the same t-character.",
  constraints: ["1 <= s.length == t.length <= 5 * 1e4", "s, t consist of any printable ASCII"],
  hints: [
    "Maintain two maps: s→t and t→s.",
    "On every position, both maps must be consistent.",
  ],
  optimal: { time: "O(n)", space: "O(σ)", approach: "Two hash maps with consistency checks." },
  alternatives: [{ approach: "Two index arrays sized 256", time: "O(n)", space: "O(1)" }],
  pitfalls: ["Using only one direction lets distinct s-chars map to the same t-char — both directions must be enforced."],
  followups: ["Word Pattern (LC 290) — the same idea on tokens."],
  signature: { fn: "isIsomorphic", params: [{ name: "s", adapt: "identity" }, { name: "t", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isIsomorphic(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const ms = new Map<string, string>(), mt = new Map<string, string>();
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = t[i];
    if (ms.has(a) && ms.get(a) !== b) return false;
    if (mt.has(b) && mt.get(b) !== a) return false;
    ms.set(a, b); mt.set(b, a);
  }
  return true;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-egg-add", category: "example", input: { s: "egg", t: "add" } });
    t.push({ name: "example-foo-bar", category: "example", input: { s: "foo", t: "bar" } });
    t.push({ name: "example-paper-title", category: "example", input: { s: "paper", t: "title" } });
    t.push({ name: "single-char", category: "edge", input: { s: "a", t: "z" } });
    t.push({ name: "same-string", category: "edge", input: { s: "abcabc", t: "abcabc" } });
    t.push({ name: "all-same-fails", category: "edge", input: { s: "ab", t: "aa" } });
    return t;
  },
});

add({
  id: "ransom-note",
  leetcode_number: 383,
  title: "Ransom Note",
  difficulty: "Easy",
  categories: ["String", "Hash Table", "Counting"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given two strings ransomNote and magazine, return true if ransomNote can be constructed by using only letters from magazine; each letter in magazine can be used at most once.",
  constraints: ["1 <= ransomNote.length, magazine.length <= 1e5", "lowercase English letters"],
  hints: ["Count letters in magazine, then decrement as you scan ransomNote."],
  optimal: { time: "O(n + m)", space: "O(1)", approach: "26-letter count array." },
  alternatives: [],
  pitfalls: ["Forgetting that each magazine letter can only be used once — a presence-only set is wrong."],
  followups: ["Generalize to Unicode (use a Map)."],
  signature: { fn: "canConstruct", params: [{ name: "ransom", adapt: "identity" }, { name: "magazine", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function canConstruct(ransomNote: string, magazine: string): boolean {
  const c = new Array(26).fill(0);
  for (let i = 0; i < magazine.length; i++) c[magazine.charCodeAt(i) - 97]++;
  for (let i = 0; i < ransomNote.length; i++) {
    const k = ransomNote.charCodeAt(i) - 97;
    if (c[k] === 0) return false;
    c[k]--;
  }
  return true;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-false", category: "example", input: { ransom: "a", magazine: "b" } });
    t.push({ name: "example-false-2", category: "example", input: { ransom: "aa", magazine: "ab" } });
    t.push({ name: "example-true", category: "example", input: { ransom: "aa", magazine: "aab" } });
    t.push({ name: "exact-match", category: "edge", input: { ransom: "abc", magazine: "abc" } });
    t.push({ name: "magazine-has-extras", category: "edge", input: { ransom: "ab", magazine: "zzab" } });
    {
      const r = rng(1044);
      const m = randStr(r, 50000);
      const note = randStr(r, 100);
      t.push({ name: "stress-50k", category: "stress", input: { ransom: note, magazine: m } });
    }
    return t;
  },
});

add({
  id: "length-of-last-word",
  leetcode_number: 58,
  title: "Length of Last Word",
  difficulty: "Easy",
  categories: ["String"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given a string s consisting of words separated by single or multiple spaces (with possible leading or trailing spaces), return the length of the last word.",
  constraints: ["1 <= s.length <= 1e4", "s consists of English letters and spaces", "There is at least one word in s."],
  hints: ["Walk from the right, skip trailing spaces, then count the next run of non-space characters."],
  optimal: { time: "O(n)", space: "O(1)", approach: "Right-to-left two-state scan: skip spaces, then count word." },
  alternatives: [{ approach: "Split + filter empty", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Trailing spaces — must skip them before measuring."],
  followups: ["Length of all words / longest word."],
  signature: { fn: "lengthOfLastWord", params: [{ name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function lengthOfLastWord(s: string): number {
  let i = s.length - 1;
  while (i >= 0 && s[i] === ' ') i--;
  let len = 0;
  while (i >= 0 && s[i] !== ' ') { len++; i--; }
  return len;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "Hello World" } });
    t.push({ name: "example-2", category: "example", input: { s: "   fly me   to   the moon  " } });
    t.push({ name: "example-3", category: "example", input: { s: "luffy is still joyboy" } });
    t.push({ name: "single-word", category: "edge", input: { s: "abc" } });
    t.push({ name: "trailing-spaces", category: "edge", input: { s: "abc   " } });
    t.push({ name: "single-letter", category: "edge", input: { s: "x" } });
    return t;
  },
});

add({
  id: "longest-common-prefix",
  leetcode_number: 14,
  title: "Longest Common Prefix",
  difficulty: "Easy",
  categories: ["String", "Trie"],
  sources: ["LeetCode Top Interview 150", "Grind 75"],
  prompt: "Write a function that finds the longest common prefix string among an array of strings. Return '' if no common prefix exists.",
  constraints: ["0 <= strs.length <= 200", "0 <= strs[i].length <= 200", "strs[i] consists of lowercase English letters"],
  hints: [
    "Compare characters column by column.",
    "Or repeatedly trim the candidate prefix until every string starts with it.",
  ],
  optimal: { time: "O(S)", space: "O(1)", approach: "Vertical scan: at each column, all strings must agree." },
  alternatives: [
    { approach: "Sort, compare first and last", time: "O(n log n · k)", space: "O(1)" },
    { approach: "Trie", time: "O(S)", space: "O(S)" },
  ],
  pitfalls: ["Empty array or empty string in the array — must return ''."],
  followups: ["Longest common suffix / LCP of pairs."],
  signature: { fn: "longestCommonPrefix", params: [{ name: "strs", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) return "";
  let p = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(p)) {
      p = p.slice(0, -1);
      if (p === "") return "";
    }
  }
  return p;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { strs: ["flower","flow","flight"] } });
    t.push({ name: "example-2-no-prefix", category: "example", input: { strs: ["dog","racecar","car"] } });
    t.push({ name: "single", category: "edge", input: { strs: ["abc"] } });
    t.push({ name: "empty-string-in-list", category: "edge", input: { strs: ["", "abc"] } });
    t.push({ name: "all-same", category: "edge", input: { strs: ["abc","abc","abc"] } });
    t.push({ name: "one-is-prefix", category: "edge", input: { strs: ["ab","abc","abcd"] } });
    return t;
  },
});

add({
  id: "zigzag-conversion",
  leetcode_number: 6,
  title: "Zigzag Conversion",
  difficulty: "Medium",
  categories: ["String"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Write the string s in a zigzag pattern on numRows rows (going down and then diagonally up), then read it row by row to produce a new string. For numRows = 1 or numRows >= s.length, return s unchanged.",
  constraints: ["1 <= s.length <= 1000", "1 <= numRows <= 1000", "s consists of letters, ',' and '.'"],
  hints: [
    "Walk across s, appending each character to the row indicated by a bouncing pointer.",
    "Reverse direction at the top and bottom rows.",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Bucket characters into rows, join rows in order." },
  alternatives: [{ approach: "Direct index calculation per cell", time: "O(n)", space: "O(1) extra" }],
  pitfalls: ["Treating numRows = 1 the same way as multi-row leads to division by zero or all-in-row-0."],
  followups: ["Direct k-th character without building the rows."],
  signature: { fn: "zigzagConvert", params: [{ name: "s", adapt: "identity" }, { name: "numRows", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function convert(s: string, numRows: number): string {
  if (numRows === 1 || numRows >= s.length) return s;
  const rows: string[] = Array.from({ length: numRows }, () => "");
  let cur = 0, dir = -1;
  for (const c of s) {
    rows[cur] += c;
    if (cur === 0 || cur === numRows - 1) dir = -dir;
    cur += dir;
  }
  return rows.join("");
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "PAYPALISHIRING", numRows: 3 } });
    t.push({ name: "example-2", category: "example", input: { s: "PAYPALISHIRING", numRows: 4 } });
    t.push({ name: "single-row", category: "edge", input: { s: "ABCDEF", numRows: 1 } });
    t.push({ name: "rows-greater-than-length", category: "edge", input: { s: "AB", numRows: 5 } });
    t.push({ name: "two-rows", category: "edge", input: { s: "ABCDE", numRows: 2 } });
    return t;
  },
});

add({
  id: "find-the-index-of-the-first-occurrence-in-a-string",
  leetcode_number: 28,
  title: "Find the Index of the First Occurrence in a String",
  difficulty: "Easy",
  categories: ["String", "Two Pointers"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given strings haystack and needle, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack. If needle is empty, return 0.",
  constraints: ["1 <= haystack.length, needle.length <= 1e4", "haystack and needle consist of only lowercase English characters"],
  hints: [
    "Naive double loop is O(nm); usually fine for the given limits.",
    "For optimal worst case, KMP gives O(n + m).",
  ],
  optimal: { time: "O(n + m)", space: "O(m)", approach: "KMP failure function for linear-time search." },
  alternatives: [{ approach: "Sliding compare", time: "O(n m)", space: "O(1)" }],
  pitfalls: ["Forgetting the empty-needle case (return 0)."],
  followups: ["Return all occurrences.", "Case-insensitive variants."],
  signature: { fn: "strStr", params: [{ name: "haystack", adapt: "identity" }, { name: "needle", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function strStr(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  // KMP
  const lps = new Array(needle.length).fill(0);
  for (let i = 1, k = 0; i < needle.length;) {
    if (needle[i] === needle[k]) { lps[i++] = ++k; }
    else if (k > 0) k = lps[k - 1];
    else { lps[i++] = 0; }
  }
  let i = 0, j = 0;
  while (i < haystack.length) {
    if (haystack[i] === needle[j]) { i++; j++; if (j === needle.length) return i - j; }
    else if (j > 0) j = lps[j - 1];
    else i++;
  }
  return -1;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { haystack: "sadbutsad", needle: "sad" } });
    t.push({ name: "example-2", category: "example", input: { haystack: "leetcode", needle: "leeto" } });
    t.push({ name: "needle-empty-not-allowed", category: "edge", input: { haystack: "abc", needle: "a" } });
    t.push({ name: "needle-equals-haystack", category: "edge", input: { haystack: "abc", needle: "abc" } });
    t.push({ name: "needle-longer", category: "edge", input: { haystack: "ab", needle: "abc" } });
    t.push({ name: "tricky-overlap", category: "edge", input: { haystack: "mississippi", needle: "issip" } });
    {
      const r = rng(1048);
      const h = "a".repeat(10000) + "b" + "a".repeat(100);
      t.push({ name: "stress-rare-match", category: "stress", input: { haystack: h, needle: "ab" } });
      t.push({ name: "stress-no-match", category: "stress", input: { haystack: randStr(r, 5000), needle: "zzzzzz" } });
    }
    return t;
  },
});

add({
  id: "word-pattern",
  leetcode_number: 290,
  title: "Word Pattern",
  difficulty: "Easy",
  categories: ["String", "Hash Table"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given a pattern and a string s, return true if s follows the same pattern. Each character in pattern maps to exactly one whitespace-separated word in s, and each word maps to exactly one character (a bijection).",
  constraints: ["1 <= pattern.length <= 300", "pattern is lowercase English letters", "1 <= s.length <= 3000", "s is single-space-separated lowercase words"],
  hints: ["This is Isomorphic Strings (LC 205) but with words instead of characters."],
  optimal: { time: "O(n + m)", space: "O(σ)", approach: "Two hash maps to enforce the bijection." },
  alternatives: [],
  pitfalls: ["Length mismatch between pattern and tokens."],
  followups: ["Multi-character patterns / pattern-DP."],
  signature: { fn: "wordPattern", params: [{ name: "pattern", adapt: "identity" }, { name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function wordPattern(pattern: string, s: string): boolean {
  const words = s.split(' ');
  if (words.length !== pattern.length) return false;
  const p2w = new Map<string, string>(), w2p = new Map<string, string>();
  for (let i = 0; i < pattern.length; i++) {
    const p = pattern[i], w = words[i];
    if (p2w.has(p) && p2w.get(p) !== w) return false;
    if (w2p.has(w) && w2p.get(w) !== p) return false;
    p2w.set(p, w); w2p.set(w, p);
  }
  return true;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1-true", category: "example", input: { pattern: "abba", s: "dog cat cat dog" } });
    t.push({ name: "example-2-false", category: "example", input: { pattern: "abba", s: "dog cat cat fish" } });
    t.push({ name: "example-3-false-len", category: "example", input: { pattern: "aaaa", s: "dog cat cat dog" } });
    t.push({ name: "single-pair", category: "edge", input: { pattern: "a", s: "hi" } });
    t.push({ name: "two-words-same", category: "edge", input: { pattern: "ab", s: "dog dog" } });
    t.push({ name: "length-mismatch", category: "edge", input: { pattern: "abc", s: "dog cat" } });
    return t;
  },
});

add({
  id: "rotate-string",
  leetcode_number: 796,
  title: "Rotate String",
  difficulty: "Easy",
  categories: ["String", "String Matching"],
  sources: ["LeetCode Top Interview 150"],
  prompt: "Given two strings s and goal, return true if and only if s can become goal after some number of left shifts. A left shift moves the first character to the end.",
  constraints: ["1 <= s.length, goal.length <= 100", "s and goal consist of lowercase English letters"],
  hints: [
    "Every rotation of s is a substring of s + s.",
    "First check the lengths match.",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Length match + (s + s).includes(goal)." },
  alternatives: [{ approach: "Try all n rotations", time: "O(n²)", space: "O(n)" }],
  pitfalls: ["Forgetting the length check — '' .includes('') is true but lengths still matter."],
  followups: ["Use KMP to do the substring check in O(n) without building s+s."],
  signature: { fn: "rotateString", params: [{ name: "s", adapt: "identity" }, { name: "goal", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function rotateString(s: string, goal: string): boolean {
  return s.length === goal.length && (s + s).includes(goal);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1-true", category: "example", input: { s: "abcde", goal: "cdeab" } });
    t.push({ name: "example-2-false", category: "example", input: { s: "abcde", goal: "abced" } });
    t.push({ name: "identical", category: "edge", input: { s: "a", goal: "a" } });
    t.push({ name: "length-mismatch", category: "edge", input: { s: "abc", goal: "ab" } });
    t.push({ name: "empty-pair", category: "edge", input: { s: "abcd", goal: "dabc" } });
    t.push({ name: "all-same-letter", category: "edge", input: { s: "aaaa", goal: "aaaa" } });
    return t;
  },
});
