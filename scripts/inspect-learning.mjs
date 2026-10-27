import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
await mkdir('artifacts', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://127.0.0.1:8099')
await page.waitForLoadState('networkidle')
console.log(
  JSON.stringify({
    heading: await page.locator('h1').allTextContents(),
    buttons: await page.getByRole('button').allTextContents(),
    errors,
  }),
)
await page.screenshot({ path: 'artifacts/dashboard-desktop.png', fullPage: true })
await page.setViewportSize({ width: 375, height: 812 })
await page.screenshot({ path: 'artifacts/dashboard-mobile.png', fullPage: true })
await browser.close()
