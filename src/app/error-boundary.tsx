import { Component, type ReactNode } from 'react'
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <main className="fatal-error">
        <h1>页面暂时无法打开</h1>
        <p>你的本地记录不会被清除。请刷新后重试。</p>
        <button onClick={() => window.location.reload()}>刷新页面</button>
      </main>
    ) : (
      this.props.children
    )
  }
}
