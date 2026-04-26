// Phase D Go stub-sweep: every supported problem must produce a syntactically
// valid harness and compile when given a stub user fn/struct.
import { readdirSync, readFileSync } from "node:fs";

const ENDPOINT = "http://localhost:9090/api/run";

// Default Go zero-value expressions for stub returns.
function zeroLit(t) {
  if (!t || t === "") return "";
  if (t === "int" || t === "int64" || t === "int32") return "0";
  if (t === "float64" || t === "float32") return "0.0";
  if (t === "string") return `""`;
  if (t === "bool") return "false";
  if (t === "byte" || t === "rune") return "0";
  if (t.startsWith("[]")) return "nil";
  if (t.startsWith("*")) return "nil";
  if (t.startsWith("map[")) return "nil";
  return "*new(" + t + ")"; // fallback (e.g., struct)
}

function stubForFunction(q) {
  const ct = q.signature.codeTypes.go;
  const fn = q.signature.fn;
  const params = ct.params.map((p) => `${p.name} ${p.type}`).join(", ");
  const ret = ct.returns;
  const body = ret === "" ? "/* mutate */" : `return ${zeroLit(ret)}`;
  const retDecl = ret === "" ? "" : ` ${ret}`;
  return `func ${fn}(${params})${retDecl} {\n\t${body}\n}`;
}

function stubForDesign(q) {
  const d = q.signature.design;
  const cls = d.className;
  const ctorParams = (d.ctor?.params || []).map((p) => `${p.name} ${p.type.go}`).join(", ");
  const methodDecls = (d.methods || []).map((m) => {
    const ps = m.params.map((p) => `${p.name} ${p.type.go}`).join(", ");
    const ret = m.returns?.go || "";
    const retDecl = ret === "" ? "" : ` ${ret}`;
    const body = ret === "" ? "/* mutate */" : `return ${zeroLit(ret)}`;
    return `func (this *${cls}) ${m.name}(${ps})${retDecl} {\n\t${body}\n}`;
  }).join("\n\n");
  return `type ${cls} struct {}

func Constructor(${ctorParams}) ${cls} {
\treturn ${cls}{}
}

${methodDecls}`;
}

function stubFor(q) {
  if (q.signature.kind === "design") return stubForDesign(q);
  return stubForFunction(q);
}

function isSupported(q) {
  const kind = q.signature.kind || "function";
  if (kind !== "function" && kind !== "design") return false;
  if (q.signature.backendUnsupported?.go) return false;
  return true;
}

const files = readdirSync("docs/questions").filter((f) => f.endsWith(".json"));
const all = files.map((f) => JSON.parse(readFileSync("docs/questions/" + f, "utf8")));
const supported = all.filter(isSupported);
const skipped = all.filter((q) => !isSupported(q));

console.log(`${supported.length} supported (sweeping), ${skipped.length} skipped`);

let okCount = 0;
const failures = [];
let i = 0;
for (const q of supported) {
  i++;
  const code = stubFor(q);
  process.stdout.write(`[${String(i).padStart(3)}/${supported.length}] ${q.id.padEnd(48)} `);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug: q.id, language: "go", code }),
    });
    const j = await res.json();
    if (j.compileError) {
      const short = j.compileError.slice(0, 160).replace(/\n/g, " ");
      console.log(`COMPILE FAIL: ${short}`);
      failures.push({ id: q.id, error: j.compileError.slice(0, 800) });
    } else {
      okCount++;
      console.log(`✓ (${j.results.length} cases)`);
    }
  } catch (e) {
    console.log(`request error: ${e.message}`);
    failures.push({ id: q.id, error: e.message });
  }
}
console.log(`\n${okCount}/${supported.length} compiled.`);
if (failures.length) {
  console.log("\n=== Failures ===");
  for (const f of failures.slice(0, 5)) {
    console.log(`--- ${f.id} ---\n${f.error}\n`);
  }
}
process.exit(failures.length === 0 ? 0 : 1);
