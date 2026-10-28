import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  testMatch: ['cloud.spec.ts'],
  workers: 1,
  timeout: 45000,
  expect: { timeout: 8000 },
  outputDir: 'work/cloud-test-results',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8112/agent-path/',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command:
      'npm exec -- vite preview --mode pages --outDir work/cloud-preview --host 127.0.0.1 --port 8112 --strictPort',
    url: 'http://127.0.0.1:8112/agent-path/',
    reuseExistingServer: false,
  },
})
