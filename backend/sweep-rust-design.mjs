// Phase D.3 stub-sweep: every design problem must at least produce a syntactically
// valid harness when the user provides a minimal stub for the class. We won't
// pass tests with stubs but they should COMPILE and run (errors expected).
import { readdirSync, readFileSync } from "node:fs";

const ENDPOINT = "http://localhost:9090/api/run";

function stubFor(question) {
  const d = question.signature.design;
  const className = d.className;
  const ctorParams = d.ctor?.params || [];
  const ctorArgs = ctorParams.map((p) => `_${p.name}: ${p.type.rust}`).join(", ");
  const methods = d.methods.map((m) => {
    const ps = m.params.map((p) => `_${p.name}: ${p.type.rust}`).join(", ");
    const ret = m.returns?.rust || "()";
    const body = ret === "()" || ret === "" ? `{}` : `{ unimplemented!() }`;
    return `    pub fn ${m.name}(&mut self, ${ps}) -> ${ret} ${body}`;
  }).join("\n");
  return `pub struct ${className} {}
impl ${className} {
    pub fn new(${ctorArgs}) -> Self { ${className} {} }
${methods}
}`;
}

const files = readdirSync("docs/questions").filter((f) => f.endsWith(".json"));
const designs = [];
for (const f of files) {
  const q = JSON.parse(readFileSync("docs/questions/" + f, "utf8"));
  if (q.signature.kind === "design") designs.push(q);
}

let okCount = 0, compileFailCount = 0;
for (const q of designs) {
  const code = stubFor(q);
  process.stdout.write(`${q.id.padEnd(45)} `);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug: q.id, language: "rust", code }),
    });
    const j = await res.json();
    if (j.compileError) {
      console.log(`COMPILE FAIL: ${j.compileError.slice(0, 200).replace(/\n/g, " ")}`);
      compileFailCount++;
    } else {
      okCount++;
      console.log(`✓ compiled (${j.results.length} cases ran)`);
    }
  } catch (e) {
    console.log(`request error: ${e.message}`);
    compileFailCount++;
  }
}
console.log(`\n${okCount}/${designs.length} compiled. ${compileFailCount} compile failures.`);
process.exit(compileFailCount === 0 ? 0 : 1);
