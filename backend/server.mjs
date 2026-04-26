// AlgoTutor backend HTTP server (single-file, no deps beyond Node 22 stdlib).
//
//   POST /api/health   → { ok: true, languages: [...] }
//   POST /api/run      → { results: [...], compileError?, totalMs }
//
// State (SQLite-backed, single-user):
//   GET  /api/state                       → { solved, attempted, lang }
//   GET  /api/state/code?slug=&lang=      → { code }
//   PUT  /api/state/code                  body { slug, lang, code }
//   GET  /api/state/submission?slug=      → submission|null
//   PUT  /api/state/submission            body { slug, submission }
//   PUT  /api/state/lang                  body { lang }
//   PUT  /api/state/attempted             body { slug }
//   POST /api/state/migrate               body { progress, code, submissions, lang }
//   POST /api/state/reset                 (only when ALGOTUTOR_E2E=1)

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runJavascript } from "./languages/javascript.mjs";
import { runRust } from "./languages/rust.mjs";
import { runGo } from "./languages/go.mjs";
import * as Db from "./db.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUESTIONS_DIR = resolve(__dirname, "..", "docs", "questions");
const PORT = Number(process.env.PORT || 9090);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 30000);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS
  || "http://localhost:8080,http://127.0.0.1:8080").split(",").map(s => s.trim());
const E2E_RESET_ENABLED = process.env.ALGOTUTOR_E2E === "1";

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

function corsHeaders(req) {
  const origin = req.headers.origin;
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, x-algotutor-test",
    "vary": "Origin",
  };
}

function jsonResponse(res, status, body, req) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    ...corsHeaders(req || { headers: {} }),
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

async function handleRun(req, res, started) {
  if (req.method !== "POST") return jsonResponse(res, 405, { error: "method not allowed" }, req);

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch (err) {
    return jsonResponse(res, 400, { error: "invalid json: " + err.message }, req);
  }

  const { slug, language, code, mode = "tests", customInput } = body;
  if (!slug || !language || typeof code !== "string") {
    return jsonResponse(res, 400, { error: "missing fields" }, req);
  }
  const runner = RUNNERS[language];
  if (!runner) return jsonResponse(res, 400, { error: `unsupported language: ${language}` }, req);

  let question;
  try {
    question = await loadQuestion(slug);
  } catch (err) {
    return jsonResponse(res, 404, { error: `unknown slug: ${slug}` }, req);
  }

  if (question.signature?.backendUnsupported?.[language]) {
    return jsonResponse(res, 200, {
      results: [],
      compileError: `${slug} is not yet supported on the ${language} backend.`,
      totalMs: 0,
    }, req);
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
    return jsonResponse(res, 200, { ...result, totalMs: Date.now() - started }, req);
  } catch (err) {
    return jsonResponse(res, 500, { error: err.message, totalMs: Date.now() - started }, req);
  }
}

async function handleState(req, res) {
  const url = new URL(req.url, "http://x");
  const path = url.pathname;
  const method = req.method;

  // GET /api/state — overall snapshot
  if (path === "/api/state" && method === "GET") {
    return jsonResponse(res, 200, Db.getOverallState(), req);
  }

  // GET /api/state/code?slug=&lang=
  if (path === "/api/state/code" && method === "GET") {
    const slug = url.searchParams.get("slug");
    const lang = url.searchParams.get("lang");
    if (!slug || !lang) return jsonResponse(res, 400, { error: "missing slug/lang" }, req);
    return jsonResponse(res, 200, { code: Db.getCode(slug, lang) }, req);
  }
  // PUT /api/state/code  body { slug, lang, code }
  if (path === "/api/state/code" && method === "PUT") {
    let body;
    try { body = JSON.parse(await readBody(req)); }
    catch (e) { return jsonResponse(res, 400, { error: "invalid json: " + e.message }, req); }
    const { slug, lang, code } = body || {};
    if (!slug || !lang || typeof code !== "string") {
      return jsonResponse(res, 400, { error: "missing slug/lang/code" }, req);
    }
    Db.setCode(slug, lang, code);
    return jsonResponse(res, 200, { ok: true }, req);
  }

  // GET /api/state/submission?slug=
  if (path === "/api/state/submission" && method === "GET") {
    const slug = url.searchParams.get("slug");
    if (!slug) return jsonResponse(res, 400, { error: "missing slug" }, req);
    return jsonResponse(res, 200, { submission: Db.getSubmission(slug) }, req);
  }
  // PUT /api/state/submission  body { slug, submission }
  if (path === "/api/state/submission" && method === "PUT") {
    let body;
    try { body = JSON.parse(await readBody(req)); }
    catch (e) { return jsonResponse(res, 400, { error: "invalid json: " + e.message }, req); }
    const { slug, submission } = body || {};
    if (!slug || !submission) return jsonResponse(res, 400, { error: "missing slug/submission" }, req);
    Db.setSubmission(slug, submission);
    const allPass = submission.passed === submission.total
      && !submission.fatal && !submission.timedOut;
    Db.markProgress(slug, { solved: !!allPass, attempted: true });
    return jsonResponse(res, 200, { ok: true, solved: !!allPass }, req);
  }

  // PUT /api/state/lang  body { lang }
  if (path === "/api/state/lang" && method === "PUT") {
    let body;
    try { body = JSON.parse(await readBody(req)); }
    catch (e) { return jsonResponse(res, 400, { error: "invalid json: " + e.message }, req); }
    const { lang } = body || {};
    if (!lang || typeof lang !== "string") return jsonResponse(res, 400, { error: "missing lang" }, req);
    Db.setLang(lang);
    return jsonResponse(res, 200, { ok: true }, req);
  }

  // PUT /api/state/attempted  body { slug }
  if (path === "/api/state/attempted" && method === "PUT") {
    let body;
    try { body = JSON.parse(await readBody(req)); }
    catch (e) { return jsonResponse(res, 400, { error: "invalid json: " + e.message }, req); }
    const { slug } = body || {};
    if (!slug) return jsonResponse(res, 400, { error: "missing slug" }, req);
    Db.markProgress(slug, { attempted: true });
    return jsonResponse(res, 200, { ok: true }, req);
  }

  // POST /api/state/migrate  body { progress, code, submissions, lang }
  if (path === "/api/state/migrate" && method === "POST") {
    let body;
    try { body = JSON.parse(await readBody(req)); }
    catch (e) { return jsonResponse(res, 400, { error: "invalid json: " + e.message }, req); }
    Db.migrate(body || {});
    return jsonResponse(res, 200, { ok: true }, req);
  }

  // POST /api/state/reset (test-only — gated by env AND custom header,
  // so it's both opt-in for the operator and CORS-protected against
  // drive-by POSTs from random sites the user happens to visit).
  if (path === "/api/state/reset" && method === "POST") {
    if (!E2E_RESET_ENABLED) return jsonResponse(res, 403, { error: "reset disabled" }, req);
    if (req.headers["x-algotutor-test"] !== "1") {
      return jsonResponse(res, 403, { error: "reset requires x-algotutor-test header" }, req);
    }
    Db.resetAll();
    return jsonResponse(res, 200, { ok: true }, req);
  }

  return jsonResponse(res, 404, { error: "not found" }, req);
}

const server = createServer(async (req, res) => {
  const started = Date.now();
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders(req));
    res.end();
    return;
  }

  try {
    if (req.url === "/api/health") {
      return jsonResponse(res, 200, { ok: true, languages: Object.keys(RUNNERS) }, req);
    }
    if (req.url === "/api/run" || req.url?.startsWith("/api/run?")) {
      return handleRun(req, res, started);
    }
    if (req.url?.startsWith("/api/state")) {
      return handleState(req, res);
    }
    return jsonResponse(res, 404, { error: "not found" }, req);
  } catch (err) {
    console.error("[server] unhandled error", err);
    return jsonResponse(res, 500, { error: err.message }, req);
  }
});

server.listen(PORT, () => {
  console.log(`[algotutor-backend] listening on :${PORT} (questions=${QUESTIONS_DIR}, db=${Db.DB_PATH})`);
});
