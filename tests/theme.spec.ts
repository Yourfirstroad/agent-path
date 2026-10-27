import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'

test('主题切换刷新保留、两个入口同步且不更改学习记录', async ({ page, request }) => {
  const before = await (await request.get('/api/export')).json()
  await page.goto('/settings')
  await page.getByRole('button', { name: '使用石墨蓝', exact: true }).click()
  await expect(page.getByRole('combobox', { name: '配色', exact: true })).toHaveValue('slate')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(18, 22, 29)')
  await page.reload()
  await expect(page.getByRole('button', { name: '使用石墨蓝', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('combobox', { name: '配色', exact: true }).selectOption('paper')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(242, 244, 247)')
  await expect(page.getByRole('button', { name: '使用纸白', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('link', { name: '学习工作台', exact: true }).click()
  await expect(page.getByRole('combobox', { name: '配色', exact: true })).toHaveValue('paper')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper')
  expect(await (await request.get('/api/export')).json()).toEqual(before)
})

test('主题选择可键盘操作，同浏览器新标签同步', async ({ page, context }) => {
  await page.goto('/settings')
  const second = await context.newPage()
  await second.goto('/')
  await page.getByRole('button', { name: '使用纸白', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: '使用纸白', exact: true })).toBeFocused()
  await expect(second.getByRole('combobox', { name: '配色', exact: true })).toHaveValue('paper')
  await second.close()
})

test('无效主题安全回退，存储受限提示仅本次有效', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('agent-path:appearance:v1', 'not-a-theme')
    Storage.prototype.setItem = function () {
      throw new DOMException('Blocked', 'SecurityError')
    }
  })
  await page.goto('/settings')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'forest')
  await page.getByRole('button', { name: '使用纸白', exact: true }).click()
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(242, 244, 247)')
  await expect(page.getByRole('alert')).toContainText('仅本次页面有效')
})

for (const theme of ['forest', 'slate', 'paper']) {
  test(`${theme} 配色文字对比度与响应布局`, async ({ page }) => {
    await mkdir('artifacts', { recursive: true })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/settings')
    await page.getByRole('combobox', { name: '配色', exact: true }).selectOption(theme)
    for (const path of ['/', '/settings', '/learn/l01', '/resources', '/projects', '/roadmap']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        })),
        path,
      ).toEqual([])
    }
    for (const width of [320, 375, 414, 768, 900, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const path of ['/', '/settings']) {
        await page.goto(path)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${path} ${width}`,
        ).toBe(true)
        const select = await page.getByRole('combobox', { name: '配色', exact: true }).boundingBox()
        expect(select).not.toBeNull()
        expect(select!.x + select!.width).toBeLessThanOrEqual(width)
        expect(select!.height).toBeGreaterThanOrEqual(44)
      }
    }
    await page.screenshot({ path: `artifacts/theme-${theme}-desktop.png`, fullPage: true })
    await page.setViewportSize({ width: 375, height: 812 })
    await page.screenshot({ path: `artifacts/theme-${theme}-mobile.png`, fullPage: true })
    expect(errors).toEqual([])
  })
}
