import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'
const blank = {
  version: 1,
  lessons: {},
  projects: {},
  bookmarks: [],
  settings: { daily_minutes: 60 },
}
test.beforeEach(async ({ request }) => {
  const r = await request.post('/api/import', { data: blank })
  expect(r.ok()).toBeTruthy()
})

test('课程验收、自测、笔记与刷新后的推荐形成完整流程', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: '开始第一课', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: '从零运行一段 Python', exact: true }),
  ).toBeVisible()
  const checks = page.getByRole('checkbox')
  for (let i = 0; i < 3; i++) {
    await checks.nth(i).click()
    await expect(checks.nth(i)).toBeChecked()
    await expect(checks.nth(i)).toBeEnabled()
  }
  await page.getByRole('radio', { name: '只切换窗口', exact: true }).check()
  await page.getByRole('button', { name: '检查答案' }).click()
  await expect(page.getByText('再想一想', { exact: true })).toBeVisible()
  await expect(page.getByText('本课已完成。', { exact: false })).toHaveCount(0)
  await page.getByRole('radio', { name: '保存文件并重新运行' }).check()
  await page.getByRole('button', { name: '检查答案' }).click()
  await expect(page.getByText('本课已完成。', { exact: false })).toBeVisible()
  await page.getByLabel('记下理解、报错和下次要做的事').fill('验收笔记：保存之后，再运行。')
  await page.getByRole('button', { name: '保存笔记', exact: true }).click()
  await expect(page.getByText('笔记已保存到本机数据库', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('记下理解、报错和下次要做的事')).toHaveValue(
    '验收笔记：保存之后，再运行。',
  )
  await expect(checks.nth(0)).toBeChecked()
  await page.getByRole('link', { name: '学习笔记', exact: true }).click()
  await expect(page.getByText('验收笔记：保存之后，再运行。', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: '学习工作台', exact: true }).click()
  await expect(page.getByRole('link', { name: '继续学习', exact: true })).toHaveAttribute(
    'href',
    '/learn/l02',
  )
})

test('资料搜索、空结果、收藏与持久化', async ({ page }) => {
  await page.goto('/resources')
  await page.getByLabel('搜索资料库').fill('MCP')
  await expect(page.locator('.resource-card')).toHaveCount(1)
  await page.getByRole('button', { name: '收藏 MCP · 官方入门', exact: true }).click()
  await expect(page.getByRole('button', { name: '取消收藏 MCP · 官方入门' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.reload()
  await expect(page.getByRole('button', { name: '取消收藏 MCP · 官方入门' })).toBeVisible()
  await page.getByLabel('搜索资料库').fill('no-such-resource-123')
  await expect(page.getByRole('heading', { name: '没有匹配的资料' })).toBeVisible()
  await page.getByRole('button', { name: '清除筛选' }).click()
  await expect(page.locator('.resource-card')).toHaveCount(36)
  await page.getByRole('button', { name: '只看收藏' }).click()
  await expect(page.locator('.resource-card')).toHaveCount(1)
})

test('项目、时长设置与导出恢复实际数据', async ({ page, request }) => {
  await page.goto('/projects')
  await page.getByRole('checkbox').first().click()
  await expect(page.getByRole('checkbox').first()).toBeChecked()
  await expect(page.getByRole('checkbox').first()).toBeEnabled()
  await page.reload()
  await expect(page.getByRole('checkbox').first()).toBeChecked()
  await page.getByRole('link', { name: '学习设置', exact: true }).click()
  await page.getByRole('button', { name: '30分钟 轻量推进' }).click()
  await expect(page.getByText('学习节奏已保存', { exact: true })).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('link', { name: '导出全部记录' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('agent-path-backup.json')
  const exported = await (await request.get('/api/export')).json()
  expect(exported.settings.daily_minutes).toBe(30)
  expect(exported.projects.p1.checks[0]).toBe(true)
  await page.getByLabel('选择 JSON 备份').setInputFiles({
    name: 'restore.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({
        ...blank,
        settings: { daily_minutes: 90 },
        lessons: {
          l01: {
            checks: [false, false, false],
            answer: null,
            note: '恢复的笔记',
            completed_at: null,
          },
        },
      }),
    ),
  })
  await expect(page.getByText('准备恢复：restore.json')).toBeVisible()
  await page.getByRole('button', { name: '确认恢复' }).click()
  await expect(page.getByText('备份已恢复，原记录已留存快照')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: '90分钟 集中学习' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('link', { name: '学习笔记', exact: true }).click()
  await expect(page.getByText('恢复的笔记', { exact: true })).toBeVisible()
})

test('失败不提示保存成功，未保存笔记阻止误离开', async ({ page }) => {
  await page.goto('/learn/l01')
  await page.getByLabel('记下理解、报错和下次要做的事').fill('不要丢失的草稿')
  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('link', { name: '返回学习路线' }).click()
  await expect(page).toHaveURL(/learn\/l01/)
  await page.route('**/api/lessons/l01', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ detail: '模拟保存失败，请重试' }),
    }),
  )
  await page.getByRole('button', { name: '保存笔记', exact: true }).click()
  await expect(page.getByText('模拟保存失败，请重试', { exact: true })).toBeVisible()
  await expect(page.getByLabel('记下理解、报错和下次要做的事')).toHaveValue('不要丢失的草稿')
  await expect(page.getByText('笔记已保存到本机数据库', { exact: true })).toHaveCount(0)
  await page.unroute('**/api/lessons/l01')
  await page.getByRole('button', { name: '保存笔记', exact: true }).click()
  await expect(page.getByText('笔记已保存到本机数据库', { exact: true })).toBeVisible()
})

test('错误备份不覆盖记录；未知路由可返回', async ({ page, request }) => {
  await request.patch('/api/lessons/l01', { data: { note: '保留原记录' } })
  await page.goto('/settings')
  await page.getByLabel('选择 JSON 备份').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{not-json'),
  })
  await expect(page.getByRole('alert')).toBeVisible()
  expect((await (await request.get('/api/export')).json()).lessons.l01.note).toBe('保留原记录')
  await page.goto('/not-a-page')
  await expect(page.getByRole('heading', { name: '这页还不在学习路线里' })).toBeVisible()
  await page.getByRole('link', { name: '返回工作台' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('今天')
})

for (const width of [320, 375, 414, 768, 1440])
  test(`主要页面 ${width}px 布局与控制台`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const path of [
      '/',
      '/roadmap',
      '/learn/l01',
      '/learn/l38',
      '/resources',
      '/projects',
      '/notes',
      '/settings',
    ]) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        path,
      ).toBeTruthy()
    }
    if (width <= 768) {
      await page.getByRole('button', { name: '打开导航' }).click()
      await page.getByRole('link', { name: '学习路线', exact: true }).click()
      await expect(page).toHaveURL(/roadmap/)
      await expect(page.locator('.sidebar')).not.toBeVisible()
    }
    expect(errors).toEqual([])
  })

test('课程和资料引用完整且所有课程路由可读', async ({ page, request }) => {
  const { curriculum: c } = await (await request.get('/api/bootstrap')).json()
  expect(c.lessons).toHaveLength(62)
  expect(c.stages).toHaveLength(10)
  for (const l of c.lessons) {
    expect(l.checks).toHaveLength(3)
    for (const id of l.resources)
      expect(c.resources.some((r: { id: string }) => r.id === id)).toBe(true)
    await page.goto(`/learn/${l.id}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(l.title)
  }
})

test('桌面可访问性与页面截图', async ({ page }) => {
  await mkdir('artifacts', { recursive: true })
  for (const [path, name] of [
    ['/', 'dashboard'],
    ['/learn/l01', 'lesson'],
    ['/resources', 'resources'],
    ['/roadmap', 'roadmap'],
    ['/projects', 'projects'],
    ['/settings', 'settings'],
  ]) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(
      results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([])
    await page.screenshot({ path: `artifacts/${name}-desktop.png`, fullPage: true })
  }
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await expect(page.locator('.sidebar')).not.toBeVisible()
  await page.screenshot({ path: 'artifacts/dashboard-mobile.png', fullPage: true })
})
