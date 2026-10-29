import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
function App() {
  return (
    <main>
      <h1>CI 练习</h1>
      <p>构建成功不代表业务验收完成。</p>
    </main>
  )
}
createRoot(document.getElementById('root')).render(<App />)
