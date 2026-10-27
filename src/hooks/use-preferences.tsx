import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  theme: z.enum(['light', 'dark']),
  accent: z.enum(['clay', 'forest', 'indigo']),
  name: z.string().trim().min(1).max(30),
})
type Preferences = z.infer<typeof schema>
const defaults: Preferences = { theme: 'light', accent: 'clay', name: '我的工作空间' }
const key = 'agent-path-00d9f5ad:preferences:v1'
const Context = createContext<{
  preferences: Preferences
  update: (p: Partial<Preferences>) => boolean
} | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const result = schema.safeParse(JSON.parse(localStorage.getItem(key) || 'null'))
      return result.success ? result.data : defaults
    } catch {
      return defaults
    }
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark')
    document.documentElement.dataset.accent = preferences.accent
  }, [preferences])
  const update = (patch: Partial<Preferences>) => {
    const result = schema.safeParse({ ...preferences, ...patch })
    if (!result.success) {
      toast.error('请填写 1–30 字的工作空间名称')
      return false
    }
    try {
      localStorage.setItem(key, JSON.stringify(result.data))
      setPreferences(result.data)
      return true
    } catch {
      toast.error('偏好未保存，请检查浏览器存储空间或访问权限')
      return false
    }
  }
  return <Context.Provider value={{ preferences, update }}>{children}</Context.Provider>
}
export function usePreferences() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('PreferencesProvider missing')
  return ctx
}
