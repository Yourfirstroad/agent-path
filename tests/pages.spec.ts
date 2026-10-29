import { test, expect, type Page, type Download } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { State } from '../src/features/learning/types'

const key = 'agent-path:learning:v1'
const blank: State = {
  version: 1,
  lessons: {},
  projects: {},
  bookmarks: [],
  settings: { daily_minutes: 60 },
}
const noteLabel = '记下理解、报错和下次要做的事'
async function downloadJson(download: Download) {
  const stream = await download.createReadStream()
  if (!stream) throw new Error('Download stream missing')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as State
}
async function exportState(page: Page, snapshot = false) {
  const pending = page.waitForEvent('download')
  await page
    .getByRole('button', { name: snapshot ? '导出恢复前快照' : '导出全部记录', exact: true })
    .click()
  return downloadJson(await pending)
}
async function importState(page: Page, state: unknown) {
  await page.getByLabel('选择 JSON 备份').setInputFiles({
    name: 'test-restore.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(state)),
  })
  await page.getByRole('button', { name: '确认恢复', exact: true }).click()
}

test('无安装打开、子路径资源、全部课程直接访问和刷新', async ({ page, request }) => {
  const requests: string[] = [],
    errors: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./')
  await expect(page.getByRole('link', { name: '开始第一课', exact: true })).toBeVisible()
  await expect(page.getByText('浏览器保存 · 个人记录')).toBeVisible()
  const response = await request.get('curriculum.json')
  expect(response.ok()).toBeTruthy()
  const curriculum = await response.json()
  expect(curriculum).not.toHaveProperty('state')
  expect(curriculum.lessons).toHaveLength(62)
  for (const lesson of curriculum.lessons) {
    await page.goto(`./#/learn/${lesson.id}`)
    await expect(page.getByRole('heading', { name: lesson.title, exact: true })).toBeVisible()
  }
  await page.reload()
  await expect(page.getByLabel(noteLabel)).toBeVisible()
  expect(requests.filter((url) => new URL(url).pathname.startsWith('/api/'))).toEqual([])
  expect(errors).toEqual([])
})

test('实践验收、自测与笔记刷新保留，第二位访问者记录独立', async ({ page, browser }) => {
  await page.goto('./#/learn/l01')
  const checks = page.getByRole('checkbox')
  for (let index = 0; index < 3; index++) await checks.nth(index).check()
  await page.getByRole('radio', { name: '只切换窗口', exact: true }).check()
  await page.getByRole('button', { name: '检查答案' }).click()
  await expect(page.getByText('本课已完成。', { exact: false })).toHaveCount(0)
  await page.getByRole('radio', { name: '保存文件并重新运行', exact: true }).check()
  await page.getByRole('button', { name: '检查答案' }).click()
  await expect(page.getByText('本课已完成。', { exact: false })).toBeVisible()
  await page.getByLabel(noteLabel).fill('在线版测试笔记')
  await page.getByRole('button', { name: '保存笔记', exact: true }).click()
  await expect(page.getByText('笔记已保存到当前浏览器', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel(noteLabel)).toHaveValue('在线版测试笔记')
  const other = await browser.newContext()
  try {
    const visitor = await other.newPage()
    await visitor.goto(page.url())
    await expect(visitor.getByLabel(noteLabel)).toHaveValue('')
    await expect(visitor.getByRole('checkbox').first()).not.toBeChecked()
  } finally {
    await other.close()
  }
})

test('导出、替换恢复与恢复前快照都包含真实个人记录', async ({ page }) => {
  await page.goto('./#/projects')
  await page.getByRole('checkbox').first().check()
  await page.getByRole('link', { name: '学习设置', exact: true }).click()
  await page.getByRole('button', { name: '30分钟 轻量推进' }).click()
  await expect(page.getByRole('button', { name: '30分钟 轻量推进' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  const old = await exportState(page)
  expect(old.projects.p1.checks[0]).toBe(true)
  expect(old.settings.daily_minutes).toBe(30)
  await importState(page, {
    ...blank,
    settings: { daily_minutes: 90 },
    lessons: {
      l01: {
        checks: [false, false, false],
        note: '导入的新记录',
        answer: null,
        completed_at: '伪造完成',
      },
    },
  })
  await expect(page.getByText('备份已恢复，原记录已留存快照')).toBeVisible()
  await page.reload()
  const next = await exportState(page)
  expect(next.lessons.l01.note).toBe('导入的新记录')
  expect(next.lessons.l01.completed_at).toBeNull()
  expect(await exportState(page, true)).toEqual(old)
  await importState(page, old)
  await expect(page.getByRole('button', { name: '30分钟 轻量推进' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('错误备份和超长笔记不覆盖已有数据', async ({ page }) => {
  await page.goto('./#/settings')
  await page.getByRole('button', { name: '90分钟 集中学习' }).click()
  const old = await exportState(page)
  const invalid = [
    { ...blank, settings: { daily_minutes: 45 } },
    {
      ...blank,
      lessons: {
        unknown: { checks: [false, false, false], note: '', answer: null, completed_at: null },
      },
    },
    {
      ...blank,
      lessons: {
        l01: {
          checks: [false, false, false],
          note: 'x'.repeat(30001),
          answer: null,
          completed_at: null,
        },
      },
    },
    { ...blank, bookmarks: ['unknown'] },
    { ...blank, extra: 'not allowed' },
  ]
  for (const value of invalid) {
    await importState(page, value)
    await expect(page.getByText(/原记录未被替换/).last()).toBeVisible()
    expect(await exportState(page)).toEqual(old)
  }
})

test('浏览器禁止存储时仍可阅读，保存失败保留草稿', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'agent-path:learning:v1' || key === 'agent-path:storage-probe')
        throw new DOMException('blocked', 'SecurityError')
      original.call(this, key, value)
    }
  })
  await page.goto('./#/learn/l01')
  await expect(page.getByText(/浏览器未允许保存数据/)).toBeVisible()
  await page.getByLabel(noteLabel).fill('保存失败时保留这份草稿')
  await page.getByRole('button', { name: '保存笔记', exact: true }).click()
  await expect(page.getByText(/浏览器无法保存记录/)).toBeVisible()
  await expect(page.getByLabel(noteLabel)).toHaveValue('保存失败时保留这份草稿')
  await expect(page.getByText('笔记已保存到当前浏览器', { exact: true })).toHaveCount(0)
})

test('恢复遇到容量不足时当前记录和之前快照一起保留', async ({ page }) => {
  await page.goto('./#/settings')
  await importState(page, { ...blank, settings: { daily_minutes: 90 } })
  await expect(page.getByRole('button', { name: '90分钟 集中学习' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  const old = await page.evaluate((key) => localStorage.getItem(key), key)
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'agent-path:learning:v1') throw new DOMException('full', 'QuotaExceededError')
      original.call(this, key, value)
    }
  })
  await importState(page, blank)
  await expect(page.getByText(/浏览器无法保存记录/)).toBeVisible()
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(old)
})

test('同浏览器标签同步且保留未保存笔记，资料收藏可刷新', async ({ page, context }) => {
  await page.goto('./#/learn/l01')
  await page.getByLabel(noteLabel).fill('不要覆盖我的草稿')
  const second = await context.newPage()
  await second.goto(new URL('./#/settings', page.url()).href)
  await second.getByRole('button', { name: '30分钟 轻量推进' }).click()
  await expect
    .poll(async () =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).state.settings.daily_minutes,
        key,
      ),
    )
    .toBe(30)
  await expect(page.getByLabel(noteLabel)).toHaveValue('不要覆盖我的草稿')
  await second.goto(new URL('./#/resources', page.url()).href)
  await second
    .getByRole('button', { name: /^收藏 / })
    .first()
    .click()
  await second.reload()
  await expect(second.getByRole('button', { name: /^取消收藏 / }).first()).toBeVisible()
})

test('三套主题与手机布局正常', async ({ page }) => {
  await page.goto('./#/settings')
  for (const theme of ['forest', 'slate', 'paper']) {
    await page.getByLabel('配色', { exact: true }).selectOption(theme)
    await page.reload()
    await expect(page.getByLabel('配色', { exact: true })).toHaveValue(theme)
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(audit.violations).toEqual([])
  }
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('./#/learn/l10')
  await expect(page.getByLabel(noteLabel)).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})

test('框架课程有完整代码及实际 ZIP 下载入口', async ({ page }) => {
  await page.goto('./#/learn/lc03')
  await expect(page.getByRole('heading', { name: '1. 准备文件与环境', exact: true })).toBeVisible()
  await page.locator('summary').filter({ hasText: '03_agent_memory.py' }).click()
  await expect(
    page.getByRole('code').filter({ hasText: 'from langchain.agents import create_agent' }),
  ).toContainText('from langchain.agents import create_agent')
  const pending = page.waitForEvent('download')
  await page.getByRole('link', { name: '下载完整实战包', exact: true }).click()
  const download = await pending
  expect(download.suggestedFilename()).toBe('agent-labs.zip')
  const stream = await download.createReadStream(),
    chunks: Buffer[] = []
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk))
  const archive = Buffer.concat(chunks)
  expect(archive.subarray(0, 2).toString()).toBe('PK')
  expect(archive.length).toBeGreaterThan(5000)
  await page.screenshot({ path: 'artifacts/framework-desktop.png', fullPage: true })
  for (const width of [320, 375, 414, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./#/learn/lg04')
    await expect(page.getByRole('link', { name: '下载完整实战包', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 375)
      await page.screenshot({ path: 'artifacts/framework-mobile.png', fullPage: true })
  }
})

test('旧版完成记录和笔记保留，新增框架课成为下一步', async ({ page, request }) => {
  const curriculum = await (await request.get('curriculum.json')).json()
  const lessons = Object.fromEntries(
    curriculum.lessons
      .filter((lesson: { id: string }) => /^l\d{2}$/.test(lesson.id))
      .map((lesson: { id: string; quiz: { answer: number } }) => [
        lesson.id,
        {
          checks: [true, true, true],
          answer: lesson.quiz.answer,
          note: lesson.id === 'l31' ? '旧版 LangGraph 学习笔记' : '',
          completed_at: '2026-10-27T00:00:00Z',
        },
      ]),
  )
  await page.goto('./#/settings')
  await importState(page, { ...blank, lessons, bookmarks: ['graph'] })
  await expect(page.getByText('备份已恢复，原记录已留存快照')).toBeVisible()
  await page.getByRole('link', { name: '学习工作台', exact: true }).click()
  await expect(page.getByRole('link', { name: '继续学习', exact: true })).toHaveAttribute(
    'href',
    /#\/learn\/lc01$/,
  )
  await expect(page.getByText(/40\s*\/\s*62\s*节已完成/)).toBeVisible()
  await expect(
    page.getByRole('progressbar', { name: '当前阶段进度', exact: true }),
  ).toHaveAttribute('max', '9')
  await page.getByRole('link', { name: '学习笔记', exact: true }).click()
  await expect(page.getByText('旧版 LangGraph 学习笔记', { exact: true })).toBeVisible()
})

test('62 课都有跟做步骤，运行命令和参考答案不会改变进度', async ({ page, request, context }) => {
  const curriculum = await (await request.get('curriculum.json')).json()
  for (const lesson of curriculum.lessons) {
    expect(lesson.guide.files.length).toBeGreaterThan(0)
    expect(lesson.guide.explain.length).toBeGreaterThanOrEqual(3)
    await page.goto(`./#/learn/${lesson.id}`)
    await expect(
      page.getByRole('heading', { name: '这节课，你会做出什么', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: '3. 运行，再对照结果', exact: true }),
    ).toBeVisible()
  }
  await page.goto('./#/learn/l18')
  const before = await exportStateFromStorage(page)
  await page.getByRole('link', { name: '3 运行', exact: true }).click()
  expect(page.url()).toContain('#/learn/l18')
  await page.getByLabel('你的电脑系统').selectOption('unix')
  await expect(page.getByRole('code').filter({ hasText: 'python3 -m venv' })).toContainText(
    '.venv/bin/python',
  )
  await page.locator('summary').filter({ hasText: '卡住时，展开参考答案' }).click()
  await expect(page.getByText(/不要自行补上今天或明天/)).toBeVisible()
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: '复制main.py', exact: true }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('def extract(text)')
  const pending = page.waitForEvent('download')
  await page.getByRole('link', { name: '下载全套参考代码', exact: true }).click()
  const download = await pending
  expect(download.suggestedFilename()).toBe('guided-lessons.zip')
  expect(await exportStateFromStorage(page)).toEqual(before)
})

async function exportStateFromStorage(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), key)
}

test('新教程三套主题无障碍与五种宽度可读', async ({ page }) => {
  await page.goto('./#/learn/da08')
  for (const theme of ['forest', 'slate', 'paper']) {
    await page.getByLabel('配色', { exact: true }).selectOption(theme)
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(audit.violations).toEqual([])
  }
  await page.getByLabel('配色', { exact: true }).selectOption('forest')
  for (const width of [320, 375, 414, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(page.getByRole('link', { name: '下载全套参考代码', exact: true })).toBeVisible()
    if (width === 375 || width === 1440)
      await page.screenshot({ path: `artifacts/guided-da08-${width}.png`, fullPage: true })
  }
})

test('Harness 与 Deep Agents 下载、先修入口和旧48课记录兼容', async ({ page, request }) => {
  const curriculum = await (await request.get('curriculum.json')).json()
  const old = {
    ...blank,
    lessons: Object.fromEntries(
      curriculum.lessons
        .filter((l: { id: string }) => !/^(h|da)\d/.test(l.id))
        .map((l: { id: string; quiz: { answer: number } }) => [
          l.id,
          {
            checks: [true, true, true],
            answer: l.quiz.answer,
            note: l.id === 'lg04' ? '保留我的旧框架笔记' : '',
            completed_at: '2026-10-28T00:00:00Z',
          },
        ]),
    ),
  }
  await page.goto('./#/settings')
  await importState(page, old)
  await expect(page.getByText('备份已恢复，原记录已留存快照')).toBeVisible()
  await page.getByRole('link', { name: '学习工作台', exact: true }).click()
  await expect(page.getByRole('link', { name: '继续学习', exact: true })).toHaveAttribute(
    'href',
    /#\/learn\/h01$/,
  )
  await page.goto('./#/learn/da08')
  await expect(
    page
      .locator('.guide-prerequisites')
      .getByRole('link', {
        name: 'Deep Agents 上下文与权限：大文件按需读、原始资料禁止改',
        exact: true,
      }),
  ).toHaveAttribute('href', /#\/learn\/da07$/)
  const pending = page.waitForEvent('download')
  await page.getByRole('link', { name: '下载全套参考代码', exact: true }).click()
  expect((await pending).suggestedFilename()).toBe('harness-labs.zip')
  await page.goto('./#/notes')
  await expect(page.getByText('保留我的旧框架笔记', { exact: true })).toBeVisible()
})
