import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";
import "./e2e/helpers/env";

// Prefer full Chromium over headless_shell (avoids wrong-arch lookup on some mac hosts).
process.env.PLAYWRIGHT_CHROMIUM_USE_HEADLESS_SHELL ??= "0";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** Pause between Playwright actions (ms). Use with --headed to watch. */
const slowMo = Number(process.env.E2E_SLOW_MO || 0) || 0;
const headed = process.env.E2E_HEADED === "1" || process.argv.includes("--headed");

/**
 * Commerce E2E against Nuxt (port 8000) + Nest API (`NUXT_ENV_BASE_URL`).
 *
 * Watch mode:
 *   E2E_HEADED=1 E2E_SLOW_MO=1000 npm run test:e2e:watch -- e2e/auth/login.spec.ts
 */
export default defineConfig({
  testDir: path.join(rootDir, "e2e"),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: slowMo ? 180_000 : 90_000,
  expect: { timeout: slowMo ? 30_000 : 15_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:8000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "ar-EG",
    headless: headed ? false : undefined,
    launchOptions: slowMo ? { slowMo } : undefined,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.E2E_SKIP_WEBSERVER
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:8000",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
