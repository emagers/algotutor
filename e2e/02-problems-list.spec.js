import { test, expect } from "@playwright/test";
import { clearStorage } from "./helpers.js";

test.beforeEach(async ({ page }) => { await clearStorage(page); });

test("problems list renders all 200 problems", async ({ page }) => {
  await page.goto("/problems.html");
  await expect(page.locator(".problem-row").first()).toBeVisible({ timeout: 10_000 });
  const rows = await page.locator(".problem-row").count();
  expect(rows).toBe(200);
  const meta = await page.locator("#results-meta").textContent();
  expect(meta).toMatch(/Showing 200 of 200/);
});

test("difficulty filter works", async ({ page }) => {
  await page.goto("/problems.html");
  await expect(page.locator(".problem-row").first()).toBeVisible();
  // Uncheck Medium and Hard.
  await page.locator("input[data-diff='Medium']").uncheck();
  await page.locator("input[data-diff='Hard']").uncheck();
  const meta = await page.locator("#results-meta").textContent();
  expect(meta).toMatch(/Showing \d+ of 200/);
  // Every visible difficulty pill should be Easy.
  const diffs = await page.locator(".problem-row .difficulty").allTextContents();
  expect(diffs.length).toBeGreaterThan(0);
  for (const d of diffs) expect(d).toBe("Easy");
});

test("search filter works", async ({ page }) => {
  await page.goto("/problems.html");
  await expect(page.locator(".problem-row").first()).toBeVisible();
  await page.fill("#search", "two-sum");
  const rows = page.locator(".problem-row");
  await expect(rows.first()).toBeVisible();
  // Either two-sum or two-sum-ii — at most a couple of matches.
  expect(await rows.count()).toBeLessThanOrEqual(5);
  for (const t of await rows.locator(".title").allTextContents()) {
    expect(t.toLowerCase()).toContain("two");
  }
});

test("group-by category re-groups results", async ({ page }) => {
  await page.goto("/problems.html");
  await expect(page.locator(".problem-row").first()).toBeVisible();
  await page.selectOption("#group-by", "category");
  const headers = await page.locator(".group-header").allTextContents();
  expect(headers.length).toBeGreaterThan(5);
  // At least one expected category present.
  expect(headers.join("|").toLowerCase()).toMatch(/array|string|tree|graph/);
});

test("language chips render JS/RS/GO and reflect support", async ({ page }) => {
  await page.goto("/problems.html");
  await expect(page.locator(".problem-row").first()).toBeVisible();
  // Find a known unsupported problem and inspect its chips.
  await page.fill("#search", "alien-dictionary");
  const row = page.locator(".problem-row").first();
  await expect(row).toBeVisible();
  await expect(row.locator(".lang-chip", { hasText: "JS" })).toHaveClass(/on/);
  await expect(row.locator(".lang-chip", { hasText: "RS" })).toHaveClass(/off/);
  await expect(row.locator(".lang-chip", { hasText: "GO" })).toHaveClass(/off/);

  // And a fully-supported one.
  await page.fill("#search", "two-sum");
  const row2 = page.locator(".problem-row").first();
  await expect(row2.locator(".lang-chip", { hasText: "JS" })).toHaveClass(/on/);
  await expect(row2.locator(".lang-chip", { hasText: "RS" })).toHaveClass(/on/);
  await expect(row2.locator(".lang-chip", { hasText: "GO" })).toHaveClass(/on/);
});

test("clicking a problem row navigates to that problem", async ({ page }) => {
  await page.goto("/problems.html");
  await page.fill("#search", "two-sum");
  const row = page.locator(".problem-row", { hasText: "Two Sum" }).first();
  await row.click();
  await expect(page).toHaveURL(/problem\.html\?id=two-sum/);
  await expect(page.locator("#problem-head h2")).toContainText(/Two Sum/i);
});

test("clear filters button resets state", async ({ page }) => {
  await page.goto("/problems.html");
  await page.fill("#search", "tree");
  await page.locator("input[data-diff='Hard']").uncheck();
  await page.click("#clear-filters");
  await expect(page.locator("#search")).toHaveValue("");
  const meta = await page.locator("#results-meta").textContent();
  expect(meta).toMatch(/Showing 200 of 200/);
});
