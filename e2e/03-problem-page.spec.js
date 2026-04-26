import { test, expect } from "@playwright/test";
import { clearStorage, getEditorCode, selectLanguage, setEditorCode, waitForEditor } from "./helpers.js";

test.beforeEach(async ({ page }) => { await clearStorage(page); });

test("problem page renders content + starter code", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await expect(page.locator("#problem-head h2")).toContainText(/Two Sum/i);
  await expect(page.locator("#problem-body h3", { hasText: /Description/ })).toBeVisible();
  await expect(page.locator(".example-block").first()).toBeVisible();
  // Editor populated with JS starter
  await waitForEditor(page);
  const js = await getEditorCode(page);
  expect(js).toContain("function twoSum");
});

test("language tabs swap starter code", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);

  await selectLanguage(page, "rust");
  let code = await getEditorCode(page);
  expect(code).toContain("fn twoSum");
  expect(code).toContain("Vec<i32>");

  await selectLanguage(page, "go");
  code = await getEditorCode(page);
  expect(code).toContain("func twoSum");
  expect(code).toContain("[]int");

  await selectLanguage(page, "javascript");
  code = await getEditorCode(page);
  expect(code).toContain("function twoSum");
});

test("hints reveal on click", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  const hint = page.locator("details.hint").first();
  await expect(hint).toBeVisible();
  await hint.locator("summary").click();
  await expect(hint).toHaveAttribute("open", "");
});

test("custom input runs against the user code (JS)", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await setEditorCode(page, `
function twoSum(nums, target) {
  const m = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (m.has(target - nums[i])) return [m.get(target - nums[i]), i];
    m.set(nums[i], i);
  }
}`);
  await page.fill("#custom-input", JSON.stringify({ nums: [2,7,11,15], target: 9 }));
  await page.click("#btn-run");
  // Wait for output.
  const out = page.locator("#output");
  await expect(out).toBeVisible();
  await expect(out).toContainText("Output", { timeout: 10_000 });
  await expect(out).toContainText("[0,1]");
});

test("invalid JSON in custom input shows error", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await page.fill("#custom-input", "{ not json");
  await page.click("#btn-run");
  await expect(page.locator("#output")).toContainText(/not valid JSON/i);
});

test("Run/Submit buttons disabled for backendUnsupported language", async ({ page }) => {
  await page.goto("/problem.html?id=alien-dictionary");
  await waitForEditor(page);
  await selectLanguage(page, "rust");
  await expect(page.locator("#btn-run")).toBeDisabled();
  await expect(page.locator("#btn-submit")).toBeDisabled();
  await expect(page.locator("#lang-warning")).toContainText(/not supported/i);
  // JS still works.
  await selectLanguage(page, "javascript");
  await expect(page.locator("#btn-run")).toBeEnabled();
  await expect(page.locator("#btn-submit")).toBeEnabled();
});

test("editor code persists across page reload", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  const marker = "// my-custom-marker-" + Date.now();
  await setEditorCode(page, `function twoSum(nums, target) {\n${marker}\n  return [];\n}`);
  // Give onChange listeners time to persist to localStorage.
  await page.waitForTimeout(300);
  await page.reload();
  await waitForEditor(page);
  // Wait for the saved code to be loaded back.
  await page.waitForFunction(
    (m) => window.__algotutor_cm_view?.state.doc.toString().includes(m),
    marker,
    { timeout: 5_000 }
  );
  expect(await getEditorCode(page)).toContain(marker);
});
