import { z } from 'zod'
import { projectInputSchema, projectSchema, type Project, type ProjectInput } from './model'
import { seedProjects } from './seed'

export const PROJECTS_KEY = 'agent-path-00d9f5ad:projects:v1'
const snapshot = z.object({ version: z.literal(1), projects: z.array(projectSchema) })
export interface ProjectRepository {
  list(): Promise<Project[]>
  save(input: ProjectInput, id?: string): Promise<Project>
  remove(id: string): Promise<void>
}
function read(): Project[] {
  let raw: string | null
  try {
    raw = localStorage.getItem(PROJECTS_KEY)
  } catch {
    throw new Error('无法读取浏览器存储，请检查访问权限后重试。')
  }
  if (raw === null) return structuredClone(seedProjects)
  try {
    return snapshot.parse(JSON.parse(raw)).projects
  } catch {
    throw new Error('本地数据格式无法识别。原始数据已保留，请备份后再修复，不会自动覆盖。')
  }
}
function write(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify({ version: 1, projects }))
  } catch {
    throw new Error('保存失败：浏览器存储不可用或空间不足，请导出现有记录后重试。')
  }
}
// Replace this adapter with HTTP calls when connecting your own backend.
export const projectRepository: ProjectRepository = {
  async list() {
    return read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },
  async save(input, id) {
    const data = projectInputSchema.parse(input)
    const projects = read()
    const existing = id ? projects.find((p) => p.id === id) : undefined
    if (id && !existing) throw new Error('项目已不存在，请返回列表刷新。')
    const now = new Date().toISOString()
    const project: Project = {
      ...data,
      progress: data.status === 'done' ? 100 : data.status === 'planned' ? 0 : data.progress,
      id: existing?.id ?? crypto.randomUUID(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    write(existing ? projects.map((p) => (p.id === id ? project : p)) : [project, ...projects])
    return project
  },
  async remove(id) {
    const projects = read()
    if (!projects.some((p) => p.id === id)) throw new Error('项目已不存在')
    write(projects.filter((p) => p.id !== id))
  },
}
