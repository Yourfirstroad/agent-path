import type { Session, SupabaseClient } from '@supabase/supabase-js'
import type { LessonState, State } from './types'
import { browserEdition } from './edition'

export type ProgressState = {
  version: 1
  lessons: Record<string, Omit<LessonState, 'note'>>
  projects: State['projects']
  settings: State['settings']
}
export type CloudRecord = { revision: number; progress: ProgressState; updated_at: string | null }
export type CloudStatus = {
  configured: boolean
  email: string | null
  owner: string | null
  phase: 'guest' | 'syncing' | 'online' | 'offline'
  message: string
  lastSync: string | null
}
const url = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
function safePublicKey(key: string) {
  if (key.startsWith('sb_publishable_')) return true
  try {
    return JSON.parse(atob(key.split('.')[1])).role === 'anon'
  } catch {
    return false
  }
}
const configured =
  browserEdition &&
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) &&
  safePublicKey(publishableKey)
let clientPromise: Promise<SupabaseClient> | null = null
let lastOwner: string | null | undefined
let status: CloudStatus = {
  configured,
  email: null,
  owner: null,
  phase: 'guest',
  message: '',
  lastSync: null,
}
const listeners = new Set<() => void>()
export const subscribeCloud = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export const getCloudStatus = () => status
export function updateCloudStatus(patch: Partial<CloudStatus>) {
  status = { ...status, ...patch }
  listeners.forEach((listener) => listener())
}
export async function getCloudClient() {
  if (!configured) return null
  if (!clientPromise)
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) => {
        const client = createClient(url, publishableKey, {
          auth: {
            flowType: 'pkce',
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
          global: {
            fetch: (input, init) =>
              fetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(12000) }),
          },
        })
        client.auth.onAuthStateChange((_event, session) => {
          const owner = session?.user.id || null
          updateCloudStatus({
            email: session?.user.email || null,
            owner,
            ...(owner ? {} : { phase: 'guest', lastSync: null, message: '' }),
          })
          if (owner !== lastOwner) {
            lastOwner = owner
            // Do not call auth methods from inside Supabase's auth callback.
            setTimeout(() => window.dispatchEvent(new Event('agent-path:cloud-auth')), 0)
          }
        })
        return client
      })
      .catch((error) => {
        clientPromise = null
        throw error
      })
  return clientPromise
}
export async function getCloudSession(): Promise<Session | null> {
  const service = await getCloudClient()
  if (!service) return null
  const result = await service.auth.getSession()
  if (result.error) throw new Error('学习账号会话暂时无法读取，请联网后重试登录。')
  return result.data.session
}
export function extractProgress(state: State): ProgressState {
  return {
    version: 1,
    lessons: Object.fromEntries(
      Object.entries(state.lessons).map(([id, lesson]) => [
        id,
        {
          checks: [...lesson.checks],
          answer: lesson.answer,
          completed_at: lesson.completed_at,
        },
      ]),
    ),
    projects: structuredClone(state.projects),
    settings: { ...state.settings },
  }
}
export function mergeProgress(local: State, progress: ProgressState): State {
  const ids = new Set([...Object.keys(local.lessons), ...Object.keys(progress.lessons)])
  return {
    ...local,
    lessons: Object.fromEntries(
      [...ids].map((id) => [
        id,
        {
          ...(progress.lessons[id] || {
            checks: [false, false, false],
            answer: null,
            completed_at: null,
          }),
          note: local.lessons[id]?.note || '',
        },
      ]),
    ),
    projects: progress.projects,
    settings: progress.settings,
  }
}
async function rpc<T>(
  name: string,
  args?: Record<string, unknown>,
  capturedSession?: Session,
): Promise<T> {
  const session = capturedSession || (await getCloudSession())
  if (!session) throw new Error('请先登录学习账号')
  let response: Response, result: unknown
  try {
    // Bind this operation to the captured account even if another tab signs out.
    response = await fetch(`${url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      signal: AbortSignal.timeout(12000),
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args || {}),
    })
    result = await response.json()
  } catch {
    const message = '暂时无法连接云端。当前显示此设备缓存；进度修改需联网，笔记仍可在本机保存。'
    updateCloudStatus({ phase: 'offline', message })
    throw new Error(message)
  }
  if (!response.ok) {
    const conflict = (result as { message?: string }).message?.includes('AP_CONFLICT')
    const message = conflict
      ? '其他设备已更新进度，已请求刷新；请核对后重新操作。'
      : '暂时无法保存或读取云端进度，请联网后重试。本次没有确认同步成功。'
    updateCloudStatus({ phase: 'offline', message })
    if (conflict) window.dispatchEvent(new Event('agent-path:cloud-refresh'))
    throw new Error(message)
  }
  return result as T
}
export async function readCloudProgress(session: Session) {
  const result = await rpc<CloudRecord>('ap_get_progress', {}, session)
  updateCloudStatus({ phase: 'online', message: '', lastSync: result.updated_at })
  return result
}
export async function writeCloudProgress(
  revision: number,
  kind: string,
  id: string,
  patch: unknown,
  session: Session,
) {
  updateCloudStatus({ phase: 'syncing', message: '' })
  const result = await rpc<CloudRecord>(
    'ap_save_progress',
    {
      p_expected_revision: revision,
      p_kind: kind,
      p_id: id,
      p_patch: patch,
    },
    session,
  )
  updateCloudStatus({ phase: 'online', message: '', lastSync: result.updated_at })
  return result
}
export function downloadJsonFile(value: unknown, filename: string) {
  const address = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = address
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(address), 1000)
}
export async function connectDailyReminder() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const token = btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
  await rpc('ap_set_reminder_key', { p_token: token })
  downloadJsonFile(
    { version: 1, project_url: url, publishable_key: publishableKey, reminder_token: token },
    'agent-path-reminder-connection.json',
  )
}
export async function revokeDailyReminder() {
  await rpc('ap_revoke_reminder_key')
}
