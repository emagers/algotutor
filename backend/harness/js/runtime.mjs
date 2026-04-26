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
  // Deep structural equality. Object key order is irrelevant by JSON
  // semantics; arrays and primitives compare by position/value.
  exact: (a, b) => deepEqual(a, b),
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
  // Validates that `actual` is any valid topological ordering for the
  // alphabet implied by `input.words`. Used by alien-dictionary so the
  // backend accepts answers from solutions whose hash-iteration order
  // differs from the JS reference. `expected` is ignored.
  topologicalValid(actual, expected, input) {
    if (typeof actual !== "string") return false;
    const words = (input && input.words) || [];
    const chars = new Set();
    for (const w of words) for (const c of w) chars.add(c);
    // Detect "no valid ordering" (a longer word precedes its prefix).
    let invalid = false;
    for (let i = 0; i + 1 < words.length && !invalid; i++) {
      const a = words[i], b = words[i + 1];
      let differed = false;
      const lim = Math.min(a.length, b.length);
      for (let j = 0; j < lim; j++) {
        if (a[j] !== b[j]) { differed = true; break; }
      }
      if (!differed && a.length > b.length) invalid = true;
    }
    // Cycle cases (which require running the topological sort to detect)
    // are signaled by the reference solution returning "". When that's the
    // case, accept any "" answer.
    if (invalid || expected === "") return actual === "";
    // Must be a permutation of all distinct chars.
    if (actual.length !== chars.size) return false;
    const pos = new Map();
    for (let i = 0; i < actual.length; i++) {
      if (!chars.has(actual[i])) return false;
      if (pos.has(actual[i])) return false;
      pos.set(actual[i], i);
    }
    // Verify every implied precedence holds.
    for (let i = 0; i + 1 < words.length; i++) {
      const a = words[i], b = words[i + 1];
      const lim = Math.min(a.length, b.length);
      for (let j = 0; j < lim; j++) {
        if (a[j] !== b[j]) {
          if (pos.get(a[j]) >= pos.get(b[j])) return false;
          break;
        }
      }
    }
    return true;
  },
};

export function deepClone(v) {
  if (v === null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(deepClone);
  const out = {};
  for (const k of Object.keys(v)) out[k] = deepClone(v[k]);
  return out;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === "object") {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (!deepEqual(a[k], b[k])) return false;
    return true;
  }
  return false;
}
