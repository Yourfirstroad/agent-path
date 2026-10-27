import { defineConfig } from '@playwright/test'

const python = process.platform === 'win32' ? '.venv\\Scripts\\python.exe' : '.venv/bin/python'

export default defineConfig({
  testDir: './tests',
  testMatch: ['learning.spec.ts', 'theme.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 8000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8100',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `${python} -m uvicorn backend.app:app --host 127.0.0.1 --port 8100`,
    url: 'http://127.0.0.1:8100/api/health',
    env: { AGENT_PATH_DB: 'work/e2e/learning.sqlite3' },
    reuseExistingServer: false,
    timeout: 30000,
  },
})
