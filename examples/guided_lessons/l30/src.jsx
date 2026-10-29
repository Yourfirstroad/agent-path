import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
function App() {
  const [query, setQuery] = useState('HTTP'),
    [result, setResult] = useState(null),
    [status, setStatus] = useState('待查询'),
    [busy, setBusy] = useState(false)
  async function ask() {
    setBusy(true)
    setStatus('查询中')
    setResult(null)
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!response.ok) throw new Error(`请求失败 ${response.status}`)
      setResult(await response.json())
      setStatus('查询完成（本地摘录）')
    } catch (e) {
      setStatus(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <main>
      <h1>带引用的知识助手</h1>
      <label>
        关键词 <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <button disabled={busy} onClick={ask}>
        查询
      </button>
      <p role="status">{status}</p>
      {result && (
        <section>
          <pre>{result.answer}</pre>
          <h2>核对原文</h2>
          {result.sources.map((s) => (
            <details key={s.id}>
              <summary>
                {s.id} · {s.title}
              </summary>
              <p>{s.text}</p>
              <small>自编教学笔记</small>
            </details>
          ))}
        </section>
      )}
    </main>
  )
}
createRoot(document.getElementById('root')).render(<App />)
