import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
try {
  for (const theme of ['light', 'dark']) {
    await page.goto('http://127.0.0.1:5177/')
    await page.evaluate(
      (theme) =>
        localStorage.setItem(
          'agent-path-00d9f5ad:preferences:v1',
          JSON.stringify({ theme, accent: 'clay', name: '测试' }),
        ),
      theme,
    )
    for (const path of [
      '/',
      '/showcase',
      '/workspace',
      '/workspace/projects',
      '/workspace/projects/new',
      '/workspace/components',
      '/workspace/settings',
    ]) {
      await page.goto(`http://127.0.0.1:5177${path}`)
      await page.locator('h1').waitFor()
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      console.log(
        JSON.stringify({
          path,
          theme,
          violations: result.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
          })),
        }),
      )
    }
  }
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('http://127.0.0.1:5177/workspace/projects')
  await page.locator('h1').waitFor()
  console.log(
    'OVERFLOW',
    await page.evaluate(() =>
      Array.from(document.querySelectorAll('body *'))
        .map((e) => ({
          tag: e.tagName,
          className: e.className?.toString(),
          left: e.getBoundingClientRect().left,
          right: e.getBoundingClientRect().right,
          width: e.getBoundingClientRect().width,
        }))
        .filter((e) => e.right > innerWidth + 1)
        .slice(0, 25),
    ),
  )
} finally {
  await browser.close()
}
