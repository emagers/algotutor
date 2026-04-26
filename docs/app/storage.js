// AlgoTutor state store. SQLite-backed via the backend API.
//
// Public API is async. Status (solved/attempted) is cached in memory after
// `Storage.init()` so list rendering can stay synchronous.
//
// On first run after the migration was deployed, this module will copy any
// localStorage state (from the legacy client-side store) up to the backend
// in a single transaction, then clear localStorage.

import * as Api from "./backend.js";

const LS_KEY_SOLVED = "algotutor:solved";
const LS_KEY_ATTEMPTED = "algotutor:attempted";
const LS_MIGRATION_DONE = "algotutor:migrated-v1";
const LS_CODE_PREFIX = "algotutor:code:";
const LS_SUB_PREFIX = "algotutor:submission:";

// In-memory cache populated by init().
const cache = {
  ready: false,
  solved: new Set(),
  attempted: new Set(),
  lang: "javascript",
};

let initPromise = null;

function readLsSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function collectLegacy() {
  // Returns the legacy localStorage payload in the migration shape, or null
  // if nothing to migrate.
  let hasAny = false;
  const progress = [];
  const solved = readLsSet(LS_KEY_SOLVED);
  const attempted = readLsSet(LS_KEY_ATTEMPTED);
  const slugs = new Set([...solved, ...attempted]);
  for (const slug of slugs) {
    progress.push({ slug, solved: solved.has(slug), attempted: attempted.has(slug) });
    hasAny = true;
  }
  const code = [];
  const submissions = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith(LS_CODE_PREFIX)) {
        const rest = k.slice(LS_CODE_PREFIX.length);
        const colon = rest.lastIndexOf(":");
        if (colon === -1) continue;
        const slug = rest.slice(0, colon);
        const lang = rest.slice(colon + 1);
        const v = localStorage.getItem(k);
        if (v != null) { code.push({ slug, lang, code: v }); hasAny = true; }
      } else if (k.startsWith(LS_SUB_PREFIX)) {
        const slug = k.slice(LS_SUB_PREFIX.length);
        const v = localStorage.getItem(k);
        if (v != null) { submissions.push({ slug, json: v }); hasAny = true; }
      }
    }
  } catch {}
  return hasAny ? { progress, code, submissions } : null;
}

function clearLegacy() {
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k === LS_KEY_SOLVED || k === LS_KEY_ATTEMPTED
          || k.startsWith(LS_CODE_PREFIX) || k.startsWith(LS_SUB_PREFIX)) {
        toRemove.push(k);
      }
    }
    for (const k of toRemove) localStorage.removeItem(k);
    localStorage.setItem(LS_MIGRATION_DONE, "1");
  } catch {}
}

async function migrateIfNeeded() {
  try {
    if (localStorage.getItem(LS_MIGRATION_DONE) === "1") return;
    const payload = collectLegacy();
    if (!payload) {
      try { localStorage.setItem(LS_MIGRATION_DONE, "1"); } catch {}
      return;
    }
    await Api.apiMigrate(payload);
    clearLegacy();
    console.log("[storage] migrated localStorage → backend", payload.progress.length, "progress,",
      payload.code.length, "code,", payload.submissions.length, "submissions");
  } catch (err) {
    console.warn("[storage] migration failed; will retry next load", err);
  }
}

async function loadOverall() {
  try {
    const s = await Api.apiGetState();
    cache.solved = new Set(s.solved || []);
    cache.attempted = new Set(s.attempted || []);
    cache.lang = s.lang || "javascript";
    cache.ready = true;
  } catch (err) {
    console.warn("[storage] state fetch failed; using empty defaults", err);
    cache.ready = true;
  }
}

export const Storage = {
  // Initialize on every page load. Idempotent (memoized).
  init() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      await migrateIfNeeded();
      await loadOverall();
    })();
    return initPromise;
  },

  // ---- Sync getters (read in-memory cache; require init() to have resolved) ----
  getSolved() { return new Set(cache.solved); },
  getAttempted() { return new Set(cache.attempted); },
  getStatus(slug) {
    if (cache.solved.has(slug)) return "solved";
    if (cache.attempted.has(slug)) return "attempted";
    return "unsolved";
  },
  getLang() { return cache.lang; },

  // ---- Async writers ----
  async markAttempted(slug) {
    if (cache.attempted.has(slug)) return;
    cache.attempted.add(slug);
    try { await Api.apiPutAttempted(slug); }
    catch (err) { console.warn("[storage] markAttempted failed", err); }
  },

  // Code per (slug, lang).
  async getCode(slug, lang) {
    try { return await Api.apiGetCode(slug, lang); }
    catch (err) { console.warn("[storage] getCode failed", err); return null; }
  },
  async setCode(slug, lang, code) {
    try { await Api.apiPutCode(slug, lang, code); }
    catch (err) { console.warn("[storage] setCode failed", err); }
  },

  // Submissions.
  async getSubmission(slug) {
    try { return await Api.apiGetSubmission(slug); }
    catch (err) { console.warn("[storage] getSubmission failed", err); return null; }
  },
  async saveSubmission(slug, sub) {
    try {
      const j = await Api.apiPutSubmission(slug, sub);
      // Update cache immediately so list-page status reflects the new state.
      cache.attempted.add(slug);
      if (j?.solved) cache.solved.add(slug);
    } catch (err) { console.warn("[storage] saveSubmission failed", err); }
  },

  async setLang(lang) {
    cache.lang = lang;
    try { await Api.apiPutLang(lang); }
    catch (err) { console.warn("[storage] setLang failed", err); }
  },
};
