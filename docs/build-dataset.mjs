// Generates docs/index.json and docs/questions/<id>.json with comprehensive
// test suites. Expected outputs are computed by running the reference
// solutions (docs/solutions.mjs) on each test's input. Run:
//   node docs/build-dataset.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ListNode,
  TreeNode,
  adapters,
  comparators,
  deepClone,
  referenceSolutions,
} from "./solutions.mjs";
import { phase2Questions } from "./phase2-questions.mjs";
import { phase3Questions } from "./phase3-questions.mjs";
import { phase4Questions } from "./phase4-questions.mjs";
import { phase5Questions } from "./phase5-questions.mjs";
import { phase6Questions } from "./phase6-questions.mjs";
import { phase7Questions } from "./phase7-questions.mjs";
import { phase8Questions } from "./phase8-questions.mjs";
import { phase9Questions } from "./phase9-questions.mjs";
import { phase10Questions } from "./phase10-questions.mjs";
import { inferCodeTypes } from "./typeInference.mjs";
import { overrides as metadataOverrides } from "./metadata-overrides.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QDIR = resolve(__dirname, "questions");
mkdirSync(QDIR, { recursive: true });

// ---------- deterministic RNG (Mulberry32) ----------
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

// ---------- helpers ----------
function shuffle(arr, r) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Run reference solution on input (after materializing args via param adapters
// and cloning), then convert return value via returnAdapt.
function runReference(slug, signature, input) {
  const fn = referenceSolutions[slug];
  if (!fn) throw new Error(`No reference solution for ${slug}`);
  const args = signature.params.map((p) => {
    const raw = input[p.name];
    const adapt = adapters[p.adapt ?? "identity"];
    return adapt(deepClone(raw));
  });
  const ret = fn(...args);
  const outAdapt = adapters[signature.returnAdapt ?? "identity"];
  return outAdapt(ret);
}

// ---------- Question definitions ----------
// Each entry has the human-facing fields plus a `signature`, `comparison`,
// and `tests(generator)` returning raw {name, category, input, note?} objects;
// expected `output` is filled in by running the reference solution.

const questions = [];

function add(q) { questions.push(q); }

// 1. Two Sum
add({
  id: "two-sum",
  leetcode_number: 1,
  title: "Two Sum",
  difficulty: "Easy",
  categories: ["Array", "Hash Table"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt:
    "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. Each input has exactly one solution, and you may not use the same element twice. Return the answer in any order.",
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Exactly one valid answer exists.",
  ],
  hints: [
    "Brute force checks every pair — can you avoid the inner loop?",
    "For each element x, the partner you need is target - x. How fast can you look that up?",
    "Use a hash map from value → index while you scan once.",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Single-pass hash map of value → index" },
  alternatives: [
    { approach: "Brute force two loops", time: "O(n^2)", space: "O(1)", note: "Acceptable for tiny inputs only." },
    { approach: "Sort + two pointers", time: "O(n log n)", space: "O(n)", note: "Need to keep original indices, so store pairs (value, index) before sorting." },
  ],
  pitfalls: [
    "Inserting into the map before checking causes an element to pair with itself.",
    "Forgetting that values can repeat — keep the first occurrence and look up the partner before inserting.",
  ],
  followups: [
    "What if the array is sorted? (Two pointers, O(1) extra space.)",
    "Return all unique pairs that sum to target.",
    "3Sum / 4Sum generalizations.",
  ],
  signature: {
    fn: "twoSum",
    params: [
      { name: "nums", adapt: "identity" },
      { name: "target", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "sortedArray",
  solutionTs:
`function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    const j = seen.get(need);
    if (j !== undefined) return [j, i];
    seen.set(nums[i], i);
  }
  return [];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [2,7,11,15], target: 9 } });
    t.push({ name: "example-2", category: "example", input: { nums: [3,2,4], target: 6 } });
    t.push({ name: "example-3-duplicates", category: "example", input: { nums: [3,3], target: 6 } });
    t.push({ name: "edge-two-zeros", category: "edge", input: { nums: [0,4,3,0], target: 0 }, note: "Two zeros that pair to 0." });
    t.push({ name: "edge-negatives", category: "edge", input: { nums: [-3,4,3,90], target: 0 }, note: "Negative numbers." });
    t.push({ name: "edge-min-size", category: "edge", input: { nums: [1,2], target: 3 } });
    t.push({ name: "edge-equal-not-same-index", category: "edge", input: { nums: [2,5,5,11], target: 10 }, note: "Two 5s at distinct indices." });
    t.push({ name: "edge-large-values", category: "edge", input: { nums: [1_000_000_000, -1_000_000_000, 7], target: 0 } });
    t.push({ name: "edge-answer-at-end", category: "edge", input: { nums: [1,2,3,4,5,6,7,8,9,11], target: 20 } });
    // stress
    const r = rng(1);
    const big1 = Array.from({ length: 10000 }, (_, i) => i + 1);
    t.push({ name: "stress-10k-end-pair", category: "stress", input: { nums: big1, target: big1[9998] + big1[9999] }, note: "Answer is the last two indices." });
    const big2 = Array.from({ length: 10000 }, () => randInt(r, -1_000_000_000, 1_000_000_000));
    big2[37] = 123456789; big2[8123] = -123456789 + 42; // target = 42
    t.push({ name: "stress-10k-random-with-planted-pair", category: "stress", input: { nums: big2, target: 42 } });
    const big3 = Array.from({ length: 10000 }, (_, i) => -5000 + i);
    t.push({ name: "stress-10k-negatives-to-zero", category: "stress", input: { nums: big3, target: 0 }, note: "Pair -1 and 1 (or similar)." });
    return t;
  },
});

// 2. Best Time to Buy and Sell Stock
add({
  id: "best-time-to-buy-and-sell-stock",
  leetcode_number: 121,
  title: "Best Time to Buy and Sell Stock",
  difficulty: "Easy",
  categories: ["Array", "Dynamic Programming"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt:
    "You are given an array `prices` where `prices[i]` is the price of a given stock on the i-th day. You want to maximize profit by choosing a single day to buy and a different later day to sell. Return the maximum profit; if no profit is possible, return 0.",
  constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
  hints: [
    "You can only sell after you buy — order matters.",
    "At each day, what's the best you can do if you sell today?",
    "Track the minimum price seen so far while scanning once.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "One pass tracking running min and best profit" },
  alternatives: [
    { approach: "Brute force all (i,j) pairs", time: "O(n^2)", space: "O(1)", note: "TLE on large inputs." },
    { approach: "DP with state (held/not held)", time: "O(n)", space: "O(1)", note: "Generalizes to k-transaction variants." },
  ],
  pitfalls: [
    "Returning a negative number when prices only decrease — clamp to 0.",
    "Updating min and profit in the wrong order can let you 'sell before buying'.",
  ],
  followups: [
    "Unlimited transactions (LC 122).",
    "At most k transactions (LC 188).",
    "With cooldown / transaction fee (LC 309 / 714).",
  ],
  signature: {
    fn: "maxProfit",
    params: [{ name: "prices", adapt: "identity" }],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function maxProfit(prices: number[]): number {
  let minPrice = Infinity;
  let best = 0;
  for (const p of prices) {
    if (p < minPrice) minPrice = p;
    else if (p - minPrice > best) best = p - minPrice;
  }
  return best;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-profit", category: "example", input: { prices: [7,1,5,3,6,4] } });
    t.push({ name: "example-no-profit", category: "example", input: { prices: [7,6,4,3,1] } });
    t.push({ name: "edge-single-day", category: "edge", input: { prices: [1] }, note: "Cannot buy and sell." });
    t.push({ name: "edge-flat", category: "edge", input: { prices: [2,2,2,2] } });
    t.push({ name: "edge-min-profit", category: "edge", input: { prices: [1,2] } });
    t.push({ name: "edge-min-after-window", category: "edge", input: { prices: [3,2,6,5,0,3] }, note: "Min appears late — must keep scanning." });
    t.push({ name: "edge-zero-prices", category: "edge", input: { prices: [0,0,0,1] } });
    t.push({ name: "edge-max-prices", category: "edge", input: { prices: [10000, 0, 10000] }, note: "Boundary values." });
    // stress
    const r = rng(2);
    const big1 = Array.from({ length: 100000 }, (_, i) => i + 1); // strictly increasing
    t.push({ name: "stress-100k-monotonic-up", category: "stress", input: { prices: big1 }, note: "Profit = last - first." });
    const big2 = Array.from({ length: 100000 }, (_, i) => 100000 - i); // strictly decreasing
    t.push({ name: "stress-100k-monotonic-down", category: "stress", input: { prices: big2 } });
    const big3 = Array.from({ length: 100000 }, () => randInt(r, 0, 10000));
    t.push({ name: "stress-100k-random", category: "stress", input: { prices: big3 } });
    const big4 = Array.from({ length: 100000 }, (_, i) => (i % 2 === 0 ? 1 : 10000));
    t.push({ name: "stress-100k-zigzag", category: "stress", input: { prices: big4 }, note: "Pair (1, 10000) appears as adjacent — profit = 9999." });
    return t;
  },
});

// 3. Contains Duplicate
add({
  id: "contains-duplicate",
  leetcode_number: 217,
  title: "Contains Duplicate",
  difficulty: "Easy",
  categories: ["Array", "Hash Table", "Sorting"],
  sources: ["Blind 75"],
  prompt: "Given an integer array `nums`, return `true` if any value appears at least twice, and `false` if every element is distinct.",
  constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
  hints: ["A set tracks what you've already seen.", "Or sort and check adjacent equality."],
  optimal: { time: "O(n)", space: "O(n)", approach: "Hash set early-exit" },
  alternatives: [
    { approach: "Sort then scan", time: "O(n log n)", space: "O(1) extra (in-place)", note: "Mutates input." },
    { approach: "Brute force pairs", time: "O(n^2)", space: "O(1)", note: "Too slow." },
  ],
  pitfalls: ["Forgetting to early-exit makes the constant worse for large duplicate-heavy inputs."],
  followups: ["Contains Duplicate II — within distance k (LC 219).", "Contains Duplicate III — within value distance t (LC 220)."],
  signature: { fn: "containsDuplicate", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-true", category: "example", input: { nums: [1,2,3,1] } });
    t.push({ name: "example-false", category: "example", input: { nums: [1,2,3,4] } });
    t.push({ name: "example-many-dups", category: "example", input: { nums: [1,1,1,3,3,4,3,2,4,2] } });
    t.push({ name: "edge-single", category: "edge", input: { nums: [1] } });
    t.push({ name: "edge-negative-dup", category: "edge", input: { nums: [-1,-1] } });
    t.push({ name: "edge-zero-dup", category: "edge", input: { nums: [0,0] } });
    t.push({ name: "edge-large-values", category: "edge", input: { nums: [1_000_000_000, -1_000_000_000, 1_000_000_000] } });
    // stress
    const big1 = Array.from({ length: 100000 }, (_, i) => i);
    t.push({ name: "stress-100k-all-unique", category: "stress", input: { nums: big1 } });
    const big2 = big1.slice();
    big2.push(99999); // duplicate at end
    t.push({ name: "stress-100k-dup-at-end", category: "stress", input: { nums: big2 } });
    const big3 = big1.slice();
    big3[50000] = 0; // early duplicate (index 0 already has 0)
    t.push({ name: "stress-100k-early-dup", category: "stress", input: { nums: big3 }, note: "Should exit fast." });
    return t;
  },
});

// 4. Valid Anagram
add({
  id: "valid-anagram",
  leetcode_number: 242,
  title: "Valid Anagram",
  difficulty: "Easy",
  categories: ["String", "Hash Table", "Sorting"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
  constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
  hints: ["Different lengths can never be anagrams.", "Count character frequencies — they must match exactly."],
  optimal: { time: "O(n)", space: "O(1)", approach: "Fixed-size 26-letter count array" },
  alternatives: [
    { approach: "Sort and compare", time: "O(n log n)", space: "O(n)", note: "Simpler but slower." },
    { approach: "Hash map counter", time: "O(n)", space: "O(k)", note: "Generalizes to Unicode." },
  ],
  pitfalls: [
    "Assuming ASCII-only without checking — the Unicode follow-up breaks the 26-array.",
    "Skipping the length check leads to false positives when one is a prefix-multiset of the other.",
  ],
  followups: ["Generalize to Unicode (use a Map).", "Group Anagrams (LC 49)."],
  signature: { fn: "isAnagram", params: [{ name: "s" }, { name: "t" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  const a = "a".charCodeAt(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - a]++;
    count[t.charCodeAt(i) - a]--;
  }
  return count.every(c => c === 0);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-true", category: "example", input: { s: "anagram", t: "nagaram" } });
    t.push({ name: "example-false", category: "example", input: { s: "rat", t: "car" } });
    t.push({ name: "edge-single-char", category: "edge", input: { s: "a", t: "a" } });
    t.push({ name: "edge-different-length", category: "edge", input: { s: "a", t: "ab" } });
    t.push({ name: "edge-same-letters-diff-counts", category: "edge", input: { s: "aacc", t: "ccac" } });
    t.push({ name: "edge-full-alphabet", category: "edge", input: { s: "abcdefghijklmnopqrstuvwxyz", t: "zyxwvutsrqponmlkjihgfedcba" } });
    // stress
    const r = rng(4);
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const big = Array.from({ length: 50000 }, () => letters[Math.floor(r() * 26)]).join("");
    const bigShuffled = shuffle(big.split(""), rng(5)).join("");
    t.push({ name: "stress-50k-shuffle-true", category: "stress", input: { s: big, t: bigShuffled } });
    t.push({ name: "stress-50k-off-by-one-false", category: "stress", input: { s: "a".repeat(49999) + "b", t: "a".repeat(49999) + "c" } });
    t.push({ name: "stress-50k-equal", category: "stress", input: { s: "a".repeat(50000), t: "a".repeat(50000) } });
    return t;
  },
});

// 5. Valid Parentheses
add({
  id: "valid-parentheses",
  leetcode_number: 20,
  title: "Valid Parentheses",
  difficulty: "Easy",
  categories: ["String", "Stack"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt:
    "Given a string `s` containing only the characters `()[]{}`, determine if the input string is valid.",
  constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only: ()[]{}"],
  hints: [
    "Process characters left to right; you only need to remember unmatched opens.",
    "A stack pairs each closing bracket with the most recent open of matching type.",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Stack of expected closing brackets" },
  alternatives: [{ approach: "Repeatedly remove `()`, `[]`, `{}` substrings", time: "O(n^2)", space: "O(n)", note: "Cute but slow." }],
  pitfalls: [
    "Forgetting the final empty-stack check leaves '(((' as 'true'.",
    "Popping when the stack is empty must count as a mismatch.",
  ],
  followups: ["Longest Valid Parentheses (LC 32).", "Generate Parentheses (LC 22).", "Minimum insertions to balance (LC 921 / 1541)."],
  signature: { fn: "isValid", params: [{ name: "s" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isValid(s: string): boolean {
  const match: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else {
      if (stack.pop() !== match[ch]) return false;
    }
  }
  return stack.length === 0;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-simple", category: "example", input: { s: "()" } });
    t.push({ name: "example-mixed", category: "example", input: { s: "()[]{}" } });
    t.push({ name: "example-mismatch", category: "example", input: { s: "(]" } });
    t.push({ name: "example-crossed", category: "example", input: { s: "([)]" } });
    t.push({ name: "example-nested", category: "example", input: { s: "{[]}" } });
    t.push({ name: "edge-only-open", category: "edge", input: { s: "(" } });
    t.push({ name: "edge-only-close", category: "edge", input: { s: "]" } });
    t.push({ name: "edge-many-opens", category: "edge", input: { s: "((((((((((" } });
    t.push({ name: "edge-deep-nest", category: "edge", input: { s: "{[()()]}" } });
    t.push({ name: "edge-close-then-open", category: "edge", input: { s: ")(" } });
    // stress
    t.push({ name: "stress-5k-balanced-deeply-nested", category: "stress", input: { s: "(".repeat(5000) + ")".repeat(5000) } });
    t.push({ name: "stress-10k-all-opens-fail", category: "stress", input: { s: "(".repeat(10000) } });
    t.push({ name: "stress-10k-flat-pairs", category: "stress", input: { s: "()".repeat(5000) } });
    t.push({ name: "stress-10k-mixed-balanced", category: "stress", input: { s: "({[]})".repeat(1666) + "()" } });
    return t;
  },
});

// 6. Merge Two Sorted Lists
add({
  id: "merge-two-sorted-lists",
  leetcode_number: 21,
  title: "Merge Two Sorted Lists",
  difficulty: "Easy",
  categories: ["Linked List", "Recursion"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt:
    "You are given the heads of two sorted singly linked lists. Splice them into one sorted list and return the head.",
  constraints: ["0 <= number of nodes in each list <= 50", "-100 <= Node.val <= 100", "Both lists are sorted in non-decreasing order."],
  hints: ["Walk both lists with two pointers, always taking the smaller head.", "A dummy/sentinel head removes the special case for the first node."],
  optimal: { time: "O(n + m)", space: "O(1)", approach: "Iterative merge with sentinel node" },
  alternatives: [{ approach: "Recursive merge", time: "O(n + m)", space: "O(n + m) stack", note: "Elegant; risks stack overflow on long lists." }],
  pitfalls: [
    "Forgetting to attach the remaining tail of the non-empty list.",
    "Using `<` instead of `<=` is fine for this problem but matters for stability in variants.",
  ],
  followups: ["Merge k Sorted Lists (LC 23).", "Merge sorted arrays in place (LC 88)."],
  signature: {
    fn: "mergeTwoLists",
    params: [
      { name: "list1", adapt: "arrayToLinkedList" },
      { name: "list2", adapt: "arrayToLinkedList" },
    ],
    returnAdapt: "linkedListToArray",
  },
  comparison: "exact",
  solutionTs:
`class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) { this.val = val; this.next = next; }
}

function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy = new ListNode();
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
    else { tail.next = list2; list2 = list2.next; }
    tail = tail.next!;
  }
  tail.next = list1 ?? list2;
  return dummy.next;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { list1: [1,2,4], list2: [1,3,4] } });
    t.push({ name: "example-both-empty", category: "example", input: { list1: [], list2: [] } });
    t.push({ name: "example-one-empty", category: "example", input: { list1: [], list2: [0] } });
    t.push({ name: "edge-all-duplicates", category: "edge", input: { list1: [1,1,1], list2: [1,1] } });
    t.push({ name: "edge-negatives", category: "edge", input: { list1: [-5,-3,0], list2: [-2,1] } });
    t.push({ name: "edge-one-much-longer", category: "edge", input: { list1: [5], list2: [1,2,3] } });
    t.push({ name: "edge-disjoint-ranges", category: "edge", input: { list1: [-100,-99,-98], list2: [98,99,100] } });
    t.push({ name: "edge-interleave", category: "edge", input: { list1: [1,3,5,7,9], list2: [2,4,6,8,10] } });
    // stress (within constraints: 50 each)
    const a = Array.from({ length: 50 }, (_, i) => -100 + i*2);
    const b = Array.from({ length: 50 }, (_, i) => -99 + i*2);
    t.push({ name: "stress-50-50-interleave", category: "stress", input: { list1: a, list2: b } });
    const c = Array.from({ length: 50 }, () => 0);
    t.push({ name: "stress-50-50-all-zero", category: "stress", input: { list1: c, list2: c.slice() } });
    return t;
  },
});

// 7. Invert Binary Tree
add({
  id: "invert-binary-tree",
  leetcode_number: 226,
  title: "Invert Binary Tree",
  difficulty: "Easy",
  categories: ["Tree", "DFS", "BFS", "Recursion"],
  sources: ["Blind 75", "Grind 75"],
  prompt: "Given the root of a binary tree, invert the tree (mirror it left-right) and return its root.",
  constraints: ["The number of nodes is in the range [0, 100].", "-100 <= Node.val <= 100"],
  hints: ["Inversion = swap left and right at every node.", "Recursion mirrors the tree's structure naturally; iterative BFS/DFS works too."],
  optimal: { time: "O(n)", space: "O(h)", approach: "Recursive swap (h = tree height)" },
  alternatives: [{ approach: "Iterative BFS with a queue", time: "O(n)", space: "O(w)", note: "Avoids recursion stack; w = max width." }],
  pitfalls: ["Swapping pointers after recursing into the now-swapped child can double-invert one side."],
  followups: ["Symmetric Tree (LC 101).", "Invert iteratively without recursion."],
  signature: {
    fn: "invertTree",
    params: [{ name: "root", adapt: "arrayToBinaryTree" }],
    returnAdapt: "binaryTreeToLevelOrder",
  },
  comparison: "exact",
  solutionTs:
`class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val; this.left = left; this.right = right;
  }
}

function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  const left = invertTree(root.left);
  const right = invertTree(root.right);
  root.left = right;
  root.right = left;
  return root;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-balanced", category: "example", input: { root: [4,2,7,1,3,6,9] } });
    t.push({ name: "example-small", category: "example", input: { root: [2,1,3] } });
    t.push({ name: "example-empty", category: "example", input: { root: [] } });
    t.push({ name: "edge-single-node", category: "edge", input: { root: [1] } });
    t.push({ name: "edge-left-only", category: "edge", input: { root: [1,2] } });
    t.push({ name: "edge-right-skewed", category: "edge", input: { root: [1,null,2,null,3] } });
    t.push({ name: "edge-left-skewed", category: "edge", input: { root: [1,2,null,3,null] } });
    t.push({ name: "edge-with-negatives", category: "edge", input: { root: [-1,-2,-3,-4,-5,-6,-7] } });
    // stress: full binary tree of depth 7 = 127 nodes (within 100 limit relaxed for stress)
    const buildFull = (depth) => {
      const out = [];
      const total = (1 << depth) - 1;
      for (let i = 0; i < total; i++) out.push(i);
      return out;
    };
    t.push({ name: "stress-100-node-full-ish", category: "stress", input: { root: buildFull(7).slice(0, 100) } });
    return t;
  },
});

// 8. Binary Search
add({
  id: "binary-search",
  leetcode_number: 704,
  title: "Binary Search",
  difficulty: "Easy",
  categories: ["Array", "Binary Search"],
  sources: ["Grind 75", "LeetCode Top Interview 150"],
  prompt:
    "Given a sorted (ascending) array of distinct integers `nums` and a `target`, return the index of `target` if found, else return -1. Run in O(log n).",
  constraints: ["1 <= nums.length <= 10^4", "-10^4 <= nums[i], target <= 10^4", "All values are unique."],
  hints: ["Halve the search interval each step.", "Use inclusive bounds [lo, hi] and compute mid carefully."],
  optimal: { time: "O(log n)", space: "O(1)", approach: "Iterative binary search with inclusive bounds" },
  alternatives: [
    { approach: "Recursive binary search", time: "O(log n)", space: "O(log n)", note: "Same logic, extra stack." },
    { approach: "Linear scan", time: "O(n)", space: "O(1)", note: "Doesn't satisfy the time constraint." },
  ],
  pitfalls: [
    "Using `lo < hi` with inclusive `hi = n-1` skips the last comparison.",
    "Updating bounds to `mid` instead of `mid ± 1` can infinite-loop.",
  ],
  followups: [
    "First/last occurrence in a sorted array with duplicates.",
    "Search Insert Position (LC 35).",
    "Search in Rotated Sorted Array (LC 33).",
  ],
  signature: { fn: "search", params: [{ name: "nums" }, { name: "target" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function search(nums: number[], target: number): number {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-found", category: "example", input: { nums: [-1,0,3,5,9,12], target: 9 } });
    t.push({ name: "example-not-found", category: "example", input: { nums: [-1,0,3,5,9,12], target: 2 } });
    t.push({ name: "edge-single-hit", category: "edge", input: { nums: [5], target: 5 } });
    t.push({ name: "edge-single-miss", category: "edge", input: { nums: [5], target: -5 } });
    t.push({ name: "edge-target-at-start", category: "edge", input: { nums: [1,2,3,4,5], target: 1 } });
    t.push({ name: "edge-target-at-end", category: "edge", input: { nums: [1,2,3,4,5], target: 5 } });
    t.push({ name: "edge-below-min", category: "edge", input: { nums: [-10000, 0, 10000], target: -10001 } });
    t.push({ name: "edge-above-max", category: "edge", input: { nums: [-10000, 0, 10000], target: 10001 } });
    // stress
    const big = Array.from({ length: 10000 }, (_, i) => -5000 + i);
    t.push({ name: "stress-10k-target-end", category: "stress", input: { nums: big, target: 4999 } });
    t.push({ name: "stress-10k-target-start", category: "stress", input: { nums: big, target: -5000 } });
    t.push({ name: "stress-10k-target-middle", category: "stress", input: { nums: big, target: 0 } });
    t.push({ name: "stress-10k-not-found", category: "stress", input: { nums: big, target: 99999 } });
    return t;
  },
});

// 9. Maximum Subarray
add({
  id: "maximum-subarray",
  leetcode_number: 53,
  title: "Maximum Subarray",
  difficulty: "Medium",
  categories: ["Array", "Dynamic Programming", "Divide & Conquer"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt: "Find the contiguous subarray (containing at least one number) with the largest sum, and return its sum.",
  constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
  hints: ["Define f(i) = best sum ending at i.", "f(i) = max(nums[i], f(i-1) + nums[i]). Track the global max."],
  optimal: { time: "O(n)", space: "O(1)", approach: "Kadane's algorithm" },
  alternatives: [
    { approach: "Divide & Conquer", time: "O(n log n)", space: "O(log n)", note: "Cross-midpoint subarrays." },
    { approach: "Brute force", time: "O(n^2)", space: "O(1)", note: "TLE." },
  ],
  pitfalls: [
    "Initializing best to 0 fails on all-negative inputs — use nums[0].",
    "Resetting cur on negativity instead of using max(...) loses the case where extending is still better.",
  ],
  followups: ["Maximum Product Subarray (LC 152).", "Maximum Circular Subarray Sum (LC 918).", "Return the actual subarray indices."],
  signature: { fn: "maxSubArray", params: [{ name: "nums" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function maxSubArray(nums: number[]): number {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    if (cur > best) best = cur;
  }
  return best;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-classic", category: "example", input: { nums: [-2,1,-3,4,-1,2,1,-5,4] } });
    t.push({ name: "example-single", category: "example", input: { nums: [1] } });
    t.push({ name: "example-positives", category: "example", input: { nums: [5,4,-1,7,8] } });
    t.push({ name: "edge-single-negative", category: "edge", input: { nums: [-1] } });
    t.push({ name: "edge-all-negative", category: "edge", input: { nums: [-2,-1,-3,-4] } });
    t.push({ name: "edge-zeros", category: "edge", input: { nums: [0,0,0] } });
    t.push({ name: "edge-all-positive", category: "edge", input: { nums: [1,2,3,4,5] } });
    t.push({ name: "edge-big-negative-then-positive", category: "edge", input: { nums: [-100, 1, 2, 3] } });
    // stress
    const r = rng(9);
    const big1 = Array.from({ length: 100000 }, () => randInt(r, -10000, 10000));
    t.push({ name: "stress-100k-random", category: "stress", input: { nums: big1 } });
    const big2 = Array.from({ length: 100000 }, () => -10000);
    t.push({ name: "stress-100k-all-negative-min", category: "stress", input: { nums: big2 } });
    const big3 = Array.from({ length: 100000 }, () => 10000);
    t.push({ name: "stress-100k-all-positive-max", category: "stress", input: { nums: big3 } });
    return t;
  },
});

// 10. Product of Array Except Self
add({
  id: "product-of-array-except-self",
  leetcode_number: 238,
  title: "Product of Array Except Self",
  difficulty: "Medium",
  categories: ["Array", "Prefix Sum"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt:
    "Return an array `answer` such that `answer[i]` equals the product of all elements of `nums` except `nums[i]`. Run in O(n) without using division.",
  constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "Any prefix or suffix product fits in a 32-bit integer."],
  hints: [
    "answer[i] = (product of left of i) * (product of right of i).",
    "Compute left products in one pass, then fold right products in a second pass into the same output array.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Two passes (left then right) reusing the output array" },
  alternatives: [
    { approach: "Prefix and suffix arrays", time: "O(n)", space: "O(n)", note: "Clearer; uses extra memory." },
    { approach: "Divide total product by nums[i]", time: "O(n)", space: "O(1)", note: "Forbidden; also breaks on zeros." },
  ],
  pitfalls: [
    "Using division silently fails on zeros and is forbidden.",
    "Treating the output array as 'extra space' — by convention it doesn't count here.",
  ],
  followups: ["Handle integer overflow for arbitrary inputs.", "Same problem allowing division — handle 0/1/many zeros explicitly."],
  signature: { fn: "productExceptSelf", params: [{ name: "nums" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const out = new Array<number>(n);
  out[0] = 1;
  for (let i = 1; i < n; i++) out[i] = out[i - 1] * nums[i - 1];
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-classic", category: "example", input: { nums: [1,2,3,4] } });
    t.push({ name: "example-with-zero", category: "example", input: { nums: [-1,1,0,-3,3] } });
    t.push({ name: "edge-min-size", category: "edge", input: { nums: [2,3] } });
    t.push({ name: "edge-two-zeros", category: "edge", input: { nums: [0,0] } });
    t.push({ name: "edge-single-zero", category: "edge", input: { nums: [0,4,5] } });
    t.push({ name: "edge-all-negative", category: "edge", input: { nums: [-2,-3,-4] } });
    t.push({ name: "edge-mixed-signs", category: "edge", input: { nums: [-1, 1, -1, 1] } });
    t.push({ name: "edge-all-ones", category: "edge", input: { nums: [1,1,1,1,1] } });
    // stress — values constrained so prefix/suffix products stay bounded
    const r = rng(10);
    const big1 = Array.from({ length: 100000 }, () => (r() < 0.5 ? -1 : 1));
    t.push({ name: "stress-100k-pm1", category: "stress", input: { nums: big1 }, note: "Random ±1 keeps products bounded." });
    const big2 = Array.from({ length: 1000 }, (_, i) => (i % 2 === 0 ? 1 : -1));
    t.push({ name: "stress-1k-alternating-signs", category: "stress", input: { nums: big2 } });
    const big3 = Array.from({ length: 1000 }, () => 1);
    big3[500] = 0;
    t.push({ name: "stress-1k-single-zero", category: "stress", input: { nums: big3 } });
    return t;
  },
});

// 11. 3Sum
add({
  id: "3sum",
  leetcode_number: 15,
  title: "3Sum",
  difficulty: "Medium",
  categories: ["Array", "Two Pointers", "Sorting"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt:
    "Return all unique triplets `[a, b, c]` from `nums` such that a + b + c = 0 and indices are distinct. The result must not contain duplicate triplets.",
  constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
  hints: [
    "Sort the array first.",
    "Fix index i, then run two pointers (l, r) on the right side searching for sum = -nums[i].",
    "Skip equal neighbors at i, l, and r to avoid duplicate triplets.",
  ],
  optimal: { time: "O(n^2)", space: "O(1) extra (or O(n) for sort)", approach: "Sort + fix i + two pointers" },
  alternatives: [
    { approach: "Hash set inside O(n^2)", time: "O(n^2)", space: "O(n)", note: "Avoids sorting; deduplication is delicate." },
    { approach: "Brute force triple loop", time: "O(n^3)", space: "O(1)", note: "TLE." },
  ],
  pitfalls: [
    "Skipping duplicates only on i (not on l and r) yields duplicate triplets.",
    "Using a hash set of stringified triplets to dedupe works but is slower and larger.",
  ],
  followups: ["3Sum Closest (LC 16).", "4Sum (LC 18) — generalize recursively.", "Count rather than enumerate triplets."],
  signature: { fn: "threeSum", params: [{ name: "nums" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const out: number[][] = [];
  const n = nums.length;
  for (let i = 0; i < n - 2; i++) {
    if (nums[i] > 0) break;
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = n - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s === 0) {
        out.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l + 1]) l++;
        while (l < r && nums[r] === nums[r - 1]) r--;
        l++; r--;
      } else if (s < 0) l++;
      else r--;
    }
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-classic", category: "example", input: { nums: [-1,0,1,2,-1,-4] } });
    t.push({ name: "example-no-triplet", category: "example", input: { nums: [0,1,1] } });
    t.push({ name: "example-all-zero", category: "example", input: { nums: [0,0,0] } });
    t.push({ name: "edge-many-zeros", category: "edge", input: { nums: [0,0,0,0] } });
    t.push({ name: "edge-dup-roles", category: "edge", input: { nums: [-2,0,1,1,2] } });
    t.push({ name: "edge-no-zero-sum", category: "edge", input: { nums: [1,2,-2,-1] } });
    t.push({ name: "edge-heavy-dups", category: "edge", input: { nums: [-4,-2,-2,-2,0,1,2,2,2,3,3,4,4,6,6] } });
    t.push({ name: "edge-min-size", category: "edge", input: { nums: [0,0,0] } });
    t.push({ name: "edge-large-values", category: "edge", input: { nums: [-100000, 50000, 50000] } });
    // stress — 3Sum can produce O(n^2) triplets; keep ranges sparse to bound output
    const r = rng(11);
    const big1 = Array.from({ length: 1500 }, () => randInt(r, -5000, 5000));
    t.push({ name: "stress-1500-sparse", category: "stress", input: { nums: big1 }, note: "Sparse range bounds the number of triplets." });
    const big2 = Array.from({ length: 600 }, (_, i) => i - 300);
    t.push({ name: "stress-600-distinct-sym", category: "stress", input: { nums: big2 }, note: "Symmetric distinct integers; ~30k triplets." });
    const big3 = Array.from({ length: 3000 }, () => 0);
    t.push({ name: "stress-3000-all-zero", category: "stress", input: { nums: big3 }, note: "Output is the single triplet [0,0,0]." });
    return t;
  },
});

// 12. Longest Substring Without Repeating Characters
add({
  id: "longest-substring-without-repeating-characters",
  leetcode_number: 3,
  title: "Longest Substring Without Repeating Characters",
  difficulty: "Medium",
  categories: ["String", "Sliding Window", "Hash Table"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt: "Given a string `s`, return the length of the longest substring without repeating characters.",
  constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols, and spaces."],
  hints: ["Maintain a window [l, r] of unique characters and slide r forward.", "On a repeat, jump l forward to past the previous occurrence."],
  optimal: { time: "O(n)", space: "O(min(n, Σ))", approach: "Sliding window with last-index map" },
  alternatives: [
    { approach: "Sliding window with set", time: "O(n)", space: "O(Σ)", note: "Shrink l one step at a time." },
    { approach: "Brute force all substrings", time: "O(n^3)", space: "O(Σ)", note: "TLE." },
  ],
  pitfalls: [
    "Setting l = prev + 1 unconditionally moves it backward when the duplicate is outside the window — guard with prev >= l.",
    "Forgetting to update the map for the current character.",
  ],
  followups: ["Longest Substring with At Most K Distinct Characters (LC 340).", "Minimum Window Substring (LC 76)."],
  signature: { fn: "lengthOfLongestSubstring", params: [{ name: "s" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function lengthOfLongestSubstring(s: string): number {
  const lastIdx = new Map<string, number>();
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    const prev = lastIdx.get(c);
    if (prev !== undefined && prev >= l) l = prev + 1;
    lastIdx.set(c, r);
    if (r - l + 1 > best) best = r - l + 1;
  }
  return best;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-abcabcbb", category: "example", input: { s: "abcabcbb" } });
    t.push({ name: "example-bbbbb", category: "example", input: { s: "bbbbb" } });
    t.push({ name: "example-pwwkew", category: "example", input: { s: "pwwkew" } });
    t.push({ name: "edge-empty", category: "edge", input: { s: "" } });
    t.push({ name: "edge-single-space", category: "edge", input: { s: " " } });
    t.push({ name: "edge-all-unique-short", category: "edge", input: { s: "au" } });
    t.push({ name: "edge-old-dup-outside-window", category: "edge", input: { s: "dvdf" } });
    t.push({ name: "edge-with-symbols", category: "edge", input: { s: "!@#$%^&*()" } });
    t.push({ name: "edge-mixed-case", category: "edge", input: { s: "AaBbCc" } });
    // stress
    const r = rng(12);
    const all = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const big1 = Array.from({ length: 50000 }, () => all[Math.floor(r() * all.length)]).join("");
    t.push({ name: "stress-50k-random", category: "stress", input: { s: big1 } });
    t.push({ name: "stress-50k-all-same", category: "stress", input: { s: "a".repeat(50000) } });
    t.push({ name: "stress-50k-cycle", category: "stress", input: { s: "abcdef".repeat(8333).slice(0, 50000) }, note: "Cycle of length 6 → answer is 6." });
    t.push({ name: "stress-all-distinct-256", category: "stress", input: { s: Array.from({ length: 200 }, (_, i) => String.fromCharCode(32 + i)).join("") } });
    return t;
  },
});

// 13. Group Anagrams
add({
  id: "group-anagrams",
  leetcode_number: 49,
  title: "Group Anagrams",
  difficulty: "Medium",
  categories: ["String", "Hash Table", "Sorting"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt: "Group the anagrams together. You may return the answer in any order.",
  constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."],
  hints: ["Anagrams share a canonical signature — pick one.", "Sorting yields a key; or use a 26-length count tuple."],
  optimal: { time: "O(n * k)", space: "O(n * k)", approach: "Bucket by 26-length count signature" },
  alternatives: [{ approach: "Bucket by sorted-string key", time: "O(n * k log k)", space: "O(n * k)", note: "Simpler to write." }],
  pitfalls: [
    "Joining counts without a separator collides 1,12 with 11,2.",
    "For Unicode, the 26-array approach breaks — use a Map signature or sorting.",
  ],
  followups: ["Generalize to Unicode.", "Streaming: maintain anagram groups as new strings arrive."],
  signature: { fn: "groupAnagrams", params: [{ name: "strs" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();
  const a = "a".charCodeAt(0);
  for (const s of strs) {
    const count = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) count[s.charCodeAt(i) - a]++;
    const key = count.join(",");
    const bucket = groups.get(key);
    if (bucket) bucket.push(s);
    else groups.set(key, [s]);
  }
  return Array.from(groups.values());
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-classic", category: "example", input: { strs: ["eat","tea","tan","ate","nat","bat"] } });
    t.push({ name: "example-empty-string", category: "example", input: { strs: [""] } });
    t.push({ name: "example-single", category: "example", input: { strs: ["a"] } });
    t.push({ name: "edge-two-empties", category: "edge", input: { strs: ["",""] } });
    t.push({ name: "edge-single-bigger-group", category: "edge", input: { strs: ["abc","bca","cab","xyz"] } });
    t.push({ name: "edge-same-letters-diff-counts", category: "edge", input: { strs: ["ddddddddddg","dgggggggggg"] }, note: "Must NOT group together." });
    t.push({ name: "edge-all-same", category: "edge", input: { strs: ["abc","abc","abc"] } });
    // stress
    const r = rng(13);
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const big = [];
    for (let i = 0; i < 1000; i++) {
      const len = randInt(r, 1, 10);
      big.push(Array.from({ length: len }, () => letters[Math.floor(r() * 26)]).join(""));
    }
    t.push({ name: "stress-1k-random", category: "stress", input: { strs: big } });
    const big2 = Array.from({ length: 1000 }, (_, i) => "a".repeat(i % 100 + 1));
    t.push({ name: "stress-1k-prefix-pattern", category: "stress", input: { strs: big2 } });
    return t;
  },
});

// 14. Search in Rotated Sorted Array
add({
  id: "search-in-rotated-sorted-array",
  leetcode_number: 33,
  title: "Search in Rotated Sorted Array",
  difficulty: "Medium",
  categories: ["Array", "Binary Search"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt: "Sorted-ascending array of distinct integers possibly rotated; find target index in O(log n) or -1.",
  constraints: ["1 <= nums.length <= 5000", "-10^4 <= nums[i] <= 10^4", "All values are unique."],
  hints: ["At any midpoint one half is fully sorted.", "Decide which half is sorted, then check whether target lies inside it."],
  optimal: { time: "O(log n)", space: "O(1)", approach: "Single-pass binary search exploiting the sorted half" },
  alternatives: [
    { approach: "Find pivot then two binary searches", time: "O(log n)", space: "O(1)", note: "Two clearer stages." },
    { approach: "Linear scan", time: "O(n)", space: "O(1)", note: "Doesn't satisfy the constraint." },
  ],
  pitfalls: [
    "Strict vs. non-strict inequalities matter: nums[lo] <= nums[mid] (not <) handles 2-element ranges.",
    "Variant LC 81 (with duplicates) cannot guarantee O(log n).",
  ],
  followups: ["Find Minimum in Rotated Sorted Array (LC 153).", "With duplicates allowed (LC 81)."],
  signature: { fn: "searchRotated", params: [{ name: "nums" }, { name: "target" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function search(nums: number[], target: number): number {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-found", category: "example", input: { nums: [4,5,6,7,0,1,2], target: 0 } });
    t.push({ name: "example-not-found", category: "example", input: { nums: [4,5,6,7,0,1,2], target: 3 } });
    t.push({ name: "example-single-miss", category: "example", input: { nums: [1], target: 0 } });
    t.push({ name: "edge-single-hit", category: "edge", input: { nums: [1], target: 1 } });
    t.push({ name: "edge-two-elements", category: "edge", input: { nums: [1,3], target: 3 } });
    t.push({ name: "edge-rotated-by-1", category: "edge", input: { nums: [3,1], target: 1 } });
    t.push({ name: "edge-target-at-pivot", category: "edge", input: { nums: [5,1,3], target: 5 } });
    t.push({ name: "edge-target-end-of-left-half", category: "edge", input: { nums: [4,5,6,7,8,1,2,3], target: 8 } });
    t.push({ name: "edge-not-rotated", category: "edge", input: { nums: [1,2,3,4,5,6,7], target: 4 } });
    // stress
    const n = 5000;
    const sorted = Array.from({ length: n }, (_, i) => i - n/2);
    const rotateBy = 1234;
    const rotated = sorted.slice(rotateBy).concat(sorted.slice(0, rotateBy));
    t.push({ name: "stress-5k-rotated-random-target", category: "stress", input: { nums: rotated, target: 1000 } });
    t.push({ name: "stress-5k-rotated-not-found", category: "stress", input: { nums: rotated, target: 99999 } });
    t.push({ name: "stress-5k-rotated-target-min", category: "stress", input: { nums: rotated, target: -n/2 } });
    t.push({ name: "stress-5k-rotated-target-max", category: "stress", input: { nums: rotated, target: n/2 - 1 } });
    return t;
  },
});

// 15. Number of Islands
add({
  id: "number-of-islands",
  leetcode_number: 200,
  title: "Number of Islands",
  difficulty: "Medium",
  categories: ["Matrix", "Graph", "DFS", "BFS", "Union-Find"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt: "Count maximal connected groups of '1's in a 2D grid (4-directional).",
  constraints: ["1 <= m, n <= 300", "grid[i][j] is '0' or '1'."],
  hints: ["Each unvisited land cell starts a new island; flood-fill it before moving on.", "Mark visited cells in place to save space."],
  optimal: { time: "O(m * n)", space: "O(m * n) worst case", approach: "DFS/BFS flood fill, mutating grid" },
  alternatives: [{ approach: "Union-Find on land cells", time: "O(m*n * α)", space: "O(m*n)", note: "Useful for streaming variants like LC 305." }],
  pitfalls: ["Recursive DFS can stack-overflow on a 300x300 all-1 grid; switch to iterative BFS for safety.", "Counting diagonal neighbors as connected (problem says they're not)."],
  followups: ["Number of Islands II (LC 305) — dynamic, use Union-Find.", "Max Area of Island (LC 695)."],
  signature: { fn: "numIslands", params: [{ name: "grid" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function numIslands(grid: string[][]): number {
  const m = grid.length, n = grid[0].length;
  let count = 0;
  const dfs = (r: number, c: number): void => {
    if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] !== "1") return;
    grid[r][c] = "0";
    dfs(r + 1, c); dfs(r - 1, c);
    dfs(r, c + 1); dfs(r, c - 1);
  };
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-one-island", category: "example", input: { grid: [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]] } });
    t.push({ name: "example-three-islands", category: "example", input: { grid: [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]] } });
    t.push({ name: "edge-all-water", category: "edge", input: { grid: [["0"]] } });
    t.push({ name: "edge-single-land", category: "edge", input: { grid: [["1"]] } });
    t.push({ name: "edge-1xN-alternating", category: "edge", input: { grid: [["1","0","1","0","1"]] } });
    t.push({ name: "edge-Nx1-all-land", category: "edge", input: { grid: [["1"],["1"],["1"]] } });
    t.push({ name: "edge-diagonal-not-connected", category: "edge", input: { grid: [["1","0","1"],["0","1","0"],["1","0","1"]] }, note: "5 islands — diagonals don't connect." });
    // stress
    const big = Array.from({ length: 100 }, (_, r) =>
      Array.from({ length: 100 }, (_, c) => ((r + c) % 2 === 0 ? "1" : "0"))
    );
    t.push({ name: "stress-100x100-checker", category: "stress", input: { grid: big }, note: "Each '1' is its own island." });
    const allLand = Array.from({ length: 200 }, () => Array.from({ length: 200 }, () => "1"));
    t.push({ name: "stress-200x200-all-land", category: "stress", input: { grid: allLand } });
    const allWater = Array.from({ length: 300 }, () => Array.from({ length: 300 }, () => "0"));
    t.push({ name: "stress-300x300-all-water", category: "stress", input: { grid: allWater } });
    return t;
  },
});

// 16. Course Schedule
add({
  id: "course-schedule",
  leetcode_number: 207,
  title: "Course Schedule",
  difficulty: "Medium",
  categories: ["Graph", "BFS", "DFS", "Topological Sort"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt: "Given numCourses and a list of [a, b] meaning b is a prerequisite for a, can you finish all courses (i.e., is the graph acyclic)?",
  constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000", "All prerequisite pairs are unique."],
  hints: ["Detect a cycle in a directed graph.", "Kahn's algorithm: peel zero-indegree nodes.", "DFS alternative: 3-color marking."],
  optimal: { time: "O(V + E)", space: "O(V + E)", approach: "Kahn's algorithm (BFS topological sort)" },
  alternatives: [{ approach: "DFS with 3-color cycle detection", time: "O(V + E)", space: "O(V + E)", note: "Recursion depth risk on huge graphs." }],
  pitfalls: [
    "Reversing the edge direction relative to the problem statement gives the wrong topo order.",
    "queue.shift() is O(n) in JS — use an index pointer for true O(V+E).",
  ],
  followups: ["Course Schedule II (LC 210) — return an actual ordering.", "Course Schedule IV (LC 1462) — reachability queries."],
  signature: { fn: "canFinish", params: [{ name: "numCourses" }, { name: "prerequisites" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    indeg[a]++;
  }
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) queue.push(i);
  let head = 0, taken = 0;
  while (head < queue.length) {
    const u = queue[head++];
    taken++;
    for (const v of adj[u]) {
      if (--indeg[v] === 0) queue.push(v);
    }
  }
  return taken === numCourses;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-true", category: "example", input: { numCourses: 2, prerequisites: [[1,0]] } });
    t.push({ name: "example-cycle", category: "example", input: { numCourses: 2, prerequisites: [[1,0],[0,1]] } });
    t.push({ name: "edge-no-prereqs", category: "edge", input: { numCourses: 1, prerequisites: [] } });
    t.push({ name: "edge-three-cycle", category: "edge", input: { numCourses: 3, prerequisites: [[0,1],[1,2],[2,0]] } });
    t.push({ name: "edge-diamond-dag", category: "edge", input: { numCourses: 4, prerequisites: [[1,0],[2,0],[3,1],[3,2]] } });
    t.push({ name: "edge-disconnected", category: "edge", input: { numCourses: 5, prerequisites: [] } });
    t.push({ name: "edge-self-loop", category: "edge", input: { numCourses: 2, prerequisites: [[0,0]] }, note: "Self-edge is a cycle." });
    // stress
    const N = 2000;
    const chain = [];
    for (let i = 1; i < N; i++) chain.push([i, i - 1]);
    t.push({ name: "stress-2k-chain-dag", category: "stress", input: { numCourses: N, prerequisites: chain } });
    const cycle = chain.slice();
    cycle.push([0, N - 1]);
    t.push({ name: "stress-2k-chain-cycle", category: "stress", input: { numCourses: N, prerequisites: cycle } });
    // dense random DAG: edges only from lower to higher index
    const r = rng(16);
    const dense = [];
    const seen = new Set();
    while (dense.length < 5000) {
      const a = randInt(r, 0, N - 1);
      const b = randInt(r, 0, N - 1);
      if (a === b) continue;
      const lo = Math.min(a, b), hi = Math.max(a, b);
      const key = `${hi}-${lo}`;
      if (seen.has(key)) continue;
      seen.add(key);
      dense.push([hi, lo]); // hi requires lo (DAG)
    }
    t.push({ name: "stress-dense-dag", category: "stress", input: { numCourses: N, prerequisites: dense } });
    return t;
  },
});

// 17. Coin Change
add({
  id: "coin-change",
  leetcode_number: 322,
  title: "Coin Change",
  difficulty: "Medium",
  categories: ["Dynamic Programming", "Array"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt: "Fewest coins to make `amount` using unlimited copies of denominations in `coins`, or -1 if impossible.",
  constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
  hints: [
    "dp[x] = min coins to make x. Base: dp[0] = 0.",
    "Transition: dp[x] = 1 + min over coin c of dp[x - c] (when x - c >= 0).",
    "Greedy 'always take the largest' does NOT work in general.",
  ],
  optimal: { time: "O(amount * |coins|)", space: "O(amount)", approach: "Bottom-up DP over amounts" },
  alternatives: [
    { approach: "Top-down DFS + memoization", time: "O(amount * |coins|)", space: "O(amount)", note: "Recursion overhead." },
    { approach: "BFS over amounts", time: "O(amount * |coins|)", space: "O(amount)", note: "Level = coin count." },
  ],
  pitfalls: ["Using Infinity then arithmetic is brittle — use amount+1 as sentinel.", "Trying greedy fails on non-canonical coin sets."],
  followups: ["Coin Change II (LC 518) — count combinations.", "Print one optimal combination.", "Bounded knapsack variant."],
  signature: { fn: "coinChange", params: [{ name: "coins" }, { name: "amount" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function coinChange(coins: number[], amount: number): number {
  const INF = amount + 1;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;
  for (let x = 1; x <= amount; x++) {
    for (const c of coins) {
      if (c <= x && dp[x - c] + 1 < dp[x]) dp[x] = dp[x - c] + 1;
    }
  }
  return dp[amount] === INF ? -1 : dp[amount];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-classic", category: "example", input: { coins: [1,2,5], amount: 11 } });
    t.push({ name: "example-impossible", category: "example", input: { coins: [2], amount: 3 } });
    t.push({ name: "example-zero-amount", category: "example", input: { coins: [1], amount: 0 } });
    t.push({ name: "edge-trivial", category: "edge", input: { coins: [1], amount: 1 } });
    t.push({ name: "edge-multiple-uses", category: "edge", input: { coins: [1], amount: 2 } });
    t.push({ name: "edge-mixed-sizes", category: "edge", input: { coins: [2,5,10,1], amount: 27 } });
    t.push({ name: "edge-greedy-fails", category: "edge", input: { coins: [1,3,4], amount: 6 }, note: "Greedy says 4+1+1=3; optimal is 3+3=2." });
    t.push({ name: "edge-large-coins", category: "edge", input: { coins: [186,419,83,408], amount: 6249 } });
    t.push({ name: "edge-coin-larger-than-amount", category: "edge", input: { coins: [10,20,30], amount: 5 } });
    // stress
    t.push({ name: "stress-amount-9999-canonical", category: "stress", input: { coins: [1,5,10,25], amount: 9999 } });
    t.push({ name: "stress-amount-10000-many-coins", category: "stress", input: { coins: [1,2,5,10,20,50,100,200,500,1000], amount: 10000 } });
    t.push({ name: "stress-amount-10000-impossible", category: "stress", input: { coins: [3], amount: 10000 } });
    t.push({ name: "stress-amount-10000-only-large", category: "stress", input: { coins: [137, 251, 499], amount: 10000 } });
    return t;
  },
});

// 18. Word Break
add({
  id: "word-break",
  leetcode_number: 139,
  title: "Word Break",
  difficulty: "Medium",
  categories: ["Dynamic Programming", "String", "Hash Table", "Trie"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt: "Can `s` be segmented into a sequence of dictionary words (reuse allowed)?",
  constraints: ["1 <= s.length <= 300", "1 <= wordDict.length <= 1000", "1 <= wordDict[i].length <= 20", "All strings of wordDict are unique."],
  hints: [
    "dp[i] = can s[0..i) be segmented?",
    "dp[i] = true iff exists j < i with dp[j] true AND s[j..i) in dict.",
    "Use a Set for O(1) lookup; only try suffixes up to maxWordLen.",
  ],
  optimal: { time: "O(n * m)", space: "O(n)", approach: "Bottom-up DP, m = max word length" },
  alternatives: [
    { approach: "Memoized DFS", time: "O(n * m)", space: "O(n)", note: "Cleaner to extend to LC 140." },
    { approach: "BFS over indices", time: "O(n * m)", space: "O(n)", note: "Each index visited once." },
    { approach: "Trie + DP", time: "O(n^2)", space: "O(total chars)", note: "Pays off when dictionary is huge / shares prefixes." },
  ],
  pitfalls: ["Naive recursion without memoization is exponential.", "Forgetting the maxLen cap causes O(n^2) substring work."],
  followups: ["Word Break II (LC 140) — return all valid segmentations.", "Use a Trie for very large dictionaries."],
  signature: { fn: "wordBreak", params: [{ name: "s" }, { name: "wordDict" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function wordBreak(s: string, wordDict: string[]): boolean {
  const dict = new Set(wordDict);
  let maxLen = 0;
  for (const w of wordDict) if (w.length > maxLen) maxLen = w.length;
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= n; i++) {
    for (let j = Math.max(0, i - maxLen); j < i; j++) {
      if (dp[j] && dict.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-leetcode", category: "example", input: { s: "leetcode", wordDict: ["leet","code"] } });
    t.push({ name: "example-applepenapple", category: "example", input: { s: "applepenapple", wordDict: ["apple","pen"] } });
    t.push({ name: "example-cant-segment", category: "example", input: { s: "catsandog", wordDict: ["cats","dog","sand","and","cat"] } });
    t.push({ name: "edge-single-match", category: "edge", input: { s: "a", wordDict: ["a"] } });
    t.push({ name: "edge-suffix-not-in-dict", category: "edge", input: { s: "ab", wordDict: ["a"] } });
    t.push({ name: "edge-multi-segments", category: "edge", input: { s: "aaaaaaa", wordDict: ["aaaa","aaa"] } });
    t.push({ name: "edge-catastrophic-trap", category: "edge", input: { s: "aaaaaaaaaaaaab", wordDict: ["a","aa","aaa","aaaa","aaaaa","aaaaaa","aaaaaaa","aaaaaaaa"] }, note: "Naive recursion TLEs without memoization." });
    // stress
    t.push({ name: "stress-300-as-with-tail-fail", category: "stress", input: { s: "a".repeat(300) + "b", wordDict: ["a","aa","aaa"] } });
    t.push({ name: "stress-300-as-success", category: "stress", input: { s: "a".repeat(300), wordDict: ["a","aa","aaa","aaaa","aaaaa"] } });
    const dict = [];
    for (let i = 0; i < 100; i++) dict.push("a".repeat(i + 1));
    t.push({ name: "stress-300-large-dict", category: "stress", input: { s: "a".repeat(300), wordDict: dict } });
    return t;
  },
});

// 19. Top K Frequent Elements
add({
  id: "top-k-frequent-elements",
  leetcode_number: 347,
  title: "Top K Frequent Elements",
  difficulty: "Medium",
  categories: ["Array", "Hash Table", "Heap / Priority Queue", "Sorting"],
  sources: ["Blind 75", "Grind 75", "LeetCode Top Interview 150"],
  prompt: "Return the k most frequent elements (any order). Better than O(n log n).",
  constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4", "k is in [1, number of unique values]", "Answer is unique."],
  hints: [
    "Count frequencies in a hash map.",
    "Bucket sort by frequency: bucket[f] = list of values with that frequency.",
    "A size-k min-heap gives O(n log k) but bucket sort gives O(n).",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Hash count + bucket sort by frequency" },
  alternatives: [
    { approach: "Min-heap of size k", time: "O(n log k)", space: "O(n)", note: "Easier to write." },
    { approach: "Sort by frequency", time: "O(n log n)", space: "O(n)", note: "Doesn't beat the bar." },
    { approach: "Quickselect", time: "O(n) avg", space: "O(n)", note: "Worst case O(n^2)." },
  ],
  pitfalls: [
    "Allocating buckets for every possible frequency (only [1..n] are reachable).",
    "Returning more than k elements when frequencies tie at the boundary.",
  ],
  followups: ["Top K Frequent Words (LC 692) with lexicographic tie-breaking.", "Streaming top-K (Misra–Gries / Count-Min Sketch)."],
  signature: { fn: "topKFrequent", params: [{ name: "nums" }, { name: "k" }], returnAdapt: "identity" },
  comparison: "sortedArray",
  solutionTs:
`function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);
  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);
  for (const [val, f] of freq) buckets[f].push(val);
  const out: number[] = [];
  for (let f = buckets.length - 1; f >= 0 && out.length < k; f--) {
    for (const v of buckets[f]) {
      out.push(v);
      if (out.length === k) break;
    }
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-classic", category: "example", input: { nums: [1,1,1,2,2,3], k: 2 } });
    t.push({ name: "example-single", category: "example", input: { nums: [1], k: 1 } });
    t.push({ name: "edge-k-equals-unique", category: "edge", input: { nums: [1,2], k: 2 } });
    t.push({ name: "edge-negatives", category: "edge", input: { nums: [4,1,-1,2,-1,2,3], k: 2 } });
    t.push({ name: "edge-large-k", category: "edge", input: { nums: [1,1,2,2,3,3,4,4,5,5], k: 5 } });
    // stress
    const r = rng(19);
    const big = [];
    for (let i = 0; i < 100000; i++) big.push(randInt(r, -100, 100));
    t.push({ name: "stress-100k-narrow-range", category: "stress", input: { nums: big, k: 10 } });
    const big2 = [];
    for (let v = 0; v < 1000; v++) for (let c = 0; c < v + 1; c++) big2.push(v); // freq grows with value
    t.push({ name: "stress-graded-freq", category: "stress", input: { nums: big2, k: 50 } });
    return t;
  },
});

// 20. Trapping Rain Water
add({
  id: "trapping-rain-water",
  leetcode_number: 42,
  title: "Trapping Rain Water",
  difficulty: "Hard",
  categories: ["Array", "Two Pointers", "Stack", "Dynamic Programming", "Monotonic Stack"],
  sources: ["Grind 75", "LeetCode Top Interview 150"],
  prompt: "Given an elevation map (bar widths = 1), compute trapped water after rain.",
  constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
  hints: [
    "Water above i = min(maxLeft, maxRight) - height[i] (clamped at 0).",
    "Two pointers achieves O(1) extra space by always advancing the side with the smaller running max.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Two pointers tracking left/right running max" },
  alternatives: [
    { approach: "Prefix/suffix max arrays", time: "O(n)", space: "O(n)", note: "Easiest to derive." },
    { approach: "Monotonic decreasing stack", time: "O(n)", space: "O(n)", note: "Computes layer-by-layer." },
    { approach: "Brute force per index", time: "O(n^2)", space: "O(1)", note: "TLE." },
  ],
  pitfalls: [
    "Comparing leftMax to rightMax instead of height[l] to height[r] — invariant is on the *current* sides.",
    "Forgetting to update the running max before adding water leads to negative contributions.",
  ],
  followups: ["Trapping Rain Water II (LC 407) — 2D version, requires a min-heap.", "Container With Most Water (LC 11)."],
  signature: { fn: "trap", params: [{ name: "height" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function trap(height: number[]): number {
  let l = 0, r = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      if (height[l] >= leftMax) leftMax = height[l];
      else water += leftMax - height[l];
      l++;
    } else {
      if (height[r] >= rightMax) rightMax = height[r];
      else water += rightMax - height[r];
      r--;
    }
  }
  return water;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-classic", category: "example", input: { height: [0,1,0,2,1,0,1,3,2,1,2,1] } });
    t.push({ name: "example-walls", category: "example", input: { height: [4,2,0,3,2,5] } });
    t.push({ name: "edge-single", category: "edge", input: { height: [0] } });
    t.push({ name: "edge-flat", category: "edge", input: { height: [1,1,1,1] } });
    t.push({ name: "edge-big-trough", category: "edge", input: { height: [5,0,0,0,5] } });
    t.push({ name: "edge-decreasing", category: "edge", input: { height: [3,2,1] } });
    t.push({ name: "edge-increasing", category: "edge", input: { height: [1,2,3] } });
    t.push({ name: "edge-zeros", category: "edge", input: { height: [0,0,0] } });
    t.push({ name: "edge-two-bars", category: "edge", input: { height: [5, 5] } });
    // stress
    const r = rng(20);
    const big1 = Array.from({ length: 20000 }, () => randInt(r, 0, 100000));
    t.push({ name: "stress-20k-random", category: "stress", input: { height: big1 } });
    const big2 = [];
    for (let i = 0; i < 10000; i++) big2.push(i);
    for (let i = 9999; i >= 0; i--) big2.push(i);
    t.push({ name: "stress-20k-pyramid", category: "stress", input: { height: big2 }, note: "No water trapped." });
    const big3 = [];
    big3.push(100000);
    for (let i = 0; i < 19998; i++) big3.push(0);
    big3.push(100000);
    t.push({ name: "stress-20k-canyon", category: "stress", input: { height: big3 }, note: "Massive trough between two walls." });
    return t;
  },
});

// ---------- Build & write ----------

phase2Questions.forEach((q) => questions.push(q));
phase3Questions.forEach((q) => questions.push(q));
phase4Questions.forEach((q) => questions.push(q));
phase5Questions.forEach((q) => questions.push(q));
phase6Questions.forEach((q) => questions.push(q));
phase7Questions.forEach((q) => questions.push(q));
phase8Questions.forEach((q) => questions.push(q));
phase9Questions.forEach((q) => questions.push(q));
phase10Questions.forEach((q) => questions.push(q));

const indexEntries = [];
let totalTests = 0;
for (const q of questions) {
  const rawTests = q.tests();
  const enriched = rawTests.map((t) => {
    const expected = runReference(q.id, q.signature, t.input);
    return { ...t, output: expected };
  });
  totalTests += enriched.length;

  // ---- Schema enrichment for backend code execution ----
  const ov = metadataOverrides[q.id] || {};
  const inferred = inferCodeTypes({ signature: q.signature, tests: enriched });
  // Merge inferred + override types (override wins per language).
  const codeTypes = {
    rust: ov.codeTypes?.rust ?? inferred.rust,
    go:   ov.codeTypes?.go   ?? inferred.go,
  };
  const enrichedSignature = {
    ...q.signature,
    kind: ov.kind ?? "function",
    judgeSource: ov.judgeSource ?? "return",
    ...(ov.numericOverflow ? { numericOverflow: ov.numericOverflow } : {}),
    ...(ov.design ? { design: ov.design } : {}),
    ...(ov.backendUnsupported ? { backendUnsupported: ov.backendUnsupported } : {}),
    codeTypes,
  };

  const file = {
    id: q.id,
    leetcode_number: q.leetcode_number,
    title: q.title,
    difficulty: q.difficulty,
    categories: q.categories,
    sources: q.sources,
    prompt: q.prompt,
    constraints: q.constraints,
    hints: q.hints,
    optimal: q.optimal,
    alternatives: q.alternatives,
    pitfalls: q.pitfalls,
    followups: q.followups,
    signature: enrichedSignature,
    comparison: q.comparison,
    solution: { language: "TypeScript", code: q.solutionTs },
    tests: enriched,
  };

  // Custom serializer: pretty top-level, each test on one compact line.
  // Saves ~10x vs JSON.stringify(file, null, 2) for files with large arrays.
  const { tests, ...meta } = file;
  const metaJson = JSON.stringify(meta, null, 2);
  const testLines = tests.map((t) => "    " + JSON.stringify(t)).join(",\n");
  const body =
    metaJson.slice(0, -2) + // strip trailing "\n}"
    ',\n  "tests": [\n' + testLines + "\n  ]\n}\n";
  const outPath = resolve(QDIR, `${q.id}.json`);
  writeFileSync(outPath, body, "utf8");
}

const indexPath = resolve(__dirname, "index.json");
writeFileSync(
  indexPath,
  JSON.stringify(
    {
      version: 1,
      total: questions.length,
      totalTests,
      items: questions.map((q) => {
        const item = {
          id: q.id,
          leetcode_number: q.leetcode_number,
          title: q.title,
          difficulty: q.difficulty,
          categories: q.categories,
          sources: q.sources,
          file: `questions/${q.id}.json`,
        };
        const ov = metadataOverrides[q.id];
        if (ov?.backendUnsupported) {
          item.backendUnsupported = ov.backendUnsupported;
        }
        return item;
      }),
    },
    null,
    2
  ) + "\n",
  "utf8"
);

console.log(`Wrote ${questions.length} question files (${totalTests} total tests) and index.json`);
