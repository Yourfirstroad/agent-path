// Real tutorial services + browser, in disposable work copies, with no learner data.
import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { spawn, execFile } from 'node:child_process'
import { readFile, mkdir, cp, mkdtemp, writeFile } from 'node:fs/promises'
import path from 'node:path'
import net from 'node:net'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const python = path.join(root, 'work/tutorial312/Scripts/python.exe')
const guides = JSON.parse(await readFile(path.join(root, 'backend/guided_lessons.json'), 'utf8'))
await mkdir(path.join(root, 'work/tutorial-browser'), { recursive: true })
const base = await mkdtemp(path.join(root, 'work/tutorial-browser/run-'))
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.setDefaultTimeout(12000)
const records = []
async function free(port) {
  await new Promise((resolve, reject) => {
    const s = net.connect(port, '127.0.0.1')
    s.once('connect', () => {
      s.destroy()
      reject(new Error(`Port ${port} already has a service`))
    })
    s.once('error', (e) => (e.code === 'ECONNREFUSED' ? resolve() : reject(e)))
  })
}
async function waitFor(url, proc) {
  for (let n = 0; n < 100; n++) {
    if (proc.exitCode !== null) throw new Error('Service exited')
    try {
      if ((await fetch(url)).ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`Service not ready: ${url}`)
}
async function start(command, args, cwd, url, port) {
  await free(port)
  const p = spawn(command, args, {
    cwd,
    windowsHide: true,
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      LANGSMITH_TRACING: 'false',
      LANGGRAPH_STRICT_MSGPACK: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let logs = ''
  p.stdout.on('data', (b) => (logs += b))
  p.stderr.on('data', (b) => (logs += b))
  p.on('error', (e) => (logs += e.message))
  try {
    await waitFor(url, p)
  } catch (e) {
    p.kill()
    throw new Error(`${e}\n${logs}`)
  }
  return p
}
async function stop(p) {
  if (!p || p.exitCode !== null || p.signalCode !== null) return
  if (process.platform === 'win32') {
    await new Promise((r) =>
      execFile('taskkill', ['/pid', String(p.pid), '/T', '/F'], { windowsHide: true }, r),
    )
    return
  }
  await new Promise((r) => {
    p.once('exit', r)
    p.kill()
  })
}
try {
  for (const id of process.argv[2]
    ? [process.argv[2]]
    : ['l14', 'l15', 'l16', 'l19', 'l20', 'l30', 'l38']) {
    await page.goto('about:blank')
    const dir = path.join(base, id)
    await mkdir(dir, { recursive: true })
    for (const name of guides[id].files) {
      const dest = path.join(dir, name)
      await mkdir(path.dirname(dest), { recursive: true })
      await cp(path.join(root, 'examples/guided_lessons', id, name), dest)
    }
    // Files in work can resolve the exact same React/Vite versions from the root;
    // separate npm ci + builds validate standalone dependency installation.
    let api, ui
    try {
      const react = ['l16', 'l20', 'l30', 'l38'].includes(id)
      if (id === 'l14') {
        api = await start(
          python,
          ['-m', 'http.server', '8014', '--bind', '127.0.0.1'],
          dir,
          'http://127.0.0.1:8014',
          8014,
        )
        await page.goto('http://127.0.0.1:8014')
        assert.match(await page.locator('#output').innerText(), /"JS"/)
      } else {
        const port = id === 'l15' ? 8015 : id === 'l19' ? 8019 : 8020
        if (id !== 'l16')
          api = await start(
            python,
            ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', String(port)],
            dir,
            `http://127.0.0.1:${port}/openapi.json`,
            port,
          )
        if (react)
          ui = await start(
            process.execPath,
            [
              path.join(root, 'node_modules/vite/bin/vite.js'),
              '--host',
              '127.0.0.1',
              '--port',
              '5176',
              '--strictPort',
            ],
            dir,
            'http://127.0.0.1:5176',
            5176,
          )
        await page.goto(`http://127.0.0.1:${react ? 5176 : port}`)
      }
      if (id === 'l15') {
        await page.getByRole('button', { name: '读取任务' }).click()
        await page.getByText('读取成功', { exact: true }).waitFor()
        assert.match(await page.locator('#output').innerText(), /学习 fetch/)
        await stop(api)
        api = null
        await page.getByRole('button', { name: '读取任务' }).click()
        await page.getByText(/读取失败/).waitFor()
      }
      if (id === 'l16') {
        await page.getByRole('button', { name: '完成', exact: true }).first().click()
        await page.getByText('已完成 1 / 2', { exact: true }).waitFor()
        await page.getByRole('button', { name: '清空练习列表' }).click()
        await page.getByText('还没有任务', { exact: true }).waitFor()
      }
      if (id === 'l19') {
        await page.getByRole('button', { name: '开始', exact: true }).click()
        await page.getByText('已完成', { exact: true }).waitFor()
        await page.getByRole('button', { name: '开始', exact: true }).click()
        await page.getByText('生成中（本地模拟）', { exact: true }).waitFor()
        await page.getByRole('button', { name: '停止', exact: true }).click()
        await page.getByText('已取消，保留已接收内容', { exact: true }).waitFor()
        await page.getByLabel('模拟中断').check()
        await page.getByRole('button', { name: '开始', exact: true }).click()
        await page.getByText('连接中断，内容未完成', { exact: true }).waitFor()
      }
      if (id === 'l20') {
        await page.getByRole('button', { name: '提取待办' }).click()
        await page.getByLabel('确认后的标题').fill('浏览器实际编辑')
        await page.getByRole('button', { name: '确认保存' }).click()
        await page.getByText('保存成功', { exact: true }).waitFor()
        await page.reload()
        await page.getByRole('button', { name: '读取已保存任务' }).click()
        await page.getByText('浏览器实际编辑', { exact: true }).waitFor()
        await page.getByLabel('模拟模型失败').check()
        await page.getByRole('button', { name: '提取待办' }).click()
        await page.getByText('教学模拟：模型服务不可用', { exact: true }).waitFor()
      }
      if (id === 'l30') {
        await page.getByRole('button', { name: '查询', exact: true }).click()
        await page.locator('summary').filter({ hasText: 'http · HTTP' }).click()
        await page.getByText('HTTP 请求包含方法和路径，响应包含状态码。', { exact: true }).waitFor()
        await page.getByLabel('关键词').fill('火星天气')
        await page.getByRole('button', { name: '查询', exact: true }).click()
        await page.getByText('资料不足，无法回答', { exact: true }).waitFor()
      }
      if (id === 'l38') {
        await page.getByRole('button', { name: '开始研究' }).click()
        await page.getByRole('heading', { name: '等待你确认' }).waitFor()
        const task = await page.getByLabel('任务编号（保存它可跨重启恢复）').inputValue()
        await stop(api)
        api = await start(
          python,
          ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '8020'],
          dir,
          'http://127.0.0.1:8020/openapi.json',
          8020,
        )
        await page.reload()
        await page.getByLabel('任务编号（保存它可跨重启恢复）').fill(task)
        await page.getByRole('button', { name: '读取任务' }).click()
        await page.getByRole('heading', { name: '等待你确认' }).waitFor()
        await page.getByRole('button', { name: '批准并保存' }).click()
        await page.getByRole('heading', { name: '已保存', exact: true }).waitFor()
        await page.getByText('实际教学单位：1；写入次数：1', { exact: true }).waitFor()
        for (const action of ['拒绝', '取消任务']) {
          await page.getByRole('button', { name: '开始研究' }).click()
          await page.getByRole('button', { name: action, exact: true }).click()
          await page
            .getByRole('heading', { name: action === '拒绝' ? '已拒绝' : '已取消', exact: true })
            .waitFor()
        }
        await page.getByLabel('教学预算单位').fill('0')
        await page.getByRole('button', { name: '开始研究' }).click()
        await page.getByRole('heading', { name: '预算不足', exact: true }).waitFor()
      }
      records.push({ lesson: id, status: 'passed' })
      console.log(`${id}: real browser flow passed`)
    } catch (error) {
      await page.screenshot({ path: path.join(base, `${id}-failure.png`), fullPage: true })
      await writeFile(path.join(base, `${id}-failure.txt`), await page.locator('body').innerText())
      throw error
    } finally {
      await stop(ui)
      await stop(api)
    }
  }
  await writeFile(path.join(base, 'results.json'), JSON.stringify(records, null, 2))
  console.log(`Evidence: ${base}`)
} finally {
  await browser.close()
}
