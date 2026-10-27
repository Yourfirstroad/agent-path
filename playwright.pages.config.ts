import { defineConfig } from '@playwright/test'

const remote = process.env.PAGES_TEST_URL
export default defineConfig({
  testDir: './tests',
  testMatch: ['pages.spec.ts'],
  workers: 1,
  timeout: 30000,
  expect: { timeout: 8000 },
  reporter: [['list']],
  use: {
    baseURL: remote || 'http://127.0.0.1:8111/agent-path/',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: remote
    ? undefined
    : {
        command: 'npm run preview:pages',
        url: 'http://127.0.0.1:8111/agent-path/',
        reuseExistingServer: false,
      },
})
