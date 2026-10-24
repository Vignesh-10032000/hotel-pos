import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for Biryani POS
 * Windows Browser Demo Validation
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 }, // Standard POS touchscreen resolution
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'pos-touchscreen',
      use: {
        viewport: { width: 1024, height: 768 },
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: 'pnpm run dev --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
