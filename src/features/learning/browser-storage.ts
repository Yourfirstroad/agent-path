import { z } from 'zod'
import type { Bootstrap, LessonState, State } from './types'

export const learningStorageKey = 'agent-path:learning:v1'
const lessonSchema = z.strictObject({
  checks: z.array(z.boolean()).length(3),
  note: z.string().max(30000),
  answer: z.number().int().min(0).max(2).nullable(),
  completed_at: z.string().nullable(),
})
const stateSchema = z.strictObject({
  version: z.literal(1),
  lessons: z.record(z.string(), lessonSchema),
  projects: z.record(z.string(), z.strictObject({ checks: z.array(z.boolean()).length(4) })),
  bookmarks: z.array(z.string()).max(200),
  settings: z.strictObject({
    daily_minutes: z.union([z.literal(30), z.literal(60), z.literal(90)]),
  }),
})
type Curriculum = Bootstrap['curriculum']
type Envelope = { state: State; previous: State | null }
let curriculumPromise: Promise<Curriculum> | undefined

export function emptyState(): State {
  return { version: 1, lessons: {}, projects: {}, bookmarks: [], settings: { daily_minutes: 60 } }
}

export function loadCurriculum() {
  if (!curriculumPromise) {
    curriculumPromise = fetch(`${import.meta.env.BASE_URL}curriculum.json?v=2026.10.28-frameworks`)
      .then(async (response) => {
        if (!response.ok) throw new Error('课程暂时无法加载，请检查网络后重试。')
        return (await response.json()) as Curriculum
      })
      .catch((error) => {
        curriculumPromise = undefined
        throw error
      })
  }
  return curriculumPromise
}

function validate(value: unknown, curriculum: Curriculum): State {
  const result = stateSchema.safeParse(value)
  if (!result.success)
    throw new Error('记录格式不正确，请检查课程验收、笔记及设置。原记录未被替换。')
  const state = result.data
  const lessons = new Map(curriculum.lessons.map((lesson) => [lesson.id, lesson]))
  const projects = new Set(curriculum.projects.map((project) => project.id))
  const resources = new Set(curriculum.resources.map((resource) => resource.id))
  if (
    Object.keys(state.lessons).some((id) => !lessons.has(id)) ||
    Object.keys(state.projects).some((id) => !projects.has(id)) ||
    state.bookmarks.some((id) => !resources.has(id)) ||
    new Set(state.bookmarks).size !== state.bookmarks.length
  )
    throw new Error('备份含未知或重复的课程、项目或资料。原记录未被替换。')
  for (const [id, progress] of Object.entries(state.lessons)) {
    const complete =
      progress.checks.every(Boolean) && progress.answer === lessons.get(id)!.quiz.answer
    progress.completed_at = complete ? progress.completed_at || new Date().toISOString() : null
  }
  return state
}

function readEnvelope(curriculum: Curriculum): Envelope {
  let raw: string | null
  try {
    raw = localStorage.getItem(learningStorageKey)
  } catch {
    // Reading courses remains possible; writing always reports storage failures.
    return { state: emptyState(), previous: null }
  }
  if (!raw) return { state: emptyState(), previous: null }
  try {
    const envelope = JSON.parse(raw)
    return {
      state: validate(envelope.state, curriculum),
      previous: envelope.previous === null ? null : validate(envelope.previous, curriculum),
    }
  } catch {
    throw new Error('本浏览器的学习记录无法读取，未清空或覆盖。请先保留浏览器数据并联系维护者。')
  }
}

function writeEnvelope(envelope: Envelope) {
  try {
    // One atomic storage write keeps state and the before-import snapshot together.
    localStorage.setItem(learningStorageKey, JSON.stringify(envelope))
  } catch {
    throw new Error(
      '浏览器无法保存记录，可能已禁用存储或空间不足。请允许本站存储后重试；本次未保存。',
    )
  }
}

export function browserStorageAvailable() {
  try {
    const key = 'agent-path:storage-probe'
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export async function browserRequest<T>(path: string, method: string, body?: unknown): Promise<T> {
  const curriculum = await loadCurriculum()
  const envelope = readEnvelope(curriculum)
  if (method === 'GET' && path === '/bootstrap') {
    return { curriculum, state: envelope.state } as T
  }
  if (method === 'GET' && (path === '/export' || path === '/snapshot')) {
    const state = path === '/snapshot' ? envelope.previous : envelope.state
    if (!state) throw new Error('还没有恢复前快照。首次恢复备份后会自动生成。')
    return state as T
  }
  let result: unknown
  const parts = path.split('/')
  const id = parts[2]
  if (path === '/import' && method === 'POST') {
    // Validate before any write. Keep the old state as the recoverable snapshot.
    const state = validate(body, curriculum)
    writeEnvelope({ state, previous: envelope.state })
    return state as T
  } else if (parts[1] === 'lessons' && method === 'PATCH') {
    if (!curriculum.lessons.some((lesson) => lesson.id === id)) throw new Error('课程不存在')
    const current: LessonState = envelope.state.lessons[id] || {
      checks: [false, false, false],
      note: '',
      answer: null,
      completed_at: null,
    }
    envelope.state.lessons[id] = { ...current, ...(body as Partial<LessonState>) }
    result = envelope.state.lessons[id]
  } else if (parts[1] === 'projects' && method === 'PUT') {
    envelope.state.projects[id] = body as { checks: boolean[] }
    result = body
  } else if (parts[1] === 'bookmarks' && method === 'PUT') {
    const { saved } = body as { saved: boolean }
    envelope.state.bookmarks = envelope.state.bookmarks.filter((value) => value !== id)
    if (saved) envelope.state.bookmarks.push(id)
    result = body
  } else if (path === '/settings' && method === 'PUT') {
    envelope.state.settings = body as State['settings']
    result = body
  } else {
    throw new Error('不支持的学习记录操作')
  }
  envelope.state = validate(envelope.state, curriculum)
  if (parts[1] === 'lessons') result = envelope.state.lessons[id]
  writeEnvelope(envelope)
  return result as T
}
