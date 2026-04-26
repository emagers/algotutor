import { fetchQuestion, fetchVideoMap } from "../data.js";
import { Storage } from "../storage.js";
import { CodeEditor, starterCode } from "../editor.js";
import { runAllForLanguage, runCustomForLanguage, isBackendUp } from "../runner.js";

const params = new URLSearchParams(location.search);
const slug = params.get("id");

let question = null;
let editor = null;
let currentLang = "javascript";

// Debounced background save of the editor contents. Each (slug,lang) has at
// most one save in flight; the latest pending value always wins.
const SAVE_DEBOUNCE_MS = 400;
const saveState = { timer: null, pendingCode: null, pendingLang: null, inFlight: false };

function scheduleCodeSave(lang, code) {
  saveState.pendingCode = code;
  saveState.pendingLang = lang;
  if (saveState.timer) clearTimeout(saveState.timer);
  saveState.timer = setTimeout(flushCodeSave, SAVE_DEBOUNCE_MS);
}

async function flushCodeSave() {
  if (saveState.timer) { clearTimeout(saveState.timer); saveState.timer = null; }
  if (saveState.pendingCode === null) return;
  while (saveState.pendingCode !== null && !saveState.inFlight) {
    const lang = saveState.pendingLang;
    const code = saveState.pendingCode;
    saveState.pendingCode = null;
    saveState.pendingLang = null;
    saveState.inFlight = true;
    try { await Storage.setCode(slug, lang, code); }
    finally { saveState.inFlight = false; }
  }
}

window.addEventListener("beforeunload", () => {
  // Best-effort sync flush via sendBeacon-style fetch keepalive.
  if (saveState.pendingCode !== null) {
    try {
      navigator.sendBeacon?.(
        `${location.protocol}//${location.hostname}:9090/api/state/code`,
        new Blob([JSON.stringify({ slug, lang: saveState.pendingLang, code: saveState.pendingCode })],
          { type: "application/json" }),
      );
    } catch {}
  }
});

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
    <h2>#${q.number}. ${escapeHtml(q.title)}</h2>
    <span class="difficulty diff-${q.difficulty}">${q.difficulty}</span>
    <button class="pane-collapse-btn" id="btn-collapse-problem" title="Collapse / expand problem">⮜</button>
  `;

  const body = document.getElementById("problem-body");
  const cats = q.categories.map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join("");

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
    <div>${cats}</div>

    <h3>Description</h3>
    <p>${inlineMd(q.prompt)}</p>

    ${examples ? `<h3>Examples</h3>${examples}` : ""}

    ${constraints ? `<h3>Constraints</h3><ul>${constraints}</ul>` : ""}

    ${hints ? `<h3>Hints (click to reveal)</h3>${hints}` : ""}

    <h3>Optimal complexity</h3>
    <p>Time <code>${escapeHtml(q.optimal.time)}</code> · Space <code>${escapeHtml(q.optimal.space)}</code></p>

    <h3>Test suite</h3>
    <p class="dim">${q.tests.length} tests total — ${counts.example || 0} example, ${counts.edge || 0} edge, ${counts.stress || 0} stress.</p>
  `;
}

async function renderVideo(q) {
  const target = document.getElementById("video-body");
  const map = await fetchVideoMap();
  const entry = map[q.id];
  if (entry?.video) {
    target.innerHTML = `
      <div class="video-wrap">
        <iframe
          src="https://www.youtube.com/embed/${encodeURIComponent(entry.video)}"
          title="${escapeHtml(q.title)} — video walkthrough"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>
      <p class="dim" style="margin-top:8px">Walkthrough video.</p>
    `;
  } else {
    const q1 = encodeURIComponent(`${q.title} algorithm`);
    target.innerHTML = `
      <p>No curated video walkthrough is available for this problem yet.</p>
      <p>Try searching: <a href="https://www.youtube.com/results?search_query=${q1}" target="_blank" rel="noopener">"${escapeHtml(q.title)} algorithm"</a>.</p>
    `;
  }
}

function setupProblemTabs() {
  const tabs = document.querySelectorAll(".problem-tab");
  const desc = document.getElementById("problem-body");
  const vid = document.getElementById("video-body");
  tabs.forEach((t) => {
    t.addEventListener("click", () => {
      tabs.forEach((x) => x.classList.toggle("active", x === t));
      const which = t.dataset.tab;
      desc.classList.toggle("hidden", which !== "description");
      vid.classList.toggle("hidden", which !== "video");
    });
  });
}

async function getOrInitCode(lang) {
  const saved = await Storage.getCode(slug, lang);
  if (saved !== null && saved !== "") return saved;
  return starterCode(question.signature, lang);
}

function buildCustomInputDefault() {
  const ex = question.tests.find((t) => t.category === "example");
  const inp = ex ? ex.input : {};
  return JSON.stringify(inp, null, 2);
}

async function setupEditor() {
  const container = document.getElementById("editor");
  const initialCode = await getOrInitCode(currentLang);
  editor = new CodeEditor(container, {
    lang: currentLang,
    code: initialCode,
    onChange: (code) => scheduleCodeSave(currentLang, code),
  });
  // Reflect the active tab in UI.
  document.querySelectorAll(".lang-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.lang === currentLang);
  });
}

let switching = false;

function setupLangTabs() {
  const tabs = document.querySelectorAll(".lang-tab");
  tabs.forEach((t) => {
    t.addEventListener("click", async () => {
      if (switching) return;
      const lang = t.dataset.lang;
      if (lang === currentLang) return;
      switching = true;
      tabs.forEach((x) => x.disabled = true);
      try {
        // Flush whatever's in the editor for the OUTGOING language first.
        scheduleCodeSave(currentLang, editor.getCode());
        await flushCodeSave();
        // Switch.
        tabs.forEach((x) => x.classList.toggle("active", x === t));
        currentLang = lang;
        editor.setLanguage(lang);
        const next = await getOrInitCode(lang);
        editor.setCode(next);
        await Storage.setLang(lang);
        updateLangAvailability();
      } finally {
        tabs.forEach((x) => x.disabled = false);
        switching = false;
      }
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
  const body = document.getElementById("output-body");
  out.classList.remove("hidden");
  out.classList.remove("collapsed");
  body.innerHTML = html;
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
  scheduleCodeSave(currentLang, code);
  await Promise.all([Storage.markAttempted(slug), flushCodeSave()]);
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
  scheduleCodeSave(currentLang, code);
  await Promise.all([Storage.markAttempted(slug), flushCodeSave()]);

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
    metrics: result.metrics || null,
    total: question.tests.length,
    passed: result.results.filter((r) => r.pass).length,
  };
  // Persist before navigating so submission.html reads a fresh row.
  await Storage.saveSubmission(slug, sub);

  location.href = `submission.html?id=${encodeURIComponent(slug)}`;
}

async function init() {
  if (!slug) {
    document.getElementById("problem-body").innerHTML =
      `<p class="empty-state">No problem ID specified.</p>`;
    return;
  }
  await Storage.init();
  currentLang = Storage.getLang() || "javascript";

  try {
    question = await fetchQuestion(slug);
  } catch (e) {
    document.getElementById("problem-body").innerHTML =
      `<p class="empty-state">Failed to load problem: ${escapeHtml(e.message)}</p>`;
    return;
  }

  renderProblem(question);
  renderVideo(question);
  setupProblemTabs();
  await setupEditor();
  setupLangTabs();
  setupCollapseAndResize();
  document.getElementById("custom-input").value = buildCustomInputDefault();
  document.getElementById("btn-run").addEventListener("click", onRun);
  document.getElementById("btn-submit").addEventListener("click", onSubmit);
  updateLangAvailability();
  // Probe backend in the background; refresh the warning banner once we know.
  isBackendUp().then((ok) => { backendOnline = ok; updateLangAvailability(); });
}

// ---------- Collapse + resize wiring ----------

const UI_STATE_KEY = "algotutor:problem-ui";

function loadUiState() {
  try { return JSON.parse(localStorage.getItem(UI_STATE_KEY)) || {}; }
  catch { return {}; }
}
function saveUiState(patch) {
  const cur = loadUiState();
  localStorage.setItem(UI_STATE_KEY, JSON.stringify({ ...cur, ...patch }));
}

function setupCollapseAndResize() {
  const layout = document.getElementById("problem-layout");
  const pPane = document.getElementById("problem-pane");
  const ePane = layout.querySelector(".editor-pane");
  const handle = document.getElementById("resize-handle");
  const collapseBtn = document.getElementById("btn-collapse-problem");
  const runArea = document.getElementById("run-area");
  const outputArea = document.getElementById("output");

  const ui = loadUiState();

  // Restore widths.
  if (typeof ui.problemFlex === "number" && !ui.problemCollapsed) {
    pPane.style.flex = `${ui.problemFlex} 1 0`;
    ePane.style.flex = `${1 - ui.problemFlex} 1 0`;
  }
  if (ui.problemCollapsed) pPane.classList.add("collapsed");
  if (ui.runCollapsed) runArea.classList.add("collapsed");
  if (ui.outputCollapsed) outputArea.classList.add("collapsed");

  // Collapse / expand the problem pane.
  collapseBtn.addEventListener("click", () => {
    pPane.classList.toggle("collapsed");
    saveUiState({ problemCollapsed: pPane.classList.contains("collapsed") });
  });

  // Drag-to-resize between problem and editor panes.
  let dragging = false;
  handle.addEventListener("mousedown", (e) => {
    if (pPane.classList.contains("collapsed")) return;
    dragging = true;
    handle.classList.add("dragging");
    document.body.classList.add("col-resizing");
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const rect = layout.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frac = Math.min(0.85, Math.max(0.15, x / rect.width));
    pPane.style.flex = `${frac} 1 0`;
    ePane.style.flex = `${1 - frac} 1 0`;
  });
  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove("dragging");
    document.body.classList.remove("col-resizing");
    const rect = layout.getBoundingClientRect();
    const pRect = pPane.getBoundingClientRect();
    const frac = pRect.width / rect.width;
    saveUiState({ problemFlex: frac });
  });

  // Section collapse toggles for run-area and output-area.
  document.querySelectorAll("[data-toggle]").forEach((header) => {
    header.addEventListener("click", () => {
      const which = header.dataset.toggle;
      const target = which === "run-area" ? runArea : outputArea;
      target.classList.toggle("collapsed");
      saveUiState({
        [which === "run-area" ? "runCollapsed" : "outputCollapsed"]:
          target.classList.contains("collapsed"),
      });
    });
  });
}

init();
