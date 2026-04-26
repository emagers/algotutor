// Sweep: try every function-kind problem in Rust using a no-op stub, just to
// see how many compile cleanly. We're not asserting correctness — just that
// the harness generator emits valid Rust for the inferred types.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { glob } from "node:fs/promises";

async function readQuestion(slug) {
  return JSON.parse(await readFile(resolve("docs/questions", `${slug}.json`), "utf8"));
}

const indexFile = JSON.parse(await readFile("docs/index.json", "utf8"));
const slugs = indexFile.items.map((it) => it.id);

let ok = 0, compileErr = 0, runErr = 0, fail = 0, skipped = 0;
const failures = [];

for (const slug of slugs) {
  const q = await readQuestion(slug);
  const sig = q.signature;
  if ((sig.kind || "function") !== "function") { skipped++; continue; }
  if (sig.backendUnsupported?.rust) { skipped++; continue; }

  // Generate a stub body that tries to construct a default return.
  const ret = sig.codeTypes.rust.returns;
  const fn = sig.fn;
  const params = sig.codeTypes.rust.params.map((p) => `_${p.name}: ${p.type}`).join(", ");
  let stubBody;
  if (ret === "i32") stubBody = "0";
  else if (ret === "i64") stubBody = "0";
  else if (ret === "f64") stubBody = "0.0";
  else if (ret === "bool") stubBody = "false";
  else if (ret === "String") stubBody = `String::new()`;
  else if (ret === "u32") stubBody = "0";
  else if (ret.startsWith("Vec<")) stubBody = "Vec::new()";
  else if (ret.startsWith("Option<")) stubBody = "None";
  else if (ret === "()") stubBody = "()";
  else stubBody = "Default::default()";

  const code = `fn ${fn}(${params}) -> ${ret} { ${stubBody} }`;

  const r = await fetch("http://localhost:9090/api/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, language: "rust", code, mode: "tests" }),
  }).then((x) => x.json()).catch((e) => ({ compileError: "fetch failed: " + e.message }));

  if (r.compileError) {
    if (r.compileError.includes("cargo build failed")) {
      compileErr++;
      failures.push({ slug, kind: "compile", msg: r.compileError.split("\n").find((l) => l.includes("error")) || r.compileError.slice(0, 120) });
    } else {
      runErr++;
      failures.push({ slug, kind: "runtime", msg: r.compileError.slice(0, 120) });
    }
    continue;
  }
  // We don't care about pass/fail — the stub returns garbage. We care that it RAN.
  if (r.results.length > 0) ok++;
  else fail++;
}
console.log(`\nSWEEP: ok=${ok} compileErr=${compileErr} runErr=${runErr} fail=${fail} skipped=${skipped}`);
if (failures.length) {
  console.log("\nFirst 25 failures:");
  failures.slice(0, 25).forEach((f) => console.log(`  ${f.slug.padEnd(45)} [${f.kind}] ${f.msg}`));
}
const counts = {};
for (const f of failures) {
  const key = (f.msg.match(/error\[?[^\]:]*\]?:[^—]+/) || [f.msg])[0].trim().slice(0, 100);
  counts[key] = (counts[key] || 0) + 1;
}
console.log("\nFailure clusters:");
Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([k,v]) => console.log(`  ${v.toString().padStart(3)}× ${k}`));
