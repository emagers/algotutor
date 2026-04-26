import { Storage } from "../storage.js";
import { fetchQuestion } from "../data.js";

const params = new URLSearchParams(location.search);
const slug = params.get("id");

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderTest(r) {
  const det = `
    <div class="details">
      <div class="row"><span class="label">Category:</span> ${escapeHtml(r.category)}</div>
      <div class="row"><span class="label">Time:</span> ${r.timeMs.toFixed(2)} ms</div>
      <div class="row"><span class="label">Input:</span><pre>${escapeHtml(r.inputPreview)}</pre></div>
      <div class="row"><span class="label">Expected:</span><pre>${escapeHtml(r.expected)}</pre></div>
      <div class="row"><span class="label">Actual:</span><pre>${escapeHtml(r.actual ?? "(error)")}</pre></div>
      ${r.error ? `<div class="row"><span class="label">Error:</span><pre class="err">${escapeHtml(r.error)}</pre></div>` : ""}
    </div>
  `;
  return `
    <div class="test-result ${r.pass ? "pass" : "fail"}">
      <div class="head" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none';">
        <span class="icon">${r.pass ? "✓" : "✗"}</span>
        <span class="name">${escapeHtml(r.name)}</span>
        <span class="cat">${escapeHtml(r.category)}</span>
        <span class="time">${r.timeMs.toFixed(1)}ms</span>
      </div>
      <div style="display: ${r.pass ? "none" : "block"};">${det}</div>
    </div>
  `;
}

function fmtBytes(n) {
  if (!Number.isFinite(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function metricsRow(sub) {
  const m = sub.metrics;
  if (!m) return "";
  const parts = [];
  if (Number.isFinite(m.peakMemBytes)) parts.push(`<span>Peak memory <code>${fmtBytes(m.peakMemBytes)}</code></span>`);
  if (Number.isFinite(m.cpuMs)) parts.push(`<span>CPU time <code>${m.cpuMs} ms</code></span>`);
  if (Number.isFinite(m.wallMs)) parts.push(`<span>Wall time <code>${m.wallMs} ms</code></span>`);
  if (!parts.length) return "";
  return `<div class="metrics-row">${parts.join("")}</div>`;
}

async function init() {
  await Storage.init();
  const sub = await Storage.getSubmission(slug);
  const root = document.getElementById("submission-root");
  if (!sub) {
    root.innerHTML = `<p class="empty-state">No submission found for this problem. <a href="problem.html?id=${encodeURIComponent(slug)}">Go solve it →</a></p>`;
    return;
  }
  let question;
  try { question = await fetchQuestion(slug); } catch { question = { title: slug }; }

  const allPass = sub.passed === sub.total && !sub.fatal && !sub.timedOut;
  const summary = `
    <div class="submission-summary ${allPass ? "passed" : "failed"}">
      <div class="title">${allPass ? "✓ Accepted" : sub.timedOut ? "⏱ Time Limit Exceeded" : sub.fatal ? "✗ Runtime Error" : "✗ Wrong Answer"}</div>
      <div>${sub.passed} / ${sub.total} tests passed</div>
      <div class="meta">
        ${escapeHtml(question.title)} · ${escapeHtml(sub.language)} ·
        ${(sub.durationMs / 1000).toFixed(2)}s ·
        ${new Date(sub.timestamp).toLocaleString()}
      </div>
      ${metricsRow(sub)}
      ${sub.fatal ? `<pre style="margin-top:12px;text-align:left;background:var(--code-bg);padding:12px;border-radius:6px;color:var(--fail);">${escapeHtml(sub.fatal)}</pre>` : ""}
    </div>
  `;

  // Group failures first, then passes.
  const fails = sub.results.filter((r) => !r.pass);
  const passes = sub.results.filter((r) => r.pass);
  const ordered = [...fails, ...passes];

  const links = `
    <div style="display:flex;gap:8px;margin-bottom:16px;">
      <a class="btn" href="problem.html?id=${encodeURIComponent(slug)}">← Back to problem</a>
      <a class="btn" href="problems.html">Browse more</a>
    </div>
  `;

  const tests = `
    <h3 style="margin-bottom:12px;color:var(--text-dim);text-transform:uppercase;font-size:12px;letter-spacing:1px;">
      Test results ${fails.length ? `(${fails.length} failing first)` : ""}
    </h3>
    ${ordered.map(renderTest).join("")}
  `;

  root.innerHTML = links + summary + tests;
  document.title = `${allPass ? "✓" : "✗"} ${question.title || slug} — Submission`;
}

init();
