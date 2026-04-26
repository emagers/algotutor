// AlgoTutor backend HTTP server (single-file, no deps beyond Node 22 stdlib).
//
//   POST /api/health   → { ok: true, languages: ["javascript","rust","go"] }
//   POST /api/run      → { results: [...], compileError?, totalMs }
//
// Request body for /api/run:
//   { slug, language, code, mode: "tests" | "custom", customInput? }
//
// Each result: { index, status, expected, actual, durationMs, stderr? }
// Statuses: "pass" | "fail" | "error" | "skipped" | "timeout"

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runJavascript } from "./languages/javascript.mjs";
import { runRust } from "./languages/rust.mjs";
import { runGo } from "./languages/go.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUESTIONS_DIR = resolve(__dirname, "..", "docs", "questions");
const PORT = Number(process.env.PORT || 9090);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 30000);

const RUNNERS = {
  javascript: runJavascript,
  rust: runRust,
  go: runGo,
};

async function loadQuestion(slug) {
  if (!/^[a-z0-9-]+$/i.test(slug)) throw new Error("invalid slug");
  const path = resolve(QUESTIONS_DIR, `${slug}.json`);
  const buf = await readFile(path, "utf8");
  return JSON.parse(buf);
}

function jsonResponse(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(payload);
}

async function readBody(req, limit = 4 * 1024 * 1024) {
  return new Promise((resolveBody, reject) => {
    let total = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > limit) { reject(new Error("payload too large")); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const started = Date.now();
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    res.end();
    return;
  }

  if (req.url === "/api/health") {
    return jsonResponse(res, 200, { ok: true, languages: Object.keys(RUNNERS) });
  }

  if (req.url !== "/api/run" || req.method !== "POST") {
    return jsonResponse(res, 404, { error: "not found" });
  }

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch (err) {
    return jsonResponse(res, 400, { error: "invalid json: " + err.message });
  }

  const { slug, language, code, mode = "tests", customInput } = body;
  if (!slug || !language || typeof code !== "string") {
    return jsonResponse(res, 400, { error: "missing fields" });
  }
  const runner = RUNNERS[language];
  if (!runner) return jsonResponse(res, 400, { error: `unsupported language: ${language}` });

  let question;
  try {
    question = await loadQuestion(slug);
  } catch (err) {
    return jsonResponse(res, 404, { error: `unknown slug: ${slug}` });
  }

  if (question.signature?.backendUnsupported?.[language]) {
    return jsonResponse(res, 200, {
      results: [],
      compileError: `${slug} is not yet supported on the ${language} backend.`,
      totalMs: 0,
    });
  }

  // Build the test list. customInput is a single test object {input: {...}, output?: ...}.
  const tests = mode === "custom"
    ? [customInput || { input: question.tests[0]?.input || {}, output: undefined }]
    : question.tests;

  try {
    const result = await Promise.race([
      runner({ question, code, tests }),
      new Promise((_, rej) => setTimeout(() => rej(new Error("backend timeout")), REQUEST_TIMEOUT_MS)),
    ]);
    return jsonResponse(res, 200, { ...result, totalMs: Date.now() - started });
  } catch (err) {
    return jsonResponse(res, 500, { error: err.message, totalMs: Date.now() - started });
  }
});

server.listen(PORT, () => {
  console.log(`[algotutor-backend] listening on :${PORT} (questions=${QUESTIONS_DIR})`);
});
