// Comprehensive harness sweep — every problem × every language.
//
// For each problem we generate a *stub* that has the correct signature and
// returns a default value (no real logic). We then submit it to the backend
// and verify the harness emitted code that:
//   - compiles cleanly (Rust/Go) — no `compileError`
//   - executes — `results.length > 0`
//
// We do NOT assert correctness — stubs return garbage and most tests will
// fail. The point is: every {problem, language} combination is *evaluable*.
//
// Run: node backend/sweep-all.mjs   (backend must be up on :9090)

import { readFileSync, readdirSync } from "node:fs";

const ENDPOINT = "http://localhost:9090/api/run";
const LANGS = ["javascript", "rust", "go"];

const files = readdirSync("docs/questions").filter((f) => f.endsWith(".json"));
const all = files.map((f) => JSON.parse(readFileSync("docs/questions/" + f, "utf8")));
all.sort((a, b) => a.id.localeCompare(b.id));

// ─── Stub generators per language ──────────────────────────────────────────

function rustZero(t) {
  if (t === "i32" || t === "i64" || t === "u32" || t === "u64" || t === "usize" || t === "isize") return "0";
  if (t === "f64" || t === "f32") return "0.0";
  if (t === "bool") return "false";
  if (t === "String") return "String::new()";
  if (t === "char") return "'\\0'";
  if (t.startsWith("Vec<")) return "Vec::new()";
  if (t.startsWith("Option<")) return "None";
  if (t === "()" || t === "") return "";
  return "Default::default()";
}
function goZero(t) {
  if (!t) return "";
  if (t === "int" || t === "int64" || t === "int32") return "0";
  if (t === "float64" || t === "float32") return "0.0";
  if (t === "string") return `""`;
  if (t === "bool") return "false";
  if (t === "byte" || t === "rune") return "0";
  if (t.startsWith("[]") || t.startsWith("*") || t.startsWith("map[")) return "nil";
  return `*new(${t})`;
}

function stubJs(q) {
  if (q.signature.kind === "design" || q.signature.kind === "codec-roundtrip") {
    const d = q.signature.design;
    const methods = d.methods.map((m) => `    ${m.name}(${m.params.map((p) => p.name).join(", ")}) { return null; }`).join("\n");
    return `class ${d.className} {
  constructor(${(d.ctor?.params || []).map((p) => p.name).join(", ")}) {}
${methods}
}`;
  }
  const sig = q.signature;
  const params = sig.params.map((p) => p.name).join(", ");
  return `function ${sig.fn}(${params}) {}`;
}

function stubRust(q) {
  const kind = q.signature.kind || "function";
  if (kind === "design" || kind === "codec-roundtrip") {
    const d = q.signature.design;
    const cls = d.className;
    const ctorParams = (d.ctor?.params || []).map((p) => `_${p.name}: ${p.type.rust}`).join(", ");
    const methods = d.methods.map((m) => {
      const ps = m.params.map((p) => `_${p.name}: ${p.type.rust}`).join(", ");
      const ret = m.returns?.rust || "()";
      const arrow = ret === "()" || ret === "" ? "" : ` -> ${ret}`;
      const body = ret === "()" || ret === "" ? "{}" : `{ ${rustZero(ret)} }`;
      const sep = ps ? ", " : "";
      return `    pub fn ${m.name}(&mut self${sep}${ps})${arrow} ${body}`;
    }).join("\n");
    return `pub struct ${cls} {}
impl ${cls} {
    pub fn new(${ctorParams}) -> Self { ${cls} {} }
${methods}
}`;
  }
  const ct = q.signature.codeTypes.rust;
  const fn = q.signature.fn;
  const params = ct.params.map((p) => `_${p.name.replace(/^_/, "")}: ${p.type}`).join(", ");
  const ret = ct.returns;
  const arrow = ret === "()" || ret === "" ? "" : ` -> ${ret}`;
  const body = ret === "()" || ret === "" ? "" : rustZero(ret);
  return `fn ${fn}(${params})${arrow} { ${body} }`;
}

function stubGo(q) {
  const kind = q.signature.kind || "function";
  if (kind === "design" || kind === "codec-roundtrip") {
    const d = q.signature.design;
    const cls = d.className;
    const ctorParams = (d.ctor?.params || []).map((p) => `${p.name} ${p.type.go}`).join(", ");
    const methods = d.methods.map((m) => {
      const ps = m.params.map((p) => `${p.name} ${p.type.go}`).join(", ");
      const ret = m.returns?.go || "";
      const retDecl = ret === "" ? "" : ` ${ret}`;
      const body = ret === "" ? "" : `return ${goZero(ret)}`;
      return `func (this *${cls}) ${m.name}(${ps})${retDecl} {\n\t${body}\n}`;
    }).join("\n\n");
    return `type ${cls} struct {}\nfunc Constructor(${ctorParams}) ${cls} { return ${cls}{} }\n${methods}`;
  }
  const ct = q.signature.codeTypes.go;
  const fn = q.signature.fn;
  const params = ct.params.map((p) => `${p.name} ${p.type}`).join(", ");
  const ret = ct.returns;
  const retDecl = ret === "" ? "" : ` ${ret}`;
  const body = ret === "" ? "" : `return ${goZero(ret)}`;
  return `func ${fn}(${params})${retDecl} {\n\t${body}\n}`;
}

const STUBBERS = { javascript: stubJs, rust: stubRust, go: stubGo };

// ─── Run sweep ─────────────────────────────────────────────────────────────

function isSupported(q, lang) {
  const kind = q.signature.kind || "function";
  if (kind !== "function" && kind !== "design" && kind !== "codec-roundtrip") return false;
  if (q.signature.backendUnsupported?.[lang]) return false;
  return true;
}

const matrix = {};
for (const lang of LANGS) matrix[lang] = { ok: [], compile: [], evalErr: [], skipped: [] };

console.log(`Sweeping ${all.length} problems × ${LANGS.length} languages…\n`);

let n = 0;
for (const q of all) {
  n++;
  process.stdout.write(`[${String(n).padStart(3)}/${all.length}] ${q.id.padEnd(50)} `);
  const cells = [];
  for (const lang of LANGS) {
    if (!isSupported(q, lang)) { matrix[lang].skipped.push(q.id); cells.push("-"); continue; }
    const code = STUBBERS[lang](q);
    let r;
    try {
      r = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: q.id, language: lang, code }),
      }).then((x) => x.json());
    } catch (e) {
      matrix[lang].evalErr.push({ id: q.id, msg: e.message });
      cells.push("X");
      continue;
    }
    if (r.compileError) {
      matrix[lang].compile.push({ id: q.id, msg: r.compileError.slice(0, 240).replace(/\s+/g, " ") });
      cells.push("C");
      continue;
    }
    if (!r.results || r.results.length === 0) {
      matrix[lang].evalErr.push({ id: q.id, msg: "no results returned" });
      cells.push("?");
      continue;
    }
    matrix[lang].ok.push(q.id);
    cells.push("✓");
  }
  console.log(cells.join(" "));
}

console.log("\n========== SUMMARY ==========");
for (const lang of LANGS) {
  const m = matrix[lang];
  const total = m.ok.length + m.compile.length + m.evalErr.length;
  console.log(`${lang.padEnd(11)} ok=${m.ok.length}/${total}   skipped=${m.skipped.length}   compileFail=${m.compile.length}   evalErr=${m.evalErr.length}`);
}

let totalProblems = 0, totalFails = 0;
for (const lang of LANGS) {
  totalProblems += matrix[lang].ok.length + matrix[lang].compile.length + matrix[lang].evalErr.length;
  totalFails += matrix[lang].compile.length + matrix[lang].evalErr.length;
}
console.log(`\nTotal {problem, lang} pairs evaluated: ${totalProblems}, failures: ${totalFails}`);

if (totalFails > 0) {
  console.log("\n========== FAILURES ==========");
  for (const lang of LANGS) {
    for (const f of matrix[lang].compile) {
      console.log(`[${lang}] ${f.id}: ${f.msg.slice(0, 200)}`);
    }
    for (const f of matrix[lang].evalErr) {
      console.log(`[${lang}] ${f.id}: ${f.msg}`);
    }
  }
}

console.log("\n========== SKIPPED (backendUnsupported) ==========");
const skippedAll = new Set();
for (const lang of LANGS) for (const id of matrix[lang].skipped) skippedAll.add(id);
for (const id of [...skippedAll].sort()) {
  const langs = LANGS.filter((l) => matrix[l].skipped.includes(id));
  console.log(`  ${id.padEnd(50)} (${langs.join(", ")})`);
}

process.exit(totalFails === 0 ? 0 : 1);
