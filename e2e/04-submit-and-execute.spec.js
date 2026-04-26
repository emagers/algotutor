import { test, expect } from "@playwright/test";
import { clearStorage, selectLanguage, setEditorCode, waitForEditor } from "./helpers.js";

test.beforeEach(async ({ page }) => { await clearStorage(page); });

const TWO_SUM_JS = `
function twoSum(nums, target) {
  const m = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (m.has(target - nums[i])) return [m.get(target - nums[i]), i];
    m.set(nums[i], i);
  }
}`;

const TWO_SUM_RUST = `
fn twoSum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    use std::collections::HashMap;
    let mut m: HashMap<i32, i32> = HashMap::new();
    for (i, &n) in nums.iter().enumerate() {
        if let Some(&j) = m.get(&(target - n)) { return vec![j, i as i32]; }
        m.insert(n, i as i32);
    }
    vec![]
}`;

const TWO_SUM_GO = `
func twoSum(nums []int, target int) []int {
    m := map[int]int{}
    for i, n := range nums {
        if j, ok := m[target-n]; ok { return []int{j, i} }
        m[n] = i
    }
    return nil
}`;

async function submitAndWaitForResult(page) {
  await page.click("#btn-submit");
  // submission.html navigation
  await page.waitForURL(/submission\.html/, { timeout: 90_000 });
  await expect(page.locator(".submission-summary")).toBeVisible({ timeout: 30_000 });
}

test("JS submission for two-sum is accepted (full test suite)", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await setEditorCode(page, TWO_SUM_JS);
  await submitAndWaitForResult(page);
  await expect(page.locator(".submission-summary .title")).toHaveText(/Accepted/);
  await expect(page.locator(".submission-summary")).toContainText(/12 \/ 12/);
});

test("Rust submission for two-sum is accepted via Docker backend", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await selectLanguage(page, "rust");
  await setEditorCode(page, TWO_SUM_RUST);
  await submitAndWaitForResult(page);
  await expect(page.locator(".submission-summary .title")).toHaveText(/Accepted/);
  await expect(page.locator(".submission-summary")).toContainText(/12 \/ 12/);
  await expect(page.locator(".submission-summary .meta")).toContainText(/rust/);
});

test("Go submission for two-sum is accepted via Docker backend", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await selectLanguage(page, "go");
  await setEditorCode(page, TWO_SUM_GO);
  await submitAndWaitForResult(page);
  await expect(page.locator(".submission-summary .title")).toHaveText(/Accepted/);
  await expect(page.locator(".submission-summary")).toContainText(/12 \/ 12/);
  await expect(page.locator(".submission-summary .meta")).toContainText(/go/);
});

test("Wrong-answer JS submission shows failure with details", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await setEditorCode(page, `function twoSum(nums, target) { return [0, 0]; }`);
  await submitAndWaitForResult(page);
  await expect(page.locator(".submission-summary .title")).toHaveText(/Wrong Answer/);
  // Failures appear first.
  const firstResult = page.locator(".test-result").first();
  await expect(firstResult).toHaveClass(/fail/);
  // Details are already expanded for failing tests.
  await expect(firstResult.locator(".details")).toBeVisible();
  await expect(firstResult.locator(".details")).toContainText(/Expected:/);
  await expect(firstResult.locator(".details")).toContainText(/Actual:/);
});

test("Rust compile error is reported in the submission", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await selectLanguage(page, "rust");
  await setEditorCode(page, `fn twoSum(nums: Vec<i32>, target: i32) -> Vec<i32> { THIS IS NOT VALID RUST }`);
  await submitAndWaitForResult(page);
  await expect(page.locator(".submission-summary .title")).toHaveText(/Runtime Error/);
  await expect(page.locator(".submission-summary pre")).toContainText(/cargo build failed|error/);
});
