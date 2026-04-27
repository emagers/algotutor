// Main-thread API for spawning workers and timing-out runaway code.

import { runAllBackend, runCustomBackend, isBackendUp } from "./backend.js";

const TOTAL_TIMEOUT_MS = 30000;
const CUSTOM_TIMEOUT_MS = 5000;

function spawn() {
  return new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
}

export function runAll(code, question, onProgress) {
  return new Promise((resolve) => {
    const worker = spawn();
    const startedAt = Date.now();
    const results = [];
    const timeoutId = setTimeout(() => {
      worker.terminate();
      resolve({
        timedOut: true,
        results,
        durationMs: Date.now() - startedAt,
        fatal: `Submission exceeded ${TOTAL_TIMEOUT_MS / 1000}s — likely an infinite loop or a too-slow algorithm.`,
      });
    }, TOTAL_TIMEOUT_MS);

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "progress") {
        results.push(msg.result);
        if (onProgress) onProgress(msg.result, results.length);
      } else if (msg.type === "done") {
        clearTimeout(timeoutId);
        worker.terminate();
        resolve({
          timedOut: false,
          results: msg.results,
          durationMs: Date.now() - startedAt,
          fatal: null,
        });
      } else if (msg.type === "fatal") {
        clearTimeout(timeoutId);
        worker.terminate();
        resolve({
          timedOut: false,
          results,
          durationMs: Date.now() - startedAt,
          fatal: msg.error,
        });
      }
    };
    worker.onerror = (e) => {
      clearTimeout(timeoutId);
      worker.terminate();
      resolve({
        timedOut: false,
        results,
        durationMs: Date.now() - startedAt,
        fatal: e.message || String(e),
      });
    };

    worker.postMessage({
      code,
      signature: question.signature,
      comparison: question.comparison,
      tests: question.tests,
      mode: "all",
    });
  });
}

export function runCustom(code, question, customInput) {
  return new Promise((resolve) => {
    const worker = spawn();
    const timeoutId = setTimeout(() => {
      worker.terminate();
      resolve({
        timedOut: true,
        actual: null,
        error: `Run exceeded ${CUSTOM_TIMEOUT_MS / 1000}s — likely an infinite loop.`,
        timeMs: CUSTOM_TIMEOUT_MS,
      });
    }, CUSTOM_TIMEOUT_MS);

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "custom-result") {
        clearTimeout(timeoutId);
        worker.terminate();
        resolve({ timedOut: false, ...msg });
      } else if (msg.type === "fatal") {
        clearTimeout(timeoutId);
        worker.terminate();
        resolve({ timedOut: false, actual: null, error: msg.error, timeMs: 0 });
      }
    };
    worker.onerror = (e) => {
      clearTimeout(timeoutId);
      worker.terminate();
      resolve({ timedOut: false, actual: null, error: e.message || String(e), timeMs: 0 });
    };

    worker.postMessage({
      code,
      signature: question.signature,
      comparison: question.comparison,
      mode: "custom",
      customInput,
    });
  });
}

// Top-level dispatcher: JS function-kind runs in the Web Worker; Rust/Go and
// JS design/codec route through the backend (worker doesn't drive class harnesses).
function jsNeedsBackend(question) {
  const kind = question.signature?.kind || "function";
  return kind === "design" || kind === "codec-roundtrip";
}

export async function runAllForLanguage(code, question, language, onProgress) {
  if (language === "javascript" && !jsNeedsBackend(question)) return runAll(code, question, onProgress);
  return runAllBackend(code, question, language);
}

export async function runCustomForLanguage(code, question, language, customInput) {
  if (language === "javascript" && !jsNeedsBackend(question)) return runCustom(code, question, customInput);
  return runCustomBackend(code, question, language, customInput);
}

export { isBackendUp };
