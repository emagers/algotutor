import { fetchIndex } from "../data.js";
import { Storage } from "../storage.js";

const state = {
  items: [],
  difficulty: new Set(["Easy", "Medium", "Hard"]),
  categories: new Set(),  // empty = all
  search: "",
  groupBy: "difficulty",  // "difficulty" | "category" | "none"
  unsolvedOnly: false,
};

const STATUS_ICON = {
  solved: '<span class="status status-solved" title="Solved">✓</span>',
  attempted: '<span class="status status-attempted" title="Attempted">●</span>',
  unsolved: '<span class="status status-unsolved" title="Unsolved">○</span>',
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function applyFilters() {
  const q = state.search.trim().toLowerCase();
  return state.items.filter((it) => {
    if (!state.difficulty.has(it.difficulty)) return false;
    if (state.categories.size && !it.categories.some((c) => state.categories.has(c))) return false;
    if (state.unsolvedOnly && Storage.getStatus(it.id) === "solved") return false;
    if (q) {
      const hay = `${it.id} ${it.title} ${it.number} ${it.categories.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function langChips(it) {
  const u = it.backendUnsupported || {};
  const langs = [
    { code: "JS", on: true },
    { code: "RS", on: !u.rust },
    { code: "GO", on: !u.go },
  ];
  return langs.map((l) => `<span class="lang-chip ${l.on ? 'on' : 'off'}" title="${l.on ? l.code + ' supported' : l.code + ' not supported for this problem'}">${l.code}</span>`).join("");
}

function renderRow(it) {
  const status = Storage.getStatus(it.id);
  const cats = it.categories.slice(0, 3).map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join("");
  const more = it.categories.length > 3 ? `<span class="tag">+${it.categories.length - 3}</span>` : "";
  return `
    <a class="problem-row" href="problem.html?id=${encodeURIComponent(it.id)}">
      ${STATUS_ICON[status]}
      <span class="lc-num">#${it.number}</span>
      <span class="title">${escapeHtml(it.title)}</span>
      <span class="difficulty diff-${it.difficulty}">${it.difficulty}</span>
      <span class="cats">${cats}${more}</span>
      <span class="langs">${langChips(it)}</span>
    </a>
  `;
}

function render() {
  const filtered = applyFilters();
  document.getElementById("results-meta").textContent =
    `Showing ${filtered.length} of ${state.items.length} problems`;

  const list = document.getElementById("problem-list");
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">No problems match your filters.</div>`;
    return;
  }

  let html = "";
  if (state.groupBy === "none") {
    html = filtered.map(renderRow).join("");
  } else if (state.groupBy === "difficulty") {
    const order = ["Easy", "Medium", "Hard"];
    const groups = { Easy: [], Medium: [], Hard: [] };
    for (const it of filtered) groups[it.difficulty].push(it);
    for (const d of order) {
      if (!groups[d].length) continue;
      html += `<div class="group-header">${d} (${groups[d].length})</div>`;
      html += groups[d].map(renderRow).join("");
    }
  } else if (state.groupBy === "category") {
    const groups = new Map();
    for (const it of filtered) {
      for (const c of it.categories) {
        if (!groups.has(c)) groups.set(c, []);
        groups.get(c).push(it);
      }
    }
    const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
    for (const [cat, items] of sorted) {
      html += `<div class="group-header">${escapeHtml(cat)} (${items.length})</div>`;
      html += items.map(renderRow).join("");
    }
  }
  list.innerHTML = html;
}

function renderFilters() {
  // Difficulty
  const diffEl = document.getElementById("filter-difficulty");
  const diffs = ["Easy", "Medium", "Hard"];
  const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const it of state.items) diffCounts[it.difficulty]++;
  diffEl.innerHTML = diffs.map((d) => `
    <label>
      <input type="checkbox" data-diff="${d}" ${state.difficulty.has(d) ? "checked" : ""}>
      <span class="diff-${d}">${d}</span>
      <span class="count">${diffCounts[d]}</span>
    </label>
  `).join("");
  diffEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", () => {
      const d = cb.dataset.diff;
      if (cb.checked) state.difficulty.add(d); else state.difficulty.delete(d);
      render();
    });
  });

  // Categories
  const catCounts = new Map();
  for (const it of state.items) for (const c of it.categories) catCounts.set(c, (catCounts.get(c) || 0) + 1);
  const cats = [...catCounts.entries()].sort((a, b) => b[1] - a[1]);
  const catEl = document.getElementById("filter-categories");
  catEl.innerHTML = cats.map(([c, n]) => `
    <label>
      <input type="checkbox" data-cat="${escapeHtml(c)}" ${state.categories.has(c) ? "checked" : ""}>
      ${escapeHtml(c)}
      <span class="count">${n}</span>
    </label>
  `).join("");
  catEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", () => {
      const c = cb.dataset.cat;
      if (cb.checked) state.categories.add(c); else state.categories.delete(c);
      render();
    });
  });
}

async function init() {
  await Storage.init();
  const idx = await fetchIndex();
  state.items = idx.items;

  renderFilters();

  document.getElementById("search").addEventListener("input", (e) => {
    state.search = e.target.value;
    render();
  });
  document.getElementById("group-by").addEventListener("change", (e) => {
    state.groupBy = e.target.value;
    render();
  });
  document.getElementById("unsolved-only").addEventListener("change", (e) => {
    state.unsolvedOnly = e.target.checked;
    render();
  });
  document.getElementById("clear-filters").addEventListener("click", () => {
    state.difficulty = new Set(["Easy", "Medium", "Hard"]);
    state.categories = new Set();
    state.search = "";
    state.unsolvedOnly = false;
    document.getElementById("search").value = "";
    document.getElementById("unsolved-only").checked = false;
    renderFilters();
    render();
  });

  render();
}

init().catch((e) => {
  console.error(e);
  document.getElementById("problem-list").innerHTML =
    `<div class="empty-state">Failed to load problems: ${escapeHtml(e.message)}</div>`;
});
