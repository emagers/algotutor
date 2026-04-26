// Phase 2 question definitions (25 questions). Imported by build-dataset.mjs.
// Each entry mirrors the Phase 1 inline shape: id, number, title,
// difficulty, categories, sources, prompt, constraints, hints, optimal,
// alternatives, pitfalls, followups, signature, comparison, solutionTs, tests().

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const randInt = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

export const phase2Questions = [];
function add(q) { phase2Questions.push(q); }

// 1. Valid Palindrome
add({
  id: "valid-palindrome",
  number: 189,
  title: "Valid Palindrome",
  difficulty: "Easy",
  categories: ["Two Pointers", "String"],
  prompt:
    "Given a string `s`, return true if it is a palindrome after converting all uppercase letters to lowercase and removing all non-alphanumeric characters.",
  constraints: ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
  hints: [
    "Skip non-alphanumeric characters from both ends.",
    "Compare characters case-insensitively as you converge two pointers.",
    "You can do it in O(1) extra space without building a cleaned copy.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Two pointers, skipping non-alphanumeric characters." },
  alternatives: [
    { approach: "Filter then compare to reverse", time: "O(n)", space: "O(n)", note: "Simpler but allocates." },
  ],
  pitfalls: [
    "Forgetting digits are alphanumeric.",
    "Comparing without lowercasing.",
    "Infinite loop when both pointers stop on non-alphanumeric chars — advance them inside the inner loop.",
  ],
  followups: ["Allow at most one character deletion (Valid Palindrome II)."],
  signature: { fn: "isPalindromeAlnum", params: [{ name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isPalindromeAlnum(s: string): boolean {
  const isAlnum = (c: string) =>
    (c >= "0" && c <= "9") || (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
  let i = 0, j = s.length - 1;
  while (i < j) {
    while (i < j && !isAlnum(s[i])) i++;
    while (i < j && !isAlnum(s[j])) j--;
    if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;
    i++; j--;
  }
  return true;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "A man, a plan, a canal: Panama" } });
    t.push({ name: "example-2", category: "example", input: { s: "race a car" } });
    t.push({ name: "example-3-empty-after-clean", category: "example", input: { s: " " } });
    t.push({ name: "edge-single-char", category: "edge", input: { s: "a" } });
    t.push({ name: "edge-only-symbols", category: "edge", input: { s: ".,!?" }, note: "Empty after cleaning is a palindrome." });
    t.push({ name: "edge-digits", category: "edge", input: { s: "0P" }, note: "'0' and 'P' differ." });
    t.push({ name: "edge-mixed-case", category: "edge", input: { s: "Madam" } });
    t.push({ name: "edge-numeric-palindrome", category: "edge", input: { s: "12321" } });
    t.push({ name: "edge-numeric-non-palindrome", category: "edge", input: { s: "12345" } });
    const r = rng(11);
    let big = "";
    for (let i = 0; i < 100000; i++) big += String.fromCharCode(97 + randInt(r, 0, 25));
    big = big + big.split("").reverse().join("");
    t.push({ name: "stress-200k-palindrome", category: "stress", input: { s: big } });
    let big2 = "";
    for (let i = 0; i < 200000; i++) big2 += String.fromCharCode(97 + randInt(r, 0, 25));
    t.push({ name: "stress-200k-random", category: "stress", input: { s: big2 } });
    t.push({ name: "stress-200k-mostly-symbols", category: "stress", input: { s: "!".repeat(100000) + "a" + "!".repeat(100000) }, note: "Symbols collapse around a single 'a'." });
    return t;
  },
});

// 2. Two Sum II - Input Array Is Sorted
add({
  id: "two-sum-ii",
  number: 185,
  title: "Two Sum II - Input Array Is Sorted",
  difficulty: "Medium",
  categories: ["Two Pointers", "Binary Search", "Array"],
  prompt:
    "Given a 1-indexed array of integers `numbers` sorted in non-decreasing order, find two numbers that add up to `target`. Return the 1-based indices `[index1, index2]` with index1 < index2. There is exactly one solution and you may not use the same element twice. Use only constant extra space.",
  constraints: [
    "2 <= numbers.length <= 3 * 10^4",
    "-1000 <= numbers[i] <= 1000",
    "numbers is sorted in non-decreasing order.",
    "-1000 <= target <= 1000",
    "There is exactly one solution.",
  ],
  hints: [
    "The array is sorted — exploit it.",
    "Move two pointers inward based on whether the current sum is too small or too large.",
    "Constant space rules out a hash map.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Two pointers from both ends, converging based on sum vs target." },
  alternatives: [
    { approach: "Binary search the complement", time: "O(n log n)", space: "O(1)" },
    { approach: "Hash map", time: "O(n)", space: "O(n)", note: "Violates the constant-space requirement." },
  ],
  pitfalls: ["Returning 0-based indices.", "Using the same element twice."],
  followups: ["3Sum / kSum.", "What if the array isn't sorted (Two Sum)?"],
  signature: {
    fn: "twoSumSorted",
    params: [{ name: "numbers", adapt: "identity" }, { name: "target", adapt: "identity" }],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function twoSumSorted(numbers: number[], target: number): number[] {
  let i = 0, j = numbers.length - 1;
  while (i < j) {
    const sum = numbers[i] + numbers[j];
    if (sum === target) return [i + 1, j + 1];
    if (sum < target) i++; else j--;
  }
  return [];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { numbers: [2,7,11,15], target: 9 } });
    t.push({ name: "example-2", category: "example", input: { numbers: [2,3,4], target: 6 } });
    t.push({ name: "example-3-negatives", category: "example", input: { numbers: [-1,0], target: -1 } });
    t.push({ name: "edge-min-size", category: "edge", input: { numbers: [1,2], target: 3 } });
    t.push({ name: "edge-duplicates", category: "edge", input: { numbers: [0,0,3,4], target: 0 } });
    t.push({ name: "edge-large-negative", category: "edge", input: { numbers: [-1000,-500,0,500,1000], target: 0 } });
    t.push({ name: "edge-answer-at-ends", category: "edge", input: { numbers: [1,2,3,4,5,6,7,8,9,10], target: 11 } });
    t.push({ name: "edge-answer-in-middle", category: "edge", input: { numbers: [-3,-1,0,2,4,5], target: 1 } });
    const r = rng(2);
    const big = [];
    for (let i = 0; i < 30000; i++) big.push(randInt(r, -1000, 1000));
    big.sort((a, b) => a - b);
    big[15000] = 250; big[20000] = 750; // pair sums to 1000
    big.sort((a, b) => a - b);
    t.push({ name: "stress-30k-random-sorted", category: "stress", input: { numbers: big, target: 1000 } });
    const arr2 = Array.from({ length: 30000 }, (_, i) => -15000 + i);
    t.push({ name: "stress-30k-arithmetic", category: "stress", input: { numbers: arr2, target: 0 }, note: "Pairs around zero." });
    return t;
  },
});

// 3. Container With Most Water
add({
  id: "container-with-most-water",
  number: 30,
  title: "Container With Most Water",
  difficulty: "Medium",
  categories: ["Two Pointers", "Greedy", "Array"],
  prompt:
    "Given an integer array `height` of length n where height[i] is the height of a vertical line at index i, find two lines that together with the x-axis form a container holding the most water. Return the maximum amount of water (area).",
  constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
  hints: [
    "Brute force tries every pair — O(n^2) is too slow.",
    "Start with the widest container; what determines the area?",
    "Move the pointer at the smaller height inward — the wider container with the same shorter side cannot improve.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Two pointers from both ends; always move the shorter side inward." },
  alternatives: [
    { approach: "Brute force", time: "O(n^2)", space: "O(1)" },
  ],
  pitfalls: ["Moving the taller pointer (loses width without chance of gain)."],
  followups: ["Trapping Rain Water variants.", "Largest rectangle in histogram (different problem, similar feel)."],
  signature: { fn: "maxArea", params: [{ name: "height", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function maxArea(height: number[]): number {
  let i = 0, j = height.length - 1, best = 0;
  while (i < j) {
    const h = Math.min(height[i], height[j]);
    const area = h * (j - i);
    if (area > best) best = area;
    if (height[i] < height[j]) i++; else j--;
  }
  return best;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { height: [1,8,6,2,5,4,8,3,7] } });
    t.push({ name: "example-2", category: "example", input: { height: [1,1] } });
    t.push({ name: "edge-min-size", category: "edge", input: { height: [0,0] }, note: "All zero." });
    t.push({ name: "edge-increasing", category: "edge", input: { height: [1,2,3,4,5,6,7,8,9,10] } });
    t.push({ name: "edge-decreasing", category: "edge", input: { height: [10,9,8,7,6,5,4,3,2,1] } });
    t.push({ name: "edge-tall-pair-far-apart", category: "edge", input: { height: [10000, 0, 0, 0, 0, 0, 0, 10000] } });
    t.push({ name: "edge-tall-skinny-vs-wide", category: "edge", input: { height: [4,3,2,1,4] }, note: "Wide pair beats tall middle." });
    t.push({ name: "edge-zeros-with-spike", category: "edge", input: { height: [0,0,0,5,0,0,0] } });
    const r = rng(3);
    const big = Array.from({ length: 100000 }, () => randInt(r, 0, 10000));
    t.push({ name: "stress-100k-random", category: "stress", input: { height: big } });
    const big2 = Array.from({ length: 100000 }, (_, i) => i % 10000);
    t.push({ name: "stress-100k-sawtooth", category: "stress", input: { height: big2 } });
    const big3 = new Array(100000).fill(10000);
    t.push({ name: "stress-100k-uniform-max", category: "stress", input: { height: big3 } });
    return t;
  },
});

// 4. Move Zeroes
add({
  id: "move-zeroes",
  number: 121,
  title: "Move Zeroes",
  difficulty: "Easy",
  categories: ["Two Pointers", "Array"],
  prompt:
    "Given an integer array `nums`, move all 0s to the end while maintaining the relative order of the non-zero elements. Modify the array in-place.",
  constraints: ["1 <= nums.length <= 10^4", "-2^31 <= nums[i] <= 2^31 - 1"],
  hints: [
    "Track a write pointer for where the next non-zero should go.",
    "After scanning, fill the rest with zeros.",
    "Or swap as you go to do it in one pass.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Two-pointer write index; copy non-zeros forward, then zero-fill the tail." },
  alternatives: [
    { approach: "Swap variant", time: "O(n)", space: "O(1)", note: "Single pass with swaps when nums[i] is non-zero." },
  ],
  pitfalls: ["Re-ordering non-zero elements.", "Forgetting to zero out the tail in the write-pointer variant."],
  followups: ["Move all Xs to the end.", "Stable partition by predicate."],
  signature: { fn: "moveZeroes", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function moveZeroes(nums: number[]): number[] {
  let w = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) nums[w++] = nums[i];
  }
  for (; w < nums.length; w++) nums[w] = 0;
  return nums;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [0,1,0,3,12] } });
    t.push({ name: "example-2", category: "example", input: { nums: [0] } });
    t.push({ name: "edge-no-zeros", category: "edge", input: { nums: [1,2,3,4,5] } });
    t.push({ name: "edge-all-zeros", category: "edge", input: { nums: [0,0,0,0] } });
    t.push({ name: "edge-zeros-front", category: "edge", input: { nums: [0,0,0,1,2,3] } });
    t.push({ name: "edge-zeros-back", category: "edge", input: { nums: [1,2,3,0,0,0] } });
    t.push({ name: "edge-negatives", category: "edge", input: { nums: [-1,0,-2,0,-3] } });
    const r = rng(4);
    const big = Array.from({ length: 10000 }, () => (r() < 0.3 ? 0 : randInt(r, -100, 100)));
    t.push({ name: "stress-10k-random", category: "stress", input: { nums: big } });
    const big2 = Array.from({ length: 10000 }, (_, i) => (i % 2 === 0 ? 0 : i));
    t.push({ name: "stress-10k-alternating-zero", category: "stress", input: { nums: big2 } });
    return t;
  },
});

// 5. Remove Duplicates from Sorted Array
add({
  id: "remove-duplicates-from-sorted-array",
  number: 148,
  title: "Remove Duplicates from Sorted Array",
  difficulty: "Easy",
  categories: ["Two Pointers", "Array"],
  prompt:
    "Given a sorted integer array `nums`, remove duplicates in-place so each unique element appears only once, preserving relative order. Return k = the count of unique elements; the first k positions of nums must contain the unique values.",
  constraints: ["1 <= nums.length <= 3 * 10^4", "-100 <= nums[i] <= 100", "nums is sorted in non-decreasing order."],
  hints: [
    "Sortedness lets you compare consecutive elements only.",
    "Keep a write pointer for the next unique slot.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Two pointers: write index w starts at 1; copy when nums[i] !== nums[w-1]." },
  alternatives: [{ approach: "Set then rewrite", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Off-by-one when w starts at 0 vs 1.", "Failing to update the value at index w."],
  followups: ["Allow at most two duplicates (LC 80)."],
  signature: { fn: "removeDuplicates", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function removeDuplicates(nums: number[]): [number, number[]] {
  if (nums.length === 0) return [0, []];
  let w = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[w - 1]) nums[w++] = nums[i];
  }
  return [w, nums.slice(0, w)];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,1,2] } });
    t.push({ name: "example-2", category: "example", input: { nums: [0,0,1,1,1,2,2,3,3,4] } });
    t.push({ name: "edge-single", category: "edge", input: { nums: [7] } });
    t.push({ name: "edge-all-same", category: "edge", input: { nums: [5,5,5,5,5] } });
    t.push({ name: "edge-no-duplicates", category: "edge", input: { nums: [-3,-1,0,2,4,9] } });
    t.push({ name: "edge-two-elements-equal", category: "edge", input: { nums: [2,2] } });
    t.push({ name: "edge-negatives", category: "edge", input: { nums: [-100,-100,-1,-1,0,0,100,100] } });
    const r = rng(5);
    const big = [];
    let v = -100;
    for (let i = 0; i < 30000; i++) {
      big.push(v);
      if (r() < 0.3) v = Math.min(100, v + 1);
    }
    t.push({ name: "stress-30k-monotone-with-runs", category: "stress", input: { nums: big } });
    const big2 = Array.from({ length: 30000 }, (_, i) => Math.floor(i / 300) - 50);
    t.push({ name: "stress-30k-block-runs", category: "stress", input: { nums: big2 } });
    const big3 = new Array(30000).fill(0);
    t.push({ name: "stress-30k-all-equal", category: "stress", input: { nums: big3 } });
    return t;
  },
});

// 6. Merge Sorted Array
add({
  id: "merge-sorted-array",
  number: 111,
  title: "Merge Sorted Array",
  difficulty: "Easy",
  categories: ["Two Pointers", "Array"],
  prompt:
    "You are given two sorted integer arrays nums1 and nums2, with nums1 having m + n length where the last n entries are placeholders. Merge nums2 into nums1 in-place so nums1 becomes sorted in non-decreasing order.",
  constraints: [
    "nums1.length == m + n",
    "nums2.length == n",
    "0 <= m, n <= 200",
    "1 <= m + n <= 200",
    "-10^9 <= nums1[i], nums2[j] <= 10^9",
  ],
  hints: [
    "Merging from the front would overwrite unread values.",
    "Walk pointers from the back of each array into the back of nums1.",
    "Don't forget any leftover nums2 (leftover nums1 is already in place).",
  ],
  optimal: { time: "O(m+n)", space: "O(1)", approach: "Three pointers from the back: write the larger of nums1[i], nums2[j] into nums1[k]." },
  alternatives: [{ approach: "Concatenate and sort", time: "O((m+n) log(m+n))", space: "O(1)" }],
  pitfalls: ["Stopping when i < 0 but j still has values left.", "Comparing using > instead of >= can be fine but be consistent."],
  followups: ["Merge k sorted arrays."],
  signature: {
    fn: "mergeSortedArrays",
    params: [
      { name: "nums1", adapt: "identity" },
      { name: "m", adapt: "identity" },
      { name: "nums2", adapt: "identity" },
      { name: "n", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function mergeSortedArrays(nums1: number[], m: number, nums2: number[], n: number): number[] {
  let i = m - 1, j = n - 1, k = m + n - 1;
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
    else nums1[k--] = nums2[j--];
  }
  return nums1;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums1: [1,2,3,0,0,0], m: 3, nums2: [2,5,6], n: 3 } });
    t.push({ name: "example-2-empty-nums2", category: "example", input: { nums1: [1], m: 1, nums2: [], n: 0 } });
    t.push({ name: "example-3-empty-nums1-prefix", category: "example", input: { nums1: [0], m: 0, nums2: [1], n: 1 } });
    t.push({ name: "edge-all-from-nums2-smaller", category: "edge", input: { nums1: [4,5,6,0,0,0], m: 3, nums2: [1,2,3], n: 3 } });
    t.push({ name: "edge-interleaved", category: "edge", input: { nums1: [1,3,5,0,0,0], m: 3, nums2: [2,4,6], n: 3 } });
    t.push({ name: "edge-duplicates", category: "edge", input: { nums1: [1,2,2,0,0,0], m: 3, nums2: [2,2,3], n: 3 } });
    t.push({ name: "edge-negatives", category: "edge", input: { nums1: [-5,-3,0,0,0,0], m: 2, nums2: [-4,-2,1,7], n: 4 } });
    t.push({ name: "edge-nums2-leftover", category: "edge", input: { nums1: [9,0,0,0], m: 1, nums2: [1,2,3], n: 3 } });
    const r = rng(6);
    const A = Array.from({ length: 100 }, () => randInt(r, -1_000_000_000, 1_000_000_000)).sort((a,b)=>a-b);
    const B = Array.from({ length: 100 }, () => randInt(r, -1_000_000_000, 1_000_000_000)).sort((a,b)=>a-b);
    const arr = A.concat(new Array(100).fill(0));
    t.push({ name: "stress-200-random", category: "stress", input: { nums1: arr, m: 100, nums2: B, n: 100 } });
    const A2 = Array.from({ length: 100 }, (_, i) => i * 2).sort((a,b)=>a-b);
    const B2 = Array.from({ length: 100 }, (_, i) => i * 2 + 1);
    t.push({ name: "stress-200-interleaved", category: "stress", input: { nums1: A2.concat(new Array(100).fill(0)), m: 100, nums2: B2, n: 100 } });
    return t;
  },
});

// 7. Longest Consecutive Sequence
add({
  id: "longest-consecutive-sequence",
  number: 93,
  title: "Longest Consecutive Sequence",
  difficulty: "Medium",
  categories: ["Hash Table", "Union-Find", "Array"],
  prompt:
    "Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence. Solve in O(n).",
  constraints: ["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
  hints: [
    "Sorting is O(n log n) — but you may want it for a baseline.",
    "Put all values in a hash set; for each value that has no predecessor (v-1 absent), walk forward.",
    "Each element is visited at most twice → O(n).",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Hash set; only start counting from sequence starts (no v-1 in set)." },
  alternatives: [{ approach: "Sort + scan", time: "O(n log n)", space: "O(1) extra" }],
  pitfalls: [
    "Counting from every element gives O(n^2).",
    "Forgetting to deduplicate (a set handles this).",
    "Empty input must return 0.",
  ],
  followups: ["Return the actual sequence.", "Streaming version with arbitrary inserts."],
  signature: { fn: "longestConsecutive", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function longestConsecutive(nums: number[]): number {
  const set = new Set(nums);
  let best = 0;
  for (const v of set) {
    if (!set.has(v - 1)) {
      let cur = v, len = 1;
      while (set.has(cur + 1)) { cur++; len++; }
      if (len > best) best = len;
    }
  }
  return best;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [100,4,200,1,3,2] } });
    t.push({ name: "example-2", category: "example", input: { nums: [0,3,7,2,5,8,4,6,0,1] } });
    t.push({ name: "edge-empty", category: "edge", input: { nums: [] } });
    t.push({ name: "edge-single", category: "edge", input: { nums: [42] } });
    t.push({ name: "edge-all-duplicates", category: "edge", input: { nums: [5,5,5,5] } });
    t.push({ name: "edge-already-sorted", category: "edge", input: { nums: [1,2,3,4,5,6,7,8,9,10] } });
    t.push({ name: "edge-negatives-and-positives", category: "edge", input: { nums: [-3,-2,-1,0,1,2,3] } });
    t.push({ name: "edge-two-disjoint-runs", category: "edge", input: { nums: [1,2,3,100,101,102,103] } });
    t.push({ name: "edge-large-values", category: "edge", input: { nums: [1_000_000_000, 999_999_999, 1, -1_000_000_000] } });
    const r = rng(7);
    const big = Array.from({ length: 100000 }, () => randInt(r, -50000, 50000));
    t.push({ name: "stress-100k-random", category: "stress", input: { nums: big } });
    const big2 = Array.from({ length: 100000 }, (_, i) => i);
    t.push({ name: "stress-100k-full-run", category: "stress", input: { nums: big2 } });
    const big3 = [];
    for (let i = 0; i < 50; i++) {
      const start = i * 5000;
      for (let j = 0; j < 1500; j++) big3.push(start + j);
    }
    t.push({ name: "stress-75k-many-runs", category: "stress", input: { nums: big3 } });
    return t;
  },
});

// 8. Encode and Decode Strings
add({
  id: "encode-decode-strings",
  number: 49,
  title: "Encode and Decode Strings",
  difficulty: "Medium",
  categories: ["String", "Design"],
  prompt:
    "Design an algorithm to encode a list of strings to a single string and decode that single string back into the original list. Strings can contain any unicode characters including separators or digits.",
  constraints: ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200", "strs[i] may contain any printable characters."],
  hints: [
    "Any sentinel character could appear in the data — naive splitting fails.",
    "Length-prefix each string: write the length, a delimiter, then the string.",
    "On decode, read up to the delimiter to get the length, then take exactly that many chars.",
  ],
  optimal: { time: "O(N)", space: "O(N)", approach: "Length-prefix each string with `len#str`; decode reads length, then exactly len characters." },
  alternatives: [
    { approach: "Escape separators", time: "O(N)", space: "O(N)", note: "Possible but easy to get wrong with Unicode." },
  ],
  pitfalls: ["Choosing a delimiter that may appear in data.", "Off-by-one when slicing by length."],
  followups: ["Make it streaming."],
  signature: { fn: "codecRoundTrip", params: [{ name: "strs", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function encode(strs: string[]): string {
  return strs.map(s => s.length + "#" + s).join("");
}
function decode(s: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (s[j] !== "#") j++;
    const len = parseInt(s.slice(i, j), 10);
    out.push(s.slice(j + 1, j + 1 + len));
    i = j + 1 + len;
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { strs: ["lint","code","love","you"] } });
    t.push({ name: "example-2", category: "example", input: { strs: ["we","say",":","yes"] } });
    t.push({ name: "edge-empty-list", category: "edge", input: { strs: [] } });
    t.push({ name: "edge-empty-strings", category: "edge", input: { strs: ["", "", ""] } });
    t.push({ name: "edge-mixed-empties", category: "edge", input: { strs: ["a", "", "bc", "", "d"] } });
    t.push({ name: "edge-with-hash-and-digits", category: "edge", input: { strs: ["1#2", "3#4", "##", "10#abc"] }, note: "Delimiter and digits inside data." });
    t.push({ name: "edge-spaces-and-newlines", category: "edge", input: { strs: ["hello world", "foo\nbar", "\t"] } });
    t.push({ name: "edge-unicode", category: "edge", input: { strs: ["你好", "🌍🚀", "café"] } });
    const r = rng(8);
    const big = [];
    for (let i = 0; i < 200; i++) {
      const len = randInt(r, 0, 200);
      let s = "";
      for (let k = 0; k < len; k++) s += String.fromCharCode(randInt(r, 32, 126));
      big.push(s);
    }
    t.push({ name: "stress-200-random-printable", category: "stress", input: { strs: big } });
    const big2 = Array.from({ length: 200 }, (_, i) => i.toString().padEnd(200, "#"));
    t.push({ name: "stress-200-all-hash-padded", category: "stress", input: { strs: big2 } });
    return t;
  },
});

// 9. Longest Palindromic Substring
add({
  id: "longest-palindromic-substring",
  number: 96,
  title: "Longest Palindromic Substring",
  difficulty: "Medium",
  categories: ["Two Pointers", "String", "Dynamic Programming"],
  prompt:
    "Given a string `s`, return the longest palindromic substring of `s`. Any valid longest substring is accepted.",
  constraints: ["1 <= s.length <= 1000", "s consists of digits and English letters."],
  hints: [
    "Brute force is O(n^3) — too slow.",
    "Try expanding around each center; there are 2n-1 centers (odd and even).",
    "Manacher's algorithm achieves O(n) but is rarely required.",
  ],
  optimal: { time: "O(n^2)", space: "O(1)", approach: "Expand around each center for both odd and even lengths; track the best." },
  alternatives: [
    { approach: "DP table", time: "O(n^2)", space: "O(n^2)" },
    { approach: "Manacher's algorithm", time: "O(n)", space: "O(n)" },
  ],
  pitfalls: ["Forgetting the even-length centers.", "Tracking indices vs substring extraction."],
  followups: ["Count all palindromic substrings (LC 647).", "Shortest palindrome by prefix extension."],
  signature: { fn: "longestPalindrome", params: [{ name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "stringLength",
  solutionTs:
`function longestPalindrome(s: string): string {
  let bl = 0, br = 0;
  const expand = (l: number, r: number) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    if (r - l - 1 > br - bl + 1) { bl = l + 1; br = r - 1; }
  };
  for (let i = 0; i < s.length; i++) { expand(i, i); expand(i, i + 1); }
  return s.slice(bl, br + 1);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "babad" } });
    t.push({ name: "example-2", category: "example", input: { s: "cbbd" } });
    t.push({ name: "edge-single-char", category: "edge", input: { s: "a" } });
    t.push({ name: "edge-two-same", category: "edge", input: { s: "bb" } });
    t.push({ name: "edge-two-diff", category: "edge", input: { s: "ab" } });
    t.push({ name: "edge-all-same", category: "edge", input: { s: "aaaaaa" } });
    t.push({ name: "edge-no-palindrome-longer-than-1", category: "edge", input: { s: "abcdefg" } });
    t.push({ name: "edge-pal-at-start", category: "edge", input: { s: "abacxyz" } });
    t.push({ name: "edge-pal-at-end", category: "edge", input: { s: "xyzracecar" } });
    t.push({ name: "edge-even-pal", category: "edge", input: { s: "abccba" } });
    const r = rng(9);
    let mid = "";
    for (let i = 0; i < 200; i++) mid += String.fromCharCode(97 + randInt(r, 0, 25));
    const pal = mid + mid.split("").reverse().join("");
    let pre = "", suf = "";
    for (let i = 0; i < 100; i++) pre += String.fromCharCode(97 + randInt(r, 0, 25));
    for (let i = 0; i < 100; i++) suf += String.fromCharCode(97 + randInt(r, 0, 25));
    t.push({ name: "stress-600-with-embedded-pal", category: "stress", input: { s: pre + pal + suf } });
    let big2 = "";
    for (let i = 0; i < 1000; i++) big2 += String.fromCharCode(97 + randInt(r, 0, 25));
    t.push({ name: "stress-1000-random", category: "stress", input: { s: big2 } });
    t.push({ name: "stress-1000-all-same", category: "stress", input: { s: "a".repeat(1000) } });
    return t;
  },
});

// 10. Palindromic Substrings
add({
  id: "palindromic-substrings",
  number: 133,
  title: "Palindromic Substrings",
  difficulty: "Medium",
  categories: ["String", "Dynamic Programming"],
  prompt:
    "Given a string `s`, return the number of palindromic substrings in it. A substring is palindromic if it reads the same forward and backward; identical substrings at different positions are counted separately.",
  constraints: ["1 <= s.length <= 1000", "s consists of lowercase English letters."],
  hints: [
    "Same expand-around-center technique as Longest Palindromic Substring.",
    "Each center contributes the number of palindromes that extend from it.",
  ],
  optimal: { time: "O(n^2)", space: "O(1)", approach: "Expand around each odd and even center, counting matches." },
  alternatives: [
    { approach: "DP", time: "O(n^2)", space: "O(n^2)" },
    { approach: "Manacher's", time: "O(n)", space: "O(n)" },
  ],
  pitfalls: ["Forgetting even centers.", "Double counting when expanding past mismatch."],
  followups: ["Return all distinct palindromic substrings."],
  signature: { fn: "countSubstrings", params: [{ name: "s", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function countSubstrings(s: string): number {
  let count = 0;
  const expand = (l: number, r: number) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { count++; l--; r++; }
  };
  for (let i = 0; i < s.length; i++) { expand(i, i); expand(i, i + 1); }
  return count;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "abc" } });
    t.push({ name: "example-2", category: "example", input: { s: "aaa" } });
    t.push({ name: "edge-single", category: "edge", input: { s: "z" } });
    t.push({ name: "edge-two-same", category: "edge", input: { s: "bb" } });
    t.push({ name: "edge-two-diff", category: "edge", input: { s: "bc" } });
    t.push({ name: "edge-all-same-10", category: "edge", input: { s: "aaaaaaaaaa" } });
    t.push({ name: "edge-no-pal-beyond-1", category: "edge", input: { s: "abcdef" } });
    t.push({ name: "edge-mix", category: "edge", input: { s: "abacdfgdcaba" } });
    const r = rng(10);
    let big = "";
    for (let i = 0; i < 1000; i++) big += String.fromCharCode(97 + randInt(r, 0, 25));
    t.push({ name: "stress-1000-random", category: "stress", input: { s: big } });
    t.push({ name: "stress-1000-all-same", category: "stress", input: { s: "a".repeat(1000) }, note: "All n*(n+1)/2 substrings are palindromes." });
    let big2 = "";
    for (let i = 0; i < 500; i++) big2 += "ab";
    t.push({ name: "stress-1000-alt", category: "stress", input: { s: big2 } });
    return t;
  },
});

// 11. Longest Repeating Character Replacement
add({
  id: "longest-repeating-character-replacement",
  number: 97,
  title: "Longest Repeating Character Replacement",
  difficulty: "Medium",
  categories: ["Sliding Window", "Hash Table", "String"],
  prompt:
    "Given a string `s` and an integer `k`, you can change at most k characters to any other uppercase English letter. Return the length of the longest substring containing the same letter you can obtain.",
  constraints: ["1 <= s.length <= 10^5", "0 <= k <= s.length", "s consists of uppercase English letters."],
  hints: [
    "A window is valid when (windowLen - mostFrequentCount) <= k.",
    "Slide a right pointer; only shrink the window when invalid (move left).",
    "You can keep mostFrequentCount as a non-decreasing 'lazy' max — it's correct for the answer.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Sliding window with character-frequency array; track max-frequency in window." },
  alternatives: [{ approach: "Try each letter as target", time: "O(26 * n)", space: "O(1)" }],
  pitfalls: ["Recomputing max across the alphabet on every step (still O(26n) — fine, but the lazy trick gives true O(n)).", "Off-by-one when shrinking."],
  followups: ["Return the actual substring.", "Allow at most k distinct characters (LC 340)."],
  signature: { fn: "characterReplacement", params: [{ name: "s", adapt: "identity" }, { name: "k", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function characterReplacement(s: string, k: number): number {
  const cnt = new Array(26).fill(0);
  let l = 0, maxF = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    const ri = s.charCodeAt(r) - 65;
    cnt[ri]++;
    if (cnt[ri] > maxF) maxF = cnt[ri];
    while (r - l + 1 - maxF > k) {
      cnt[s.charCodeAt(l) - 65]--;
      l++;
    }
    if (r - l + 1 > best) best = r - l + 1;
  }
  return best;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "ABAB", k: 2 } });
    t.push({ name: "example-2", category: "example", input: { s: "AABABBA", k: 1 } });
    t.push({ name: "edge-k-zero", category: "edge", input: { s: "AABBCC", k: 0 } });
    t.push({ name: "edge-single-char", category: "edge", input: { s: "A", k: 0 } });
    t.push({ name: "edge-all-same", category: "edge", input: { s: "AAAAA", k: 2 } });
    t.push({ name: "edge-k-equals-len", category: "edge", input: { s: "ABCDE", k: 5 } });
    t.push({ name: "edge-k-greater-than-needed", category: "edge", input: { s: "ABABAB", k: 100 } });
    t.push({ name: "edge-mostly-same", category: "edge", input: { s: "AAAABA", k: 1 } });
    const r = rng(11);
    let big = "";
    for (let i = 0; i < 100000; i++) big += String.fromCharCode(65 + randInt(r, 0, 25));
    t.push({ name: "stress-100k-uniform-random", category: "stress", input: { s: big, k: 100 } });
    let big2 = "";
    for (let i = 0; i < 100000; i++) big2 += String.fromCharCode(65 + randInt(r, 0, 1));
    t.push({ name: "stress-100k-binary-random", category: "stress", input: { s: big2, k: 1000 } });
    t.push({ name: "stress-100k-all-same", category: "stress", input: { s: "Z".repeat(100000), k: 0 } });
    return t;
  },
});

// 12. Minimum Window Substring
add({
  id: "minimum-window-substring",
  number: 119,
  title: "Minimum Window Substring",
  difficulty: "Hard",
  categories: ["Sliding Window", "Hash Table", "String"],
  prompt:
    "Given strings `s` and `t`, return the minimum window substring of `s` that contains every character of `t` (including duplicates). If no such substring exists, return the empty string. Any valid minimum-length window is accepted.",
  constraints: ["1 <= s.length, t.length <= 10^5", "s and t consist of uppercase and lowercase English letters."],
  hints: [
    "Slide a window and maintain how many of `t`'s characters are still required.",
    "Expand right; once the window contains all chars, shrink left as much as possible.",
    "Track best window seen; reset it whenever you find a smaller valid window.",
  ],
  optimal: { time: "O(|s|+|t|)", space: "O(|s|+|t|)", approach: "Sliding window with a `need`/`have` count and a `missing` counter." },
  alternatives: [{ approach: "Brute force over all substrings", time: "O(|s|^2 |t|)", space: "O(|t|)" }],
  pitfalls: ["Decrementing missing when the same char appears beyond what t requires.", "Forgetting case sensitivity."],
  followups: ["Smallest window with k distinct.", "Streaming variant."],
  signature: { fn: "minWindow", params: [{ name: "s", adapt: "identity" }, { name: "t", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "stringLength",
  solutionTs:
`function minWindow(s: string, t: string): string {
  if (t.length > s.length) return "";
  const need = new Map<string, number>();
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
  let missing = t.length;
  let bestL = 0, bestLen = Infinity, l = 0;
  for (let r = 0; r < s.length; r++) {
    const cr = s[r];
    const nr = need.get(cr);
    if (nr !== undefined) {
      if (nr > 0) missing--;
      need.set(cr, nr - 1);
    }
    while (missing === 0) {
      if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
      const cl = s[l];
      const nl = need.get(cl);
      if (nl !== undefined) {
        need.set(cl, nl + 1);
        if (nl + 1 > 0) missing++;
      }
      l++;
    }
  }
  return bestLen === Infinity ? "" : s.slice(bestL, bestL + bestLen);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s: "ADOBECODEBANC", t: "ABC" } });
    t.push({ name: "example-2", category: "example", input: { s: "a", t: "a" } });
    t.push({ name: "example-3-no-window", category: "example", input: { s: "a", t: "aa" } });
    t.push({ name: "edge-empty-result", category: "edge", input: { s: "abcdef", t: "z" } });
    t.push({ name: "edge-equal-strings", category: "edge", input: { s: "abc", t: "abc" } });
    t.push({ name: "edge-repeats-in-t", category: "edge", input: { s: "aaflslflsldkalskaaa", t: "aaa" } });
    t.push({ name: "edge-case-sensitive", category: "edge", input: { s: "AaBbCc", t: "abc" } });
    t.push({ name: "edge-window-at-end", category: "edge", input: { s: "xxxxxxxxxxxxabc", t: "abc" } });
    t.push({ name: "edge-window-at-start", category: "edge", input: { s: "abcxxxxxxxxxx", t: "abc" } });
    const r = rng(12);
    let big = "";
    for (let i = 0; i < 100000; i++) big += String.fromCharCode(97 + randInt(r, 0, 25));
    t.push({ name: "stress-100k-target-all-letters", category: "stress", input: { s: big, t: "abcdefghijklmnopqrstuvwxyz" } });
    let big2 = "a".repeat(50000) + "bcd" + "a".repeat(49997);
    t.push({ name: "stress-100k-rare-target", category: "stress", input: { s: big2, t: "bcd" } });
    return t;
  },
});

// 13. Permutation in String
add({
  id: "permutation-in-string",
  number: 137,
  title: "Permutation in String",
  difficulty: "Medium",
  categories: ["Sliding Window", "Hash Table", "String"],
  prompt:
    "Given two strings `s1` and `s2`, return true if `s2` contains a permutation of `s1` as a substring (i.e., one of s1's permutations is a substring of s2).",
  constraints: ["1 <= s1.length, s2.length <= 10^4", "s1 and s2 consist of lowercase English letters."],
  hints: [
    "A permutation of s1 has the same character histogram as s1.",
    "Slide a fixed-size window of length s1.length over s2 and compare counts.",
    "Maintain a 'matches' counter so the comparison is O(1) per step.",
  ],
  optimal: { time: "O(|s2|)", space: "O(1)", approach: "Fixed-size sliding window with 26-letter counts and a `matches` counter." },
  alternatives: [{ approach: "Sort and compare every window", time: "O(|s2| * |s1| log |s1|)", space: "O(|s1|)" }],
  pitfalls: ["Forgetting to compare counts (not characters).", "Off-by-one when shrinking the window."],
  followups: ["Find all anagrams of s1 in s2 (LC 438)."],
  signature: { fn: "checkInclusion", params: [{ name: "s1", adapt: "identity" }, { name: "s2", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function checkInclusion(s1: string, s2: string): boolean {
  if (s1.length > s2.length) return false;
  const a = new Array(26).fill(0), b = new Array(26).fill(0);
  for (let i = 0; i < s1.length; i++) {
    a[s1.charCodeAt(i) - 97]++;
    b[s2.charCodeAt(i) - 97]++;
  }
  let matches = 0;
  for (let i = 0; i < 26; i++) if (a[i] === b[i]) matches++;
  for (let r = s1.length; r < s2.length; r++) {
    if (matches === 26) return true;
    const ri = s2.charCodeAt(r) - 97;
    b[ri]++;
    if (b[ri] === a[ri]) matches++;
    else if (b[ri] === a[ri] + 1) matches--;
    const li = s2.charCodeAt(r - s1.length) - 97;
    b[li]--;
    if (b[li] === a[li]) matches++;
    else if (b[li] === a[li] - 1) matches--;
  }
  return matches === 26;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { s1: "ab", s2: "eidbaooo" } });
    t.push({ name: "example-2", category: "example", input: { s1: "ab", s2: "eidboaoo" } });
    t.push({ name: "edge-s1-longer", category: "edge", input: { s1: "abc", s2: "ab" } });
    t.push({ name: "edge-equal-strings", category: "edge", input: { s1: "abc", s2: "cba" } });
    t.push({ name: "edge-no-permutation", category: "edge", input: { s1: "hello", s2: "ooolleoooleh" } });
    t.push({ name: "edge-single-char-found", category: "edge", input: { s1: "a", s2: "abc" } });
    t.push({ name: "edge-single-char-missing", category: "edge", input: { s1: "z", s2: "abc" } });
    t.push({ name: "edge-end-of-s2", category: "edge", input: { s1: "abc", s2: "xxxxxxbca" } });
    const r = rng(13);
    let big = "";
    for (let i = 0; i < 10000; i++) big += String.fromCharCode(97 + randInt(r, 0, 25));
    t.push({ name: "stress-10k-no-match", category: "stress", input: { s1: "zzzzzzzzzz", s2: big } });
    let big2 = "a".repeat(9990) + "bcdefghijk";
    t.push({ name: "stress-10k-match-at-end", category: "stress", input: { s1: "kjihgfedcb", s2: big2 } });
    t.push({ name: "stress-10k-all-same", category: "stress", input: { s1: "aaaa", s2: "a".repeat(10000) } });
    return t;
  },
});

// 14. Sliding Window Maximum
add({
  id: "sliding-window-maximum",
  number: 168,
  title: "Sliding Window Maximum",
  difficulty: "Hard",
  categories: ["Sliding Window", "Heap / Priority Queue", "Queue", "Monotonic Stack", "Array"],
  prompt:
    "Given an integer array `nums` and an integer `k`, return an array of the maximum values in each contiguous window of size k as the window slides from left to right.",
  constraints: ["1 <= nums.length <= 10^5", "1 <= k <= nums.length", "-10^4 <= nums[i] <= 10^4"],
  hints: [
    "A naive O(n*k) is too slow at n = 10^5.",
    "Maintain a deque of indices whose values form a non-increasing sequence.",
    "Front of the deque is always the current window's max; pop from the back when adding smaller-or-equal values.",
  ],
  optimal: { time: "O(n)", space: "O(k)", approach: "Monotonic deque of indices; each index is pushed/popped at most once." },
  alternatives: [
    { approach: "Max-heap with lazy deletion", time: "O(n log n)", space: "O(n)" },
    { approach: "Brute force per window", time: "O(n*k)", space: "O(1)" },
  ],
  pitfalls: ["Storing values instead of indices (can't expire by position).", "Forgetting to pop indices that have left the window."],
  followups: ["Sliding window minimum.", "Sliding window median (heap variant)."],
  signature: { fn: "maxSlidingWindow", params: [{ name: "nums", adapt: "identity" }, { name: "k", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function maxSlidingWindow(nums: number[], k: number): number[] {
  const dq: number[] = [];
  const out: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    while (dq.length && dq[0] <= i - k) dq.shift();
    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) out.push(nums[dq[0]]);
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [1,3,-1,-3,5,3,6,7], k: 3 } });
    t.push({ name: "example-2", category: "example", input: { nums: [1], k: 1 } });
    t.push({ name: "edge-k-equals-n", category: "edge", input: { nums: [1,2,3,4,5], k: 5 } });
    t.push({ name: "edge-k-1", category: "edge", input: { nums: [9,11,8,5,7,10], k: 1 } });
    t.push({ name: "edge-all-same", category: "edge", input: { nums: [4,4,4,4,4,4], k: 3 } });
    t.push({ name: "edge-decreasing", category: "edge", input: { nums: [9,8,7,6,5,4,3,2,1], k: 3 } });
    t.push({ name: "edge-increasing", category: "edge", input: { nums: [1,2,3,4,5,6,7,8,9], k: 4 } });
    t.push({ name: "edge-negatives", category: "edge", input: { nums: [-7,-8,7,5,7,1,6,0], k: 4 } });
    const r = rng(14);
    const big = Array.from({ length: 100000 }, () => randInt(r, -10000, 10000));
    t.push({ name: "stress-100k-random-k-100", category: "stress", input: { nums: big, k: 100 } });
    t.push({ name: "stress-100k-random-k-1", category: "stress", input: { nums: big, k: 1 } });
    const big2 = Array.from({ length: 100000 }, (_, i) => i);
    t.push({ name: "stress-100k-monotone", category: "stress", input: { nums: big2, k: 1000 } });
    return t;
  },
});

// 15. Find Minimum in Rotated Sorted Array
add({
  id: "find-minimum-in-rotated-sorted-array",
  number: 55,
  title: "Find Minimum in Rotated Sorted Array",
  difficulty: "Medium",
  categories: ["Binary Search", "Array"],
  prompt:
    "Given a sorted array of unique integers that has been rotated between 1 and n times, return the minimum element. Solve in O(log n).",
  constraints: ["1 <= nums.length <= 5000", "-5000 <= nums[i] <= 5000", "All values are unique.", "nums is sorted then rotated 1..n times."],
  hints: [
    "If nums[mid] > nums[right], the minimum lies to the right of mid.",
    "Otherwise it's at mid or to its left.",
    "Loop while left < right; converge until they meet.",
  ],
  optimal: { time: "O(log n)", space: "O(1)", approach: "Binary search comparing nums[mid] with nums[right]." },
  alternatives: [{ approach: "Linear scan", time: "O(n)", space: "O(1)" }],
  pitfalls: ["Comparing nums[mid] with nums[left] instead of right (handles fewer cases cleanly).", "Off-by-one in the loop condition."],
  followups: ["With duplicates (LC 154).", "Find both min and max indices."],
  signature: { fn: "findMin", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function findMin(nums: number[]): number {
  let l = 0, r = nums.length - 1;
  while (l < r) {
    const m = (l + r) >> 1;
    if (nums[m] > nums[r]) l = m + 1;
    else r = m;
  }
  return nums[l];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [3,4,5,1,2] } });
    t.push({ name: "example-2", category: "example", input: { nums: [4,5,6,7,0,1,2] } });
    t.push({ name: "example-3-no-rotation", category: "example", input: { nums: [11,13,15,17] } });
    t.push({ name: "edge-single", category: "edge", input: { nums: [1] } });
    t.push({ name: "edge-two-rotated", category: "edge", input: { nums: [2,1] } });
    t.push({ name: "edge-two-not-rotated", category: "edge", input: { nums: [1,2] } });
    t.push({ name: "edge-rotation-by-1", category: "edge", input: { nums: [2,3,4,5,6,7,8,9,10,1] } });
    t.push({ name: "edge-rotation-by-n-minus-1", category: "edge", input: { nums: [10,1,2,3,4,5,6,7,8,9] } });
    t.push({ name: "edge-negatives", category: "edge", input: { nums: [-3,-1,1,3,-7,-5] } });
    const r = rng(15);
    const sorted = Array.from({ length: 5000 }, (_, i) => -2500 + i);
    const piv = randInt(r, 0, 4999);
    const rot = sorted.slice(piv).concat(sorted.slice(0, piv));
    t.push({ name: "stress-5000-rotated", category: "stress", input: { nums: rot } });
    t.push({ name: "stress-5000-sorted", category: "stress", input: { nums: sorted } });
    const rot2 = sorted.slice(1).concat(sorted.slice(0, 1));
    t.push({ name: "stress-5000-rot-by-1", category: "stress", input: { nums: rot2 } });
    return t;
  },
});

// 16. Search a 2D Matrix
add({
  id: "search-2d-matrix",
  number: 162,
  title: "Search a 2D Matrix",
  difficulty: "Medium",
  categories: ["Binary Search", "Matrix", "Array"],
  prompt:
    "Given an m x n integer matrix where every row is sorted in non-decreasing order and the first integer of each row is greater than the last integer of the previous row, return true if `target` is in the matrix.",
  constraints: ["m == matrix.length", "n == matrix[i].length", "1 <= m, n <= 100", "-10^4 <= matrix[i][j], target <= 10^4"],
  hints: [
    "The matrix behaves like a single sorted array of length m*n.",
    "Map a flat index k to (k / n, k % n) and binary search.",
  ],
  optimal: { time: "O(log(m*n))", space: "O(1)", approach: "Binary search treating the matrix as a sorted 1D array via index arithmetic." },
  alternatives: [
    { approach: "Two binary searches (row, then column)", time: "O(log m + log n)", space: "O(1)" },
    { approach: "Staircase from top-right", time: "O(m+n)", space: "O(1)" },
  ],
  pitfalls: ["Wrong index math when mapping mid to (row, col).", "Forgetting to handle empty rows."],
  followups: ["LC 240 — rows and columns sorted but not globally chained."],
  signature: { fn: "searchMatrix", params: [{ name: "matrix", adapt: "identity" }, { name: "target", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function searchMatrix(matrix: number[][], target: number): boolean {
  const m = matrix.length, n = matrix[0].length;
  let l = 0, r = m * n - 1;
  while (l <= r) {
    const mid = (l + r) >> 1;
    const v = matrix[(mid / n) | 0][mid % n];
    if (v === target) return true;
    if (v < target) l = mid + 1; else r = mid - 1;
  }
  return false;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1-found", category: "example", input: { matrix: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target: 3 } });
    t.push({ name: "example-2-missing", category: "example", input: { matrix: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target: 13 } });
    t.push({ name: "edge-single-cell-found", category: "edge", input: { matrix: [[5]], target: 5 } });
    t.push({ name: "edge-single-cell-missing", category: "edge", input: { matrix: [[5]], target: 7 } });
    t.push({ name: "edge-target-too-small", category: "edge", input: { matrix: [[1,3,5],[7,9,11]], target: 0 } });
    t.push({ name: "edge-target-too-large", category: "edge", input: { matrix: [[1,3,5],[7,9,11]], target: 99 } });
    t.push({ name: "edge-single-row", category: "edge", input: { matrix: [[1,2,3,4,5,6,7,8,9,10]], target: 7 } });
    t.push({ name: "edge-single-column", category: "edge", input: { matrix: [[1],[2],[3],[4],[5]], target: 4 } });
    t.push({ name: "edge-negatives", category: "edge", input: { matrix: [[-10,-5,-1],[0,2,4]], target: -5 } });
    const r = rng(16);
    const big = [];
    let v = -10000;
    for (let i = 0; i < 100; i++) {
      const row = [];
      for (let j = 0; j < 100; j++) { row.push(v); v += randInt(r, 1, 5); }
      big.push(row);
    }
    t.push({ name: "stress-100x100-found", category: "stress", input: { matrix: big, target: big[50][50] } });
    t.push({ name: "stress-100x100-missing", category: "stress", input: { matrix: big, target: 100001 } });
    return t;
  },
});

// 17. Koko Eating Bananas
add({
  id: "koko-eating-bananas",
  number: 80,
  title: "Koko Eating Bananas",
  difficulty: "Medium",
  categories: ["Binary Search", "Array"],
  prompt:
    "Koko has piles of bananas with piles[i] bananas in the i-th pile. She eats k bananas per hour, choosing one pile each hour. If a pile has fewer than k bananas, she finishes it and waits the rest of that hour. Return the minimum integer k that lets her finish all piles within h hours.",
  constraints: ["1 <= piles.length <= 10^4", "piles.length <= h <= 10^9", "1 <= piles[i] <= 10^9"],
  hints: [
    "Higher k → fewer hours. Lower k → more hours. The relationship is monotonic.",
    "Binary search over k in [1, max(piles)].",
    "Hours used at speed k = sum(ceil(p/k)).",
  ],
  optimal: { time: "O(n log(max(piles)))", space: "O(1)", approach: "Binary search the answer; check feasibility in O(n)." },
  alternatives: [{ approach: "Linear scan over k", time: "O(n * max(piles))", space: "O(1)" }],
  pitfalls: ["Integer overflow in other languages; in JS, ceil division must round up correctly.", "Wrong upper bound (must be max(piles), not sum)."],
  followups: ["Capacity to ship within D days (LC 1011).", "Split array into m subarrays minimizing max sum."],
  signature: { fn: "minEatingSpeed", params: [{ name: "piles", adapt: "identity" }, { name: "h", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function minEatingSpeed(piles: number[], h: number): number {
  let lo = 1, hi = 0;
  for (const p of piles) if (p > hi) hi = p;
  const can = (k: number) => {
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / k);
    return hours <= h;
  };
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (can(m)) hi = m; else lo = m + 1;
  }
  return lo;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { piles: [3,6,7,11], h: 8 } });
    t.push({ name: "example-2", category: "example", input: { piles: [30,11,23,4,20], h: 5 } });
    t.push({ name: "example-3", category: "example", input: { piles: [30,11,23,4,20], h: 6 } });
    t.push({ name: "edge-single-pile", category: "edge", input: { piles: [1000000000], h: 2 } });
    t.push({ name: "edge-h-equals-piles", category: "edge", input: { piles: [3,6,7,11], h: 4 } });
    t.push({ name: "edge-h-very-large", category: "edge", input: { piles: [3,6,7,11], h: 1000000000 } });
    t.push({ name: "edge-all-ones", category: "edge", input: { piles: [1,1,1,1,1], h: 5 } });
    t.push({ name: "edge-all-equal-large", category: "edge", input: { piles: [1000000000,1000000000,1000000000], h: 3 } });
    const r = rng(17);
    const big = Array.from({ length: 10000 }, () => randInt(r, 1, 1_000_000_000));
    t.push({ name: "stress-10k-random-tight-h", category: "stress", input: { piles: big, h: 20000 } });
    t.push({ name: "stress-10k-random-loose-h", category: "stress", input: { piles: big, h: 1_000_000_000 } });
    const big2 = new Array(10000).fill(1_000_000_000);
    t.push({ name: "stress-10k-uniform-max", category: "stress", input: { piles: big2, h: 30000 } });
    return t;
  },
});

// 18. Min Stack
add({
  id: "min-stack",
  number: 115,
  title: "Min Stack",
  difficulty: "Medium",
  categories: ["Stack", "Design"],
  prompt:
    "Design a stack that supports push, pop, top, and retrieving the minimum element in O(1). Implement: push(val), pop(), top() returning the top value, getMin() returning the current minimum.",
  constraints: ["-2^31 <= val <= 2^31 - 1", "Methods pop, top, and getMin are always called on non-empty stacks.", "At most 3 * 10^4 operations."],
  hints: [
    "You need O(1) min retrieval — precompute it.",
    "Maintain a parallel stack of running minimums.",
    "Push the smaller of (val, currentMin); pop both stacks together.",
  ],
  optimal: { time: "O(1) per op", space: "O(n)", approach: "Two stacks: values, and running mins (push min(val, prevMin))." },
  alternatives: [{ approach: "Encode delta with current min", time: "O(1) per op", space: "O(n)", note: "Saves ~half the space." }],
  pitfalls: ["Failing to push to mins on equal values.", "Using one stack and recomputing min on pop (O(n))."],
  followups: ["Max stack.", "Min queue (two-stack queue)."],
  signature: { fn: "minStackOps", params: [{ name: "ops", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class MinStack {
  private vals: number[] = [];
  private mins: number[] = [];
  push(val: number): void {
    this.vals.push(val);
    this.mins.push(this.mins.length === 0 ? val : Math.min(val, this.mins[this.mins.length - 1]));
  }
  pop(): void { this.vals.pop(); this.mins.pop(); }
  top(): number { return this.vals[this.vals.length - 1]; }
  getMin(): number { return this.mins[this.mins.length - 1]; }
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { ops: [["push",-2],["push",0],["push",-3],["getMin"],["pop"],["top"],["getMin"]] } });
    t.push({ name: "edge-single-push", category: "edge", input: { ops: [["push",5],["top"],["getMin"]] } });
    t.push({ name: "edge-monotone-decreasing", category: "edge", input: { ops: [["push",5],["push",4],["push",3],["push",2],["push",1],["getMin"],["pop"],["getMin"],["pop"],["getMin"]] } });
    t.push({ name: "edge-monotone-increasing", category: "edge", input: { ops: [["push",1],["push",2],["push",3],["getMin"],["pop"],["getMin"]] } });
    t.push({ name: "edge-equal-values", category: "edge", input: { ops: [["push",2],["push",2],["push",2],["getMin"],["pop"],["getMin"],["pop"],["getMin"]] } });
    t.push({ name: "edge-negatives-and-zero", category: "edge", input: { ops: [["push",-5],["push",0],["push",-10],["getMin"],["pop"],["getMin"],["pop"],["getMin"]] } });
    t.push({ name: "edge-push-pop-cycles", category: "edge", input: { ops: [["push",1],["pop"],["push",2],["getMin"],["push",-1],["getMin"],["pop"],["getMin"]] } });
    const r = rng(18);
    const ops = [];
    const live = [];
    for (let i = 0; i < 30000; i++) {
      const choice = r();
      if (choice < 0.5 || live.length === 0) {
        const v = randInt(r, -100000, 100000);
        ops.push(["push", v]);
        live.push(v);
      } else if (choice < 0.7) {
        ops.push(["pop"]);
        live.pop();
      } else if (choice < 0.85) {
        ops.push(["top"]);
      } else {
        ops.push(["getMin"]);
      }
    }
    t.push({ name: "stress-30k-mixed", category: "stress", input: { ops } });
    return t;
  },
});

// 19. Evaluate Reverse Polish Notation
add({
  id: "evaluate-reverse-polish-notation",
  number: 50,
  title: "Evaluate Reverse Polish Notation",
  difficulty: "Medium",
  categories: ["Stack", "Math"],
  prompt:
    "Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, /. Each operand is a 32-bit integer or another RPN expression. Division between two integers always truncates toward zero.",
  constraints: [
    "1 <= tokens.length <= 10^4",
    "Each token is +, -, *, /, or an integer in [-200, 200].",
    "Input is always a valid arithmetic expression.",
  ],
  hints: [
    "Push numbers; on operator, pop two, compute, push result.",
    "Order matters for - and / (left then right).",
    "For division, use truncation toward zero, not floor.",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Single pass with a number stack." },
  alternatives: [{ approach: "Recursive parse", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Floor vs truncation for negative division.", "Reversing operand order on - or /.", "Treating all-digit tokens as numbers (forget about leading-minus)."],
  followups: ["Infix → postfix conversion (Shunting-yard)."],
  signature: { fn: "evalRPN", params: [{ name: "tokens", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function evalRPN(tokens: string[]): number {
  const st: number[] = [];
  for (const tok of tokens) {
    if (tok === "+" || tok === "-" || tok === "*" || tok === "/") {
      const b = st.pop()!, a = st.pop()!;
      let v = 0;
      if (tok === "+") v = a + b;
      else if (tok === "-") v = a - b;
      else if (tok === "*") v = a * b;
      else v = Math.trunc(a / b);
      st.push(v);
    } else {
      st.push(parseInt(tok, 10));
    }
  }
  return st[0];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { tokens: ["2","1","+","3","*"] } });
    t.push({ name: "example-2", category: "example", input: { tokens: ["4","13","5","/","+"] } });
    t.push({ name: "example-3", category: "example", input: { tokens: ["10","6","9","3","+","-11","*","/","*","17","+","5","+"] } });
    t.push({ name: "edge-single-num", category: "edge", input: { tokens: ["42"] } });
    t.push({ name: "edge-negative-num", category: "edge", input: { tokens: ["-7"] } });
    t.push({ name: "edge-trunc-toward-zero", category: "edge", input: { tokens: ["7","-2","/"] }, note: "7 / -2 = -3 (toward 0), not -4 (floor)." });
    t.push({ name: "edge-trunc-neg-pos", category: "edge", input: { tokens: ["-7","2","/"] } });
    t.push({ name: "edge-mul-with-zero", category: "edge", input: { tokens: ["100","0","*"] } });
    t.push({ name: "edge-deep-nesting", category: "edge", input: { tokens: ["1","2","+","3","+","4","+","5","+"] } });
    const r = rng(19);
    const big = ["1"];
    for (let i = 0; i < 4999; i++) {
      const v = randInt(r, -200, 200);
      big.push(String(v === 0 ? 1 : v));
      const ops = ["+","-","*","/"];
      big.push(ops[randInt(r, 0, 3)]);
    }
    t.push({ name: "stress-10k-tokens", category: "stress", input: { tokens: big } });
    const adds = ["1"];
    for (let i = 0; i < 4999; i++) { adds.push("1"); adds.push("+"); }
    t.push({ name: "stress-10k-only-add", category: "stress", input: { tokens: adds } });
    return t;
  },
});

// 20. Daily Temperatures
add({
  id: "daily-temperatures",
  number: 40,
  title: "Daily Temperatures",
  difficulty: "Medium",
  categories: ["Stack", "Monotonic Stack", "Array"],
  prompt:
    "Given an array of daily temperatures, return an array `answer` such that answer[i] is the number of days you must wait after day i to get a warmer temperature. If no such day exists, answer[i] = 0.",
  constraints: ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"],
  hints: [
    "Brute force is O(n^2) — too slow.",
    "Use a monotonically decreasing stack of indices.",
    "When today's temp exceeds the index on top, pop and record the difference.",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Monotonic-decreasing stack of indices; each index is pushed/popped at most once." },
  alternatives: [{ approach: "Brute force", time: "O(n^2)", space: "O(1)" }],
  pitfalls: ["Storing temperatures instead of indices (can't compute the gap).", "Forgetting that strictly warmer is required."],
  followups: ["Next greater element (LC 496/503).", "Stock span problem."],
  signature: { fn: "dailyTemperatures", params: [{ name: "temperatures", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function dailyTemperatures(temperatures: number[]): number[] {
  const out = new Array(temperatures.length).fill(0);
  const st: number[] = [];
  for (let i = 0; i < temperatures.length; i++) {
    while (st.length && temperatures[st[st.length - 1]] < temperatures[i]) {
      const j = st.pop()!;
      out[j] = i - j;
    }
    st.push(i);
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { temperatures: [73,74,75,71,69,72,76,73] } });
    t.push({ name: "example-2", category: "example", input: { temperatures: [30,40,50,60] } });
    t.push({ name: "example-3", category: "example", input: { temperatures: [30,60,90] } });
    t.push({ name: "edge-single-day", category: "edge", input: { temperatures: [50] } });
    t.push({ name: "edge-all-same", category: "edge", input: { temperatures: [70,70,70,70,70] } });
    t.push({ name: "edge-decreasing", category: "edge", input: { temperatures: [100,90,80,70,60] } });
    t.push({ name: "edge-increasing", category: "edge", input: { temperatures: [60,70,80,90,100] } });
    t.push({ name: "edge-spike-then-flat", category: "edge", input: { temperatures: [50,50,50,100,50,50,50] } });
    const r = rng(20);
    const big = Array.from({ length: 100000 }, () => randInt(r, 30, 100));
    t.push({ name: "stress-100k-random", category: "stress", input: { temperatures: big } });
    const big2 = Array.from({ length: 100000 }, (_, i) => 30 + (i % 71));
    t.push({ name: "stress-100k-sawtooth", category: "stress", input: { temperatures: big2 } });
    const big3 = Array.from({ length: 100000 }, (_, i) => 100 - (i % 71));
    t.push({ name: "stress-100k-decreasing-blocks", category: "stress", input: { temperatures: big3 } });
    return t;
  },
});

// 21. Largest Rectangle in Histogram
add({
  id: "largest-rectangle-in-histogram",
  number: 84,
  title: "Largest Rectangle in Histogram",
  difficulty: "Hard",
  categories: ["Stack", "Monotonic Stack", "Array"],
  prompt:
    "Given an array `heights` representing the bar heights of a histogram (each bar has width 1), return the area of the largest rectangle that fits entirely inside the histogram.",
  constraints: ["1 <= heights.length <= 10^5", "0 <= heights[i] <= 10^4"],
  hints: [
    "For each bar, the largest rectangle using it as the smallest height extends as far as possible left/right.",
    "Use a monotonic-increasing stack of indices to find the previous and next smaller bars in O(n).",
    "When you pop, the popped bar's range is bounded by the current index and the new top.",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Monotonic stack with sentinel; on each pop, compute area = h * (i - stack.top - 1)." },
  alternatives: [{ approach: "Divide & conquer (segment tree)", time: "O(n log n)", space: "O(n)" }],
  pitfalls: ["Forgetting to flush the stack at the end (or using a sentinel zero height).", "Using the popped height with the wrong width."],
  followups: ["Maximal rectangle in a binary matrix (LC 85)."],
  signature: { fn: "largestRectangleArea", params: [{ name: "heights", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function largestRectangleArea(heights: number[]): number {
  const st: number[] = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (st.length && heights[st[st.length - 1]] > h) {
      const j = st.pop()!;
      const left = st.length ? st[st.length - 1] : -1;
      const area = heights[j] * (i - left - 1);
      if (area > best) best = area;
    }
    st.push(i);
  }
  return best;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { heights: [2,1,5,6,2,3] } });
    t.push({ name: "example-2", category: "example", input: { heights: [2,4] } });
    t.push({ name: "edge-single-bar", category: "edge", input: { heights: [7] } });
    t.push({ name: "edge-zero-bar", category: "edge", input: { heights: [0] } });
    t.push({ name: "edge-all-equal", category: "edge", input: { heights: [3,3,3,3,3] } });
    t.push({ name: "edge-increasing", category: "edge", input: { heights: [1,2,3,4,5,6,7] } });
    t.push({ name: "edge-decreasing", category: "edge", input: { heights: [7,6,5,4,3,2,1] } });
    t.push({ name: "edge-with-zero-in-middle", category: "edge", input: { heights: [4,4,4,0,4,4,4] } });
    t.push({ name: "edge-pyramid", category: "edge", input: { heights: [1,2,3,4,3,2,1] } });
    const r = rng(21);
    const big = Array.from({ length: 100000 }, () => randInt(r, 0, 10000));
    t.push({ name: "stress-100k-random", category: "stress", input: { heights: big } });
    const big2 = Array.from({ length: 100000 }, (_, i) => i + 1);
    t.push({ name: "stress-100k-monotone", category: "stress", input: { heights: big2 } });
    const big3 = new Array(100000).fill(10000);
    t.push({ name: "stress-100k-uniform", category: "stress", input: { heights: big3 } });
    return t;
  },
});

// 22. Generate Parentheses
add({
  id: "generate-parentheses",
  number: 62,
  title: "Generate Parentheses",
  difficulty: "Medium",
  categories: ["Backtracking", "Dynamic Programming", "String"],
  prompt:
    "Given n pairs of parentheses, generate all combinations of well-formed parentheses. Return the result as a list of strings (any order accepted).",
  constraints: ["1 <= n <= 8"],
  hints: [
    "At any prefix, opens used >= closes used.",
    "Recurse with two choices: add '(' if opens < n; add ')' if closes < opens.",
    "The total count is the n-th Catalan number.",
  ],
  optimal: { time: "O(4^n / sqrt(n))", space: "O(4^n / sqrt(n))", approach: "Backtracking with open/close counters." },
  alternatives: [{ approach: "DP on (a, b) catalan-style composition", time: "O(C_n * n)", space: "O(C_n * n)" }],
  pitfalls: ["Allowing closes >= opens leads to invalid sequences.", "Mutating the same string buffer without restoring."],
  followups: ["Valid parentheses given a string.", "Different paren types ([{}])."],
  signature: { fn: "generateParenthesis", params: [{ name: "n", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "sortedArray",
  solutionTs:
`function generateParenthesis(n: number): string[] {
  const out: string[] = [];
  const go = (cur: string, open: number, close: number) => {
    if (cur.length === 2 * n) { out.push(cur); return; }
    if (open < n) go(cur + "(", open + 1, close);
    if (close < open) go(cur + ")", open, close + 1);
  };
  go("", 0, 0);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { n: 1 } });
    t.push({ name: "example-2", category: "example", input: { n: 2 } });
    t.push({ name: "example-3", category: "example", input: { n: 3 } });
    t.push({ name: "edge-n4", category: "edge", input: { n: 4 } });
    t.push({ name: "edge-n5", category: "edge", input: { n: 5 } });
    t.push({ name: "edge-n6", category: "edge", input: { n: 6 } });
    t.push({ name: "stress-n7", category: "stress", input: { n: 7 } });
    t.push({ name: "stress-n8", category: "stress", input: { n: 8 }, note: "1430 strings (8th Catalan)." });
    return t;
  },
});

// 23. Car Fleet
add({
  id: "car-fleet",
  number: 20,
  title: "Car Fleet",
  difficulty: "Medium",
  categories: ["Stack", "Monotonic Stack", "Sorting", "Greedy"],
  prompt:
    "There are n cars at given integer positions on a single-lane road heading to a destination at `target`. Each car drives at speed[i] and never overtakes; if a faster car catches a slower one they form a fleet that moves at the slower car's speed. Return the number of fleets that arrive at the target.",
  constraints: ["n == position.length == speed.length", "1 <= n <= 10^5", "0 < target <= 10^6", "0 <= position[i] < target", "All position[i] are distinct.", "0 < speed[i] <= 10^6"],
  hints: [
    "Sort cars by their starting position descending (closest to target first).",
    "Compute time-to-target for each: (target - pos) / speed.",
    "Walk in order; a car becomes its own fleet only if its time exceeds the current leading fleet's time.",
  ],
  optimal: { time: "O(n log n)", space: "O(n)", approach: "Sort by position descending; count strict-greater times as new fleets." },
  alternatives: [{ approach: "Stack of times", time: "O(n log n)", space: "O(n)", note: "Same idea using an explicit stack." }],
  pitfalls: ["Forgetting that catching up at the destination still merges into one fleet (use >=).", "Not pairing position with speed before sorting."],
  followups: ["Car fleet II — find collision times (LC 1776)."],
  signature: {
    fn: "carFleet",
    params: [
      { name: "target", adapt: "identity" },
      { name: "position", adapt: "identity" },
      { name: "speed", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function carFleet(target: number, position: number[], speed: number[]): number {
  const cars = position.map((p, i) => [p, speed[i]] as [number, number]);
  cars.sort((a, b) => b[0] - a[0]);
  let fleets = 0, lead = 0;
  for (const [p, s] of cars) {
    const time = (target - p) / s;
    if (time > lead) { fleets++; lead = time; }
  }
  return fleets;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { target: 12, position: [10,8,0,5,3], speed: [2,4,1,1,3] } });
    t.push({ name: "example-2", category: "example", input: { target: 10, position: [3], speed: [3] } });
    t.push({ name: "example-3", category: "example", input: { target: 100, position: [0,2,4], speed: [4,2,1] } });
    t.push({ name: "edge-all-merge-into-one", category: "edge", input: { target: 10, position: [0,1,2,3], speed: [1,1,1,1] } });
    t.push({ name: "edge-all-separate-same-speed-spread", category: "edge", input: { target: 1000000, position: [0,1,2,3], speed: [4,3,2,1] } });
    t.push({ name: "edge-fast-behind-catches-up", category: "edge", input: { target: 100, position: [0,5], speed: [10,1] } });
    t.push({ name: "edge-fast-ahead-leaves-slow-behind", category: "edge", input: { target: 100, position: [10,0], speed: [10,1] } });
    t.push({ name: "edge-equal-times-merge", category: "edge", input: { target: 100, position: [0,50], speed: [1,2] }, note: "Both arrive at t=100; merge into one fleet." });
    const r = rng(23);
    const positions = new Set();
    while (positions.size < 1000) positions.add(randInt(r, 0, 999998));
    const pos = Array.from(positions);
    const sp = pos.map(() => randInt(r, 1, 100));
    t.push({ name: "stress-1000-random", category: "stress", input: { target: 1000000, position: pos, speed: sp } });
    const positions2 = new Set();
    while (positions2.size < 100000) positions2.add(randInt(r, 0, 999998));
    const pos2 = Array.from(positions2);
    const sp2 = pos2.map(() => randInt(r, 1, 1000000));
    t.push({ name: "stress-100k-random", category: "stress", input: { target: 1000000, position: pos2, speed: sp2 } });
    return t;
  },
});

// 24. Squares of a Sorted Array
add({
  id: "squares-of-a-sorted-array",
  number: 171,
  title: "Squares of a Sorted Array",
  difficulty: "Easy",
  categories: ["Two Pointers", "Sorting", "Array"],
  prompt:
    "Given an integer array `nums` sorted in non-decreasing order, return an array of the squares of each number, also sorted in non-decreasing order. Solve in O(n).",
  constraints: ["1 <= nums.length <= 10^4", "-10^4 <= nums[i] <= 10^4", "nums is sorted in non-decreasing order."],
  hints: [
    "The largest square comes from one of the two ends.",
    "Two pointers: compare absolute values and write to the back of the result.",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Two pointers from both ends; fill result back-to-front with the larger square." },
  alternatives: [{ approach: "Square then sort", time: "O(n log n)", space: "O(n)" }],
  pitfalls: ["Forgetting that |negative| can exceed |positive|.", "Filling front-to-back leads to O(n log n)."],
  followups: ["Without using extra space (overwrite the input)."],
  signature: { fn: "sortedSquares", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function sortedSquares(nums: number[]): number[] {
  const out = new Array(nums.length);
  let i = 0, j = nums.length - 1, k = nums.length - 1;
  while (i <= j) {
    const a = nums[i] * nums[i], b = nums[j] * nums[j];
    if (a > b) { out[k--] = a; i++; } else { out[k--] = b; j--; }
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [-4,-1,0,3,10] } });
    t.push({ name: "example-2", category: "example", input: { nums: [-7,-3,2,3,11] } });
    t.push({ name: "edge-single-positive", category: "edge", input: { nums: [5] } });
    t.push({ name: "edge-single-negative", category: "edge", input: { nums: [-5] } });
    t.push({ name: "edge-all-negatives", category: "edge", input: { nums: [-9,-7,-3,-1] } });
    t.push({ name: "edge-all-positives", category: "edge", input: { nums: [1,2,3,4,5] } });
    t.push({ name: "edge-zero-included", category: "edge", input: { nums: [-3,-2,-1,0,1,2,3] } });
    t.push({ name: "edge-duplicates", category: "edge", input: { nums: [-2,-2,0,2,2] } });
    const r = rng(24);
    const big = Array.from({ length: 10000 }, () => randInt(r, -10000, 10000)).sort((a, b) => a - b);
    t.push({ name: "stress-10k-random-sorted", category: "stress", input: { nums: big } });
    const big2 = Array.from({ length: 10000 }, (_, i) => -5000 + i);
    t.push({ name: "stress-10k-symmetric", category: "stress", input: { nums: big2 } });
    const big3 = new Array(10000).fill(0);
    t.push({ name: "stress-10k-all-zero", category: "stress", input: { nums: big3 } });
    return t;
  },
});

// 25. Set Matrix Zeroes
add({
  id: "set-matrix-zeroes",
  number: 165,
  title: "Set Matrix Zeroes",
  difficulty: "Medium",
  categories: ["Matrix", "Array", "Hash Table"],
  prompt:
    "Given an m x n integer matrix, if any element is 0, set its entire row and column to 0. Modify the matrix in-place using O(1) extra space.",
  constraints: ["m == matrix.length", "n == matrix[0].length", "1 <= m, n <= 200", "-2^31 <= matrix[i][j] <= 2^31 - 1"],
  hints: [
    "O(m+n) space (a row set and column set) is the easy version.",
    "For O(1) extra, use the first row and first column as flags themselves.",
    "Track separately whether the first row or first column originally contained a zero.",
  ],
  optimal: { time: "O(m*n)", space: "O(1)", approach: "Use first row/column as zero markers; remember firstRowZero and firstColZero separately." },
  alternatives: [{ approach: "Two sets", time: "O(m*n)", space: "O(m+n)" }],
  pitfalls: ["Zeroing the first row before reading its flags.", "Forgetting to handle the original zero status of row 0 / col 0."],
  followups: ["Apply rotations and zeroing in one pass."],
  signature: { fn: "setZeroes", params: [{ name: "matrix", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function setZeroes(matrix: number[][]): number[][] {
  const m = matrix.length, n = matrix[0].length;
  let firstRowZero = false, firstColZero = false;
  for (let j = 0; j < n; j++) if (matrix[0][j] === 0) { firstRowZero = true; break; }
  for (let i = 0; i < m; i++) if (matrix[i][0] === 0) { firstColZero = true; break; }
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      if (matrix[i][j] === 0) { matrix[i][0] = 0; matrix[0][j] = 0; }
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;
  if (firstRowZero) for (let j = 0; j < n; j++) matrix[0][j] = 0;
  if (firstColZero) for (let i = 0; i < m; i++) matrix[i][0] = 0;
  return matrix;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { matrix: [[1,1,1],[1,0,1],[1,1,1]] } });
    t.push({ name: "example-2", category: "example", input: { matrix: [[0,1,2,0],[3,4,5,2],[1,3,1,5]] } });
    t.push({ name: "edge-no-zeros", category: "edge", input: { matrix: [[1,2,3],[4,5,6]] } });
    t.push({ name: "edge-all-zeros", category: "edge", input: { matrix: [[0,0],[0,0]] } });
    t.push({ name: "edge-single-cell-zero", category: "edge", input: { matrix: [[0]] } });
    t.push({ name: "edge-single-cell-nonzero", category: "edge", input: { matrix: [[7]] } });
    t.push({ name: "edge-single-row-with-zero", category: "edge", input: { matrix: [[1,0,3,4]] } });
    t.push({ name: "edge-single-col-with-zero", category: "edge", input: { matrix: [[1],[0],[3],[4]] } });
    t.push({ name: "edge-zero-in-corner", category: "edge", input: { matrix: [[0,1,2],[3,4,5],[6,7,8]] } });
    t.push({ name: "edge-zero-bottom-right", category: "edge", input: { matrix: [[1,2,3],[4,5,6],[7,8,0]] } });
    const r = rng(25);
    const big = [];
    for (let i = 0; i < 200; i++) {
      const row = [];
      for (let j = 0; j < 200; j++) row.push(r() < 0.01 ? 0 : randInt(r, 1, 1000));
      big.push(row);
    }
    t.push({ name: "stress-200x200-sparse-zeros", category: "stress", input: { matrix: big } });
    const big2 = [];
    for (let i = 0; i < 200; i++) {
      const row = new Array(200).fill(1);
      big2.push(row);
    }
    t.push({ name: "stress-200x200-no-zeros", category: "stress", input: { matrix: big2 } });
    const big3 = [];
    for (let i = 0; i < 200; i++) {
      const row = [];
      for (let j = 0; j < 200; j++) row.push(((i + j) % 50 === 0) ? 0 : 5);
      big3.push(row);
    }
    t.push({ name: "stress-200x200-diagonal-zeros", category: "stress", input: { matrix: big3 } });
    return t;
  },
});

