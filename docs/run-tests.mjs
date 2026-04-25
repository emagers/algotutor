// Validates docs/questions/*.json by running each test through the reference
// solutions in docs/solutions.mjs. Exit code 0 = all pass, 1 = any failure.
//
// Use the same shape (--solutions=<path>) to validate your own implementation
// later: any module that exports the function names listed in
// signature.fn for each question.
//
// Usage:
//   node docs/run-tests.mjs                         # use reference solutions
//   node docs/run-tests.mjs --filter=two-sum        # one question
//   node docs/run-tests.mjs --category=stress       # only stress tests

import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  adapters,
  comparators,
  deepClone,
  referenceSolutions,
} from "./solutions.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QDIR = resolve(__dirname, "questions");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

const files = readdirSync(QDIR).filter((f) => f.endsWith(".json")).sort();
let pass = 0, fail = 0;
const failures = [];
const t0 = Date.now();

for (const f of files) {
  const q = JSON.parse(readFileSync(resolve(QDIR, f), "utf8"));
  if (args.filter && q.id !== args.filter) continue;

  const fn = referenceSolutions[q.id];
  if (!fn) {
    console.error(`✗ ${q.id}: no reference solution registered`);
    fail++;
    continue;
  }
  const cmp = comparators[q.comparison];
  if (!cmp) {
    console.error(`✗ ${q.id}: unknown comparison ${q.comparison}`);
    fail++;
    continue;
  }

  let qPass = 0, qFail = 0;
  for (const test of q.tests) {
    if (args.category && test.category !== args.category) continue;
    const passedArgs = q.signature.params.map((p) => {
      const adapt = adapters[p.adapt ?? "identity"];
      return adapt(deepClone(test.input[p.name]));
    });
    let actual;
    try {
      const ret = fn(...passedArgs);
      const outAdapt = adapters[q.signature.returnAdapt ?? "identity"];
      actual = outAdapt(ret);
    } catch (e) {
      qFail++; fail++;
      failures.push({ id: q.id, test: test.name, error: String(e) });
      continue;
    }
    if (cmp(actual, test.output)) {
      qPass++; pass++;
    } else {
      qFail++; fail++;
      const summarize = (v) => {
        const s = JSON.stringify(v);
        return s.length > 200 ? s.slice(0, 200) + "..." : s;
      };
      failures.push({
        id: q.id,
        test: test.name,
        category: test.category,
        expected: summarize(test.output),
        actual: summarize(actual),
      });
    }
  }
  const status = qFail === 0 ? "✓" : "✗";
  console.log(`${status} ${q.id.padEnd(50)} ${qPass}/${qPass + qFail}`);
}

const dt = ((Date.now() - t0) / 1000).toFixed(2);
console.log(`\n${pass} passed, ${fail} failed in ${dt}s (${files.length} questions)`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures.slice(0, 20)) console.log(JSON.stringify(f, null, 2));
}
process.exit(fail === 0 ? 0 : 1);
