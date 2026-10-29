import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
function Summary({ tasks }) {
  return (
    <p>
      已完成 {tasks.filter((t) => t.done).length} / {tasks.length}
    </p>
  )
}
function App() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Python', done: false },
    { id: 2, title: 'React', done: false },
  ])
  function complete(id) {
    setTasks((items) => items.map((t) => (t.id === id ? { ...t, done: true } : t)))
  }
  return (
    <main>
      <h1>我的任务</h1>
      <Summary tasks={tasks} />
      {!tasks.length && <p>还没有任务</p>}
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title}{' '}
            <button disabled={t.done} onClick={() => complete(t.id)}>
              {t.done ? '已完成' : '完成'}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => setTasks([])}>清空练习列表</button>
    </main>
  )
}
createRoot(document.getElementById('root')).render(<App />)
