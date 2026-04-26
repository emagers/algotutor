// Shared comparator + adapter helpers used by the JS harness on the backend.
// Mirrors docs/runtime.mjs but kept self-contained so the backend has no
// dependency on the docs/ tree at runtime (questions are JSON-only).

export class ListNode {
  constructor(val = 0, next = null) { this.val = val; this.next = next; }
}
export class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val; this.left = left; this.right = right;
  }
}

export const adapters = {
  identity: (v) => v,
  arrayToLinkedList(arr) {
    if (!Array.isArray(arr)) return arr;
    let head = null;
    for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);
    return head;
  },
  linkedListToArray(head) {
    const out = [];
    let cur = head;
    while (cur) { out.push(cur.val); cur = cur.next; }
    return out;
  },
  arrayToBinaryTree(arr) {
    if (!Array.isArray(arr) || arr.length === 0 || arr[0] === null) return null;
    const root = new TreeNode(arr[0]);
    const q = [root];
    let i = 1;
    while (q.length && i < arr.length) {
      const node = q.shift();
      const lv = arr[i++];
      if (lv !== null && lv !== undefined) { node.left = new TreeNode(lv); q.push(node.left); }
      if (i < arr.length) {
        const rv = arr[i++];
        if (rv !== null && rv !== undefined) { node.right = new TreeNode(rv); q.push(node.right); }
      }
    }
    return root;
  },
  binaryTreeToLevelOrder(root) {
    if (!root) return [];
    const out = [];
    const q = [root];
    while (q.length) {
      const node = q.shift();
      if (node === null) { out.push(null); continue; }
      out.push(node.val);
      q.push(node.left);
      q.push(node.right);
    }
    while (out.length && out[out.length - 1] === null) out.pop();
    return out;
  },
};

export const comparators = {
  exact: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  sortedArray(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
  },
  setOfArrays(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    const norm = (x) => JSON.stringify([...x].map((y) => Array.isArray(y) ? [...y].sort((p, q) => p - q) : y).sort());
    return norm(a) === norm(b);
  },
  stringLength(a, b) {
    if (typeof a === "number" && typeof b === "number") return a === b;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length;
    return a === b;
  },
};

export function deepClone(v) {
  if (v === null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(deepClone);
  const out = {};
  for (const k of Object.keys(v)) out[k] = deepClone(v[k]);
  return out;
}
