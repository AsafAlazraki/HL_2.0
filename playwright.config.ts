import { defineConfig, devices } from '@playwright/test'
import { PREVIEW_PORT } from './tools/ports.ts'

/**
 * Everything browser-side runs against `vite preview` of a fresh build, never the dev
 * server: the old repo's rulers measured a Vite HMR partial transform three times.
 */
const baseURL = `http://localhost:${PREVIEW_PORT}`

export default defineConfig({
  testDir: './e2e',
  snapshotDir: './e2e/__screenshots__',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    deviceScaleFactor: 1,
    locale: 'en-AU',
    timezoneId: 'Australia/Brisbane',
  },
  projects: [
    {
      name: 'laptop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
