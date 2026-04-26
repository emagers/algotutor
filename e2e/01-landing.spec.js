import { test, expect } from "@playwright/test";
import { clearStorage } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await clearStorage(page);
});

test("landing page renders hero and stats", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/AlgoTutor/);
  await expect(page.locator(".hero h1")).toHaveText(/Master 200 interview problems/);
  await expect(page.locator(".cta")).toHaveText(/Browse problems/);

  // Stats are loaded async from index.json — wait for them to fill in.
  const totalEl = page.locator("#stat-total");
  await expect(totalEl).toHaveText("200", { timeout: 10_000 });

  const testsEl = page.locator("#stat-tests");
  await expect(testsEl).not.toHaveText("…");
  const testsTxt = await testsEl.textContent();
  // We have 1647 tests; allow growth.
  expect(parseInt(testsTxt.replace(/,/g, ""), 10)).toBeGreaterThanOrEqual(1500);

  const catsTxt = await page.locator("#stat-cats").textContent();
  expect(parseInt(catsTxt, 10)).toBeGreaterThanOrEqual(15);
});

test("clicking 'Browse problems' navigates to list", async ({ page }) => {
  await page.goto("/");
  await page.click(".cta");
  await expect(page).toHaveURL(/problems\.html/);
  await expect(page.locator("h1, .group-header").first()).toBeVisible();
});

test("nav header links work", async ({ page }) => {
  await page.goto("/");
  await page.click(".site-nav a[href='problems.html']");
  await expect(page).toHaveURL(/problems\.html/);
  await page.click(".site-nav a[href='index.html']");
  await expect(page).toHaveURL(/(index\.html|\/$)/);
});
