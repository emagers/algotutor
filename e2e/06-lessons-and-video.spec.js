import { test, expect } from "@playwright/test";
import { clearStorage } from "./helpers.js";

test.beforeEach(async ({ page }) => { await clearStorage(page); });

test("lessons page lists topics with counts and links", async ({ page }) => {
  await page.goto("/lessons.html");
  await expect(page.locator(".lesson-card").first()).toBeVisible({ timeout: 5000 });
  const cardCount = await page.locator(".lesson-card").count();
  expect(cardCount).toBeGreaterThan(5);
  const firstCard = page.locator(".lesson-card a").first();
  await expect(firstCard).toHaveAttribute("href", /lesson\.html\?tag=/);
});

test("clicking a lesson opens the per-topic page with problems", async ({ page }) => {
  await page.goto("/lessons.html");
  await page.locator(".lesson-card a").first().click();
  await expect(page).toHaveURL(/lesson\.html\?tag=/);
  await expect(page.locator(".problem-row").first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator("#lesson-title")).not.toHaveText(/loading/i);
});

test("problem page has a Video tab that toggles the embed", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await expect(page.locator(".problem-tab", { hasText: "Video" })).toBeVisible();
  await page.locator(".problem-tab", { hasText: "Video" }).click();
  await expect(page.locator("#video-body iframe")).toBeVisible();
  await expect(page.locator("#video-body iframe")).toHaveAttribute(
    "src",
    /youtube\.com\/embed\//,
  );
  // Switching back to Description hides the video pane.
  await page.locator(".problem-tab", { hasText: "Description" }).click();
  await expect(page.locator("#video-body")).toHaveClass(/hidden/);
});
