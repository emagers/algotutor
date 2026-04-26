// SQLite-backed state store for AlgoTutor.
//
// Uses Node 22's built-in `node:sqlite` (run with --experimental-sqlite).
// One file at process.env.DB_PATH (defaults to ./data/algotutor.db).
//
// Schema is created on first open. Single-user app: no auth, no sharding.

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DB_PATH = process.env.DB_PATH || resolve(process.cwd(), "data", "algotutor.db");

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS progress (
    slug TEXT PRIMARY KEY,
    solved INTEGER NOT NULL DEFAULT 0,
    attempted INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS code (
    slug TEXT NOT NULL,
    lang TEXT NOT NULL,
    code TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (slug, lang)
  );
  CREATE TABLE IF NOT EXISTS submissions (
    slug TEXT PRIMARY KEY,
    json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

const now = () => Date.now();

function withTransaction(fn) {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    try { db.exec("ROLLBACK"); } catch {}
    throw err;
  }
}

const stmts = {
  getProgress: db.prepare(
    "SELECT slug, solved, attempted FROM progress"
  ),
  upsertProgress: db.prepare(`
    INSERT INTO progress (slug, solved, attempted, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      solved = MAX(progress.solved, excluded.solved),
      attempted = MAX(progress.attempted, excluded.attempted),
      updated_at = excluded.updated_at
  `),
  getCode: db.prepare("SELECT code FROM code WHERE slug = ? AND lang = ?"),
  upsertCode: db.prepare(`
    INSERT INTO code (slug, lang, code, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(slug, lang) DO UPDATE SET
      code = excluded.code,
      updated_at = excluded.updated_at
  `),
  getSubmission: db.prepare("SELECT json FROM submissions WHERE slug = ?"),
  upsertSubmission: db.prepare(`
    INSERT INTO submissions (slug, json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      json = excluded.json,
      updated_at = excluded.updated_at
  `),
  getSetting: db.prepare("SELECT value FROM settings WHERE key = ?"),
  setSetting: db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `),
};

export function getOverallState() {
  const rows = stmts.getProgress.all();
  const solved = [];
  const attempted = [];
  for (const r of rows) {
    if (r.solved) solved.push(r.slug);
    if (r.attempted) attempted.push(r.slug);
  }
  const langRow = stmts.getSetting.get("current_lang");
  const lang = langRow?.value || "javascript";
  return { solved, attempted, lang };
}

export function markProgress(slug, { solved = false, attempted = false } = {}) {
  stmts.upsertProgress.run(slug, solved ? 1 : 0, attempted ? 1 : 0, now());
}

export function getCode(slug, lang) {
  const row = stmts.getCode.get(slug, lang);
  return row ? row.code : null;
}

export function setCode(slug, lang, code) {
  stmts.upsertCode.run(slug, lang, code, now());
}

export function getSubmission(slug) {
  const row = stmts.getSubmission.get(slug);
  return row ? JSON.parse(row.json) : null;
}

export function setSubmission(slug, submission) {
  stmts.upsertSubmission.run(slug, JSON.stringify(submission), now());
}

export function setLang(lang) {
  stmts.setSetting.run("current_lang", lang);
}

export function resetAll() {
  withTransaction(() => {
    db.exec("DELETE FROM progress");
    db.exec("DELETE FROM code");
    db.exec("DELETE FROM submissions");
    db.exec("DELETE FROM settings");
  });
}

// Bulk migration from localStorage. Inserts only where missing.
// payload: { progress: [{slug, solved, attempted}], code: [{slug, lang, code}], submissions: [{slug, json}], lang }
export function migrate(payload) {
  withTransaction(() => {
    const t = now();
    for (const p of payload.progress || []) {
      stmts.upsertProgress.run(p.slug, p.solved ? 1 : 0, p.attempted ? 1 : 0, t);
    }
    for (const c of payload.code || []) {
      // Only insert if missing — don't clobber backend data.
      if (!stmts.getCode.get(c.slug, c.lang)) {
        stmts.upsertCode.run(c.slug, c.lang, c.code, t);
      }
    }
    for (const s of payload.submissions || []) {
      if (!stmts.getSubmission.get(s.slug)) {
        stmts.upsertSubmission.run(s.slug, s.json, t);
      }
    }
    if (payload.lang && !stmts.getSetting.get("current_lang")) {
      stmts.setSetting.run("current_lang", payload.lang);
    }
  });
}

export { DB_PATH };
