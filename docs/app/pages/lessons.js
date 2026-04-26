import { fetchIndex } from "../data.js";
import { Storage } from "../storage.js";

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function init() {
  await Storage.init();
  const idx = await fetchIndex();

  const groups = new Map();
  for (const it of idx.items) {
    for (const c of it.categories) {
      if (!groups.has(c)) groups.set(c, []);
      groups.get(c).push(it);
    }
  }
  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

  const html = sorted.map(([cat, items]) => {
    const solved = items.filter((it) => Storage.getStatus(it.id) === "solved").length;
    const pct = Math.round((solved / items.length) * 100);
    return `
      <div class="lesson-card">
        <a href="lesson.html?tag=${encodeURIComponent(cat)}">
          <div class="lesson-title">${escapeHtml(cat)}</div>
          <div class="lesson-meta">${items.length} problem${items.length === 1 ? "" : "s"} · ${solved} solved (${pct}%)</div>
          <div class="lesson-progress"><div style="width:${pct}%"></div></div>
        </a>
      </div>
    `;
  }).join("");

  document.getElementById("lessons").innerHTML = html;
}

init().catch((e) => {
  console.error(e);
  document.getElementById("lessons").innerHTML =
    `<div class="empty-state">Failed to load lessons: ${escapeHtml(e.message)}</div>`;
});
