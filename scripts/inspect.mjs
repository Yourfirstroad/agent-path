import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
await mkdir('artifacts', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
})
page.on('pageerror', (e) => console.error('PAGE_ERROR:', e.message))
for (const [name, url] of [
  ['landing', '/'],
  ['dashboard', '/workspace'],
  ['gallery', '/workspace/components'],
]) {
  await page.goto(`http://127.0.0.1:5177${url}`)
  await page.locator('h1').waitFor()
  await page.screenshot({ path: `artifacts/${name}.png`, fullPage: true, animations: 'disabled' })
  console.log(name, await page.locator('h1').innerText())
}
await page.goto('http://127.0.0.1:5177/workspace')
await page.getByRole('button', { name: '切换深色主题' }).first().click()
await page.screenshot({
  path: 'artifacts/dashboard-dark.png',
  fullPage: true,
  animations: 'disabled',
})
await page.getByRole('button', { name: '切换浅色主题' }).first().click()
await page.setViewportSize({ width: 375, height: 812 })
for (const [name, url] of [
  ['landing-mobile', '/'],
  ['projects-mobile', '/workspace/projects'],
]) {
  await page.goto(`http://127.0.0.1:5177${url}`)
  await page.locator('h1').waitFor()
  await page.screenshot({ path: `artifacts/${name}.png`, fullPage: true, animations: 'disabled' })
}
await browser.close()
