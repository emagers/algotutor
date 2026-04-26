import { fetchQuestion } from "../data.js";
import { Storage } from "../storage.js";
import { CodeEditor, starterCode } from "../editor.js";
import { runAllForLanguage, runCustomForLanguage, isBackendUp } from "../runner.js";

const params = new URLSearchParams(location.search);
const slug = params.get("id");

let question = null;
let editor = null;
let currentLang = "javascript";

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Lightweight markdown-ish: backticks → <code>, **bold**, *em*, line breaks.
function inlineMd(s) {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
}

function renderProblem(q) {
  document.title = `${q.title} — AlgoTutor`;
  const head = document.getElementById("problem-head");
  head.innerHTML = `
    <h2>#${q.leetcode_number}. ${escapeHtml(q.title)}</h2>
    <span class="difficulty diff-${q.difficulty}">${q.difficulty}</span>
  `;

  const body = document.getElementById("problem-body");
  const cats = q.categories.map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join("");
  const sources = (q.sources || []).map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("");

  const examples = q.tests.filter((t) => t.category === "example").map((t, i) => {
    const inp = Object.entries(t.input).map(([k, v]) => `<div><span class="label">${escapeHtml(k)} =</span> ${escapeHtml(JSON.stringify(v))}</div>`).join("");
    return `
      <div class="example-block">
        <div><strong>Example ${i + 1}</strong></div>
        ${inp}
        <div><span class="label">Output:</span> ${escapeHtml(JSON.stringify(t.output))}</div>
      </div>
    `;
  }).join("");

  const constraints = (q.constraints || []).map((c) => `<li>${inlineMd(c)}</li>`).join("");

  const hints = (q.hints || []).map((h, i) => `
    <details class="hint">
      <summary>Hint ${i + 1}</summary>
      <p>${inlineMd(h)}</p>
    </details>
  `).join("");

  const alts = (q.alternatives || []).map((a) => `
    <li><strong>${escapeHtml(a.approach)}</strong> — Time ${escapeHtml(a.time)}, Space ${escapeHtml(a.space)}.${a.note ? ` <span class="dim">${inlineMd(a.note)}</span>` : ""}</li>
  `).join("");

  const pitfalls = (q.pitfalls || []).map((p) => `<li>${inlineMd(p)}</li>`).join("");
  const followups = (q.followups || []).map((p) => `<li>${inlineMd(p)}</li>`).join("");

  const counts = q.tests.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {});

  body.innerHTML = `
    <div>${cats}${sources}</div>

    <h3>Description</h3>
    <p>${inlineMd(q.prompt)}</p>

    ${examples ? `<h3>Examples</h3>${examples}` : ""}

    ${constraints ? `<h3>Constraints</h3><ul>${constraints}</ul>` : ""}

    ${hints ? `<h3>Hints (click to reveal)</h3>${hints}` : ""}

    <h3>Optimal complexity</h3>
    <p>Time <code>${escapeHtml(q.optimal.time)}</code> · Space <code>${escapeHtml(q.optimal.space)}</code> — ${inlineMd(q.optimal.approach)}</p>

    ${alts ? `<h3>Alternative approaches</h3><ul>${alts}</ul>` : ""}

    ${pitfalls ? `<h3>Pitfalls</h3><ul>${pitfalls}</ul>` : ""}

    ${followups ? `<h3>Follow-ups</h3><ul>${followups}</ul>` : ""}

    <h3>Test suite</h3>
    <p class="dim">${q.tests.length} tests total — ${counts.example || 0} example, ${counts.edge || 0} edge, ${counts.stress || 0} stress.</p>
  `;
}

function getOrInitCode(lang) {
  const saved = Storage.getCode(slug, lang);
  if (saved !== null && saved !== "") return saved;
  return starterCode(question.signature, lang);
}

function buildCustomInputDefault() {
  const ex = question.tests.find((t) => t.category === "example");
  const inp = ex ? ex.input : {};
  return JSON.stringify(inp, null, 2);
}

function setupEditor() {
  const container = document.getElementById("editor");
  editor = new CodeEditor(container, {
    lang: currentLang,
    code: getOrInitCode(currentLang),
    onChange: (code) => Storage.setCode(slug, currentLang, code),
  });
}

function setupLangTabs() {
  const tabs = document.querySelectorAll(".lang-tab");
  tabs.forEach((t) => {
    t.addEventListener("click", () => {
      const lang = t.dataset.lang;
      if (lang === currentLang) return;
      // Save current
      Storage.setCode(slug, currentLang, editor.getCode());
      tabs.forEach((x) => x.classList.toggle("active", x === t));
      currentLang = lang;
      editor.setLanguage(lang);
      editor.setCode(getOrInitCode(lang));
      updateLangAvailability();
    });
  });
}

let backendOnline = false;

function updateLangAvailability() {
  const supported = currentLang === "javascript"
    || (backendOnline && !question?.signature?.backendUnsupported?.[currentLang]);
  const reason = currentLang === "javascript"
    ? ""
    : !backendOnline
      ? "⚠ Backend offline — start it with `npm run backend:up` to run Rust/Go."
      : question?.signature?.backendUnsupported?.[currentLang]
        ? `⚠ ${currentLang} execution not supported for this problem yet.`
        : "";
  document.getElementById("lang-warning").textContent = reason;
  document.getElementById("btn-run").disabled = !supported;
  document.getElementById("btn-submit").disabled = !supported;
}

function showOutput(html) {
  const out = document.getElementById("output");
  out.classList.remove("hidden");
  out.innerHTML = html;
}

async function onRun() {
  const out = document.getElementById("output");
  const ta = document.getElementById("custom-input");
  let parsed;
  try { parsed = JSON.parse(ta.value); }
  catch (e) {
    showOutput(`<span class="err">Custom input is not valid JSON: ${escapeHtml(e.message)}</span>`);
    return;
  }
  const code = editor.getCode();
  Storage.markAttempted(slug);
  Storage.setCode(slug, currentLang, code);
  showOutput(`<span class="dim">Running…</span>`);
  const res = await runCustomForLanguage(code, question, currentLang, parsed);
  if (res.timedOut) {
    showOutput(`<span class="err">⏱ Timed out — ${escapeHtml(res.error)}</span>`);
  } else if (res.error) {
    showOutput(`<span class="err">Error:</span>\n${escapeHtml(res.error)}`);
  } else {
    showOutput(`<span class="ok">✓ Output</span> <span class="dim">(${res.timeMs.toFixed(2)}ms)</span>\n${escapeHtml(res.actual)}`);
  }
}

async function onSubmit() {
  const code = editor.getCode();
  Storage.markAttempted(slug);
  Storage.setCode(slug, currentLang, code);

  showOutput(`<span class="dim">Submitting… running ${question.tests.length} tests.</span>`);
  document.getElementById("btn-submit").disabled = true;
  document.getElementById("btn-run").disabled = true;

  const t0 = Date.now();
  let passedSoFar = 0;
  const result = await runAllForLanguage(code, question, currentLang, (r) => {
    if (r.pass) passedSoFar++;
    showOutput(`<span class="dim">Running… ${passedSoFar} passed so far</span>`);
  });

  const sub = {
    slug,
    language: currentLang,
    code,
    timestamp: Date.now(),
    durationMs: result.durationMs,
    timedOut: result.timedOut,
    fatal: result.fatal,
    results: result.results,
    total: question.tests.length,
    passed: result.results.filter((r) => r.pass).length,
  };
  Storage.saveSubmission(slug, sub);
  if (sub.passed === sub.total && !sub.fatal && !sub.timedOut) {
    Storage.markSolved(slug);
  }

  // Navigate to submission page.
  location.href = `submission.html?id=${encodeURIComponent(slug)}`;
}

async function init() {
  if (!slug) {
    document.getElementById("problem-body").innerHTML =
      `<p class="empty-state">No problem ID specified.</p>`;
    return;
  }
  try {
    question = await fetchQuestion(slug);
  } catch (e) {
    document.getElementById("problem-body").innerHTML =
      `<p class="empty-state">Failed to load problem: ${escapeHtml(e.message)}</p>`;
    return;
  }

  renderProblem(question);
  setupEditor();
  setupLangTabs();
  document.getElementById("custom-input").value = buildCustomInputDefault();
  document.getElementById("btn-run").addEventListener("click", onRun);
  document.getElementById("btn-submit").addEventListener("click", onSubmit);
  updateLangAvailability();
  // Probe backend in the background; refresh the warning banner once we know.
  isBackendUp().then((ok) => { backendOnline = ok; updateLangAvailability(); });
}

init();
