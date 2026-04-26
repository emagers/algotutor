import { fetchIndex } from "../data.js";
import { Storage } from "../storage.js";
import { lessonContent } from "../lesson-content.js";

const params = new URLSearchParams(location.search);
const tag = params.get("tag") || "";

const STATUS_ICON = {
  solved: '<span class="status status-solved" title="Solved">✓</span>',
  attempted: '<span class="status status-attempted" title="Attempted">●</span>',
  unsolved: '<span class="status status-unsolved" title="Unsolved">○</span>',
};

const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 };

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Lightweight markdown-ish: backticks → <code>, **bold**, *em*.
function inlineMd(s) {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
}

function renderOverview(content) {
  if (!content) return;
  const target = document.getElementById("lesson-overview");
  const whenList = (content.whenToUse || []).map((w) => `<li>${inlineMd(w)}</li>`).join("");
  const patterns = (content.keyPatterns || []).map((p) => `
    <div class="pattern">
      <div class="pname">${inlineMd(p.name)}</div>
      <div class="pdesc">${inlineMd(p.description)}</div>
    </div>
  `).join("");
  target.innerHTML = `
    <h3>Overview</h3>
    <p>${inlineMd(content.overview)}</p>
    ${whenList ? `<h3>When to reach for it</h3><ul>${whenList}</ul>` : ""}
    ${patterns ? `<h3>Key patterns</h3>${patterns}` : ""}
    ${content.complexity ? `<h3>Complexity guide</h3><p>${inlineMd(content.complexity)}</p>` : ""}
    <h3>Practice problems</h3>
  `;
  target.classList.remove("hidden");
}

function langChips(it) {
  const u = it.backendUnsupported || {};
  const langs = [
    { code: "JS", on: true },
    { code: "RS", on: !u.rust },
    { code: "GO", on: !u.go },
  ];
  return langs.map((l) => `<span class="lang-chip ${l.on ? "on" : "off"}">${l.code}</span>`).join("");
}

function renderRow(it) {
  const status = Storage.getStatus(it.id);
  return `
    <a class="problem-row" href="problem.html?id=${encodeURIComponent(it.id)}">
      ${STATUS_ICON[status]}
      <span class="lc-num">#${it.number}</span>
      <span class="title">${escapeHtml(it.title)}</span>
      <span class="difficulty diff-${it.difficulty}">${it.difficulty}</span>
      <span class="cats"></span>
      <span class="langs">${langChips(it)}</span>
    </a>
  `;
}

async function init() {
  if (!tag) {
    document.getElementById("lesson-title").textContent = "No topic specified";
    return;
  }
  await Storage.init();
  const idx = await fetchIndex();
  const items = idx.items.filter((it) => it.categories.includes(tag));
  items.sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty] || a.number - b.number);

  document.title = `${tag} — AlgoTutor`;
  document.getElementById("lesson-title").textContent = tag;
  document.getElementById("lesson-desc").innerHTML =
    `Practice all <strong>${items.length}</strong> problems tagged <code>${escapeHtml(tag)}</code>, ordered easiest → hardest.`;

  const counts = items.reduce((acc, it) => { acc[it.difficulty] = (acc[it.difficulty] || 0) + 1; return acc; }, {});
  const solved = items.filter((it) => Storage.getStatus(it.id) === "solved").length;
  const attempted = items.filter((it) => Storage.getStatus(it.id) === "attempted").length;
  document.getElementById("lesson-meta").innerHTML = `
    <span class="diff-Easy">${counts.Easy || 0} Easy</span> ·
    <span class="diff-Medium">${counts.Medium || 0} Medium</span> ·
    <span class="diff-Hard">${counts.Hard || 0} Hard</span>
    &nbsp;·&nbsp; ${solved} solved · ${attempted} attempted
  `;

  renderOverview(lessonContent[tag]);

  if (items.length === 0) {
    document.getElementById("lesson-problems").innerHTML =
      `<div class="empty-state">No problems found for this topic. <a href="lessons.html">Back to lessons</a>.</div>`;
    return;
  }

  document.getElementById("lesson-problems").innerHTML = items.map(renderRow).join("");
}

init().catch((e) => {
  console.error(e);
  document.getElementById("lesson-problems").innerHTML =
    `<div class="empty-state">Failed to load lesson: ${escapeHtml(e.message)}</div>`;
});
