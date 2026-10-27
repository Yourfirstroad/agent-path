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
  expect(curriculum.lessons).toHaveLength(40)
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
