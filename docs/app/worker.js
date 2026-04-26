// Web Worker that runs user-submitted JavaScript against test cases.
// Loaded with { type: "module" }; imports the shared runtime so adapters and
// comparators match the Node test runner exactly.

import { adapters, comparators, deepClone } from "../runtime.mjs";

function buildUserFn(code, fnName) {
  // Wrap user code in a function so locally declared functions/vars stay local,
  // then return the named function back. Strict mode by default for ES modules.
  const wrapper = `"use strict";\n${code}\n;return typeof ${fnName} === "function" ? ${fnName} : null;`;
  // eslint-disable-next-line no-new-func
  const factory = new Function(wrapper);
  return factory();
}

function summarize(v) {
  let s;
  try { s = JSON.stringify(v); } catch { s = String(v); }
  if (s === undefined) s = String(v);
  return s.length > 500 ? s.slice(0, 500) + "..." : s;
}

function runOne(fn, signature, comparison, test) {
  const t0 = performance.now();
  let actual, ok = false, error = null;
  try {
    const passed = signature.params.map((p) => {
      const adapt = adapters[p.adapt ?? "identity"];
      return adapt(deepClone(test.input[p.name]));
    });
    const ret = fn(...passed);
    const outAdapt = adapters[signature.returnAdapt ?? "identity"];
    actual = outAdapt(ret);
    ok = comparators[comparison](actual, test.output);
  } catch (e) {
    error = (e && e.stack) ? String(e.stack).split("\n").slice(0, 4).join("\n") : String(e);
  }
  const dt = performance.now() - t0;
  return {
    name: test.name,
    category: test.category,
    pass: ok,
    timeMs: dt,
    error,
    expected: summarize(test.output),
    actual: error ? null : summarize(actual),
    inputPreview: summarize(test.input),
  };
}

self.onmessage = (e) => {
  const { code, signature, comparison, tests, mode, customInput } = e.data;
  try {
    const fn = buildUserFn(code, signature.fn);
    if (typeof fn !== "function") {
      self.postMessage({
        type: "fatal",
        error: `Could not find function "${signature.fn}". Make sure your function is named exactly "${signature.fn}".`,
      });
      return;
    }

    if (mode === "custom") {
      const fakeTest = {
        name: "custom",
        category: "example",
        input: customInput,
        output: null,
      };
      // Run but don't compare; we just want the actual return.
      const t0 = performance.now();
      let actual, error = null;
      try {
        const passed = signature.params.map((p) => {
          const adapt = adapters[p.adapt ?? "identity"];
          return adapt(deepClone(customInput[p.name]));
        });
        const ret = fn(...passed);
        const outAdapt = adapters[signature.returnAdapt ?? "identity"];
        actual = outAdapt(ret);
      } catch (err) {
        error = (err && err.stack) ? String(err.stack).split("\n").slice(0, 4).join("\n") : String(err);
      }
      self.postMessage({
        type: "custom-result",
        timeMs: performance.now() - t0,
        actual: error ? null : summarize(actual),
        error,
      });
      return;
    }

    // mode === "all" — run every test
    const results = [];
    for (const test of tests) {
      const r = runOne(fn, signature, comparison, test);
      results.push(r);
      // Stream progress
      self.postMessage({ type: "progress", result: r });
    }
    self.postMessage({ type: "done", results });
  } catch (err) {
    self.postMessage({
      type: "fatal",
      error: (err && err.stack) ? String(err.stack) : String(err),
    });
  }
};
