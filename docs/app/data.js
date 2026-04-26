// Data fetching for the index manifest and individual question JSON files.

let _indexCache = null;
const _qCache = new Map();

export async function fetchIndex() {
  if (_indexCache) return _indexCache;
  const res = await fetch("./index.json");
  if (!res.ok) throw new Error(`Failed to load index.json: ${res.status}`);
  _indexCache = await res.json();
  return _indexCache;
}

export async function fetchQuestion(slug) {
  if (_qCache.has(slug)) return _qCache.get(slug);
  const res = await fetch(`./questions/${slug}.json`);
  if (!res.ok) throw new Error(`Failed to load question ${slug}: ${res.status}`);
  const q = await res.json();
  _qCache.set(slug, q);
  return q;
}
