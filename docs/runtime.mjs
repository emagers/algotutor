// Shared runtime: data shapes, adapters, comparators, deepClone.
// Used by both the Node test runner (run-tests.mjs via solutions.mjs)
// and the in-browser Web Worker that runs user-submitted code.

export class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

export class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

export const adapters = {
  identity: (x) => x,

  arrayToLinkedList(arr) {
    if (!arr || arr.length === 0) return null;
    const head = new ListNode(arr[0]);
    let tail = head;
    for (let i = 1; i < arr.length; i++) {
      tail.next = new ListNode(arr[i]);
      tail = tail.next;
    }
    return head;
  },

  linkedListToArray(head) {
    const out = [];
    let cur = head;
    while (cur) {
      out.push(cur.val);
      cur = cur.next;
    }
    return out;
  },

  // level-order (null placeholders for absent children) with `null` placeholders for absent children.
  arrayToBinaryTree(arr) {
    if (!arr || arr.length === 0 || arr[0] === null) return null;
    const root = new TreeNode(arr[0]);
    const q = [root];
    let i = 1;
    while (q.length && i < arr.length) {
      const node = q.shift();
      if (i < arr.length) {
        const lv = arr[i++];
        if (lv !== null && lv !== undefined) {
          node.left = new TreeNode(lv);
          q.push(node.left);
        }
      }
      if (i < arr.length) {
        const rv = arr[i++];
        if (rv !== null && rv !== undefined) {
          node.right = new TreeNode(rv);
          q.push(node.right);
        }
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
      if (node === null) {
        out.push(null);
        continue;
      }
      out.push(node.val);
      q.push(node.left);
      q.push(node.right);
    }
    while (out.length && out[out.length - 1] === null) out.pop();
    return out;
  },
};

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

function canonSortedArray(arr) {
  return [...arr].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
}

function canonSetOfArrays(arrs) {
  const inner = arrs.map((a) => canonSortedArray(a));
  inner.sort((a, b) => {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      if (a[i] < b[i]) return -1;
      if (a[i] > b[i]) return 1;
    }
    return a.length - b.length;
  });
  return inner;
}

export const comparators = {
  exact: (a, b) => deepEqual(a, b),
  sortedArray: (a, b) => deepEqual(canonSortedArray(a), canonSortedArray(b)),
  setOfArrays: (a, b) => deepEqual(canonSetOfArrays(a), canonSetOfArrays(b)),
  stringLength: (a, b) => typeof a === "string" && typeof b === "string" && a.length === b.length,
};

export function deepClone(x) {
  if (x === null || typeof x !== "object") return x;
  if (Array.isArray(x)) return x.map(deepClone);
  const out = {};
  for (const k of Object.keys(x)) out[k] = deepClone(x[k]);
  return out;
}
