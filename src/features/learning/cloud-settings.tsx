import { useState, useSyncExternalStore } from 'react'
import { Cloud, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { browserEdition } from './edition'
import {
  connectDailyReminder,
  getCloudClient,
  getCloudStatus,
  revokeDailyReminder,
  subscribeCloud,
} from './cloud-client'
import { uploadGuestProgress } from './browser-storage'

export function CloudSettings() {
  const status = useSyncExternalStore(subscribeCloud, getCloudStatus)
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [busy, setBusy] = useState(false)
  if (!browserEdition) return null
  async function action(run: () => Promise<void>) {
    setBusy(true)
    try {
      await run()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败，请重试')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="panel cloud-settings" aria-labelledby="cloud-heading">
      <div className="section-heading">
        <h2 id="cloud-heading">
          <Cloud size={20} /> 跨设备学习进度
        </h2>
        <span className="tag">
          {status.owner ? (status.phase === 'online' ? '云端已连接' : '等待同步') : '未登录'}
        </span>
      </div>
      <p className="muted-text">
        手机和电脑登录同一个学习账号，即可共享课程验收、自测、项目进度和每日时长。笔记与收藏保存在各自浏览器。
      </p>
      {!status.configured ? (
        <p className="setting-note">
          云端服务正在配置。你仍可正常学习和保存当前浏览器记录；配置完成后可在这里登录同步。
        </p>
      ) : status.owner ? (
        <>
          <p className="cloud-account">当前账号：{status.email || '已登录学习者'}</p>
          <p role="status" className={status.phase === 'offline' ? 'error-text' : 'caption'}>
            {status.message ||
              (status.phase === 'syncing'
                ? '正在保存到云端…'
                : status.lastSync
                  ? `最近一次进度更新：${new Date(status.lastSync).toLocaleString('zh-CN')}`
                  : '云端暂无已保存的进度；完成一次验收或调整学习时长即可建立记录。')}
          </p>
          <div className="backup-actions">
            <button
              className="button"
              disabled={busy}
              onClick={() => window.dispatchEvent(new Event('agent-path:cloud-refresh'))}
            >
              重新同步进度
            </button>
            <button
              className="button"
              disabled={busy}
              onClick={() =>
                void action(async () => {
                  if (
                    !window.confirm(
                      '将此浏览器未登录时的课程、项目和时长替换到当前学习账号？原云端进度将保留一份快照；不会上传笔记或收藏。',
                    )
                  )
                    return
                  await uploadGuestProgress()
                  toast.success('这台设备原有进度已导入云端')
                })
              }
            >
              导入此浏览器原有进度
            </button>
            <button
              className="button"
              disabled={busy}
              onClick={() =>
                void action(async () => {
                  const result = await (await getCloudClient())!.auth.signOut({ scope: 'local' })
                  if (result.error) throw new Error('退出失败，请联网后重试')
                  toast.success('已退出这台设备的学习账号')
                })
              }
            >
              退出此设备账号
            </button>
          </div>
          <div className="setting-note">
            <ShieldCheck size={20} />
            <div>
              <b>每天 09:00 的下一步建议</b>
              <p>
                你可以授权自己的助手只读学习进度摘要，用于安排下一课。连接文件不包含笔记或密码；其中的只读凭证请勿公开分享。重新生成会使旧连接失效。
              </p>
            </div>
          </div>
          <div className="backup-actions">
            <button
              className="button"
              disabled={busy}
              onClick={() =>
                void action(async () => {
                  if (
                    !window.confirm(
                      '生成新的只读提醒连接？它只能读取进度摘要，不能更改课程或读取笔记；已有旧连接将失效。请只交给你信任的助手。',
                    )
                  )
                    return
                  await connectDailyReminder()
                  toast.success('只读连接文件已下载，请按助手指引连接每日提醒')
                })
              }
            >
              生成提醒连接文件
            </button>
            <button
              className="button"
              disabled={busy}
              onClick={() =>
                void action(async () => {
                  await revokeDailyReminder()
                  toast.success('已撤销提醒读取权限')
                })
              }
            >
              撤销提醒读取权限
            </button>
          </div>
        </>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void action(async () => {
              const result = await (await getCloudClient())!.auth.signInWithPassword({
                email: email.trim(),
                password,
              })
              if (result.error) throw new Error('登录失败，请检查邮箱、密码及邮箱验证状态。')
              setPassword('')
              toast.success('已登录，正在读取你的云端进度')
            })
          }}
        >
          <div className="cloud-login-fields">
            <label className="field-label">
              学习账号邮箱
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="field-label">
              学习账号密码
              <input
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          </div>
          <div className="backup-actions">
            <button className="button primary" type="submit" disabled={busy}>
              登录并同步进度
            </button>
            <button
              className="button"
              type="button"
              disabled={busy}
              onClick={() =>
                void action(async () => {
                  if (!email.trim() || password.length < 8)
                    throw new Error('请输入邮箱和至少 8 位密码')
                  const result = await (await getCloudClient())!.auth.signUp({
                    email: email.trim(),
                    password,
                    options: { emailRedirectTo: `${location.origin}${import.meta.env.BASE_URL}` },
                  })
                  if (result.error)
                    throw new Error('暂时无法注册，请稍后重试或联系站点维护者检查验证邮件服务。')
                  setPassword('')
                  toast.success(
                    result.data.session ? '学习账号已创建' : '请查收验证邮件，验证后回到这里登录',
                  )
                })
              }
            >
              创建学习账号
            </button>
          </div>
          <p className="caption">
            未登录时仍可使用原有浏览器记录。登录后使用账号独立的记录；原有进度需要点击导入，避免误覆盖。进度修改需联网确认保存成功。
          </p>
        </form>
      )}
    </section>
  )
}
