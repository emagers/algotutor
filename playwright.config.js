import { defineConfig, devices } from "@playwright/test";

// Tests assume the docker compose stack (frontend on :8080, backend on :9090)
// is already running. Run `npm run up` to start it before `npm run e2e`.
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false, // localStorage / single-user state is shared
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:8080",
    headless: true,
    viewport: { width: 1400, height: 900 },
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
