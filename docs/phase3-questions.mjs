// Phase 3 — Linked List cluster (12 problems)

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

export const phase3Questions = [];
function add(q) { phase3Questions.push(q); }

// 1. Reverse Linked List
add({
  id: "reverse-linked-list",
  number: 154,
  title: "Reverse Linked List",
  difficulty: "Easy",
  categories: ["Linked List", "Recursion"],
  prompt:
    "Given the head of a singly linked list, reverse the list and return the new head.",
  constraints: ["The number of nodes is in range [0, 5000].", "-5000 <= Node.val <= 5000"],
  hints: [
    "Use three pointers: prev, cur, next.",
    "Flip cur.next to prev each step, then advance.",
    "A recursive solution exists in O(n) time and O(n) call-stack space.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Iterative pointer reversal." },
  alternatives: [{ approach: "Recursive", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Forgetting to save next before overwriting cur.next.", "Returning the original head instead of prev."],
  followups: ["Reverse a sublist [m, n] (LC 92).", "Reverse in groups of k (LC 25)."],
  signature: { fn: "reverseList", params: [{ name: "head", adapt: "arrayToLinkedList" }], returnAdapt: "linkedListToArray" },
  comparison: "exact",
  solutionTs:
`function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null, cur = head;
  while (cur) {
    const nxt: ListNode | null = cur.next;
    cur.next = prev;
    prev = cur;
    cur = nxt;
  }
  return prev;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { head: [1,2,3,4,5] } });
    t.push({ name: "example-2", category: "example", input: { head: [1,2] } });
    t.push({ name: "edge-empty", category: "edge", input: { head: [] } });
    t.push({ name: "edge-single", category: "edge", input: { head: [7] } });
    t.push({ name: "edge-two", category: "edge", input: { head: [1,2] } });
    t.push({ name: "edge-negatives", category: "edge", input: { head: [-1,-2,-3] } });
    t.push({ name: "edge-duplicates", category: "edge", input: { head: [1,1,1,1] } });
    t.push({ name: "edge-palindrome", category: "edge", input: { head: [1,2,3,2,1] } });
    const r = rng(101);
    t.push({ name: "stress-5000-random", category: "stress", input: { head: Array.from({length:5000},()=>randInt(r,-5000,5000)) } });
    t.push({ name: "stress-5000-monotone", category: "stress", input: { head: Array.from({length:5000},(_,i)=>i) } });
    return t;
  },
});

// 2. Linked List Cycle
add({
  id: "linked-list-cycle",
  number: 89,
  title: "Linked List Cycle",
  difficulty: "Easy",
  categories: ["Linked List", "Two Pointers", "Hash Table"],
  prompt:
    "Given the head of a linked list (represented here as `head` array of node values plus `pos`, the index where the tail's next pointer connects, or -1 for none), determine if the list contains a cycle.",
  constraints: ["0 <= n <= 10^4", "-10^5 <= Node.val <= 10^5", "pos is -1 or a valid index in [0, n)."],
  hints: [
    "Use Floyd's tortoise and hare: slow advances 1, fast advances 2.",
    "If they ever meet, there is a cycle. If fast reaches null, there isn't.",
    "Hash set of visited nodes also works in O(n) time / O(n) space.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Floyd's tortoise and hare." },
  alternatives: [{ approach: "Hash set of visited nodes", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Off-by-one when advancing fast (must check fast && fast.next).", "Comparing values instead of node identities."],
  followups: ["Find the cycle entry node (LC 142).", "Detect cycle length."],
  signature: {
    fn: "hasCycle",
    params: [
      { name: "head", adapt: "identity" },
      { name: "pos", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function hasCycle(head: ListNode | null): boolean {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1-cycle-at-1", category: "example", input: { head: [3,2,0,-4], pos: 1 } });
    t.push({ name: "example-2-cycle-at-0", category: "example", input: { head: [1,2], pos: 0 } });
    t.push({ name: "example-3-no-cycle", category: "example", input: { head: [1], pos: -1 } });
    t.push({ name: "edge-empty", category: "edge", input: { head: [], pos: -1 } });
    t.push({ name: "edge-single-no-cycle", category: "edge", input: { head: [5], pos: -1 } });
    t.push({ name: "edge-single-self-loop", category: "edge", input: { head: [5], pos: 0 } });
    t.push({ name: "edge-cycle-at-tail", category: "edge", input: { head: [1,2,3,4], pos: 3 } });
    t.push({ name: "edge-cycle-at-head", category: "edge", input: { head: [1,2,3,4,5], pos: 0 } });
    const r = rng(102);
    const big = Array.from({length:10000},()=>randInt(r,-100000,100000));
    t.push({ name: "stress-10k-no-cycle", category: "stress", input: { head: big, pos: -1 } });
    t.push({ name: "stress-10k-cycle-mid", category: "stress", input: { head: big, pos: 5000 } });
    t.push({ name: "stress-10k-cycle-near-end", category: "stress", input: { head: big, pos: 9999 } });
    return t;
  },
});

// 3. Linked List Cycle II
add({
  id: "linked-list-cycle-ii",
  number: 90,
  title: "Linked List Cycle II",
  difficulty: "Medium",
  categories: ["Linked List", "Two Pointers", "Hash Table"],
  prompt:
    "Return the index of the node where a cycle begins, or -1 if there is no cycle. The list is given as `head` array plus `pos` (cycle entry index, -1 for none); the answer is the **index** of the cycle's first node.",
  constraints: ["0 <= n <= 10^4", "-10^5 <= Node.val <= 10^5", "pos is -1 or a valid index in [0, n)."],
  hints: [
    "After Floyd's pointers meet, reset one pointer to head and walk both at speed 1; they meet at the cycle entry.",
    "The math: if non-cycle length is a and cycle length is c, the meeting point is at distance a + b from head where a + b ≡ 0 (mod c).",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Floyd's algorithm + reset to head." },
  alternatives: [{ approach: "Hash set of visited nodes", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Returning the meeting node instead of the entry node.", "Not handling fast.next === null (no cycle)."],
  followups: ["Cycle length.", "Remove the cycle (LC 142 follow-up)."],
  signature: {
    fn: "detectCycleIndex",
    params: [
      { name: "head", adapt: "identity" },
      { name: "pos", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function detectCycle(head: ListNode | null): ListNode | null {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) {
      let p = head;
      while (p !== slow) { p = p!.next; slow = slow!.next; }
      return p;
    }
  }
  return null;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { head: [3,2,0,-4], pos: 1 } });
    t.push({ name: "example-2", category: "example", input: { head: [1,2], pos: 0 } });
    t.push({ name: "example-3-no-cycle", category: "example", input: { head: [1], pos: -1 } });
    t.push({ name: "edge-empty", category: "edge", input: { head: [], pos: -1 } });
    t.push({ name: "edge-single-self-loop", category: "edge", input: { head: [9], pos: 0 } });
    t.push({ name: "edge-cycle-at-head", category: "edge", input: { head: [1,2,3,4], pos: 0 } });
    t.push({ name: "edge-cycle-at-tail", category: "edge", input: { head: [1,2,3,4], pos: 3 } });
    t.push({ name: "edge-no-cycle-multi", category: "edge", input: { head: [1,2,3,4,5], pos: -1 } });
    const r = rng(103);
    const big = Array.from({length:10000},()=>randInt(r,-100000,100000));
    t.push({ name: "stress-10k-no-cycle", category: "stress", input: { head: big, pos: -1 } });
    t.push({ name: "stress-10k-cycle-mid", category: "stress", input: { head: big, pos: 4321 } });
    t.push({ name: "stress-10k-cycle-at-1", category: "stress", input: { head: big, pos: 1 } });
    return t;
  },
});

// 4. Middle of the Linked List
add({
  id: "middle-of-the-linked-list",
  number: 114,
  title: "Middle of the Linked List",
  difficulty: "Easy",
  categories: ["Linked List", "Two Pointers"],
  prompt:
    "Given the head of a singly linked list, return the middle node. If there are two middle nodes, return the second one.",
  constraints: ["1 <= n <= 100", "1 <= Node.val <= 100"],
  hints: [
    "Use slow/fast pointers; when fast reaches the end, slow is at the middle.",
    "For two middles, the convention is to return the second — handled automatically by stopping when fast or fast.next is null.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Slow/fast pointers." },
  alternatives: [{ approach: "Count length, then walk to floor(n/2)", time: "O(n)", space: "O(1)" }],
  pitfalls: ["Returning the first of two middles for even-length lists.", "Off-by-one in fast advance check."],
  followups: ["Find the kth-from-middle node."],
  signature: { fn: "middleNode", params: [{ name: "head", adapt: "arrayToLinkedList" }], returnAdapt: "linkedListToArray" },
  comparison: "exact",
  solutionTs:
`function middleNode(head: ListNode | null): ListNode | null {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  return slow;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-odd", category: "example", input: { head: [1,2,3,4,5] } });
    t.push({ name: "example-even", category: "example", input: { head: [1,2,3,4,5,6] } });
    t.push({ name: "edge-single", category: "edge", input: { head: [1] } });
    t.push({ name: "edge-two", category: "edge", input: { head: [1,2] } });
    t.push({ name: "edge-three", category: "edge", input: { head: [1,2,3] } });
    t.push({ name: "edge-four", category: "edge", input: { head: [1,2,3,4] } });
    t.push({ name: "stress-100-odd", category: "stress", input: { head: Array.from({length:99},(_,i)=>i+1) } });
    t.push({ name: "stress-100-even", category: "stress", input: { head: Array.from({length:100},(_,i)=>i+1) } });
    return t;
  },
});

// 5. Palindrome Linked List
add({
  id: "palindrome-linked-list",
  number: 130,
  title: "Palindrome Linked List",
  difficulty: "Easy",
  categories: ["Linked List", "Two Pointers", "Stack", "Recursion"],
  prompt:
    "Given the head of a singly linked list, return true if it is a palindrome (reads the same forward and backward).",
  constraints: ["1 <= n <= 10^5", "0 <= Node.val <= 9"],
  hints: [
    "Copy values into an array and use two pointers — O(n) time and space.",
    "For O(1) extra space, find the middle, reverse the second half, compare, then optionally restore.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Find middle, reverse second half, compare in lockstep." },
  alternatives: [{ approach: "Copy to array + two pointers", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Failing to handle odd-length lists (skip the middle).", "Mutating the list and not restoring it (problem-dependent)."],
  followups: ["Doubly linked list version.", "Streaming variant where you can't go backward."],
  signature: { fn: "isPalindromeList", params: [{ name: "head", adapt: "arrayToLinkedList" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isPalindrome(head: ListNode | null): boolean {
  let slow = head, fast = head;
  while (fast && fast.next) { slow = slow!.next; fast = fast.next.next; }
  let prev: ListNode | null = null, cur = slow;
  while (cur) { const nxt: ListNode | null = cur.next; cur.next = prev; prev = cur; cur = nxt; }
  let a = head, b = prev;
  while (b) {
    if (a!.val !== b.val) return false;
    a = a!.next; b = b.next;
  }
  return true;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { head: [1,2,2,1] } });
    t.push({ name: "example-2-not-palindrome", category: "example", input: { head: [1,2] } });
    t.push({ name: "edge-single", category: "edge", input: { head: [7] } });
    t.push({ name: "edge-two-same", category: "edge", input: { head: [3,3] } });
    t.push({ name: "edge-odd-palindrome", category: "edge", input: { head: [1,2,3,2,1] } });
    t.push({ name: "edge-odd-not", category: "edge", input: { head: [1,2,3,4,1] } });
    t.push({ name: "edge-all-same", category: "edge", input: { head: [5,5,5,5,5,5] } });
    t.push({ name: "edge-only-last-differs", category: "edge", input: { head: [1,2,3,3,2,2] } });
    const r = rng(105);
    const half = Array.from({length:50000},()=>randInt(r,0,9));
    const palin = [...half, ...half.slice().reverse()];
    t.push({ name: "stress-100k-palindrome-even", category: "stress", input: { head: palin } });
    const palinOdd = [...half, randInt(r,0,9), ...half.slice().reverse()];
    t.push({ name: "stress-100k-palindrome-odd", category: "stress", input: { head: palinOdd } });
    const notPalin = [...half, ...half.slice().reverse()];
    notPalin[0] = (notPalin[0] + 1) % 10;
    t.push({ name: "stress-100k-not-palindrome", category: "stress", input: { head: notPalin } });
    return t;
  },
});

// 6. Remove Nth Node From End of List
add({
  id: "remove-nth-node-from-end-of-list",
  number: 149,
  title: "Remove Nth Node From End of List",
  difficulty: "Medium",
  categories: ["Linked List", "Two Pointers"],
  prompt:
    "Given the head of a linked list, remove the nth node from the end and return the head.",
  constraints: ["The list size sz satisfies 1 <= sz <= 30.", "0 <= Node.val <= 100", "1 <= n <= sz"],
  hints: [
    "Use a dummy node so you can remove the head uniformly.",
    "Advance fast by n+1, then move both until fast hits null — slow is at the predecessor.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Two-pointer single pass with dummy node." },
  alternatives: [{ approach: "Count length, walk to size-n", time: "O(n)", space: "O(1)", note: "Two passes." }],
  pitfalls: ["Removing the head without a dummy.", "Off-by-one in the gap between fast and slow."],
  followups: ["Remove all nodes whose values equal x."],
  signature: {
    fn: "removeNthFromEnd",
    params: [
      { name: "head", adapt: "arrayToLinkedList" },
      { name: "n", adapt: "identity" },
    ],
    returnAdapt: "linkedListToArray",
  },
  comparison: "exact",
  solutionTs:
`function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let fast: ListNode | null = dummy, slow: ListNode | null = dummy;
  for (let i = 0; i < n; i++) fast = fast!.next;
  while (fast!.next) { fast = fast!.next; slow = slow!.next; }
  slow!.next = slow!.next!.next;
  return dummy.next;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { head: [1,2,3,4,5], n: 2 } });
    t.push({ name: "example-2-remove-only", category: "example", input: { head: [1], n: 1 } });
    t.push({ name: "example-3-remove-second", category: "example", input: { head: [1,2], n: 1 } });
    t.push({ name: "edge-remove-head", category: "edge", input: { head: [1,2,3], n: 3 } });
    t.push({ name: "edge-remove-tail", category: "edge", input: { head: [1,2,3,4,5], n: 1 } });
    t.push({ name: "edge-remove-middle", category: "edge", input: { head: [1,2,3,4,5], n: 3 } });
    t.push({ name: "edge-two-elements-remove-first", category: "edge", input: { head: [1,2], n: 2 } });
    t.push({ name: "edge-duplicates", category: "edge", input: { head: [1,1,1,1], n: 2 } });
    t.push({ name: "stress-30-remove-tail", category: "stress", input: { head: Array.from({length:30},(_,i)=>i+1), n: 1 } });
    t.push({ name: "stress-30-remove-head", category: "stress", input: { head: Array.from({length:30},(_,i)=>i+1), n: 30 } });
    t.push({ name: "stress-30-remove-mid", category: "stress", input: { head: Array.from({length:30},(_,i)=>i+1), n: 15 } });
    return t;
  },
});

// 7. Reorder List
add({
  id: "reorder-list",
  number: 150,
  title: "Reorder List",
  difficulty: "Medium",
  categories: ["Linked List", "Two Pointers", "Stack"],
  prompt:
    "Given a singly linked list L0 → L1 → … → Ln-1 → Ln, reorder it to L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → … in place.",
  constraints: ["1 <= n <= 5 * 10^4", "1 <= Node.val <= 1000"],
  hints: [
    "Find the middle, reverse the second half, then merge two halves alternately.",
    "Use slow/fast for the middle. Cut the list at slow.next = null after computing middle.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Middle + reverse second half + interleave." },
  alternatives: [{ approach: "Copy to array, two pointers, rebuild links", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Forgetting to terminate the first half (slow.next = null).", "Mis-pairing nodes in the merge."],
  followups: ["Reorder by k (general interleave)."],
  signature: { fn: "reorderList", params: [{ name: "head", adapt: "arrayToLinkedList" }], returnAdapt: "linkedListToArray" },
  comparison: "exact",
  solutionTs:
`function reorderList(head: ListNode | null): void {
  if (!head || !head.next) return;
  let slow = head, fast: ListNode | null = head;
  while (fast.next && fast.next.next) { slow = slow.next!; fast = fast.next.next; }
  let prev: ListNode | null = null, cur: ListNode | null = slow.next;
  slow.next = null;
  while (cur) { const nxt: ListNode | null = cur.next; cur.next = prev; prev = cur; cur = nxt; }
  let a: ListNode | null = head, b = prev;
  while (b) {
    const an: ListNode | null = a!.next, bn: ListNode | null = b.next;
    a!.next = b; b.next = an;
    a = an; b = bn;
  }
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { head: [1,2,3,4] } });
    t.push({ name: "example-2", category: "example", input: { head: [1,2,3,4,5] } });
    t.push({ name: "edge-single", category: "edge", input: { head: [7] } });
    t.push({ name: "edge-two", category: "edge", input: { head: [1,2] } });
    t.push({ name: "edge-three", category: "edge", input: { head: [1,2,3] } });
    t.push({ name: "edge-duplicates", category: "edge", input: { head: [5,5,5,5,5,5] } });
    const r = rng(107);
    t.push({ name: "stress-50k-monotone", category: "stress", input: { head: Array.from({length:50000},(_,i)=>i+1) } });
    t.push({ name: "stress-50k-random", category: "stress", input: { head: Array.from({length:50000},()=>randInt(r,1,1000)) } });
    return t;
  },
});

// 8. Add Two Numbers
add({
  id: "add-two-numbers",
  number: 3,
  title: "Add Two Numbers",
  difficulty: "Medium",
  categories: ["Linked List", "Math", "Recursion"],
  prompt:
    "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each node contains a single digit. Add the two numbers and return the sum as a linked list (also reverse order).",
  constraints: ["1 <= each list length <= 100", "0 <= Node.val <= 9", "Numbers contain no leading zeros except 0 itself."],
  hints: [
    "Walk both lists in lockstep; track a carry.",
    "Continue while either list has nodes or carry is non-zero.",
  ],
  optimal: { time: "O(max(m, n))", space: "O(max(m, n))", approach: "Single pass with carry." },
  alternatives: [{ approach: "Recursive with carry parameter", time: "O(max(m, n))", space: "O(max(m, n))" }],
  pitfalls: ["Forgetting the trailing carry node.", "Skipping the shorter list when one is exhausted."],
  followups: ["Numbers stored in forward order (LC 445).", "Multiplication of two big numbers."],
  signature: {
    fn: "addTwoNumbers",
    params: [
      { name: "l1", adapt: "arrayToLinkedList" },
      { name: "l2", adapt: "arrayToLinkedList" },
    ],
    returnAdapt: "linkedListToArray",
  },
  comparison: "exact",
  solutionTs:
`function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode();
  let cur: ListNode = dummy, carry = 0;
  while (l1 || l2 || carry) {
    const a = l1 ? l1.val : 0;
    const b = l2 ? l2.val : 0;
    const sum = a + b + carry;
    carry = Math.floor(sum / 10);
    cur.next = new ListNode(sum % 10);
    cur = cur.next;
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }
  return dummy.next;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { l1: [2,4,3], l2: [5,6,4] } });
    t.push({ name: "example-2", category: "example", input: { l1: [0], l2: [0] } });
    t.push({ name: "example-3", category: "example", input: { l1: [9,9,9,9,9,9,9], l2: [9,9,9,9] } });
    t.push({ name: "edge-different-lengths", category: "edge", input: { l1: [1,2,3], l2: [9,9] } });
    t.push({ name: "edge-carry-only", category: "edge", input: { l1: [5], l2: [5] } });
    t.push({ name: "edge-trailing-carry", category: "edge", input: { l1: [9,9,9], l2: [1] } });
    t.push({ name: "edge-one-empty-conceptual", category: "edge", input: { l1: [0], l2: [7,8,9] } });
    const r = rng(108);
    const big1 = Array.from({length:100},()=>randInt(r,0,9)); big1[big1.length-1] ||= 1;
    const big2 = Array.from({length:100},()=>randInt(r,0,9)); big2[big2.length-1] ||= 1;
    t.push({ name: "stress-100-100", category: "stress", input: { l1: big1, l2: big2 } });
    const all9a = new Array(100).fill(9);
    const all9b = new Array(100).fill(9);
    t.push({ name: "stress-100-all-9s", category: "stress", input: { l1: all9a, l2: all9b } });
    t.push({ name: "stress-100-vs-1", category: "stress", input: { l1: all9a, l2: [1] } });
    return t;
  },
});

// 9. Copy List with Random Pointer
add({
  id: "copy-list-with-random-pointer",
  number: 34,
  title: "Copy List with Random Pointer",
  difficulty: "Medium",
  categories: ["Linked List", "Hash Table"],
  prompt:
    "A linked list is given where each node has a `val`, a `next`, and a `random` pointer that may point to any node in the list or to null. Construct a deep copy of the list. Inputs and outputs are represented as `{ vals, randoms }` where `randoms[i]` is the index of node i's random target (or null).",
  constraints: ["0 <= n <= 1000", "-10^4 <= Node.val <= 10^4", "randoms[i] is null or a valid index in [0, n)."],
  hints: [
    "A hash map from original node → clone makes the link-copying trivial.",
    "For O(1) extra space, interleave clones into the original list, set random pointers, then detach.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Interleaved-clone three-pass technique (extra space if you count the output list)." },
  alternatives: [{ approach: "Hash map original→clone", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Setting random pointers before clones exist.", "Failing to detach the original list (mutated input)."],
  followups: ["Doubly linked list with random pointers.", "Graph cloning (LC 133)."],
  signature: { fn: "copyRandomList", params: [{ name: "list", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function copyRandomList(head: NodeR | null): NodeR | null {
  if (!head) return null;
  let cur: NodeR | null = head;
  while (cur) {
    const clone: NodeR = { val: cur.val, next: cur.next, random: null } as NodeR;
    cur.next = clone;
    cur = clone.next;
  }
  cur = head;
  while (cur) {
    if (cur.random) cur.next!.random = cur.random.next;
    cur = cur.next!.next;
  }
  const newHead = head.next;
  cur = head;
  while (cur) {
    const c = cur.next!;
    cur.next = c.next;
    c.next = c.next ? c.next.next : null;
    cur = cur.next;
  }
  return newHead;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { list: { vals: [7,13,11,10,1], randoms: [null,0,4,2,0] } } });
    t.push({ name: "example-2", category: "example", input: { list: { vals: [1,2], randoms: [1,1] } } });
    t.push({ name: "example-3", category: "example", input: { list: { vals: [3,3,3], randoms: [null,0,null] } } });
    t.push({ name: "edge-empty", category: "edge", input: { list: { vals: [], randoms: [] } } });
    t.push({ name: "edge-single-self", category: "edge", input: { list: { vals: [5], randoms: [0] } } });
    t.push({ name: "edge-single-null", category: "edge", input: { list: { vals: [5], randoms: [null] } } });
    t.push({ name: "edge-all-null-randoms", category: "edge", input: { list: { vals: [1,2,3,4,5], randoms: [null,null,null,null,null] } } });
    t.push({ name: "edge-all-point-to-head", category: "edge", input: { list: { vals: [1,2,3,4], randoms: [0,0,0,0] } } });
    const r = rng(109);
    const n = 1000;
    const vals = Array.from({length:n},()=>randInt(r,-10000,10000));
    const randoms = Array.from({length:n},()=> r() < 0.2 ? null : randInt(r,0,n-1));
    t.push({ name: "stress-1000-random", category: "stress", input: { list: { vals, randoms } } });
    return t;
  },
});

// 10. Merge K Sorted Lists
add({
  id: "merge-k-sorted-lists",
  number: 110,
  title: "Merge k Sorted Lists",
  difficulty: "Hard",
  categories: ["Linked List", "Heap / Priority Queue", "Divide & Conquer"],
  prompt:
    "You are given an array of k sorted linked lists. Merge them into one sorted linked list and return it.",
  constraints: ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500", "-10^4 <= Node.val <= 10^4", "Each list is sorted in ascending order.", "Sum of lists[i].length <= 10^4."],
  hints: [
    "A min-heap of k current heads picks the next smallest in O(log k).",
    "Alternatively, pairwise merge in log k rounds (divide & conquer).",
  ],
  optimal: { time: "O(N log k)", space: "O(k)", approach: "Min-heap of k heads." },
  alternatives: [{ approach: "Pairwise divide & conquer merge", time: "O(N log k)", space: "O(1)" }, { approach: "Sequential merge", time: "O(N k)", space: "O(1)" }],
  pitfalls: ["Comparator instability when values are equal — track list index to break ties safely.", "Forgetting to push the next node when popping."],
  followups: ["Merge k sorted iterators (online)."],
  signature: { fn: "mergeKLists", params: [{ name: "lists", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  // Pairwise merge — O(N log k) without a heap.
  const merge2 = (a: ListNode | null, b: ListNode | null): ListNode | null => {
    const d = new ListNode();
    let t = d;
    while (a && b) {
      if (a.val <= b.val) { t.next = a; a = a.next; } else { t.next = b; b = b.next; }
      t = t.next;
    }
    t.next = a ?? b;
    return d.next;
  };
  if (lists.length === 0) return null;
  while (lists.length > 1) {
    const next: Array<ListNode | null> = [];
    for (let i = 0; i < lists.length; i += 2) next.push(merge2(lists[i], lists[i + 1] ?? null));
    lists = next;
  }
  return lists[0];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { lists: [[1,4,5],[1,3,4],[2,6]] } });
    t.push({ name: "example-2-empty", category: "example", input: { lists: [] } });
    t.push({ name: "example-3-list-of-empty", category: "example", input: { lists: [[]] } });
    t.push({ name: "edge-all-empty", category: "edge", input: { lists: [[],[],[]] } });
    t.push({ name: "edge-some-empty", category: "edge", input: { lists: [[1,2,3],[],[4,5]] } });
    t.push({ name: "edge-singletons", category: "edge", input: { lists: [[3],[1],[2],[5],[4]] } });
    t.push({ name: "edge-all-equal", category: "edge", input: { lists: [[1,1,1],[1,1],[1]] } });
    t.push({ name: "edge-negatives", category: "edge", input: { lists: [[-10,-5,0],[-7,-3,5],[-1,1,9]] } });
    const r = rng(110);
    const k = 100;
    const lists1 = [];
    let total = 0;
    for (let i = 0; i < k && total < 10000; i++) {
      const len = Math.min(100, 10000 - total);
      const arr = Array.from({length:len},()=>randInt(r,-10000,10000)).sort((a,b)=>a-b);
      lists1.push(arr);
      total += len;
    }
    t.push({ name: "stress-100-lists-10k-total", category: "stress", input: { lists: lists1 } });
    const lists2 = Array.from({length:1000},(_,i)=> [i]);
    t.push({ name: "stress-1000-singletons", category: "stress", input: { lists: lists2 } });
    const lists3 = Array.from({length:5},()=> Array.from({length:2000},()=>randInt(r,-10000,10000)).sort((a,b)=>a-b));
    t.push({ name: "stress-5-lists-10k-total", category: "stress", input: { lists: lists3 } });
    return t;
  },
});

// 11. Reverse Nodes in K-Group
add({
  id: "reverse-nodes-in-k-group",
  number: 155,
  title: "Reverse Nodes in k-Group",
  difficulty: "Hard",
  categories: ["Linked List", "Recursion"],
  prompt:
    "Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list. Nodes left over at the end (fewer than k) remain in their original order. Use only O(1) extra memory.",
  constraints: ["1 <= n <= 5000", "0 <= Node.val <= 1000", "1 <= k <= n"],
  hints: [
    "Count the length first to know how many full groups exist.",
    "For each full group, reverse k nodes and stitch the boundaries with the previous group's tail.",
  ],
  optimal: { time: "O(n)", space: "O(1)", approach: "Iterative group-by-group reversal with sentinel." },
  alternatives: [{ approach: "Recursive group reversal", time: "O(n)", space: "O(n/k)" }],
  pitfalls: ["Reversing partial trailing groups.", "Losing the next group's pointer mid-reverse."],
  followups: ["Reverse alternate k-groups.", "Swap pairs (LC 24) — k=2."],
  signature: {
    fn: "reverseKGroup",
    params: [
      { name: "head", adapt: "arrayToLinkedList" },
      { name: "k", adapt: "identity" },
    ],
    returnAdapt: "linkedListToArray",
  },
  comparison: "exact",
  solutionTs:
`function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
  let n = 0;
  for (let c = head; c; c = c.next) n++;
  const dummy = new ListNode(0, head);
  let groupPrev: ListNode = dummy;
  while (n >= k) {
    let cur: ListNode | null = groupPrev.next, prev: ListNode | null = null;
    for (let i = 0; i < k; i++) {
      const nxt: ListNode | null = cur!.next;
      cur!.next = prev;
      prev = cur;
      cur = nxt;
    }
    const tail = groupPrev.next!;
    groupPrev.next!.next = cur;
    groupPrev.next = prev;
    groupPrev = tail;
    n -= k;
  }
  return dummy.next;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1-k2", category: "example", input: { head: [1,2,3,4,5], k: 2 } });
    t.push({ name: "example-2-k3", category: "example", input: { head: [1,2,3,4,5], k: 3 } });
    t.push({ name: "edge-k1", category: "edge", input: { head: [1,2,3,4,5], k: 1 } });
    t.push({ name: "edge-k-equals-n", category: "edge", input: { head: [1,2,3,4,5], k: 5 } });
    t.push({ name: "edge-k-greater-than-n", category: "edge", input: { head: [1,2,3], k: 5 } });
    t.push({ name: "edge-single-element", category: "edge", input: { head: [42], k: 1 } });
    t.push({ name: "edge-two-elements-k2", category: "edge", input: { head: [1,2], k: 2 } });
    t.push({ name: "edge-leftover", category: "edge", input: { head: [1,2,3,4,5,6,7], k: 3 } });
    const r = rng(111);
    const big = Array.from({length:5000},()=>randInt(r,0,1000));
    t.push({ name: "stress-5000-k1", category: "stress", input: { head: big, k: 1 } });
    t.push({ name: "stress-5000-k2", category: "stress", input: { head: big, k: 2 } });
    t.push({ name: "stress-5000-k7", category: "stress", input: { head: big, k: 7 } });
    t.push({ name: "stress-5000-k5000", category: "stress", input: { head: big, k: 5000 } });
    return t;
  },
});

// 12. LRU Cache
add({
  id: "lru-cache",
  number: 101,
  title: "LRU Cache",
  difficulty: "Medium",
  categories: ["Hash Table", "Linked List", "Design"],
  prompt:
    "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with capacity, get(key) returning the value or -1, and put(key, value). Each operation must run in O(1). Operations are given as `[[\"LRUCache\", capacity], [\"put\", k, v], [\"get\", k], ...]`; the output is an array with `null` for constructor/put and the returned value for get.",
  constraints: ["1 <= capacity <= 3000", "0 <= key, value <= 10^4", "At most 2 * 10^5 operations."],
  hints: [
    "A doubly linked list maintains usage order; a hash map maps keys to nodes for O(1) lookup.",
    "On get/put, move the touched node to the front (most-recent end).",
    "On overflow during put, drop the tail (least-recent).",
    "JavaScript's Map preserves insertion order — you can simulate the DLL by delete+set.",
  ],
  optimal: { time: "O(1) per op", space: "O(capacity)", approach: "HashMap + doubly linked list (or insertion-ordered Map)." },
  alternatives: [{ approach: "Map with delete+set on touch", time: "O(1) amortized", space: "O(capacity)" }],
  pitfalls: ["Forgetting to update recency on get.", "Evicting before checking the key already exists.", "Not resetting state on a fresh `LRUCache` op."],
  followups: ["LFU Cache (LC 460).", "TTL-based cache."],
  signature: { fn: "lruCacheOps", params: [{ name: "ops", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class LRUCache {
  private cap: number;
  private map = new Map<number, number>();
  constructor(capacity: number) { this.cap = capacity; }
  get(key: number): number {
    if (!this.map.has(key)) return -1;
    const v = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, v);
    return v;
  }
  put(key: number, value: number): void {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.cap) {
      const oldest = this.map.keys().next().value!;
      this.map.delete(oldest);
    }
    this.map.set(key, value);
  }
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { ops: [["LRUCache",2],["put",1,1],["put",2,2],["get",1],["put",3,3],["get",2],["put",4,4],["get",1],["get",3],["get",4]] } });
    t.push({ name: "example-2-cap1", category: "example", input: { ops: [["LRUCache",1],["put",2,1],["get",2],["put",3,2],["get",2],["get",3]] } });
    t.push({ name: "edge-overwrite", category: "edge", input: { ops: [["LRUCache",2],["put",1,1],["put",1,2],["get",1]] } });
    t.push({ name: "edge-get-missing", category: "edge", input: { ops: [["LRUCache",2],["get",1],["put",1,1],["get",2]] } });
    t.push({ name: "edge-eviction-order", category: "edge", input: { ops: [["LRUCache",2],["put",1,1],["put",2,2],["get",1],["put",3,3],["get",2]] } });
    t.push({ name: "edge-cap1-rapid-eviction", category: "edge", input: { ops: [["LRUCache",1],["put",1,1],["put",2,2],["put",3,3],["get",1],["get",2],["get",3]] } });
    const r = rng(112);
    const ops1 = [["LRUCache", 100]];
    for (let i = 0; i < 5000; i++) {
      if (r() < 0.5) ops1.push(["put", randInt(r, 0, 200), randInt(r, 0, 10000)]);
      else ops1.push(["get", randInt(r, 0, 200)]);
    }
    t.push({ name: "stress-5k-ops-cap100", category: "stress", input: { ops: ops1 } });
    const ops2 = [["LRUCache", 3000]];
    for (let i = 0; i < 200000; i++) {
      if (r() < 0.5) ops2.push(["put", randInt(r, 0, 10000), randInt(r, 0, 10000)]);
      else ops2.push(["get", randInt(r, 0, 10000)]);
    }
    t.push({ name: "stress-200k-ops-cap3000", category: "stress", input: { ops: ops2 } });
    return t;
  },
});
