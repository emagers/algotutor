// Resource-usage helpers for spawned child processes.
//
// We wrap commands with GNU /usr/bin/time and a unique format string we can
// grep out of stderr. This works for any binary (rustc-built runner, go
// runner) without any source-side instrumentation.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const HAS_GNU_TIME = existsSync("/usr/bin/time");
const TAG = "ALGOTUTOR_METRICS";
// %M = peak RSS (KB), %e = wall-clock seconds, %U = user CPU sec, %S = sys CPU sec
const FMT = `${TAG} %M %e %U %S`;

export function runWithMetrics(cmd, args, { cwd, input, timeoutMs, env } = {}) {
  return new Promise((resolveP) => {
    let realCmd = cmd;
    let realArgs = args;
    if (HAS_GNU_TIME) {
      realCmd = "/usr/bin/time";
      realArgs = ["-f", FMT, "--", cmd, ...args];
    }
    const child = spawn(realCmd, realArgs, {
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
      const parsed = extractMetrics(stderr);
      resolveP({
        code,
        signal,
        stdout,
        stderr: parsed.stderr,
        timedOut,
        metrics: parsed.metrics,
      });
    });
    child.on("error", (err) => {
      clearTimeout(t);
      const parsed = extractMetrics(stderr);
      resolveP({
        code: -1,
        signal: null,
        stdout,
        stderr: parsed.stderr + err.message,
        timedOut: false,
        metrics: parsed.metrics,
      });
    });
    if (input != null) child.stdin.end(input);
    else child.stdin.end();
  });
}

function extractMetrics(stderr) {
  const lines = stderr.split("\n");
  let metrics = null;
  const filtered = [];
  for (const line of lines) {
    if (line.startsWith(TAG + " ")) {
      const parts = line.split(/\s+/);
      // [TAG, peakKb, wall, user, sys]
      const peakKb = parseInt(parts[1], 10);
      const wallSec = parseFloat(parts[2]);
      const userSec = parseFloat(parts[3]);
      const sysSec = parseFloat(parts[4]);
      if (!Number.isNaN(peakKb)) {
        metrics = {
          peakMemBytes: peakKb * 1024,
          wallMs: Math.round(wallSec * 1000),
          cpuMs: Math.round((userSec + sysSec) * 1000),
        };
      }
    } else {
      filtered.push(line);
    }
  }
  return { stderr: filtered.join("\n"), metrics };
}
