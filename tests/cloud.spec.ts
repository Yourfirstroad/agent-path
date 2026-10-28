import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { actors, createCloudFixture } from './cloud-fixture'

const noteLabel = '记下理解、报错和下次要做的事'
async function login(page: Page, actor = actors.alice) {
  await page.goto('./#/settings')
  await page.getByLabel('学习账号邮箱').fill(actor.email)
  await page.getByLabel('学习账号密码').fill('fixture-password-only')
  await page.getByRole('button', { name: '登录并同步进度', exact: true }).click()
  await expect(page.getByText(`当前账号：${actor.email}`, { exact: true })).toBeVisible()
  await expect(page.getByText('云端已连接', { exact: true })).toBeVisible()
}
test('两台设备共享进度，笔记不上传；退出后保留原访客数据', async ({ page, context, browser }) => {
  const service = await createCloudFixture(),
    second = await browser.newContext()
  try {
    await service.attach(context)
    await service.attach(second)
    await page.goto('./#/learn/l01')
    await page.getByRole('checkbox').first().check()
    await page.getByLabel(noteLabel).fill('访客私人笔记')
    await page.getByRole('button', { name: '保存笔记', exact: true }).click()
    await login(page)
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: '导入此浏览器原有进度', exact: true }).click()
    await expect(page.getByText('这台设备原有进度已导入云端')).toBeVisible()
    const phone = await second.newPage()
    await login(phone)
    await phone.goto('./#/learn/l01')
    await expect(phone.getByRole('checkbox').first()).toBeChecked()
    await expect(phone.getByLabel(noteLabel)).toHaveValue('')
    for (let i = 1; i < 3; i++) {
      await phone.getByRole('checkbox').nth(i).click()
      await expect(phone.getByRole('checkbox').nth(i)).toBeChecked()
      await expect(phone.getByRole('checkbox').nth(i)).toBeEnabled()
    }
    await phone.getByRole('radio', { name: '保存文件并重新运行', exact: true }).check()
    await phone.getByRole('button', { name: '检查答案' }).click()
    await expect(phone.getByText('本课已完成。', { exact: false })).toBeVisible()
    await phone.getByLabel(noteLabel).fill('账号设备私人笔记')
    await phone.getByRole('button', { name: '保存笔记', exact: true }).click()
    await expect(phone.getByText('笔记已保存到当前浏览器')).toBeVisible()
    const remote = await service.rpc(actors.alice.id, 'ap_get_progress')
    expect(remote.progress.lessons.l01.completed_at).toBeTruthy()
    expect(JSON.stringify(remote)).not.toContain('note')
    await page.goto('./#/learn/l01')
    await expect(page.getByText('本课已完成。', { exact: false })).toBeVisible()
    await expect(page.getByLabel(noteLabel)).toHaveValue('')
    await page.goto('./#/settings')
    await page.getByRole('button', { name: '退出此设备账号', exact: true }).click()
    await expect(page.getByRole('button', { name: '登录并同步进度', exact: true })).toBeVisible()
    await page.goto('./#/learn/l01')
    await expect(page.getByLabel(noteLabel)).toHaveValue('访客私人笔记')
    await expect(page.getByRole('checkbox').first()).toBeChecked()
    await expect(page.getByRole('checkbox').nth(1)).not.toBeChecked()
  } finally {
    await second.close()
    await service.close()
  }
})

test('离线时不假报云端成功，旧设备冲突不会覆盖新进度', async ({ page, context }) => {
  const service = await createCloudFixture()
  try {
    await service.attach(context)
    await login(page)
    await page.goto('./#/learn/l01')
    await expect(page.getByRole('checkbox').first()).not.toBeChecked()
    service.setOffline(true)
    await page.getByRole('checkbox').first().click()
    await expect(page.getByText(/暂时无法连接云端/).last()).toBeVisible()
    await expect(page.getByRole('checkbox').first()).not.toBeChecked()
    await page.getByLabel(noteLabel).fill('离线也保留笔记')
    await page.getByRole('button', { name: '保存笔记', exact: true }).click()
    await expect(page.getByText('笔记已保存到当前浏览器')).toBeVisible()
    service.setOffline(false)
    await service.rpc(actors.alice.id, 'ap_save_progress', {
      p_expected_revision: 0,
      p_kind: 'lessons',
      p_id: 'l01',
      p_patch: { checks: [false, true, false] },
    })
    await page.getByRole('checkbox').first().click()
    await expect(page.getByText(/其他设备已更新进度/).last()).toBeVisible()
    await expect(page.getByRole('checkbox').nth(1)).toBeChecked()
    await expect(page.getByRole('checkbox').first()).not.toBeChecked()
    await page.getByRole('checkbox').first().click()
    await expect(page.getByRole('checkbox').first()).toBeChecked()
    await expect(page.getByLabel(noteLabel)).toHaveValue('离线也保留笔记')
  } finally {
    await service.close()
  }
})

test('提醒连接只读摘要，可轮换和撤销，其他账号进度独立', async ({ page, context, browser }) => {
  const service = await createCloudFixture(),
    other = await browser.newContext()
  try {
    await service.attach(context)
    await service.attach(other)
    await login(page)
    await page.getByRole('button', { name: '90分钟 集中学习' }).click()
    async function connection() {
      page.once('dialog', (dialog) => dialog.accept())
      const pending = page.waitForEvent('download')
      await page.getByRole('button', { name: '生成提醒连接文件', exact: true }).click()
      const stream = await (await pending).createReadStream()
      const parts: Buffer[] = []
      for await (const part of stream!) parts.push(Buffer.from(part))
      return JSON.parse(Buffer.concat(parts).toString('utf8'))
    }
    const first = await connection()
    expect(Object.keys(first).sort()).toEqual([
      'project_url',
      'publishable_key',
      'reminder_token',
      'version',
    ])
    const summary = await service.rpc(null, 'ap_read_reminder_progress', {
      p_token: first.reminder_token,
    })
    expect(summary.daily_minutes).toBe(90)
    expect(JSON.stringify(summary)).not.toContain('note')
    const rotated = await connection()
    await expect(
      service.rpc(null, 'ap_read_reminder_progress', { p_token: first.reminder_token }),
    ).rejects.toThrow()
    await page.getByRole('button', { name: '撤销提醒读取权限', exact: true }).click()
    await expect(page.getByText('已撤销提醒读取权限')).toBeVisible()
    await expect(
      service.rpc(null, 'ap_read_reminder_progress', { p_token: rotated.reminder_token }),
    ).rejects.toThrow()
    const visitor = await other.newPage()
    await login(visitor, actors.bob)
    await expect(visitor.getByRole('button', { name: '60分钟 推荐节奏' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  } finally {
    await other.close()
    await service.close()
  }
})

test('登录表单及同步面板适配三套配色和窄屏', async ({ page, context }) => {
  const service = await createCloudFixture()
  try {
    await service.attach(context)
    await page.goto('./#/settings')
    for (const theme of ['forest', 'slate', 'paper']) {
      await page.getByLabel('配色', { exact: true }).selectOption(theme)
      expect(
        (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
          .violations,
      ).toEqual([])
    }
    await login(page)
    for (const width of [320, 375, 414, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      await expect(
        page.getByRole('button', { name: '生成提醒连接文件', exact: true }),
      ).toBeVisible()
    }
  } finally {
    await service.close()
  }
})
