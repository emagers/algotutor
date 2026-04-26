// Backend HTTP client. Talks to the Docker container exposed on
// http://localhost:9090. If the container isn't running, falls back to a
// clear error. Used for Rust/Go execution and (optionally) JS.

const DEFAULT_URL = "http://localhost:9090";

function backendUrl() {
  return localStorage.getItem("algotutor:backend-url") || DEFAULT_URL;
}

export async function isBackendUp() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1500);
    const r = await fetch(`${backendUrl()}/api/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) return false;
    const j = await r.json();
    return !!j.ok;
  } catch {
    return false;
  }
}

async function callRun(payload) {
  const r = await fetch(`${backendUrl()}/api/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    let msg = `backend HTTP ${r.status}`;
    try { msg = (await r.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  return r.json();
}

// Match the shape returned by worker.js so submission.js doesn't care which
// path executed the code.
function summarize(v) {
  try {
    const s = JSON.stringify(v);
    if (s && s.length > 1000) return s.slice(0, 1000) + "…";
    return v;
  } catch { return String(v); }
}

function adaptResults(question, j) {
  if (j.compileError) {
    return {
      timedOut: false,
      results: [],
      durationMs: j.totalMs || 0,
      fatal: j.compileError,
    };
  }
  const tests = question.tests || [];
  const results = (j.results || []).map((r, i) => {
    const t = tests[r.index ?? i] || {};
    const ok = r.status === "pass";
    return {
      name: t.name,
      category: t.category,
      pass: ok,
      timeMs: r.durationMs ?? 0,
      error: r.status === "error" ? (r.stderr || "runtime error")
            : r.status === "timeout" ? "timed out"
            : null,
      expected: summarize(r.expected),
      actual: r.status === "error" ? null : summarize(r.actual),
      inputPreview: summarize(t.input),
    };
  });
  return {
    timedOut: results.some((r) => r.error === "timed out"),
    results,
    durationMs: j.totalMs || 0,
    fatal: null,
  };
}

export async function runAllBackend(code, question, language) {
  const j = await callRun({ slug: question.id, language, code, mode: "tests" });
  return adaptResults(question, j);
}

export async function runCustomBackend(code, question, language, customInput) {
  const j = await callRun({ slug: question.id, language, code, mode: "custom", customInput });
  if (j.compileError) return { timedOut: false, actual: null, error: j.compileError, timeMs: 0 };
  const r = (j.results || [])[0];
  if (!r) return { timedOut: false, actual: null, error: "no result returned", timeMs: 0 };
  return {
    timedOut: r.status === "timeout",
    actual: r.actual,
    error: r.status === "error" ? (r.stderr || "runtime error") : null,
    timeMs: r.durationMs ?? 0,
  };
}
