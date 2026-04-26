// Shared helpers for E2E tests.
import { expect } from "@playwright/test";

export async function clearStorage(page) {
  await page.goto("/");
  await page.evaluate(() => { localStorage.clear(); });
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
  // Wait for the CM view to be reconfigured with the new starter code.
  await page.waitForTimeout(200);
}
