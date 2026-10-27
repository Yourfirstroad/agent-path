import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Toaster } from 'sonner'

export const themes = [
  { id: 'forest', name: '森林深色', detail: '绿灰背景 · 柔和绿', mode: 'dark' },
  { id: 'slate', name: '石墨蓝', detail: '深灰背景 · 清晰蓝', mode: 'dark' },
  { id: 'paper', name: '纸白', detail: '浅灰背景 · 沉静蓝', mode: 'light' },
] as const
type Theme = (typeof themes)[number]['id']
const storageKey = 'agent-path:appearance:v1'
const isTheme = (value: unknown): value is Theme => themes.some((theme) => theme.id === value)

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(storageKey)
    return isTheme(value) ? value : 'forest'
  } catch {
    return 'forest'
  }
}
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      'content',
      getComputedStyle(document.documentElement).getPropertyValue('--page').trim(),
    )
}
export function initializeTheme() {
  applyTheme(readTheme())
}

const ThemeContext = createContext<{
  theme: Theme
  chooseTheme: (value: string) => void
  warning: string
} | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(readTheme)
  const [warning, setWarning] = useState('')
  useEffect(() => {
    applyTheme(theme)
  }, [theme])
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return
      setTheme(isTheme(event.newValue) ? event.newValue : 'forest')
      setWarning('')
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  function chooseTheme(value: string) {
    if (!isTheme(value)) return
    setTheme(value)
    try {
      localStorage.setItem(storageKey, value)
      setWarning('')
    } catch {
      setWarning('主题已切换，但浏览器禁止保存偏好，仅本次页面有效；学习记录不受影响。')
    }
  }
  return (
    <ThemeContext.Provider value={{ theme, chooseTheme, warning }}>
      {children}
      <Toaster theme={theme === 'paper' ? 'light' : 'dark'} position="bottom-right" closeButton />
    </ThemeContext.Provider>
  )
}
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('ThemeProvider missing')
  return context
}

export function ThemeSelect() {
  const { theme, chooseTheme, warning } = useTheme()
  return (
    <div className="theme-control">
      <label htmlFor="theme-select">配色</label>
      <select id="theme-select" value={theme} onChange={(event) => chooseTheme(event.target.value)}>
        {themes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      {warning && (
        <span role="alert" className="theme-save-warning">
          {warning}
        </span>
      )}
    </div>
  )
}

export function ThemeSettings() {
  const { theme, chooseTheme, warning } = useTheme()
  return (
    <section className="panel theme-settings" aria-labelledby="appearance-heading">
      <div className="section-heading">
        <div>
          <h2 id="appearance-heading">界面配色</h2>
          <p className="muted-text">点击即切换，背景、文字与按钮同步变化。随时可以换回来。</p>
        </div>
        <span className="tag">当前：{themes.find((item) => item.id === theme)?.name}</span>
      </div>
      <div className="theme-options" role="group" aria-label="选择界面配色">
        {themes.map((item) => (
          <button
            key={item.id}
            type="button"
            className="theme-option"
            aria-pressed={theme === item.id}
            aria-label={`使用${item.name}`}
            onClick={() => chooseTheme(item.id)}
          >
            <span className="theme-swatch" data-theme={item.id} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="theme-option-name">
              {item.name}
              <small>{item.detail}</small>
            </span>
            <span className="theme-choice-mark" aria-hidden="true">
              {theme === item.id ? '✓' : ''}
            </span>
          </button>
        ))}
      </div>
      <p className="caption" role="status">
        {warning || '选择只保存在当前浏览器；不会更改学习进度，也不包含在学习备份中。'}
      </p>
    </section>
  )
}
