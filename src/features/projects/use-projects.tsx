import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { PROJECTS_KEY, projectRepository } from './repository'
import type { Project, ProjectInput } from './model'

type Value = {
  projects: Project[]
  loading: boolean
  error: string
  reload: () => Promise<void>
  save: (input: ProjectInput, id?: string) => Promise<Project>
  remove: (id: string) => Promise<void>
}
const Context = createContext<Value | null>(null)
export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setProjects(await projectRepository.list())
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '读取失败')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void reload()
    const sync = (e: StorageEvent) => {
      if (e.key === PROJECTS_KEY || e.key === null) void reload()
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [reload])
  const save = async (input: ProjectInput, id?: string) => {
    const p = await projectRepository.save(input, id)
    await reload()
    return p
  }
  const remove = async (id: string) => {
    await projectRepository.remove(id)
    await reload()
  }
  return (
    <Context.Provider value={{ projects, loading, error, reload, save, remove }}>
      {children}
    </Context.Provider>
  )
}
export function useProjects() {
  const value = useContext(Context)
  if (!value) throw new Error('ProjectsProvider missing')
  return value
}
