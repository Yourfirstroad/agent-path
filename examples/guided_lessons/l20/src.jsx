import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
async function request(path, body) {
  const response = await fetch(
    path,
    body
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      : undefined,
  )
  const data = await response.json()
  if (!response.ok)
    throw new Error(
      typeof data.detail === 'string' ? data.detail : `输入校验失败（${response.status}）`,
    )
  return data
}
function App() {
  const [text, setText] = useState('任务：学习 Python'),
    [draft, setDraft] = useState(null),
    [items, setItems] = useState([]),
    [status, setStatus] = useState('尚未加载'),
    [busy, setBusy] = useState(false),
    [fail, setFail] = useState(false)
  async function action(fn) {
    setBusy(true)
    setStatus('处理中')
    try {
      await fn()
    } catch (e) {
      setStatus(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function load() {
    const rows = await request('/api/tasks')
    setItems(rows)
    setStatus(rows.length ? '已读取保存的任务' : '还没有保存的任务')
  }
  return (
    <main>
      <h1>结构化任务工作台</h1>
      <p>模式：离线规则演示（不调用 AI）</p>
      <label>
        任务文字 <input value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <label>
        <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} />
        模拟模型失败
      </label>
      <button
        disabled={busy}
        onClick={() =>
          action(async () => {
            setDraft(null)
            const data = await request('/api/extract', { text, fail })
            setDraft(data.draft.title)
            setStatus('提取成功，请编辑并确认')
          })
        }
      >
        提取待办
      </button>
      {draft !== null && (
        <section>
          <label>
            确认后的标题 <input value={draft} onChange={(e) => setDraft(e.target.value)} />
          </label>
          <button
            disabled={busy}
            onClick={() =>
              action(async () => {
                await request('/api/tasks', { title: draft })
                setDraft(null)
                await load()
                setStatus('保存成功')
              })
            }
          >
            确认保存
          </button>
        </section>
      )}
      <button disabled={busy} onClick={() => action(load)}>
        读取已保存任务
      </button>
      <p role="status">{status}</p>
      <ul>
        {items.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
    </main>
  )
}
createRoot(document.getElementById('root')).render(<App />)
