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
  /*
   * EVERY SCREEN SIZE, because the owner asked for it in those words on 2026-09-17 and the
   * plan had promised only that "phone width does not break". These six are the shapes a
   * boat dealership actually has in front of it: a phone in a hand on the floor, the same
   * phone turned sideways, a tablet beside a hull, the laptop on the desk, the monitor in
   * the office and the wide screen in the showroom. Every ruler runs against all six, so a
   * layout that only holds at the size it was drawn at fails here rather than in front of a
   * customer.
   *
   * WHY NOT playwright's device presets. `devices['Pixel 7']` carries
   * deviceScaleFactor 2.625 and `devices['iPad (gen 7)']` selects WebKit. The first breaks
   * the screenshot determinism recipe, which fixes DPR at 1 and is asserted by a ruler; the
   * second needs a browser this project does not install. So each project states its own
   * viewport on Chromium and says whether it is a touch screen.
   *
   * laptop and desktop keep their names and numbers so no screenshot baseline moves.
   */
  projects: [
    {
      name: 'phone',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'phone-landscape',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 844, height: 390 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 834, height: 1112 },
        deviceScaleFactor: 1,
        hasTouch: true,
      },
    },
    {
      name: 'laptop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'wide',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
