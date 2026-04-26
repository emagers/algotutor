// Phase 4 — Trees & BST cluster (20 problems)

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

// Build a level-order tree array (with nulls for missing children) from a list of values.
// Used to deterministically generate large balanced/skewed test trees.
function balancedBSTArray(n, start = 1) {
  // Returns level-order array of a complete BST holding values 1..n in ascending order.
  // We build a balanced BST recursively then emit level-order with nulls.
  const TreeNode = function(v, l = null, r = null) { this.val = v; this.left = l; this.right = r; };
  const sorted = Array.from({ length: n }, (_, i) => i + start);
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const m = (lo + hi) >> 1;
    return new TreeNode(sorted[m], build(lo, m - 1), build(m + 1, hi));
  };
  const root = build(0, n - 1);
  if (!root) return [];
  const out = [];
  const q = [root];
  while (q.length) {
    const x = q.shift();
    if (x === null) { out.push(null); continue; }
    out.push(x.val);
    q.push(x.left);
    q.push(x.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function leftSkewed(n) {
  // Pure left-skewed tree of values 1..n: root is 1, each node has only a left child = i+1. In level-order form
  // this means node i (0-indexed in our serialization) has left = i*2+1 and right = null. With our level-order
  // adapter (which uses null placeholders only for absent children of nodes already in the queue), the layout is:
  // [1, 2, null, 3, null, 4, null, ...].
  const a = [];
  for (let i = 1; i <= n; i++) {
    a.push(i);
    if (i < n) a.push(null); // every non-leaf has a null right child
  }
  return a;
}

function rightSkewed(n) {
  // Right-skewed: each node has only a right child.
  const a = [];
  for (let i = 1; i <= n; i++) {
    if (i > 1) a.push(null);
    a.push(i);
  }
  return a;
}

export const phase4Questions = [];
function add(q) { phase4Questions.push(q); }

// 1. Maximum Depth of Binary Tree
add({
  id: "maximum-depth-of-binary-tree",
  number: 104,
  title: "Maximum Depth of Binary Tree",
  difficulty: "Easy",
  categories: ["Tree", "DFS", "BFS", "Recursion"],
  prompt:
    "Given the root of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to a leaf.",
  constraints: ["0 <= number of nodes <= 10^4", "-100 <= Node.val <= 100"],
  hints: [
    "Recurse: depth(n) = 1 + max(depth(left), depth(right)).",
    "Iteratively: BFS by levels, count levels.",
  ],
  optimal: { time: "O(n)", space: "O(h)", approach: "DFS recursion." },
  alternatives: [{ approach: "BFS level count", time: "O(n)", space: "O(w)" }],
  pitfalls: ["Counting edges instead of nodes."],
  followups: ["Minimum depth (LC 111)."],
  signature: { fn: "maxDepth", params: [{ name: "root", adapt: "arrayToBinaryTree" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [3,9,20,null,null,15,7] } });
    t.push({ name: "example-2", category: "example", input: { root: [1,null,2] } });
    t.push({ name: "edge-empty", category: "edge", input: { root: [] } });
    t.push({ name: "edge-single", category: "edge", input: { root: [7] } });
    t.push({ name: "edge-balanced", category: "edge", input: { root: [1,2,3,4,5,6,7] } });
    t.push({ name: "stress-balanced-1023", category: "stress", input: { root: balancedBSTArray(1023) } });
    t.push({ name: "stress-leftskew-1000", category: "stress", input: { root: leftSkewed(1000) } });
    t.push({ name: "stress-rightskew-1000", category: "stress", input: { root: rightSkewed(1000) } });
    return t;
  },
});

// 2. Same Tree
add({
  id: "same-tree",
  number: 161,
  title: "Same Tree",
  difficulty: "Easy",
  categories: ["Tree", "DFS", "BFS"],
  prompt:
    "Given the roots of two binary trees p and q, return true if they are structurally identical and the nodes have the same values.",
  constraints: ["0 <= n <= 100", "-10^4 <= Node.val <= 10^4"],
  hints: [
    "Recurse on both trees in lockstep.",
    "Both null → equal; one null → not equal; values differ → not equal.",
  ],
  optimal: { time: "O(n)", space: "O(h)", approach: "Parallel DFS." },
  alternatives: [{ approach: "Serialize and compare strings", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Returning true when only one is null."],
  followups: ["Subtree of another tree (LC 572)."],
  signature: {
    fn: "isSameTree",
    params: [
      { name: "p", adapt: "arrayToBinaryTree" },
      { name: "q", adapt: "arrayToBinaryTree" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  if (!p && !q) return true;
  if (!p || !q) return false;
  if (p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { p: [1,2,3], q: [1,2,3] } });
    t.push({ name: "example-2", category: "example", input: { p: [1,2], q: [1,null,2] } });
    t.push({ name: "example-3", category: "example", input: { p: [1,2,1], q: [1,1,2] } });
    t.push({ name: "edge-both-empty", category: "edge", input: { p: [], q: [] } });
    t.push({ name: "edge-one-empty", category: "edge", input: { p: [1], q: [] } });
    t.push({ name: "edge-deep-equal", category: "edge", input: { p: [1,2,null,3,null,4], q: [1,2,null,3,null,4] } });
    t.push({ name: "edge-value-mismatch", category: "edge", input: { p: [1,2,3,4,5], q: [1,2,3,4,6] } });
    const bal = balancedBSTArray(1023);
    t.push({ name: "stress-1023-equal", category: "stress", input: { p: bal, q: bal.slice() } });
    const bal2 = bal.slice();
    bal2[bal2.length - 1] = (bal2[bal2.length - 1] === null ? 0 : bal2[bal2.length - 1]) + 1;
    t.push({ name: "stress-1023-last-differs", category: "stress", input: { p: bal, q: bal2 } });
    return t;
  },
});

// 3. Symmetric Tree
add({
  id: "symmetric-tree",
  number: 178,
  title: "Symmetric Tree",
  difficulty: "Easy",
  categories: ["Tree", "DFS", "BFS"],
  prompt:
    "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
  constraints: ["1 <= n <= 1000", "-100 <= Node.val <= 100"],
  hints: [
    "A tree is symmetric iff its left and right subtrees mirror each other.",
    "Recurse with two pointers a, b. Compare a.left with b.right and a.right with b.left.",
  ],
  optimal: { time: "O(n)", space: "O(h)", approach: "DFS mirror." },
  alternatives: [{ approach: "BFS level by level", time: "O(n)", space: "O(w)" }],
  pitfalls: ["Comparing values without mirroring children."],
  followups: ["Detect axes of symmetry."],
  signature: { fn: "isSymmetric", params: [{ name: "root", adapt: "arrayToBinaryTree" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isSymmetric(root: TreeNode | null): boolean {
  const mirror = (a: TreeNode | null, b: TreeNode | null): boolean => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.val !== b.val) return false;
    return mirror(a.left, b.right) && mirror(a.right, b.left);
  };
  return !root || mirror(root.left, root.right);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [1,2,2,3,4,4,3] } });
    t.push({ name: "example-2-asymmetric", category: "example", input: { root: [1,2,2,null,3,null,3] } });
    t.push({ name: "edge-empty", category: "edge", input: { root: [] } });
    t.push({ name: "edge-single", category: "edge", input: { root: [1] } });
    t.push({ name: "edge-pair-equal", category: "edge", input: { root: [1,2,2] } });
    t.push({ name: "edge-pair-unequal", category: "edge", input: { root: [1,2,3] } });
    t.push({ name: "edge-deep-symmetric", category: "edge", input: { root: [1,2,2,3,4,4,3,5,6,7,8,8,7,6,5] } });
    t.push({ name: "edge-value-symmetric-shape-not", category: "edge", input: { root: [1,2,2,2,null,2] } });
    return t;
  },
});

// 4. Diameter of Binary Tree
add({
  id: "diameter-of-binary-tree",
  number: 46,
  title: "Diameter of Binary Tree",
  difficulty: "Easy",
  categories: ["Tree", "DFS"],
  prompt:
    "Given the root of a binary tree, return the length (in edges) of the longest path between any two nodes. The path may or may not pass through the root.",
  constraints: ["1 <= n <= 10^4", "-100 <= Node.val <= 100"],
  hints: [
    "At each node, the longest path through it equals depth(left) + depth(right).",
    "Track the global max while computing depths post-order.",
  ],
  optimal: { time: "O(n)", space: "O(h)", approach: "Post-order DFS returning depth, updating max with l+r." },
  alternatives: [],
  pitfalls: ["Counting nodes (depth) instead of edges (depth + depth).", "Forgetting to update max for paths not through root."],
  followups: ["Diameter of an N-ary tree.", "Longest path between two leaves of equal value."],
  signature: { fn: "diameterOfBinaryTree", params: [{ name: "root", adapt: "arrayToBinaryTree" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function diameterOfBinaryTree(root: TreeNode | null): number {
  let best = 0;
  const depth = (n: TreeNode | null): number => {
    if (!n) return 0;
    const l = depth(n.left), r = depth(n.right);
    if (l + r > best) best = l + r;
    return 1 + Math.max(l, r);
  };
  depth(root);
  return best;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [1,2,3,4,5] } });
    t.push({ name: "example-2", category: "example", input: { root: [1,2] } });
    t.push({ name: "edge-single", category: "edge", input: { root: [1] } });
    t.push({ name: "edge-leftskew-100", category: "edge", input: { root: leftSkewed(100) } });
    t.push({ name: "edge-rightskew-100", category: "edge", input: { root: rightSkewed(100) } });
    t.push({ name: "edge-balanced-15", category: "edge", input: { root: balancedBSTArray(15) } });
    t.push({ name: "stress-balanced-1023", category: "stress", input: { root: balancedBSTArray(1023) } });
    t.push({ name: "stress-leftskew-5000", category: "stress", input: { root: leftSkewed(5000) } });
    return t;
  },
});

// 5. Balanced Binary Tree
add({
  id: "balanced-binary-tree",
  number: 5,
  title: "Balanced Binary Tree",
  difficulty: "Easy",
  categories: ["Tree", "DFS"],
  prompt:
    "Given the root of a binary tree, determine if it is height-balanced — for every node the depths of its two subtrees differ by at most 1.",
  constraints: ["0 <= n <= 5000", "-10^4 <= Node.val <= 10^4"],
  hints: [
    "Compute height in post-order; if any subtree is unbalanced, short-circuit.",
    "Returning -1 from the helper is a clean sentinel for 'unbalanced'.",
  ],
  optimal: { time: "O(n)", space: "O(h)", approach: "Post-order DFS with -1 sentinel." },
  alternatives: [{ approach: "Compute height per node (top-down)", time: "O(n^2)", space: "O(h)" }],
  pitfalls: ["Top-down recomputation of heights is quadratic.", "Balanced ≠ symmetric ≠ complete."],
  followups: ["Convert to balanced (LC 1382)."],
  signature: { fn: "isBalanced", params: [{ name: "root", adapt: "arrayToBinaryTree" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isBalanced(root: TreeNode | null): boolean {
  const h = (n: TreeNode | null): number => {
    if (!n) return 0;
    const l = h(n.left); if (l === -1) return -1;
    const r = h(n.right); if (r === -1) return -1;
    if (Math.abs(l - r) > 1) return -1;
    return 1 + Math.max(l, r);
  };
  return h(root) !== -1;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [3,9,20,null,null,15,7] } });
    t.push({ name: "example-2-unbalanced", category: "example", input: { root: [1,2,2,3,3,null,null,4,4] } });
    t.push({ name: "edge-empty", category: "edge", input: { root: [] } });
    t.push({ name: "edge-single", category: "edge", input: { root: [1] } });
    t.push({ name: "edge-leftskew-3", category: "edge", input: { root: leftSkewed(3) } });
    t.push({ name: "edge-leftskew-2", category: "edge", input: { root: leftSkewed(2) } });
    t.push({ name: "stress-balanced-1023", category: "stress", input: { root: balancedBSTArray(1023) } });
    t.push({ name: "stress-rightskew-5000", category: "stress", input: { root: rightSkewed(5000) } });
    return t;
  },
});

// 6. Path Sum
add({
  id: "path-sum",
  number: 136,
  title: "Path Sum",
  difficulty: "Easy",
  categories: ["Tree", "DFS", "BFS"],
  prompt:
    "Given the root of a binary tree and an integer targetSum, return true if the tree has a root-to-leaf path such that adding up all the values along the path equals targetSum.",
  constraints: ["0 <= n <= 5000", "-1000 <= Node.val <= 1000", "-1000 <= targetSum <= 1000"],
  hints: [
    "Recurse subtracting node.val from target; check at leaves.",
    "Return false on null (so a single-child node won't masquerade as a leaf).",
  ],
  optimal: { time: "O(n)", space: "O(h)", approach: "DFS subtracting target." },
  alternatives: [{ approach: "BFS with parallel sum queue", time: "O(n)", space: "O(w)" }],
  pitfalls: ["Treating internal nodes with one null child as leaves.", "Empty tree must return false even if target==0."],
  followups: ["Path Sum II — return all such paths.", "Path Sum III — count of any-direction paths."],
  signature: {
    fn: "hasPathSum",
    params: [
      { name: "root", adapt: "arrayToBinaryTree" },
      { name: "target", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  if (!root) return false;
  if (!root.left && !root.right) return root.val === targetSum;
  return (
    hasPathSum(root.left, targetSum - root.val) ||
    hasPathSum(root.right, targetSum - root.val)
  );
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [5,4,8,11,null,13,4,7,2,null,null,null,1], target: 22 } });
    t.push({ name: "example-2-no-path", category: "example", input: { root: [1,2,3], target: 5 } });
    t.push({ name: "example-3-empty", category: "example", input: { root: [], target: 0 } });
    t.push({ name: "edge-single-match", category: "edge", input: { root: [5], target: 5 } });
    t.push({ name: "edge-single-no-match", category: "edge", input: { root: [5], target: 0 } });
    t.push({ name: "edge-negatives", category: "edge", input: { root: [-2,null,-3], target: -5 } });
    t.push({ name: "edge-only-left-child-not-leaf", category: "edge", input: { root: [1,2], target: 1 } });
    t.push({ name: "stress-balanced-1023-target", category: "stress", input: { root: balancedBSTArray(1023), target: 9 + 5 + 3 + 2 + 1 + 256 } });
    t.push({ name: "stress-leftskew-1000-sum", category: "stress", input: { root: leftSkewed(1000), target: (1000 * 1001) / 2 } });
    t.push({ name: "stress-leftskew-1000-no", category: "stress", input: { root: leftSkewed(1000), target: 7 } });
    return t;
  },
});

// 7. Binary Tree Inorder Traversal
add({
  id: "binary-tree-inorder-traversal",
  number: 11,
  title: "Binary Tree Inorder Traversal",
  difficulty: "Easy",
  categories: ["Tree", "DFS", "Stack"],
  prompt:
    "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
  constraints: ["0 <= n <= 100", "-100 <= Node.val <= 100"],
  hints: [
    "Recursive: visit left, root, right.",
    "Iterative: explicit stack — push lefts, pop, visit, go right.",
    "Morris traversal achieves O(1) space using temporary threading.",
  ],
  optimal: { time: "O(n)", space: "O(h)", approach: "Iterative with stack." },
  alternatives: [{ approach: "Morris traversal", time: "O(n)", space: "O(1)" }],
  pitfalls: ["Forgetting to advance to the right after visit.", "Visiting node before processing its left subtree."],
  followups: ["Pre/post-order iteratively.", "Morris traversal."],
  signature: { fn: "inorderTraversal", params: [{ name: "root", adapt: "arrayToBinaryTree" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function inorderTraversal(root: TreeNode | null): number[] {
  const out: number[] = [], st: TreeNode[] = [];
  let cur: TreeNode | null = root;
  while (cur || st.length) {
    while (cur) { st.push(cur); cur = cur.left; }
    cur = st.pop()!;
    out.push(cur.val);
    cur = cur.right;
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [1,null,2,3] } });
    t.push({ name: "example-2-empty", category: "example", input: { root: [] } });
    t.push({ name: "example-3-single", category: "example", input: { root: [1] } });
    t.push({ name: "edge-leftskew-5", category: "edge", input: { root: leftSkewed(5) } });
    t.push({ name: "edge-rightskew-5", category: "edge", input: { root: rightSkewed(5) } });
    t.push({ name: "edge-balanced-bst-7", category: "edge", input: { root: balancedBSTArray(7) } });
    t.push({ name: "stress-leftskew-100", category: "stress", input: { root: leftSkewed(100) } });
    t.push({ name: "stress-balanced-bst-100", category: "stress", input: { root: balancedBSTArray(100) } });
    return t;
  },
});

// 8. Subtree of Another Tree
add({
  id: "subtree-of-another-tree",
  number: 175,
  title: "Subtree of Another Tree",
  difficulty: "Easy",
  categories: ["Tree", "DFS", "String"],
  prompt:
    "Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values as subRoot.",
  constraints: ["1 <= root nodes <= 2000", "1 <= subRoot nodes <= 1000", "-10^4 <= Node.val <= 10^4"],
  hints: [
    "At each node of root, check if its subtree equals subRoot via the same-tree check.",
    "Stronger O(n+m): serialize both with sentinel nulls and use string find.",
  ],
  optimal: { time: "O(n*m)", space: "O(h)", approach: "Walk root; isSameTree at each node." },
  alternatives: [{ approach: "Serialize both, KMP / substring check", time: "O(n+m)", space: "O(n+m)" }],
  pitfalls: ["Confusing 'subtree' with 'subgraph' (subtree must be from a node down, including all descendants)."],
  followups: ["Find all subtree matches.", "Anagram subtree."],
  signature: {
    fn: "isSubtree",
    params: [
      { name: "root", adapt: "arrayToBinaryTree" },
      { name: "subRoot", adapt: "arrayToBinaryTree" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {
  const same = (a: TreeNode | null, b: TreeNode | null): boolean => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.val === b.val && same(a.left, b.left) && same(a.right, b.right);
  };
  if (!subRoot) return true;
  if (!root) return false;
  return same(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [3,4,5,1,2], subRoot: [4,1,2] } });
    t.push({ name: "example-2-extra-nodes", category: "example", input: { root: [3,4,5,1,2,null,null,null,null,0], subRoot: [4,1,2] } });
    t.push({ name: "edge-equal-trees", category: "edge", input: { root: [1,2,3], subRoot: [1,2,3] } });
    t.push({ name: "edge-single-match", category: "edge", input: { root: [1,2,3], subRoot: [2] } });
    t.push({ name: "edge-no-match", category: "edge", input: { root: [1,2,3], subRoot: [4] } });
    t.push({ name: "edge-prefix-of-subtree-not-full", category: "edge", input: { root: [1,1], subRoot: [1] } });
    t.push({ name: "stress-balanced-vs-leaf", category: "stress", input: { root: balancedBSTArray(1023), subRoot: [1] } });
    t.push({ name: "stress-balanced-deep-match", category: "stress", input: { root: balancedBSTArray(1023), subRoot: balancedBSTArray(7) } });
    return t;
  },
});

// 9. Binary Tree Level Order Traversal
add({
  id: "binary-tree-level-order-traversal",
  number: 12,
  title: "Binary Tree Level Order Traversal",
  difficulty: "Medium",
  categories: ["Tree", "BFS"],
  prompt:
    "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
  constraints: ["0 <= n <= 2000", "-1000 <= Node.val <= 1000"],
  hints: [
    "BFS with a queue; process nodes in batches sized by the queue length at level start.",
  ],
  optimal: { time: "O(n)", space: "O(w)", approach: "BFS by level." },
  alternatives: [{ approach: "DFS with depth parameter pushing into out[depth]", time: "O(n)", space: "O(h)" }],
  pitfalls: ["Forgetting to snapshot queue length per level (or using a recursive DFS that tracks depth)."],
  followups: ["Reverse level order (LC 107). Zigzag (LC 103)."],
  signature: { fn: "levelOrder", params: [{ name: "root", adapt: "arrayToBinaryTree" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const out: number[][] = [], q: TreeNode[] = [root];
  while (q.length) {
    const lvl: number[] = [], n = q.length;
    for (let i = 0; i < n; i++) {
      const x = q.shift()!;
      lvl.push(x.val);
      if (x.left) q.push(x.left);
      if (x.right) q.push(x.right);
    }
    out.push(lvl);
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [3,9,20,null,null,15,7] } });
    t.push({ name: "example-2-single", category: "example", input: { root: [1] } });
    t.push({ name: "example-3-empty", category: "example", input: { root: [] } });
    t.push({ name: "edge-leftskew", category: "edge", input: { root: leftSkewed(5) } });
    t.push({ name: "edge-rightskew", category: "edge", input: { root: rightSkewed(5) } });
    t.push({ name: "edge-balanced-15", category: "edge", input: { root: balancedBSTArray(15) } });
    t.push({ name: "stress-balanced-2047", category: "stress", input: { root: balancedBSTArray(2000) } });
    t.push({ name: "stress-leftskew-2000", category: "stress", input: { root: leftSkewed(2000) } });
    return t;
  },
});

// 10. Binary Tree Right Side View
add({
  id: "binary-tree-right-side-view",
  number: 14,
  title: "Binary Tree Right Side View",
  difficulty: "Medium",
  categories: ["Tree", "BFS", "DFS"],
  prompt:
    "Given the root of a binary tree, return the values of the nodes you would see if standing on the right side, ordered from top to bottom.",
  constraints: ["0 <= n <= 100", "-100 <= Node.val <= 100"],
  hints: [
    "BFS by levels, take the last value at each level.",
    "DFS visiting right first, push to result when depth == result.length.",
  ],
  optimal: { time: "O(n)", space: "O(w)", approach: "BFS taking the rightmost per level." },
  alternatives: [{ approach: "DFS with depth, right-first", time: "O(n)", space: "O(h)" }],
  pitfalls: ["DFS visiting left first will miss right-side nodes when the right subtree is shorter only later levels."],
  followups: ["Left side view, top view, bottom view."],
  signature: { fn: "rightSideView", params: [{ name: "root", adapt: "arrayToBinaryTree" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function rightSideView(root: TreeNode | null): number[] {
  if (!root) return [];
  const out: number[] = [], q: TreeNode[] = [root];
  while (q.length) {
    const n = q.length;
    for (let i = 0; i < n; i++) {
      const x = q.shift()!;
      if (i === n - 1) out.push(x.val);
      if (x.left) q.push(x.left);
      if (x.right) q.push(x.right);
    }
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [1,2,3,null,5,null,4] } });
    t.push({ name: "example-2", category: "example", input: { root: [1,null,3] } });
    t.push({ name: "edge-empty", category: "edge", input: { root: [] } });
    t.push({ name: "edge-single", category: "edge", input: { root: [9] } });
    t.push({ name: "edge-leftskew-only", category: "edge", input: { root: leftSkewed(5) } });
    t.push({ name: "edge-rightskew-only", category: "edge", input: { root: rightSkewed(5) } });
    t.push({ name: "edge-mixed-shorter-right", category: "edge", input: { root: [1,2,3,4,null,null,null,5] }, note: "Deepest visible from right is the leftmost descendant in level 4." });
    t.push({ name: "stress-balanced-100", category: "stress", input: { root: balancedBSTArray(100) } });
    return t;
  },
});

// 11. Binary Tree Zigzag Level Order Traversal
add({
  id: "binary-tree-zigzag-level-order-traversal",
  number: 15,
  title: "Binary Tree Zigzag Level Order Traversal",
  difficulty: "Medium",
  categories: ["Tree", "BFS"],
  prompt:
    "Given the root of a binary tree, return the zigzag level order traversal of its nodes' values (left-to-right, then right-to-left for the next level, alternating).",
  constraints: ["0 <= n <= 2000", "-100 <= Node.val <= 100"],
  hints: [
    "BFS like level order, but on odd levels reverse the level array (or fill from the back).",
  ],
  optimal: { time: "O(n)", space: "O(w)", approach: "BFS with a flag toggled per level." },
  alternatives: [{ approach: "Deque-based BFS pushing to front/back alternately", time: "O(n)", space: "O(w)" }],
  pitfalls: ["Reversing the queue itself instead of just the level snapshot.", "Off-by-one on the toggle."],
  followups: ["Vertical order traversal (LC 314)."],
  signature: { fn: "zigzagLevelOrder", params: [{ name: "root", adapt: "arrayToBinaryTree" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function zigzagLevelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const out: number[][] = [], q: TreeNode[] = [root];
  let leftToRight = true;
  while (q.length) {
    const n = q.length, lvl = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      const x = q.shift()!;
      lvl[leftToRight ? i : n - 1 - i] = x.val;
      if (x.left) q.push(x.left);
      if (x.right) q.push(x.right);
    }
    out.push(lvl);
    leftToRight = !leftToRight;
  }
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [3,9,20,null,null,15,7] } });
    t.push({ name: "example-2", category: "example", input: { root: [1] } });
    t.push({ name: "example-3-empty", category: "example", input: { root: [] } });
    t.push({ name: "edge-leftskew", category: "edge", input: { root: leftSkewed(5) } });
    t.push({ name: "edge-rightskew", category: "edge", input: { root: rightSkewed(5) } });
    t.push({ name: "edge-balanced-15", category: "edge", input: { root: balancedBSTArray(15) } });
    t.push({ name: "stress-balanced-2000", category: "stress", input: { root: balancedBSTArray(2000) } });
    return t;
  },
});

// 12. Count Good Nodes in Binary Tree
add({
  id: "count-good-nodes-in-binary-tree",
  number: 35,
  title: "Count Good Nodes in Binary Tree",
  difficulty: "Medium",
  categories: ["Tree", "DFS", "BFS"],
  prompt:
    "A node X is 'good' if on the path from root to X there is no node with a value greater than X. Given the root of a binary tree, return the number of good nodes.",
  constraints: ["1 <= n <= 10^5", "-10^4 <= Node.val <= 10^4"],
  hints: [
    "DFS carrying the maximum value seen so far on the path.",
    "If node.val >= maxSoFar, increment count and update max.",
  ],
  optimal: { time: "O(n)", space: "O(h)", approach: "DFS with running max." },
  alternatives: [{ approach: "BFS with parallel max queue", time: "O(n)", space: "O(w)" }],
  pitfalls: ["Using > instead of >= (root with duplicates is also good)."],
  followups: ["Track all good values."],
  signature: { fn: "goodNodes", params: [{ name: "root", adapt: "arrayToBinaryTree" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function goodNodes(root: TreeNode | null): number {
  let count = 0;
  const dfs = (n: TreeNode | null, mx: number) => {
    if (!n) return;
    if (n.val >= mx) { count++; mx = n.val; }
    dfs(n.left, mx); dfs(n.right, mx);
  };
  dfs(root, -Infinity);
  return count;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [3,1,4,3,null,1,5] } });
    t.push({ name: "example-2", category: "example", input: { root: [3,3,null,4,2] } });
    t.push({ name: "example-3-single", category: "example", input: { root: [1] } });
    t.push({ name: "edge-strictly-increasing", category: "edge", input: { root: leftSkewed(10) } });
    t.push({ name: "edge-strictly-decreasing", category: "edge", input: { root: rightSkewed(10).map((v) => v === null ? null : 11 - v) } });
    t.push({ name: "edge-all-equal", category: "edge", input: { root: [5,5,5,5,5,5,5] } });
    t.push({ name: "stress-balanced-1023", category: "stress", input: { root: balancedBSTArray(1023) } });
    t.push({ name: "stress-leftskew-1000", category: "stress", input: { root: leftSkewed(1000) } });
    return t;
  },
});

// 13. Validate Binary Search Tree
add({
  id: "validate-binary-search-tree",
  number: 193,
  title: "Validate Binary Search Tree",
  difficulty: "Medium",
  categories: ["Tree", "DFS", "Binary Search Tree"],
  prompt:
    "Given the root of a binary tree, determine if it is a valid Binary Search Tree (every node's value is strictly greater than all values in its left subtree and strictly less than all values in its right subtree).",
  constraints: ["1 <= n <= 10^4", "-2^31 <= Node.val <= 2^31 - 1"],
  hints: [
    "Per-node comparison with parent isn't enough — use a (lo, hi) bounds check.",
    "Inorder traversal of a BST yields a strictly increasing sequence.",
  ],
  optimal: { time: "O(n)", space: "O(h)", approach: "Bounds-passing DFS or iterative inorder check." },
  alternatives: [{ approach: "Inorder traversal + monotonic check", time: "O(n)", space: "O(h)" }],
  pitfalls: ["Using <= or >= instead of strict inequalities.", "Comparing only with immediate parent."],
  followups: ["Recover BST swapped nodes (LC 99)."],
  signature: { fn: "isValidBST", params: [{ name: "root", adapt: "arrayToBinaryTree" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function isValidBST(root: TreeNode | null): boolean {
  const go = (n: TreeNode | null, lo: number, hi: number): boolean => {
    if (!n) return true;
    if (n.val <= lo || n.val >= hi) return false;
    return go(n.left, lo, n.val) && go(n.right, n.val, hi);
  };
  return go(root, -Infinity, Infinity);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [2,1,3] } });
    t.push({ name: "example-2-invalid", category: "example", input: { root: [5,1,4,null,null,3,6] } });
    t.push({ name: "edge-single", category: "edge", input: { root: [1] } });
    t.push({ name: "edge-equal-values", category: "edge", input: { root: [1,1] } });
    t.push({ name: "edge-right-grandchild-violates", category: "edge", input: { root: [10,5,15,null,null,6,20] } });
    t.push({ name: "edge-strictly-increasing-right-skew", category: "edge", input: { root: rightSkewed(10) } });
    t.push({ name: "edge-int-min-only", category: "edge", input: { root: [-2147483648] } });
    t.push({ name: "stress-balanced-bst-1023", category: "stress", input: { root: balancedBSTArray(1023) } });
    const bal = balancedBSTArray(1023);
    bal[bal.length - 2] = (typeof bal[bal.length - 2] === "number" ? bal[bal.length - 2] : 0) + 100000;
    t.push({ name: "stress-balanced-bst-1023-broken", category: "stress", input: { root: bal } });
    return t;
  },
});

// 14. Kth Smallest Element in a BST
add({
  id: "kth-smallest-element-in-a-bst",
  number: 83,
  title: "Kth Smallest Element in a BST",
  difficulty: "Medium",
  categories: ["Tree", "Binary Search Tree", "DFS"],
  prompt:
    "Given the root of a BST and an integer k, return the kth smallest value in the tree (1-indexed).",
  constraints: ["1 <= k <= n <= 10^4", "0 <= Node.val <= 10^4"],
  hints: [
    "Inorder traversal of a BST yields sorted values.",
    "Iterative inorder lets you stop as soon as you've visited k nodes.",
  ],
  optimal: { time: "O(h + k)", space: "O(h)", approach: "Iterative inorder, stop at the kth pop." },
  alternatives: [{ approach: "Augment node with subtree size for O(log n) follow-up queries", time: "O(log n)", space: "O(n)" }],
  pitfalls: ["Returning the kth visited including pre-stack pushes.", "Stopping at k-1 (off-by-one)."],
  followups: ["Frequent inserts + queries — augment with subtree counts."],
  signature: {
    fn: "kthSmallest",
    params: [
      { name: "root", adapt: "arrayToBinaryTree" },
      { name: "k", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function kthSmallest(root: TreeNode | null, k: number): number {
  const st: TreeNode[] = [];
  let cur: TreeNode | null = root, count = 0;
  while (cur || st.length) {
    while (cur) { st.push(cur); cur = cur.left; }
    cur = st.pop()!;
    if (++count === k) return cur.val;
    cur = cur.right;
  }
  return -1;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [3,1,4,null,2], k: 1 } });
    t.push({ name: "example-2", category: "example", input: { root: [5,3,6,2,4,null,null,1], k: 3 } });
    t.push({ name: "edge-single-k1", category: "edge", input: { root: [1], k: 1 } });
    t.push({ name: "edge-k-equals-n", category: "edge", input: { root: [5,3,6,2,4,null,null,1], k: 6 } });
    t.push({ name: "edge-k-mid", category: "edge", input: { root: [5,3,6,2,4,null,null,1], k: 4 } });
    const balBST = balancedBSTArray(1023);
    t.push({ name: "stress-balanced-bst-k1", category: "stress", input: { root: balBST, k: 1 } });
    t.push({ name: "stress-balanced-bst-mid", category: "stress", input: { root: balBST, k: 512 } });
    t.push({ name: "stress-balanced-bst-last", category: "stress", input: { root: balBST, k: 1023 } });
    return t;
  },
});

// 15. Lowest Common Ancestor of a BST
add({
  id: "lowest-common-ancestor-of-a-bst",
  number: 100,
  title: "Lowest Common Ancestor of a Binary Search Tree",
  difficulty: "Medium",
  categories: ["Tree", "Binary Search Tree", "DFS"],
  prompt:
    "Given a BST and two values p and q present in it, return the value of their lowest common ancestor.",
  constraints: ["2 <= n <= 10^5", "-10^9 <= Node.val <= 10^9", "All values are unique. p ≠ q and both exist in the tree."],
  hints: [
    "Walk from root: if both p, q are smaller, go left; both larger, go right; otherwise current node is the LCA.",
  ],
  optimal: { time: "O(h)", space: "O(1)", approach: "Iterative descent using BST property." },
  alternatives: [{ approach: "Generic LCA on binary tree", time: "O(n)", space: "O(h)" }],
  pitfalls: ["Forgetting that the LCA could be p or q itself."],
  followups: ["LCA of a binary tree (LC 236).", "Multi-query LCA with binary lifting."],
  signature: {
    fn: "lowestCommonAncestorBST",
    params: [
      { name: "root", adapt: "arrayToBinaryTree" },
      { name: "p", adapt: "identity" },
      { name: "q", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function lowestCommonAncestor(root: TreeNode, p: TreeNode, q: TreeNode): TreeNode {
  let cur: TreeNode | null = root;
  while (cur) {
    if (p.val < cur.val && q.val < cur.val) cur = cur.left;
    else if (p.val > cur.val && q.val > cur.val) cur = cur.right;
    else return cur;
  }
  return root;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [6,2,8,0,4,7,9,null,null,3,5], p: 2, q: 8 } });
    t.push({ name: "example-2", category: "example", input: { root: [6,2,8,0,4,7,9,null,null,3,5], p: 2, q: 4 } });
    t.push({ name: "edge-p-is-ancestor", category: "edge", input: { root: [2,1], p: 1, q: 2 } });
    t.push({ name: "edge-deep-leaves", category: "edge", input: { root: [6,2,8,0,4,7,9,null,null,3,5], p: 3, q: 5 } });
    t.push({ name: "edge-cross-subtrees", category: "edge", input: { root: [6,2,8,0,4,7,9,null,null,3,5], p: 0, q: 9 } });
    const big = balancedBSTArray(1023);
    t.push({ name: "stress-balanced-bst-far", category: "stress", input: { root: big, p: 1, q: 1023 } });
    t.push({ name: "stress-balanced-bst-near", category: "stress", input: { root: big, p: 511, q: 513 } });
    return t;
  },
});

// 16. Lowest Common Ancestor of a Binary Tree
add({
  id: "lowest-common-ancestor-of-a-binary-tree",
  number: 99,
  title: "Lowest Common Ancestor of a Binary Tree",
  difficulty: "Medium",
  categories: ["Tree", "DFS"],
  prompt:
    "Given a binary tree (not necessarily a BST) and two unique node values p and q, return the value of their lowest common ancestor.",
  constraints: ["2 <= n <= 10^5", "-10^9 <= Node.val <= 10^9", "All values are unique; both p and q exist in the tree."],
  hints: [
    "Recurse on both subtrees. If a subtree returns non-null for both p and q, that node is the LCA.",
    "Return the node itself if it equals p or q.",
  ],
  optimal: { time: "O(n)", space: "O(h)", approach: "Post-order DFS short-circuiting on found nodes." },
  alternatives: [{ approach: "Build parent map, then walk up from both", time: "O(n)", space: "O(n)" }, { approach: "Euler tour + RMQ for offline queries", time: "O(n log n) build, O(1) query", space: "O(n log n)" }],
  pitfalls: ["Returning the wrong subtree result when only one match is found below.", "Mutating values to identify nodes."],
  followups: ["LCA of multiple nodes.", "Multi-query LCA with binary lifting."],
  signature: {
    fn: "lowestCommonAncestorBT",
    params: [
      { name: "root", adapt: "arrayToBinaryTree" },
      { name: "p", adapt: "identity" },
      { name: "q", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function lowestCommonAncestor(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {
  if (!root || root === p || root === q) return root;
  const l = lowestCommonAncestor(root.left, p, q);
  const r = lowestCommonAncestor(root.right, p, q);
  if (l && r) return root;
  return l ?? r;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [3,5,1,6,2,0,8,null,null,7,4], p: 5, q: 1 } });
    t.push({ name: "example-2-self-ancestor", category: "example", input: { root: [3,5,1,6,2,0,8,null,null,7,4], p: 5, q: 4 } });
    t.push({ name: "example-3-tiny", category: "example", input: { root: [1,2], p: 1, q: 2 } });
    t.push({ name: "edge-deep-cross", category: "edge", input: { root: [3,5,1,6,2,0,8,null,null,7,4], p: 7, q: 8 } });
    t.push({ name: "edge-leaves-of-same-parent", category: "edge", input: { root: [3,5,1,6,2,0,8,null,null,7,4], p: 7, q: 4 } });
    const bal = balancedBSTArray(1023);
    t.push({ name: "stress-balanced-1023-far", category: "stress", input: { root: bal, p: 1, q: 1023 } });
    t.push({ name: "stress-balanced-1023-near", category: "stress", input: { root: bal, p: 256, q: 257 } });
    return t;
  },
});

// 17. Construct Binary Tree from Preorder and Inorder Traversal
add({
  id: "construct-binary-tree-from-preorder-and-inorder",
  number: 29,
  title: "Construct Binary Tree from Preorder and Inorder Traversal",
  difficulty: "Medium",
  categories: ["Tree", "DFS", "Hash Table", "Divide & Conquer"],
  prompt:
    "Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree (returned here as level-order with nulls).",
  constraints: ["1 <= n <= 3000", "-3000 <= Node.val <= 3000", "All values are unique. preorder and inorder describe the same tree."],
  hints: [
    "First element of preorder is the root.",
    "Find that element's index in inorder; everything left becomes the left subtree, right becomes the right subtree.",
    "Use a hash map from value→inorder index for O(1) lookups.",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Recursive split with index hash map and a moving preorder pointer." },
  alternatives: [{ approach: "Slicing arrays each call", time: "O(n^2)", space: "O(n^2)" }],
  pitfalls: ["Off-by-one when computing left subtree size.", "Re-scanning inorder each call (quadratic)."],
  followups: ["From inorder + postorder (LC 106)."],
  signature: {
    fn: "buildTreeFromPreorderInorder",
    params: [
      { name: "preorder", adapt: "identity" },
      { name: "inorder", adapt: "identity" },
    ],
    returnAdapt: "binaryTreeToLevelOrder",
  },
  comparison: "exact",
  solutionTs:
`function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  const idx = new Map<number, number>();
  for (let i = 0; i < inorder.length; i++) idx.set(inorder[i], i);
  let pre = 0;
  const build = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) return null;
    const v = preorder[pre++];
    const node = new TreeNode(v);
    const m = idx.get(v)!;
    node.left = build(lo, m - 1);
    node.right = build(m + 1, hi);
    return node;
  };
  return build(0, inorder.length - 1);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { preorder: [3,9,20,15,7], inorder: [9,3,15,20,7] } });
    t.push({ name: "example-2", category: "example", input: { preorder: [-1], inorder: [-1] } });
    t.push({ name: "edge-leftskew", category: "edge", input: { preorder: [1,2,3,4,5], inorder: [5,4,3,2,1] } });
    t.push({ name: "edge-rightskew", category: "edge", input: { preorder: [1,2,3,4,5], inorder: [1,2,3,4,5] } });
    t.push({ name: "edge-balanced-7", category: "edge", input: { preorder: [4,2,1,3,6,5,7], inorder: [1,2,3,4,5,6,7] } });
    t.push({ name: "edge-negatives", category: "edge", input: { preorder: [-3,-9,-20,-15,-7], inorder: [-9,-3,-15,-20,-7] } });
    const r = rng(417);
    const bigPre = [];
    const bigIn = [];
    // Produce a balanced BST of values 1..3000; then preorder & inorder traversals.
    const TN = function(v) { this.val = v; this.left = null; this.right = null; };
    const build = (lo, hi) => {
      if (lo > hi) return null;
      const m = (lo + hi) >> 1;
      const n = new TN(m + 1);
      n.left = build(lo, m - 1);
      n.right = build(m + 1, hi);
      return n;
    };
    const root = build(0, 2999);
    const pre = (n) => { if (!n) return; bigPre.push(n.val); pre(n.left); pre(n.right); };
    const ino = (n) => { if (!n) return; ino(n.left); bigIn.push(n.val); ino(n.right); };
    pre(root); ino(root);
    t.push({ name: "stress-balanced-3000", category: "stress", input: { preorder: bigPre, inorder: bigIn } });
    void r;
    return t;
  },
});

// 18. Binary Tree Maximum Path Sum
add({
  id: "binary-tree-maximum-path-sum",
  number: 13,
  title: "Binary Tree Maximum Path Sum",
  difficulty: "Hard",
  categories: ["Tree", "DFS", "Dynamic Programming"],
  prompt:
    "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes is connected by an edge. Given the root, return the maximum path sum of any path (need not pass through the root).",
  constraints: ["1 <= n <= 3 * 10^4", "-1000 <= Node.val <= 1000"],
  hints: [
    "At each node, the best path through it is node.val + max(0, gain(left)) + max(0, gain(right)).",
    "Return to parent: node.val + max(left, right) clamped to 0 (you can pass through the node, not split).",
  ],
  optimal: { time: "O(n)", space: "O(h)", approach: "Post-order DFS with global max." },
  alternatives: [],
  pitfalls: ["Forgetting to clamp negative gains to 0.", "Using the through-node value as the return value (must use single side)."],
  followups: ["Maximum path sum in a DAG."],
  signature: { fn: "maxPathSum", params: [{ name: "root", adapt: "arrayToBinaryTree" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function maxPathSum(root: TreeNode | null): number {
  let best = -Infinity;
  const gain = (n: TreeNode | null): number => {
    if (!n) return 0;
    const l = Math.max(0, gain(n.left));
    const r = Math.max(0, gain(n.right));
    if (n.val + l + r > best) best = n.val + l + r;
    return n.val + Math.max(l, r);
  };
  gain(root);
  return best;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { root: [1,2,3] } });
    t.push({ name: "example-2", category: "example", input: { root: [-10,9,20,null,null,15,7] } });
    t.push({ name: "edge-single", category: "edge", input: { root: [5] } });
    t.push({ name: "edge-all-negative", category: "edge", input: { root: [-3] } });
    t.push({ name: "edge-mixed-negatives", category: "edge", input: { root: [-1,-2,-3] } });
    t.push({ name: "edge-skewed-positive", category: "edge", input: { root: leftSkewed(10) } });
    t.push({ name: "edge-skewed-mixed", category: "edge", input: { root: [2,-1,null,3,null,-2,null,4] } });
    const r = rng(418);
    const bal = balancedBSTArray(1023).map((v) => v === null ? null : randInt(r, -1000, 1000));
    t.push({ name: "stress-balanced-1023-random", category: "stress", input: { root: bal } });
    t.push({ name: "stress-leftskew-1000", category: "stress", input: { root: leftSkewed(1000) } });
    return t;
  },
});

// 19. Serialize and Deserialize Binary Tree
add({
  id: "serialize-and-deserialize-binary-tree",
  number: 164,
  title: "Serialize and Deserialize Binary Tree",
  difficulty: "Hard",
  categories: ["Tree", "DFS", "BFS", "Design", "String"],
  prompt:
    "Design an algorithm to serialize a binary tree to a string and deserialize the string back to the original tree. The serialization format is up to you. The test driver round-trips your two functions and compares the resulting tree (level-order, with nulls for absent children) to the input.",
  constraints: ["0 <= n <= 10^4", "-1000 <= Node.val <= 1000"],
  hints: [
    "Preorder DFS with a sentinel ('#' or 'null') for missing children gives an unambiguous string.",
    "Deserialize by consuming tokens recursively in the same preorder.",
    "BFS with level tokens also works (an alternative format).",
  ],
  optimal: { time: "O(n)", space: "O(n)", approach: "Preorder DFS with null sentinel + comma delimiter." },
  alternatives: [{ approach: "Level-order with nulls", time: "O(n)", space: "O(n)" }],
  pitfalls: ["Forgetting null markers — the original tree shape becomes ambiguous.", "Splitting by space when values may be negative or multi-digit."],
  followups: ["Serialize a BST in less space (LC 449).", "Streamable format for large trees."],
  signature: { fn: "codecBinaryTreeRoundTrip", params: [{ name: "tree", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class Codec {
  serialize(root: TreeNode | null): string {
    const out: string[] = [];
    const ser = (n: TreeNode | null) => {
      if (!n) { out.push("#"); return; }
      out.push(String(n.val));
      ser(n.left); ser(n.right);
    };
    ser(root);
    return out.join(",");
  }
  deserialize(data: string): TreeNode | null {
    const parts = data.split(",");
    let i = 0;
    const des = (): TreeNode | null => {
      const t = parts[i++];
      if (t === "#") return null;
      const n = new TreeNode(Number(t));
      n.left = des();
      n.right = des();
      return n;
    };
    return des();
  }
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { tree: [1,2,3,null,null,4,5] } });
    t.push({ name: "example-2-empty", category: "example", input: { tree: [] } });
    t.push({ name: "example-3-single", category: "example", input: { tree: [1] } });
    t.push({ name: "edge-leftskew", category: "edge", input: { tree: leftSkewed(10) } });
    t.push({ name: "edge-rightskew", category: "edge", input: { tree: rightSkewed(10) } });
    t.push({ name: "edge-negatives", category: "edge", input: { tree: [-1,-2,-3,-4,-5] } });
    t.push({ name: "edge-balanced-15", category: "edge", input: { tree: balancedBSTArray(15) } });
    t.push({ name: "stress-balanced-1023", category: "stress", input: { tree: balancedBSTArray(1023) } });
    t.push({ name: "stress-leftskew-1000", category: "stress", input: { tree: leftSkewed(1000) } });
    return t;
  },
});

// 20. Convert Sorted Array to BST
add({
  id: "convert-sorted-array-to-bst",
  number: 33,
  title: "Convert Sorted Array to Binary Search Tree",
  difficulty: "Easy",
  categories: ["Tree", "Binary Search Tree", "Divide & Conquer"],
  prompt:
    "Given an integer array nums sorted in ascending order, convert it to a height-balanced BST. Return the tree as a level-order array (with nulls for absent children). Note: any height-balanced BST is a valid answer; this dataset checks the canonical mid = (lo+hi)/2 (lower mid) construction.",
  constraints: ["1 <= n <= 10^4", "-10^4 <= nums[i] <= 10^4", "nums is sorted in strictly ascending order."],
  hints: [
    "Recurse on the middle element.",
    "Lower mid: (lo + hi) >> 1 picks the left of two middles for even spans.",
  ],
  optimal: { time: "O(n)", space: "O(log n)", approach: "Recursive mid-pivot construction." },
  alternatives: [{ approach: "Iterative simulating recursion with stack", time: "O(n)", space: "O(log n)" }],
  pitfalls: ["Using upper mid produces a valid (but different) tree — comparator here expects lower mid."],
  followups: ["Convert sorted linked list to BST (LC 109)."],
  signature: { fn: "sortedArrayToBST", params: [{ name: "nums", adapt: "identity" }], returnAdapt: "binaryTreeToLevelOrder" },
  comparison: "exact",
  solutionTs:
`function sortedArrayToBST(nums: number[]): TreeNode | null {
  const build = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) return null;
    const m = (lo + hi) >> 1;
    const n = new TreeNode(nums[m]);
    n.left = build(lo, m - 1);
    n.right = build(m + 1, hi);
    return n;
  };
  return build(0, nums.length - 1);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { nums: [-10,-3,0,5,9] } });
    t.push({ name: "example-2", category: "example", input: { nums: [1,3] } });
    t.push({ name: "edge-single", category: "edge", input: { nums: [0] } });
    t.push({ name: "edge-two", category: "edge", input: { nums: [1,2] } });
    t.push({ name: "edge-seven", category: "edge", input: { nums: [1,2,3,4,5,6,7] } });
    t.push({ name: "edge-negatives", category: "edge", input: { nums: [-5,-4,-3,-2,-1] } });
    t.push({ name: "stress-1000", category: "stress", input: { nums: Array.from({length:1000},(_,i)=>i-500) } });
    t.push({ name: "stress-10000", category: "stress", input: { nums: Array.from({length:10000},(_,i)=>i-5000) } });
    return t;
  },
});
