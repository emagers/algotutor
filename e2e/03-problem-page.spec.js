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

test("custom input runs against the user code (Rust, via backend)", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await selectLanguage(page, "rust");
  await setEditorCode(page, `
fn twoSum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    use std::collections::HashMap;
    let mut m: HashMap<i32, i32> = HashMap::new();
    for (i, &n) in nums.iter().enumerate() {
        if let Some(&j) = m.get(&(target - n)) { return vec![j, i as i32]; }
        m.insert(n, i as i32);
    }
    vec![]
}`);
  await page.fill("#custom-input", JSON.stringify({ nums: [2,7,11,15], target: 9 }));
  await page.click("#btn-run");
  const out = page.locator("#output");
  await expect(out).toContainText("Output", { timeout: 60_000 });
  await expect(out).toContainText("[0,1]");
});

test("invalid JSON in custom input shows error", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await page.fill("#custom-input", "{ not json");
  await page.click("#btn-run");
  await expect(page.locator("#output")).toContainText(/not valid JSON/i);
});

test("Run/Submit buttons enabled across all languages (full support)", async ({ page }) => {
  // All 200 problems support all 3 languages — verify a previously-restricted
  // problem (alien-dictionary) is fully usable in Rust now.
  await page.goto("/problem.html?id=alien-dictionary");
  await waitForEditor(page);
  for (const lang of ["javascript", "rust", "go"]) {
    await selectLanguage(page, lang);
    await expect(page.locator("#btn-run")).toBeEnabled();
    await expect(page.locator("#btn-submit")).toBeEnabled();
  }
});

test("editor code persists across page reload", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  const marker = "// my-custom-marker-" + Date.now();
  await setEditorCode(page, `function twoSum(nums, target) {\n${marker}\n  return [];\n}`);
  // Give the debounced save (400ms) + network round-trip time to complete.
  await page.waitForTimeout(800);
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

test("code is distinct per language and survives switching", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);

  const jsMarker = "// js-marker-" + Date.now();
  await setEditorCode(page, `function twoSum() {\n${jsMarker}\n}`);
  await page.waitForTimeout(800);

  await selectLanguage(page, "rust");
  // Rust tab should show starter (NOT the JS code we just wrote).
  let rustCode = await getEditorCode(page);
  expect(rustCode).not.toContain(jsMarker);
  expect(rustCode).toMatch(/fn\s+twoSum/);

  const rustMarker = "// rust-marker-" + Date.now();
  await setEditorCode(page, `fn twoSum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n${rustMarker}\n    vec![]\n}`);
  await page.waitForTimeout(800);

  // Switch back to JavaScript — should restore the JS code, not the Rust code.
  await selectLanguage(page, "javascript");
  const jsCode = await getEditorCode(page);
  expect(jsCode).toContain(jsMarker);
  expect(jsCode).not.toContain(rustMarker);

  // Switch back to Rust — should restore the Rust code.
  await selectLanguage(page, "rust");
  rustCode = await getEditorCode(page);
  expect(rustCode).toContain(rustMarker);
  expect(rustCode).not.toContain(jsMarker);
});

test("selected language persists across page navigations", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await selectLanguage(page, "rust");
  // Wait for the lang PUT to complete.
  await page.waitForTimeout(300);

  // Navigate to a different problem — Rust tab should be active by default.
  await page.goto("/problem.html?id=valid-parentheses");
  await waitForEditor(page);
  await expect(page.locator(`.lang-tab[data-lang="rust"]`)).toHaveClass(/active/);
  const code = await getEditorCode(page);
  expect(code).toMatch(/fn\s+/);

  // Even on a fresh page (problems list → problem), the choice persists.
  await page.goto("/problems.html");
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await expect(page.locator(`.lang-tab[data-lang="rust"]`)).toHaveClass(/active/);
});
