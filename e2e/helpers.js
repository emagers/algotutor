// Shared helpers for E2E tests.
import { expect } from "@playwright/test";

export async function clearStorage(page) {
  // Reset both the backend SQLite store (when ALGOTUTOR_E2E=1) and the
  // browser's localStorage (covers any legacy state).
  try {
    await page.request.post("http://localhost:9090/api/state/reset", {
      headers: { "x-algotutor-test": "1" },
    });
  } catch {}
  await page.goto("/");
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
}

// Wait until the backend is reachable from the browser context.
export async function waitForBackend(page) {
  await page.goto("/");
  await page.waitForFunction(async () => {
    try {
      const r = await fetch("http://localhost:9090/api/health");
      return r.ok;
    } catch { return false; }
  }, { timeout: 15_000 });
}

// Replace CodeMirror contents with the given code by directly writing to the
// CM6 view via the global handle exposed by editor.js.
export async function setEditorCode(page, code) {
  await waitForEditor(page);
  await page.evaluate((src) => {
    const view = window.__algotutor_cm_view;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: src },
    });
  }, code);
}

export async function waitForEditor(page) {
  // The CodeMirror editor may render with 0 height behind a flex container,
  // so we don't rely on visibility — just wait for the global handle.
  await page.waitForFunction(() => !!window.__algotutor_cm_view, null, { timeout: 15_000 });
}

export async function getEditorCode(page) {
  return page.evaluate(() => {
    const view = window.__algotutor_cm_view;
    return view ? view.state.doc.toString() : "";
  });
}

export async function selectLanguage(page, lang) {
  await page.click(`.lang-tab[data-lang="${lang}"]`);
  await expect(page.locator(`.lang-tab[data-lang="${lang}"]`)).toHaveClass(/active/);
  // Wait until the language switch (which is async — it awaits a code load
  // from the backend) finishes and re-enables the tabs.
  await page.waitForFunction(() => {
    const tab = document.querySelector(`.lang-tab.active`);
    return tab && !tab.disabled;
  });
  await page.waitForTimeout(150);
}
