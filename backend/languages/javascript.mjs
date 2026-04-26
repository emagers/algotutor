// JavaScript test runner. Loads the user's code via `new Function`, drives
// every test through adapters, and reports pass/fail per case.

import { adapters, comparators, deepClone, ListNode, TreeNode } from "../harness/js/runtime.mjs";

const CASE_TIMEOUT_MS = 5000;

function makeUserFn(code, fnName, designClassName) {
  const sym = designClassName || fnName;
  const wrapper = `
    "use strict";
    ${code}
    ;return (typeof ${sym} !== "undefined") ? ${sym} : null;
  `;
  // eslint-disable-next-line no-new-func
  const factory = new Function("ListNode", "TreeNode", wrapper);
  return factory(ListNode, TreeNode);
}

function runFunctionTest(question, fn, test) {
  const inputs = question.signature.params.map((p) => {
    const adapt = adapters[p.adapt || "identity"];
    return adapt(deepClone(test.input[p.name]));
  });
  const judgeSource = question.signature.judgeSource || "return";
  const t0 = Date.now();
  const ret = fn(...inputs);
  const dur = Date.now() - t0;

  let actual;
  if (judgeSource.startsWith("param:")) {
    const idx = Number(judgeSource.slice(6));
    actual = inputs[idx];
  } else {
    actual = ret;
  }
  const outAdapt = adapters[question.signature.returnAdapt || "identity"];
  actual = outAdapt(actual);
  return { actual, durationMs: dur };
}

function runDesignTest(question, ClassRef, test) {
  const design = question.signature.design;
  const wire = design.wireFormat || "ops-tuples";
  let methods, args;
  if (wire === "ops-tuples") {
    const ops = test.input.ops || [];
    methods = ops.map((o) => o[0]);
    args = ops.map((o) => o.slice(1));
  } else {
    methods = test.input.operations || [];
    args = test.input.args || [];
  }
  const t0 = Date.now();
  let instance = null;
  const out = [];
  for (let i = 0; i < methods.length; i++) {
    const name = methods[i];
    const a = args[i] || [];
    if (name === design.className) {
      instance = new ClassRef(...a);
      out.push(null);
    } else {
      if (instance === null) instance = new ClassRef();
      const r = instance[name](...a);
      out.push(r === undefined ? null : r);
    }
  }
  return { actual: out, durationMs: Date.now() - t0 };
}

export async function runJavascript({ question, code, tests }) {
  const kind = question.signature.kind || "function";
  const fnName = question.signature.fn;
  const designName = question.signature.design?.className;

  let user;
  try {
    user = makeUserFn(code, fnName, designName);
  } catch (err) {
    return { results: [], compileError: `Parse error: ${err.message}` };
  }
  if (!user) {
    return { results: [], compileError: `Could not find ${designName || fnName} in your code.` };
  }

  const cmp = comparators[question.comparison?.kind || "exact"] || comparators.exact;
  const results = [];
  const ru0 = process.resourceUsage();
  const memBefore = process.memoryUsage().rss;
  let memPeak = memBefore;
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    try {
      const promise = (async () => {
        if (kind === "design" || kind === "codec-roundtrip") {
          return runDesignTest(question, user, test);
        }
        return runFunctionTest(question, user, test);
      })();
      const { actual, durationMs } = await Promise.race([
        promise,
        new Promise((_, rej) => setTimeout(() => rej(new Error("case timeout")), CASE_TIMEOUT_MS)),
      ]);
      const expected = test.output;
      const pass = cmp(actual, expected);
      results.push({ index: i, status: pass ? "pass" : "fail", expected, actual, durationMs });
    } catch (err) {
      results.push({
        index: i,
        status: err.message === "case timeout" ? "timeout" : "error",
        expected: test.output,
        actual: null,
        durationMs: 0,
        stderr: err.message,
      });
    }
    const rss = process.memoryUsage().rss;
    if (rss > memPeak) memPeak = rss;
  }
  const ru1 = process.resourceUsage();
  const metrics = {
    peakMemBytes: memPeak,
    cpuMs: Math.round(((ru1.userCPUTime + ru1.systemCPUTime) - (ru0.userCPUTime + ru0.systemCPUTime)) / 1000),
    wallMs: results.reduce((a, r) => a + (r.durationMs || 0), 0),
  };
  return { results, metrics };
}
