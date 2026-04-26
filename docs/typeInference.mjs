// Type inference for Rust + Go from (adapter, sample value) shape.
// Used at build time to populate signature.codeTypes for ~150 plain-function
// problems that don't need manual overrides.

function shapeOf(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return "bool";
  if (typeof v === "string") return "string";
  if (typeof v === "number") return Number.isInteger(v) ? "int" : "float";
  if (Array.isArray(v)) {
    if (v.length === 0) return "array<unknown>";
    // Sample first non-null element shape
    const inner = v.find((x) => x !== null && x !== undefined);
    return `array<${inner === undefined ? "unknown" : shapeOf(inner)}>`;
  }
  return "object";
}

const RUST_PRIM = {
  int: "i32",
  float: "f64",
  bool: "bool",
  string: "String",
  null: "()",
};
const GO_PRIM = {
  int: "int",
  float: "float64",
  bool: "bool",
  string: "string",
  null: "any",
};

function rustTypeFromShape(shape) {
  if (shape in RUST_PRIM) return RUST_PRIM[shape];
  if (shape.startsWith("array<")) {
    const inner = shape.slice(6, -1);
    return `Vec<${rustTypeFromShape(inner)}>`;
  }
  return "serde_json::Value";
}
function goTypeFromShape(shape) {
  if (shape in GO_PRIM) return GO_PRIM[shape];
  if (shape.startsWith("array<")) {
    const inner = shape.slice(6, -1);
    // Go strings/ints/etc. are simple
    return `[]${goTypeFromShape(inner)}`;
  }
  return "any";
}

// Map adapter to a forced type, regardless of shape inference.
const ADAPTER_TYPES = {
  arrayToLinkedList: { rust: "Option<Box<ListNode>>", go: "*ListNode" },
  linkedListToArray: { rust: "Option<Box<ListNode>>", go: "*ListNode" },
  arrayToBinaryTree: { rust: "Option<Rc<RefCell<TreeNode>>>", go: "*TreeNode" },
  binaryTreeToLevelOrder: { rust: "Option<Rc<RefCell<TreeNode>>>", go: "*TreeNode" },
};

function inferParamType(param, sampleValue) {
  const adapt = param.adapt || "identity";
  if (ADAPTER_TYPES[adapt]) return ADAPTER_TYPES[adapt];
  const shape = shapeOf(sampleValue);
  return { rust: rustTypeFromShape(shape), go: goTypeFromShape(shape) };
}

function inferReturnType(returnAdapt, sampleOutput) {
  const adapt = returnAdapt || "identity";
  if (ADAPTER_TYPES[adapt]) return ADAPTER_TYPES[adapt];
  const shape = shapeOf(sampleOutput);
  return { rust: rustTypeFromShape(shape), go: goTypeFromShape(shape) };
}

// Walk all tests and pick the most permissive shape (e.g., if any test has a
// non-null element where the first test had an empty array, prefer that).
function bestSampleForParam(question, paramName) {
  for (const t of question.tests) {
    const v = t.input?.[paramName];
    if (v !== undefined && v !== null) {
      // For arrays, prefer the longest non-empty one to disambiguate inner type.
      if (Array.isArray(v) && v.length === 0) continue;
      return v;
    }
  }
  // Fall back to first test value even if empty/null.
  return question.tests[0]?.input?.[paramName];
}

function bestSampleForReturn(question) {
  for (const t of question.tests) {
    if (t.output !== undefined && t.output !== null) {
      if (Array.isArray(t.output) && t.output.length === 0) continue;
      return t.output;
    }
  }
  return question.tests[0]?.output;
}

export function inferCodeTypes(question) {
  const params = (question.signature.params || []).map((p) => {
    const sample = bestSampleForParam(question, p.name);
    const t = inferParamType(p, sample);
    return { name: p.name, rust: t.rust, go: t.go };
  });
  const ret = inferReturnType(question.signature.returnAdapt, bestSampleForReturn(question));
  return {
    rust: {
      params: params.map((p) => ({ name: p.name, type: p.rust })),
      returns: ret.rust,
    },
    go: {
      params: params.map((p) => ({ name: snakeToGo(p.name), type: p.go })),
      returns: ret.go,
    },
  };
}

// Go convention: parameter names stay camelCase (matching JS).
function snakeToGo(s) { return s; }
