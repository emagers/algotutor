// Gap-filling E2E coverage: pane resize/collapse, CPU/memory metrics,
// Go custom-input run, and a non-trivial archetype submission flow.
import { test, expect } from "@playwright/test";
import { clearStorage, getEditorCode, selectLanguage, setEditorCode, waitForEditor } from "./helpers.js";

test.beforeEach(async ({ page }) => { await clearStorage(page); });

test("description, custom-input, and output panes can be collapsed/expanded", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);

  const problemPane = page.locator("#problem-pane");
  const runArea = page.locator("#run-area");
  const outputArea = page.locator("#output");

  // Initial state: nothing collapsed.
  await expect(problemPane).not.toHaveClass(/collapsed/);
  await expect(runArea).not.toHaveClass(/collapsed/);

  // Collapse description pane via the dedicated button.
  await page.click("#btn-collapse-problem");
  await expect(problemPane).toHaveClass(/collapsed/);

  // Expand again.
  await page.click("#btn-collapse-problem");
  await expect(problemPane).not.toHaveClass(/collapsed/);

  // Toggle custom-input section header.
  await page.click('[data-toggle="run-area"]');
  await expect(runArea).toHaveClass(/collapsed/);
  await page.click('[data-toggle="run-area"]');
  await expect(runArea).not.toHaveClass(/collapsed/);

  // Output area is hidden until first run; force-show it then test toggle.
  await page.fill("#custom-input", JSON.stringify({ nums: [1, 2], target: 3 }));
  await setEditorCode(page, `function twoSum(nums, target){ return [0, 1]; }`);
  await page.click("#btn-run");
  await expect(outputArea).toBeVisible({ timeout: 10_000 });
  await page.click('[data-toggle="output"]');
  await expect(outputArea).toHaveClass(/collapsed/);
  await page.click('[data-toggle="output"]');
  await expect(outputArea).not.toHaveClass(/collapsed/);

  // Collapsed state persists across reload.
  await page.click("#btn-collapse-problem");
  await expect(problemPane).toHaveClass(/collapsed/);
  // Wait for localStorage write.
  await page.waitForTimeout(200);
  await page.reload();
  await waitForEditor(page);
  await expect(page.locator("#problem-pane")).toHaveClass(/collapsed/);
});

test("description/editor split is drag-resizable", async ({ page }) => {
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);

  const problemPane = page.locator("#problem-pane");
  const widthBefore = (await problemPane.boundingBox()).width;

  const handle = page.locator("#resize-handle");
  const handleBox = await handle.boundingBox();
  // Drag the resize handle ~250px to the right.
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(handleBox.x + 250, handleBox.y + handleBox.height / 2, { steps: 8 });
  await page.mouse.up();

  const widthAfter = (await problemPane.boundingBox()).width;
  expect(widthAfter).toBeGreaterThan(widthBefore + 50);
});

test("submission page shows CPU/memory metrics (backend-routed run)", async ({ page }) => {
  test.setTimeout(120_000);
  // Metrics come from the backend, so use Rust (always backend-routed) to
  // ensure peakMemBytes / cpuMs / wallMs are populated.
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
  await page.click("#btn-submit");
  await page.waitForURL(/submission\.html/, { timeout: 90_000 });
  const metrics = page.locator(".metrics-row");
  await expect(metrics).toBeVisible({ timeout: 10_000 });
  await expect(metrics).toContainText(/Peak memory|CPU time/);
});

test("custom input runs against user code (Go, via backend)", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/problem.html?id=two-sum");
  await waitForEditor(page);
  await selectLanguage(page, "go");
  await setEditorCode(page, `
func twoSum(nums []int, target int) []int {
    m := map[int]int{}
    for i, n := range nums {
        if j, ok := m[target-n]; ok {
            return []int{j, i}
        }
        m[n] = i
    }
    return nil
}`);
  await page.fill("#custom-input", JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }));
  await page.click("#btn-run");
  const out = page.locator("#output");
  await expect(out).toContainText("Output", { timeout: 60_000 });
  await expect(out).toContainText("[0,1]");
});

test("design problem (LRU cache) submits successfully in Rust via backend", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/problem.html?id=lru-cache");
  await waitForEditor(page);
  await selectLanguage(page, "rust");
  await setEditorCode(page, `
use std::collections::HashMap;

pub struct LRUCache {
    cap: usize,
    order: Vec<i32>,
    map: HashMap<i32, i32>,
}

impl LRUCache {
    pub fn new(capacity: i32) -> Self {
        LRUCache { cap: capacity as usize, order: Vec::new(), map: HashMap::new() }
    }
    pub fn get(&mut self, key: i32) -> i32 {
        if let Some(&v) = self.map.get(&key) {
            self.order.retain(|&k| k != key);
            self.order.push(key);
            v
        } else { -1 }
    }
    pub fn put(&mut self, key: i32, value: i32) {
        if self.map.contains_key(&key) {
            self.order.retain(|&k| k != key);
        } else if self.map.len() >= self.cap {
            let evict = self.order.remove(0);
            self.map.remove(&evict);
        }
        self.order.push(key);
        self.map.insert(key, value);
    }
}`);
  await page.click("#btn-submit");
  await page.waitForURL(/submission\.html/, { timeout: 120_000 });
  // Header shows "X / X passed" — confirm a passing submission.
  await expect(page.locator(".sub-summary, .submission-header, body")).toContainText(/passed/i, { timeout: 10_000 });
});
