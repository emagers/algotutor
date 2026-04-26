// Per-problem manual overrides for codeTypes/kind/judgeSource.
// Inference handles ~150 plain-function problems automatically.
// This file lists exceptions: design problems, mutation problems, codec
// roundtrips, big-int outputs, and any inferred-incorrect cases.

// Schema:
//   slug: {
//     kind?: "function" | "design" | "codec-roundtrip"  (default "function")
//     judgeSource?: "return" | "param:N"                (default "return")
//     numericOverflow?: "i64" | "u32" | "u64" | "u128" | "skip-rust-stress"
//     codeTypes?: {
//       rust: { params: [{name, type}], returns: type }
//       go:   { params: [{name, type}], returns: type }
//     }
//     design?: {
//       className: string,
//       wireFormat: "ops-tuples" | "ops-args",  // ops-tuples: input.ops = [[method, ...args]]; ops-args: input.operations + input.args
//       ctor: { params: [{name, type}] },        // types per language picked from codeTypes.<lang>
//       methods: [{ name, params: [{name, type}], returns: type }]
//     }
//   }

export const overrides = {
  // ===== Mutation problems: judge from mutated param =====
  "rotate-image": {
    judgeSource: "param:0",
    codeTypes: {
      rust: { params: [{ name: "matrix", type: "&mut Vec<Vec<i32>>" }], returns: "()" },
      go:   { params: [{ name: "matrix", type: "[][]int" }],            returns: "" },
    },
  },
  "rotate-array": {
    judgeSource: "param:0",
    codeTypes: {
      rust: { params: [{ name: "nums", type: "&mut Vec<i32>" }, { name: "k", type: "i32" }], returns: "()" },
      go:   { params: [{ name: "nums", type: "[]int" }, { name: "k", type: "int" }], returns: "" },
    },
  },
  "set-matrix-zeroes": {
    judgeSource: "param:0",
    codeTypes: {
      rust: { params: [{ name: "matrix", type: "&mut Vec<Vec<i32>>" }], returns: "()" },
      go:   { params: [{ name: "matrix", type: "[][]int" }],            returns: "" },
    },
  },
  "game-of-life": {
    judgeSource: "param:0",
    codeTypes: {
      rust: { params: [{ name: "board", type: "&mut Vec<Vec<i32>>" }], returns: "()" },
      go:   { params: [{ name: "board", type: "[][]int" }],            returns: "" },
    },
  },
  "move-zeroes": {
    judgeSource: "param:0",
    codeTypes: {
      rust: { params: [{ name: "nums", type: "&mut Vec<i32>" }], returns: "()" },
      go:   { params: [{ name: "nums", type: "[]int" }],         returns: "" },
    },
  },
  "merge-sorted-array": {
    judgeSource: "param:0",
    codeTypes: {
      rust: { params: [
        { name: "nums1", type: "&mut Vec<i32>" }, { name: "m", type: "i32" },
        { name: "nums2", type: "Vec<i32>" }, { name: "n", type: "i32" }
      ], returns: "()" },
      go: { params: [
        { name: "nums1", type: "[]int" }, { name: "m", type: "int" },
        { name: "nums2", type: "[]int" }, { name: "n", type: "int" }
      ], returns: "" },
    },
  },
  "remove-duplicates-from-sorted-array": {
    judgeSource: "param0PrefixWithReturn",
    codeTypes: {
      rust: { params: [{ name: "nums", type: "&mut Vec<i32>" }], returns: "i32" },
      go:   { params: [{ name: "nums", type: "[]int" }],         returns: "int" },
    },
  },
  "reorder-list": {
    judgeSource: "param:0",
    codeTypes: {
      rust: { params: [{ name: "head", type: "&mut Option<Box<ListNode>>" }], returns: "()" },
      go:   { params: [{ name: "head", type: "*ListNode" }], returns: "" },
    },
  },

  // ===== Design problems: per-class drivers =====
  "lru-cache": {
    kind: "design",
    design: {
      className: "LRUCache",
      wireFormat: "ops-tuples",
      ctor: { params: [{ name: "capacity", type: { rust: "i32", go: "int" } }] },
      methods: [
        { name: "get", params: [{ name: "key", type: { rust: "i32", go: "int" } }], returns: { rust: "i32", go: "int" } },
        { name: "put", params: [{ name: "key", type: { rust: "i32", go: "int" } }, { name: "value", type: { rust: "i32", go: "int" } }], returns: { rust: "()", go: "" } },
      ],
    },
  },
  "lfu-cache": {
    kind: "design",
    design: {
      className: "LFUCache",
      wireFormat: "ops-args",
      ctor: { params: [{ name: "capacity", type: { rust: "i32", go: "int" } }] },
      methods: [
        { name: "get", params: [{ name: "key", type: { rust: "i32", go: "int" } }], returns: { rust: "i32", go: "int" } },
        { name: "put", params: [{ name: "key", type: { rust: "i32", go: "int" } }, { name: "value", type: { rust: "i32", go: "int" } }], returns: { rust: "()", go: "" } },
      ],
    },
  },
  "min-stack": {
    kind: "design",
    design: {
      className: "MinStack",
      wireFormat: "ops-tuples",
      ctor: { params: [] },
      methods: [
        { name: "push", params: [{ name: "val", type: { rust: "i32", go: "int" } }], returns: { rust: "()", go: "" } },
        { name: "pop", params: [], returns: { rust: "()", go: "" } },
        { name: "top", params: [], returns: { rust: "i32", go: "int" } },
        { name: "getMin", params: [], returns: { rust: "i32", go: "int" } },
      ],
    },
  },
  "implement-trie": {
    kind: "design",
    design: {
      className: "Trie",
      wireFormat: "ops-tuples",
      ctor: { params: [] },
      methods: [
        { name: "insert", params: [{ name: "word", type: { rust: "String", go: "string" } }], returns: { rust: "()", go: "" } },
        { name: "search", params: [{ name: "word", type: { rust: "String", go: "string" } }], returns: { rust: "bool", go: "bool" } },
        { name: "startsWith", params: [{ name: "prefix", type: { rust: "String", go: "string" } }], returns: { rust: "bool", go: "bool" } },
      ],
    },
  },
  "design-add-and-search-words-data-structure": {
    kind: "design",
    design: {
      className: "WordDictionary",
      wireFormat: "ops-tuples",
      ctor: { params: [] },
      methods: [
        { name: "addWord", params: [{ name: "word", type: { rust: "String", go: "string" } }], returns: { rust: "()", go: "" } },
        { name: "search", params: [{ name: "word", type: { rust: "String", go: "string" } }], returns: { rust: "bool", go: "bool" } },
      ],
    },
  },
  "kth-largest-element-in-a-stream": {
    kind: "design",
    design: {
      className: "KthLargest",
      wireFormat: "ops-tuples",
      ctor: { params: [{ name: "k", type: { rust: "i32", go: "int" } }, { name: "nums", type: { rust: "Vec<i32>", go: "[]int" } }] },
      methods: [
        { name: "add", params: [{ name: "val", type: { rust: "i32", go: "int" } }], returns: { rust: "i32", go: "int" } },
      ],
    },
  },
  "find-median-from-data-stream": {
    kind: "design",
    design: {
      className: "MedianFinder",
      wireFormat: "ops-tuples",
      ctor: { params: [] },
      methods: [
        { name: "addNum", params: [{ name: "num", type: { rust: "i32", go: "int" } }], returns: { rust: "()", go: "" } },
        { name: "findMedian", params: [], returns: { rust: "f64", go: "float64" } },
      ],
    },
  },
  "design-twitter": {
    kind: "design",
    design: {
      className: "Twitter",
      wireFormat: "ops-args",
      ctor: { params: [] },
      methods: [
        { name: "postTweet", params: [{ name: "userId", type: { rust: "i32", go: "int" } }, { name: "tweetId", type: { rust: "i32", go: "int" } }], returns: { rust: "()", go: "" } },
        { name: "getNewsFeed", params: [{ name: "userId", type: { rust: "i32", go: "int" } }], returns: { rust: "Vec<i32>", go: "[]int" } },
        { name: "follow", params: [{ name: "followerId", type: { rust: "i32", go: "int" } }, { name: "followeeId", type: { rust: "i32", go: "int" } }], returns: { rust: "()", go: "" } },
        { name: "unfollow", params: [{ name: "followerId", type: { rust: "i32", go: "int" } }, { name: "followeeId", type: { rust: "i32", go: "int" } }], returns: { rust: "()", go: "" } },
      ],
    },
  },
  "time-based-key-value-store": {
    kind: "design",
    design: {
      className: "TimeMap",
      wireFormat: "ops-args",
      ctor: { params: [] },
      methods: [
        { name: "set", params: [{ name: "key", type: { rust: "String", go: "string" } }, { name: "value", type: { rust: "String", go: "string" } }, { name: "timestamp", type: { rust: "i32", go: "int" } }], returns: { rust: "()", go: "" } },
        { name: "get", params: [{ name: "key", type: { rust: "String", go: "string" } }, { name: "timestamp", type: { rust: "i32", go: "int" } }], returns: { rust: "String", go: "string" } },
      ],
    },
  },
  "insert-delete-getrandom-o1": {
    kind: "design",
    design: {
      className: "RandomizedSet",
      wireFormat: "ops-args",
      ctor: { params: [] },
      methods: [
        { name: "insert", params: [{ name: "val", type: { rust: "i32", go: "int" } }], returns: { rust: "bool", go: "bool" } },
        { name: "remove", params: [{ name: "val", type: { rust: "i32", go: "int" } }], returns: { rust: "bool", go: "bool" } },
        // getRandom omitted from tests intentionally.
      ],
    },
  },
  "design-hit-counter": {
    kind: "design",
    design: {
      className: "HitCounter",
      wireFormat: "ops-args",
      ctor: { params: [] },
      methods: [
        { name: "hit", params: [{ name: "timestamp", type: { rust: "i32", go: "int" } }], returns: { rust: "()", go: "" } },
        { name: "getHits", params: [{ name: "timestamp", type: { rust: "i32", go: "int" } }], returns: { rust: "i32", go: "int" } },
      ],
    },
  },
  "design-circular-queue": {
    kind: "design",
    design: {
      className: "MyCircularQueue",
      wireFormat: "ops-args",
      ctor: { params: [{ name: "k", type: { rust: "i32", go: "int" } }] },
      methods: [
        { name: "enQueue", params: [{ name: "value", type: { rust: "i32", go: "int" } }], returns: { rust: "bool", go: "bool" } },
        { name: "deQueue", params: [], returns: { rust: "bool", go: "bool" } },
        { name: "Front", params: [], returns: { rust: "i32", go: "int" } },
        { name: "Rear", params: [], returns: { rust: "i32", go: "int" } },
        { name: "isEmpty", params: [], returns: { rust: "bool", go: "bool" } },
        { name: "isFull", params: [], returns: { rust: "bool", go: "bool" } },
      ],
    },
  },

  // ===== Codec round-trip =====
  "serialize-and-deserialize-binary-tree": {
    kind: "codec-roundtrip",
    // Codec round-trip: user implements a Codec class with serialize/deserialize.
    // The harness materializes the wire tree, drives codec.serialize → codec.deserialize,
    // then re-serializes the result and compares to the input shape.
    design: {
      className: "Codec",
      ctor: { params: [] },
      methods: [
        { name: "serialize", params: [{ name: "root", type: { rust: "Option<Rc<RefCell<TreeNode>>>", go: "*TreeNode" } }], returns: { rust: "String", go: "string" } },
        { name: "deserialize", params: [{ name: "data", type: { rust: "String", go: "string" } }], returns: { rust: "Option<Rc<RefCell<TreeNode>>>", go: "*TreeNode" } },
      ],
    },
  },

  // ===== Numeric overflow =====
  "coin-change-ii": { numericOverflow: "i64",
    codeTypes: {
      rust: { params: [{ name: "amount", type: "i32" }, { name: "coins", type: "Vec<i32>" }], returns: "i64" },
      go:   { params: [{ name: "amount", type: "int" }, { name: "coins", type: "[]int" }], returns: "int64" },
    },
  },
  "unique-paths-ii":  { numericOverflow: "skip-rust-stress" },  // outputs exceed u128
  "maximum-product-subarray": { numericOverflow: "skip-rust-stress" },
  "evaluate-reverse-polish-notation": { numericOverflow: "skip-rust-stress" },
  "reverse-bits": {
    codeTypes: {
      rust: { params: [{ name: "n", type: "u32" }], returns: "u32" },
      go:   { params: [{ name: "n", type: "uint32" }], returns: "uint32" },
    },
  },
  "hamming-distance": {
    codeTypes: {
      rust: { params: [{ name: "x", type: "u32" }, { name: "y", type: "u32" }], returns: "i32" },
      go:   { params: [{ name: "x", type: "uint32" }, { name: "y", type: "uint32" }], returns: "int" },
    },
  },
  "palindrome-number": {
    codeTypes: {
      rust: { params: [{ name: "x", type: "i64" }], returns: "bool" },
      go:   { params: [{ name: "x", type: "int64" }], returns: "bool" },
    },
  },
  "number-of-1-bits": {
    codeTypes: {
      rust: { params: [{ name: "n", type: "u32" }], returns: "i32" },
      go:   { params: [{ name: "n", type: "uint32" }], returns: "int" },
    },
  },
  "divide-two-integers": {
    codeTypes: {
      rust: { params: [{ name: "dividend", type: "i32" }, { name: "divisor", type: "i32" }], returns: "i32" },
      go:   { params: [{ name: "dividend", type: "int" }, { name: "divisor", type: "int" }], returns: "int" },
    },
  },
  "pow-x-n": {
    codeTypes: {
      rust: { params: [{ name: "x", type: "f64" }, { name: "n", type: "i32" }], returns: "f64" },
      go:   { params: [{ name: "x", type: "float64" }, { name: "n", type: "int" }], returns: "float64" },
    },
  },
  "sqrt-x": {
    codeTypes: {
      rust: { params: [{ name: "x", type: "i32" }], returns: "i32" },
      go:   { params: [{ name: "x", type: "int" }], returns: "int" },
    },
  },

  // ===== Canonical wire-shape graph/random-list problems =====
  // These take/return the wire shape directly via typed structs added to each
  // language's PRELUDE (RandomList, GraphRepr). The user works on the same
  // {vals,randoms} / {nodes,adj} encoding the JS path uses.
  "clone-graph": {
    codeTypes: {
      rust: { params: [{ name: "graph", type: "GraphRepr" }], returns: "GraphRepr" },
      go:   { params: [{ name: "graph", type: "GraphRepr" }], returns: "GraphRepr" },
    },
  },
  "copy-list-with-random-pointer": {
    codeTypes: {
      rust: { params: [{ name: "list", type: "RandomList" }], returns: "RandomList" },
      go:   { params: [{ name: "list", type: "RandomList" }], returns: "RandomList" },
    },
  },
  "alien-dictionary": {
    // Multiple valid topological orderings are accepted; the
    // `topologicalValid` comparator validates against the input words.
    comparison: "topologicalValid",
  },
  "reconstruct-itinerary": {
    // Eulerian path output verification is fine, but test answer is canonical lex-smallest.
    // Standard exact compare works; flag for now until verified.
  },
};
