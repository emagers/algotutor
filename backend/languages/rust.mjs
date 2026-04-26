// Rust execution path. Generates a main.rs from the question + user code,
// invokes `cargo run --release --quiet`, and parses JSON results.

import { spawn } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateRustHarness } from "../harness/generate-rust.mjs";
import { comparators } from "../harness/js/runtime.mjs";
import { runWithMetrics } from "./metrics.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUNNER_DIR = existsSync("/work/backend/runner/rust")
  ? "/work/backend/runner/rust"
  : resolve(__dirname, "..", "runner", "rust");
const MAIN_RS_PATH = resolve(RUNNER_DIR, "src", "main.rs");

const COMPILE_TIMEOUT_MS = 60_000;
const RUN_TIMEOUT_MS = 25_000;

let chain = Promise.resolve();
function serialized(fn) {
  const next = chain.then(fn, fn);
  chain = next.catch(() => {});
  return next;
}

function runProcess(cmd, args, { cwd, input, timeoutMs }) {
  return new Promise((resolveP) => {
    const child = spawn(cmd, args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (b) => { stdout += b.toString("utf8"); });
    child.stderr.on("data", (b) => { stderr += b.toString("utf8"); });
    let timedOut = false;
    const t = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, timeoutMs);
    child.on("close", (code, signal) => {
      clearTimeout(t);
      resolveP({ code, signal, stdout, stderr, timedOut });
    });
    child.on("error", (err) => {
      clearTimeout(t);
      resolveP({ code: -1, signal: null, stdout, stderr: stderr + err.message, timedOut: false });
    });
    if (input != null) child.stdin.end(input);
    else child.stdin.end();
  });
}

export async function runRust({ question, code, tests }) {
  const kind = question.signature.kind || "function";
  if (kind !== "function" && kind !== "design" && kind !== "codec-roundtrip") {
    return {
      results: [],
      compileError: `Rust runner does not support kind="${kind}" yet. Coming soon.`,
    };
  }

  return serialized(async () => {
    const source = generateRustHarness(question, code);
    await mkdir(dirname(MAIN_RS_PATH), { recursive: true });
    await writeFile(MAIN_RS_PATH, source, "utf8");

    const build = await runProcess("cargo", ["build", "--release", "--quiet"],
      { cwd: RUNNER_DIR, timeoutMs: COMPILE_TIMEOUT_MS });
    if (build.code !== 0) {
      return { results: [], compileError: `cargo build failed:\n${(build.stderr || build.stdout).slice(0, 4000)}` };
    }

    const requestPayload = JSON.stringify({ tests });
    const exec = await runWithMetrics(resolve(RUNNER_DIR, "target", "release", "runner"), [],
      { cwd: RUNNER_DIR, input: requestPayload, timeoutMs: RUN_TIMEOUT_MS });
    if (exec.timedOut) {
      return { results: [], compileError: `Execution timed out after ${RUN_TIMEOUT_MS / 1000}s.` };
    }
    if (exec.code !== 0) {
      return { results: [], compileError: `Runner exited with code ${exec.code}:\n${(exec.stderr || exec.stdout).slice(0, 4000)}` };
    }

    let parsed;
    try { parsed = JSON.parse(exec.stdout); }
    catch (e) {
      return { results: [], compileError: `Could not parse runner output: ${e.message}\n${exec.stdout.slice(0, 800)}` };
    }
    const cmpKey = typeof question.comparison === "string"
      ? question.comparison
      : (question.comparison?.kind || "exact");
    const cmpFn = comparators[cmpKey] || comparators.exact;

    const results = (parsed.results || []).map((r, i) => {
      const test = tests[r.index ?? i];
      const expected = test?.output;
      if (!r.ok) {
        return { index: i, status: "error", expected, actual: null, durationMs: r.durationMs ?? 0, stderr: r.error || "panic" };
      }
      const pass = cmpFn(r.actual, expected, test?.input);
      return { index: i, status: pass ? "pass" : "fail", expected, actual: r.actual, durationMs: r.durationMs ?? 0 };
    });
    return { results, metrics: exec.metrics };
  });
}
