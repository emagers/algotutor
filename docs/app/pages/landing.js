import { fetchIndex } from "../data.js";
import { Storage } from "../storage.js";

async function init() {
  await Storage.init();
  const idx = await fetchIndex();
  document.getElementById("stat-total").textContent = idx.total;
  document.getElementById("stat-tests").textContent = idx.totalTests.toLocaleString();
  document.getElementById("stat-solved").textContent = Storage.getSolved().size;

  const cats = new Set();
  for (const it of idx.items) for (const c of it.categories) cats.add(c);
  document.getElementById("stat-cats").textContent = cats.size;
}

init().catch((e) => {
  console.error(e);
  document.getElementById("stats").innerHTML =
    `<p class="empty-state">Failed to load index. Make sure you're serving over HTTP (e.g., <code>npx serve docs</code>).</p>`;
});
