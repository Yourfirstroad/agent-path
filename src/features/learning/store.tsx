import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { Bootstrap, LessonState, State } from './types'
import { browserEdition } from './edition'
import { browserRequest, learningStorageKey } from './browser-storage'
async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  if (browserEdition) return browserRequest<T>(path, method, body)
  const r = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })
  if (!r.ok) {
    let message = `请求失败（${r.status}），请重试。`
    try {
      const error = await r.json()
      if (typeof error.detail === 'string') message = error.detail
      else if (Array.isArray(error.detail)) message = '数据格式不正确，请检查输入或备份文件。'
    } catch {
      /* HTTP fallback */
    }
    throw new Error(message)
  }
  return r.json()
}

export async function downloadLearningBackup(snapshot = false) {
  const state = await request<State>(snapshot ? '/snapshot' : '/export')
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = snapshot ? 'before-import-backup.json' : 'agent-path-backup.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
type Store = {
  data: Bootstrap | null
  error: string
  busy: boolean
  reload: () => void
  saveLesson: (id: string, patch: Partial<LessonState>) => Promise<boolean>
  saveProject: (id: string, checks: boolean[]) => Promise<void>
  bookmark: (id: string, saved: boolean) => Promise<void>
  settings: (minutes: 30 | 60 | 90) => Promise<void>
  restore: (state: unknown) => Promise<boolean>
}
const Context = createContext<Store | null>(null)
export const emptyLesson: LessonState = {
  checks: [false, false, false],
  note: '',
  answer: null,
  completed_at: null,
}
export function LearningProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Bootstrap | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  const reload = useCallback(() => {
    setError('')
    request<Bootstrap>('/bootstrap')
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])
  useEffect(reload, [reload])
  useEffect(() => {
    if (!browserEdition) return
    const sync = (event: StorageEvent) => {
      if (event.key === learningStorageKey || event.key === null) reload()
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [reload])
  async function mutate<T>(
    path: string,
    method: string,
    body: unknown,
    apply: (state: State, value: T) => State,
    success?: string,
  ) {
    setBusy(true)
    try {
      const value = await request<T>(path, method, body)
      setData((old) => (old ? { ...old, state: apply(old.state, value) } : old))
      if (success) toast.success(success)
      return true
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '保存失败，请重试')
      return false
    } finally {
      setBusy(false)
    }
  }
  const store: Store = {
    data,
    error,
    busy,
    reload,
    saveLesson: (id, patch) =>
      mutate<LessonState>(`/lessons/${id}`, 'PATCH', patch, (s, v) => ({
        ...s,
        lessons: { ...s.lessons, [id]: v },
      })),
    saveProject: async (id, checks) => {
      await mutate(`/projects/${id}`, 'PUT', { checks }, (s) => ({
        ...s,
        projects: { ...s.projects, [id]: { checks } },
      }))
    },
    bookmark: async (id, saved) => {
      await mutate(
        `/bookmarks/${id}`,
        'PUT',
        { saved },
        (s) => ({
          ...s,
          bookmarks: saved
            ? [...new Set([...s.bookmarks, id])]
            : s.bookmarks.filter((x) => x !== id),
        }),
        saved ? '已收藏资料' : '已取消收藏',
      )
    },
    settings: async (daily_minutes) => {
      await mutate(
        '/settings',
        'PUT',
        { daily_minutes },
        (s) => ({ ...s, settings: { daily_minutes } }),
        '学习节奏已保存',
      )
    },
    restore: (state) =>
      mutate<State>('/import', 'POST', state, (_, v) => v, '备份已恢复，原记录已留存快照'),
  }
  return <Context.Provider value={store}>{children}</Context.Provider>
}
export function useLearning() {
  const s = useContext(Context)
  if (!s) throw new Error('LearningProvider missing')
  return s
}
