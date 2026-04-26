// Go execution path. Generates main.go from question + user code, runs
// `go build -o runner` then exec, parses JSON results.

import { spawn } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateGoHarness } from "../harness/generate-go.mjs";
import { comparators } from "../harness/js/runtime.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUNNER_DIR = existsSync("/work/backend/runner/go")
  ? "/work/backend/runner/go"
  : resolve(__dirname, "..", "runner", "go");
const MAIN_GO_PATH = resolve(RUNNER_DIR, "main.go");
const BINARY_PATH = resolve(RUNNER_DIR, "runner");

const COMPILE_TIMEOUT_MS = 60_000;
const RUN_TIMEOUT_MS = 25_000;

let chain = Promise.resolve();
function serialized(fn) {
  const next = chain.then(fn, fn);
  chain = next.catch(() => {});
  return next;
}

function runProcess(cmd, args, { cwd, input, timeoutMs, env }) {
  return new Promise((resolveP) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ...(env || {}) },
    });
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

export async function runGo({ question, code, tests }) {
  const kind = question.signature.kind || "function";
  if (kind !== "function" && kind !== "design") {
    return {
      results: [],
      compileError: `Go runner does not support kind="${kind}" yet. Coming soon.`,
    };
  }

  return serialized(async () => {
    let source;
    try {
      source = generateGoHarness(question, code);
    } catch (e) {
      return { results: [], compileError: `harness generation failed: ${e.message}` };
    }
    await mkdir(RUNNER_DIR, { recursive: true });
    await writeFile(MAIN_GO_PATH, source, "utf8");

    const build = await runProcess("go", ["build", "-o", "runner", "main.go"],
      { cwd: RUNNER_DIR, timeoutMs: COMPILE_TIMEOUT_MS });
    if (build.code !== 0) {
      return { results: [], compileError: `go build failed:\n${(build.stderr || build.stdout).slice(0, 4000)}` };
    }

    const requestPayload = JSON.stringify({ tests });
    const exec = await runProcess(BINARY_PATH, [],
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
    const cmpFn = comparators[question.comparison?.kind || "exact"] || comparators.exact;

    const results = (parsed.results || []).map((r, i) => {
      const expected = tests[r.index ?? i]?.output;
      if (!r.ok) {
        return { index: i, status: "error", expected, actual: null, durationMs: r.durationMs ?? 0, stderr: r.error || "panic" };
      }
      const pass = cmpFn(r.actual, expected);
      return { index: i, status: pass ? "pass" : "fail", expected, actual: r.actual, durationMs: r.durationMs ?? 0 };
    });
    return { results };
  });
}
