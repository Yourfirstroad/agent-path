import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('项目创建、校验、编辑、刷新、筛选、导出与删除', async ({ page }) => {
  await page.goto('/workspace/projects/new')
  await page.getByRole('button', { name: '保存项目' }).click()
  await expect(page.getByText('项目名称至少 2 个字')).toBeVisible()
  await page.getByLabel('项目名称').fill('自动验收项目')
  await page.getByLabel('项目描述').fill('验证刷新后保存和删除确认。')
  await page.getByLabel('当前状态').selectOption('active')
  await page.getByLabel('完成进度').fill('42')
  await page.getByRole('button', { name: '保存项目' }).click()
  await expect(page.getByRole('heading', { level: 1, name: '自动验收项目' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42')
  await page.getByRole('link', { name: '编辑项目', exact: true }).click()
  await page.getByLabel('项目名称').fill('已完成的验收项目')
  await page.getByLabel('当前状态').selectOption('done')
  await page.getByRole('button', { name: '保存项目' }).click()
  await expect(page.getByRole('heading', { level: 1, name: '已完成的验收项目' })).toBeVisible()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  await page.getByRole('link', { name: '返回项目列表' }).click()
  await page.getByLabel('搜索项目').fill('已完成的验收项目')
  await page.getByLabel('筛选状态').selectOption('done')
  await expect(page.getByRole('link', { name: '已完成的验收项目', exact: true })).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出记录' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('foundry-projects.json')
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream!) chunks.push(chunk)
  const exported = JSON.parse(Buffer.concat(chunks).toString())
  expect(exported.projects).toHaveLength(1)
  expect(exported.projects[0].name).toBe('已完成的验收项目')
  await page.getByRole('button', { name: '删除已完成的验收项目', exact: true }).click()
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.getByRole('link', { name: '已完成的验收项目', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '删除已完成的验收项目', exact: true }).click()
  await page.getByRole('button', { name: '确认删除' }).click()
  await expect(page.getByText('没有匹配的项目')).toBeVisible()
  await page.reload()
  await expect(page.getByText('没有匹配的项目')).toBeVisible()
})

test('分页与排序可以操作，空结果可恢复', async ({ page }) => {
  await page.goto('/workspace/projects')
  await expect(page.getByText('第 1 / 2 页', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: '下一页' }).click()
  await expect(page.getByText('第 2 / 2 页', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: '最近更新' }).click()
  await expect(page.getByRole('button', { name: '名称排序' })).toBeVisible()
  await page.getByLabel('搜索项目').fill('不存在的字符串')
  await expect(page.getByText('没有匹配的项目')).toBeVisible()
  await page.getByRole('button', { name: '清除筛选' }).first().click()
  await expect(page.getByText('共 6 个项目')).toBeVisible()
})

test('主题、品牌色和空间名跨页面与刷新保持', async ({ page }) => {
  await page.goto('/workspace/settings')
  await page.getByRole('button', { name: '深色 · 夜间专注' }).click()
  await page.getByRole('button', { name: '森林绿', exact: true }).click()
  await page.getByLabel('工作空间名称').fill('我的创作空间')
  await page.getByRole('button', { name: '保存名称' }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'forest')
  await expect(page.getByLabel('工作空间名称')).toHaveValue('我的创作空间')
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'forest')
})

test('组件交互、键盘弹窗和错误重试示例', async ({ page }) => {
  await page.goto('/workspace/components')
  await page.getByRole('button', { name: '打开示例弹窗' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('switch', { name: '紧凑视图' }).click()
  await expect(page.getByRole('switch')).not.toBeChecked()
  await page.getByRole('tab', { name: '交互状态' }).click()
  await page.getByRole('button', { name: '读取失败' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await page.getByRole('button', { name: '重新读取' }).click()
  await expect(page.getByText('你的灵感，还在路上')).toBeVisible()
})

test('损坏的存储不会被覆盖，保存失败不会伪报成功', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('agent-path-00d9f5ad:projects:v1', 'broken-data'))
  await page.goto('/workspace/projects')
  await expect(page.getByRole('alert')).toContainText('原始数据已保留')
  expect(await page.evaluate(() => localStorage.getItem('agent-path-00d9f5ad:projects:v1'))).toBe(
    'broken-data',
  )
  await page.evaluate(() => localStorage.removeItem('agent-path-00d9f5ad:projects:v1'))
  await page.goto('/workspace/projects/new')
  await page.getByLabel('项目名称').fill('保存失败测试')
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: '保存项目' }).click()
  await expect(page.getByText(/保存失败：浏览器存储不可用/)).toBeVisible()
  await expect(page).toHaveURL(/projects\/new$/)
})

for (const width of [320, 375, 414, 768, 1440]) {
  test(`${width}px 页面、深链接布局无横向溢出或运行异常`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    const paths = [
      '/',
      '/showcase',
      '/guide',
      '/workspace',
      '/workspace/projects',
      '/workspace/projects/new',
      '/workspace/projects/sample-workspace',
      '/workspace/components',
      '/workspace/settings',
      '/not-found',
    ]
    await page.setViewportSize({ width, height: 950 })
    for (const path of paths) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
      expect(overflow, `${path} at ${width}px`).toBe(false)
    }
    expect(errors).toEqual([])
  })
}

test('移动导航可以打开并在跳转后关闭', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/workspace')
  await page.getByRole('button', { name: '打开导航' }).click()
  await page.getByRole('dialog').getByRole('link', { name: '项目管理', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: '项目管理' })).toBeVisible()
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('关键页面的明暗主题自动可访问性检查', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/')
    await page.evaluate(
      (theme) =>
        localStorage.setItem(
          'agent-path-00d9f5ad:preferences:v1',
          JSON.stringify({ theme, accent: 'clay', name: '我的工作空间' }),
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
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(
        result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        `${path} ${theme}`,
      ).toEqual([])
    }
  }
})

test('减弱动态效果保留首屏几何图案', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const blocks = page.locator('.art-block')
  await expect(blocks).toHaveCount(4)
  const styles = await blocks.evaluateAll((nodes) =>
    nodes.map((n) => ({
      opacity: getComputedStyle(n).opacity,
      animation: getComputedStyle(n).animationName,
    })),
  )
  expect(styles.every((s) => s.opacity === '1' && s.animation === 'none')).toBe(true)
})
