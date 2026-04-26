import { test, expect } from "@playwright/test";
import { clearStorage, setEditorCode, waitForEditor } from "./helpers.js";

test.beforeEach(async ({ page }) => { await clearStorage(page); });

test("solving a problem marks it as solved on the list", async ({ page }) => {
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
  await page.click("#btn-submit");
  await page.waitForURL(/submission\.html/, { timeout: 90_000 });
  await expect(page.locator(".submission-summary .title")).toHaveText(/Accepted/);

  // Navigate to problems list and verify the row shows the solved icon.
  await page.goto("/problems.html");
  await page.fill("#search", "two-sum");
  const row = page.locator(".problem-row", { hasText: "Two Sum" }).first();
  await expect(row.locator(".status-solved")).toBeVisible();

  // Landing page solved counter should also reflect it.
  await page.goto("/");
  await expect(page.locator("#stat-solved")).toHaveText("1", { timeout: 5_000 });
});

test("attempted-but-failed problem shows attempted dot", async ({ page }) => {
  await page.goto("/problem.html?id=valid-parentheses");
  await waitForEditor(page);
  await setEditorCode(page, `function isValid(s) { return false; }`);
  await page.click("#btn-submit");
  await page.waitForURL(/submission\.html/, { timeout: 60_000 });
  await expect(page.locator(".submission-summary .title")).toHaveText(/Wrong Answer/);

  await page.goto("/problems.html");
  await page.fill("#search", "valid-parentheses");
  const row = page.locator(".problem-row", { hasText: "Valid Parentheses" }).first();
  await expect(row.locator(".status-attempted")).toBeVisible();
});

test("submission page renders correctly when no submission exists", async ({ page }) => {
  await page.goto("/submission.html?id=two-sum");
  await expect(page.locator(".empty-state")).toContainText(/No submission found/);
  await expect(page.locator(".empty-state a")).toHaveAttribute("href", /problem\.html\?id=two-sum/);
});

test("submission page links back to problem and to list", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await setEditorCode(page, `function twoSum() { return [0, 0]; }`);
  await page.click("#btn-submit");
  await page.waitForURL(/submission\.html/, { timeout: 30_000 });
  await expect(page.locator("a", { hasText: /Back to problem/ })).toHaveAttribute("href", /problem\.html\?id=two-sum/);
  await expect(page.locator("a", { hasText: /Browse more/ })).toHaveAttribute("href", /problems\.html/);
});
