export type Lesson = {
  id: string
  number: number
  stage: string
  title: string
  track: string
  minutes: number
  summary: string
  concepts: string[]
  exercise: string[]
  checks: string[]
  code: string
  resources: string[]
  lab?: { download: string; file: string; command: string; prerequisites: string }
  quiz: { question: string; options: string[]; answer: number; explanation: string }
}
export type Resource = {
  id: string
  title: string
  url: string
  kind: string
  language: string
  level: string
  why: string
  caution: string
  reviewed: string
}
export type Stage = {
  id: string
  name: string
  short: string
  weeks: string
  outcome: string
  focus: string
}
export type Project = {
  id: string
  title: string
  subtitle: string
  stage: string
  stack: string
  lesson: string
  checks: string[]
}
export type LessonState = {
  checks: boolean[]
  note: string
  answer: number | null
  completed_at: string | null
}
export type State = {
  version: 1
  lessons: Record<string, LessonState>
  projects: Record<string, { checks: boolean[] }>
  bookmarks: string[]
  settings: { daily_minutes: 30 | 60 | 90 }
}
export type Bootstrap = {
  identity?: string
  curriculum: {
    reviewed: string
    version: string
    stages: Stage[]
    lessons: Lesson[]
    resources: Resource[]
    projects: Project[]
  }
  state: State
}
