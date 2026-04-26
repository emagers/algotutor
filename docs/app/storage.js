// Local-storage helpers. All UI state persists here; no backend, no cookies.
// (User asked for "cookie storage" — interpreting as client-side persistence.)

const KEY_SOLVED = "algotutor:solved";        // Set<slug>
const KEY_ATTEMPTED = "algotutor:attempted";  // Set<slug>
const codeKey = (slug, lang) => `algotutor:code:${slug}:${lang}`;
const submissionKey = (slug) => `algotutor:submission:${slug}`;

function readSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}
function writeSet(key, set) {
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch {}
}

export const Storage = {
  getSolved() { return readSet(KEY_SOLVED); },
  getAttempted() { return readSet(KEY_ATTEMPTED); },

  markSolved(slug) {
    const s = readSet(KEY_SOLVED); s.add(slug); writeSet(KEY_SOLVED, s);
    const a = readSet(KEY_ATTEMPTED); a.add(slug); writeSet(KEY_ATTEMPTED, a);
  },
  markAttempted(slug) {
    const a = readSet(KEY_ATTEMPTED); a.add(slug); writeSet(KEY_ATTEMPTED, a);
  },

  getStatus(slug) {
    if (this.getSolved().has(slug)) return "solved";
    if (this.getAttempted().has(slug)) return "attempted";
    return "unsolved";
  },

  getCode(slug, lang) {
    try { return localStorage.getItem(codeKey(slug, lang)) ?? null; } catch { return null; }
  },
  setCode(slug, lang, code) {
    try { localStorage.setItem(codeKey(slug, lang), code); } catch {}
  },

  saveSubmission(slug, sub) {
    try { localStorage.setItem(submissionKey(slug), JSON.stringify(sub)); } catch {}
  },
  getSubmission(slug) {
    try {
      const raw = localStorage.getItem(submissionKey(slug));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
};
