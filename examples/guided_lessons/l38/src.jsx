import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
function App() {
  const [topic, setTopic] = useState('LangGraph'),
    [budget, setBudget] = useState(2),
    [id, setId] = useState(''),
    [run, setRun] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  async function request(path, body) {
    setBusy(true)
    setError('')
    try {
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
        throw new Error(typeof data.detail === 'string' ? data.detail : '输入不合法')
      setRun(data)
      setId(data.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  const names = {
    waiting_approval: '等待你确认',
    done: '已保存',
    rejected: '已拒绝',
    cancelled: '已取消',
    budget_exhausted: '预算不足',
    no_evidence: '没有资料',
  }
  return (
    <main>
      <h1>有审批的研究助手</h1>
      <p>本地规则计划 · 真实 LangGraph 持久化 · 不调用模型</p>
      <label>
        主题 <input value={topic} onChange={(e) => setTopic(e.target.value)} />
      </label>
      <label>
        教学预算单位{' '}
        <input
          type="number"
          min="0"
          max="5"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
      </label>
      <button disabled={busy} onClick={() => request('/api/start', { topic, budget })}>
        开始研究
      </button>
      <label>
        任务编号（保存它可跨重启恢复）
        <input value={id} onChange={(e) => setId(e.target.value)} />
      </label>
      <button disabled={busy || !id} onClick={() => request(`/api/run/${encodeURIComponent(id)}`)}>
        读取任务
      </button>
      <p role="status">{busy ? '处理中' : error}</p>
      {run && (
        <section>
          <h2>{names[run.status] || run.status}</h2>
          <p>{run.draft}</p>
          <p>
            实际教学单位：{run.spent}；写入次数：{run.writes}
          </p>
          <ol>
            {run.trace?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <ul>
            {run.sources?.map((s) => (
              <li key={s}>
                <a href={s} target="_blank" rel="noreferrer">
                  核对来源：{s}
                </a>
              </li>
            ))}
          </ul>
          {run.status === 'waiting_approval' &&
            ['approve', 'reject', 'cancel'].map((action, i) => (
              <button
                key={action}
                disabled={busy}
                onClick={() => request('/api/decision', { id: run.id, action })}
              >
                {['批准并保存', '拒绝', '取消任务'][i]}
              </button>
            ))}
        </section>
      )}
    </main>
  )
}
createRoot(document.getElementById('root')).render(<App />)
