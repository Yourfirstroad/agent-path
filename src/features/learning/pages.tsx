import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Flag,
  FolderCode,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Map,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { downloadLearningBackup, emptyLesson, useLearning } from './store'
import { browserEdition } from './edition'
import { browserStorageAvailable } from './browser-storage'
import { getCloudStatus, subscribeCloud } from './cloud-client'
import type { Lesson, Resource } from './types'
import { ThemeSelect, ThemeSettings } from './theme'
import { GuidedLesson } from './guided-lesson'

const CloudSettings = lazy(() =>
  import('./cloud-settings').then((module) => ({ default: module.CloudSettings })),
)

const navigation = [
  { to: '/', label: '学习工作台', icon: LayoutDashboard },
  { to: '/roadmap', label: '学习路线', icon: Map },
  { to: '/projects', label: '实战项目', icon: FolderCode },
  { to: '/resources', label: '资源图书馆', icon: BookOpen },
  { to: '/notes', label: '学习笔记', icon: FileText },
]
function BackupDownload({
  children,
  snapshot = false,
}: {
  children: ReactNode
  snapshot?: boolean
}) {
  if (!browserEdition)
    return (
      <a className="button" href="/api/export" download>
        {children}
      </a>
    )
  return (
    <button
      className="button"
      onClick={() => {
        void downloadLearningBackup(snapshot).catch((error) => toast.error(error.message))
      }}
    >
      {children}
    </button>
  )
}
function Tag({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <span className={`tag ${muted ? 'muted' : ''}`}>{children}</span>
}
function Progress({ value, max, label }: { value: number; max: number; label: string }) {
  return <progress aria-label={label} value={value} max={max || 1} />
}
function PageHead({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </header>
  )
}
function SectionHead({
  title,
  to,
  label = '查看全部',
}: {
  title: string
  to?: string
  label?: string
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {to && (
        <Link to={to} className="text-action">
          {label}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}
function Empty({
  title,
  body,
  to,
  label,
}: {
  title: string
  body: string
  to?: string
  label?: string
}) {
  return (
    <div className="empty">
      <BookOpen size={30} />
      <h2>{title}</h2>
      <p>{body}</p>
      {to && (
        <Link className="button primary" to={to}>
          {label}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}

export function Shell() {
  const cloud = useSyncExternalStore(subscribeCloud, getCloudStatus)
  const { data, error, reload } = useLearning()
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState('')
  const [storageAvailable] = useState(() => !browserEdition || browserStorageAvailable())
  const location = useLocation(),
    navigate = useNavigate()
  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
    document.title = 'Agent Path · 从零构建你的 AI Agent'
    if (browserEdition && cloud.owner) reload()
  }, [location.pathname])
  useEffect(() => {
    if (!open) return
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])
  const completed = data
      ? Object.values(data.state.lessons).filter((x) => x.completed_at).length
      : 0,
    total = data?.curriculum.lessons.length || 0
  const active =
    navigation.find((n) => n.to !== '/' && location.pathname.startsWith(n.to))?.label ||
    (location.pathname.startsWith('/learn')
      ? '课程学习'
      : location.pathname === '/settings'
        ? '学习设置'
        : '学习工作台')
  return (
    <div className="app-shell">
      <a
        href="#main"
        className="skip-link"
        onClick={
          browserEdition
            ? (event) => {
                event.preventDefault()
                document.getElementById('main')?.focus()
              }
            : undefined
        }
      >
        跳到主要内容
      </a>
      {open && (
        <button className="nav-scrim" aria-label="关闭导航" onClick={() => setOpen(false)} />
      )}
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="学习导航">
        <Link to="/" className="brand">
          <span className="brand-symbol">
            <Code2 size={23} />
          </span>
          <span>
            Agent Path<small>AI 开发学习工作台</small>
          </span>
        </Link>
        <div className="path-label">
          <span className="status-dot" />
          PYTHON 主线<span className="tiny-tag">2026</span>
        </div>
        <nav aria-label="主导航">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink end={to === '/'} to={to} key={to}>
              <Icon size={19} />
              <span>{label}</span>
              {to === '/projects' && <small>4</small>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-path">
          <span className="side-caption">你的成长路径</span>
          <div className="mini-path">
            <span>Python 基础</span>
            <span>应用开发</span>
            <span>Agent 工程</span>
            <span>独立交付</span>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="side-progress">
            <div>
              <span>路线进度</span>
              <b>{total > 0 ? `${Math.round((completed / total) * 100)}%` : '载入中'}</b>
            </div>
            <Progress value={completed} max={total} label="总学习进度" />
            <small>
              {completed} / {total} 节已完成
            </small>
          </div>
          <NavLink to="/settings" className="settings-link">
            <Settings2 size={18} />
            学习设置
            <ChevronRight size={15} />
          </NavLink>
          <div className="profile">
            <span>我</span>
            <div>
              我的学习空间
              <small>
                {browserEdition
                  ? cloud.owner
                    ? '云端进度 · 笔记本机'
                    : '浏览器保存 · 个人记录'
                  : '本机保存 · 单人使用'}
              </small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            aria-label={open ? '收起导航' : '打开导航'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            我的学习空间
            <ChevronRight size={14} />
            <b>{active}</b>
          </div>
          <form
            className="global-search"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/resources?q=${encodeURIComponent(query)}`)
            }}
          >
            <Search size={17} />
            <input
              aria-label="搜索学习资料"
              placeholder="搜索学习资料…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button aria-label="提交搜索" type="submit">
              <ArrowRight size={16} />
            </button>
          </form>
          <ThemeSelect />
          <span className="top-date">
            {new Date().toLocaleDateString('zh-CN', {
              timeZone: 'Asia/Shanghai',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          {browserEdition && !storageAvailable && (
            <p className="setting-note" role="alert">
              浏览器未允许保存数据。你可以阅读课程；请允许本站存储后刷新，才能保存进度和笔记。
            </p>
          )}
          {error ? (
            <>
              <Empty
                title={browserEdition ? '暂时无法加载学习内容' : '暂时无法连接学习服务'}
                body={browserEdition ? error : `${error} 请确认 Python 服务正在运行。`}
              />
              <button className="button primary" onClick={reload}>
                重新连接
              </button>
            </>
          ) : !data ? (
            <div className="loading" role="status">
              <div />
              <div />
              <div />
              <p>正在载入课程与学习记录…</p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
        <footer className="app-footer">
          <span>Agent Path · 一步步，把想法写成能运行的程序。</span>
          <span>内容核验 {data?.curriculum.reviewed || '2026-10-27'}</span>
        </footer>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { data } = useLearning()
  if (!data) return null
  const { curriculum: c, state: s } = data
  const complete = c.lessons.filter((l) => s.lessons[l.id]?.completed_at),
    current = c.lessons.find((l) => !s.lessons[l.id]?.completed_at) || c.lessons[0],
    stage = c.stages.find((x) => x.id === current.stage)!,
    stageLessons = c.lessons.filter((x) => x.stage === current.stage),
    done = stageLessons.filter((x) => s.lessons[x.id]?.completed_at).length
  const noteCount = Object.values(s.lessons).filter((x) => x.note.trim()).length,
    projectCount = c.projects.filter((p) => s.projects[p.id]?.checks.every(Boolean)).length
  const read = Math.round(s.settings.daily_minutes / 4),
    practice = Math.floor(s.settings.daily_minutes / 2),
    review = s.settings.daily_minutes - read - practice
  return (
    <>
      <PageHead
        title={
          complete.length === c.lessons.length
            ? '整条路线，你已经走完了。'
            : '今天，向 AI 开发者再进一步。'
        }
        description="从一段 Python 开始，逐步做出属于自己的 Agent。"
      >
        <div className="daily-badge">
          <Clock3 size={17} />
          <span>
            每日 09:00<small>Asia / Shanghai</small>
          </span>
        </div>
      </PageHead>
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <section className="today-card">
            <div className="today-top">
              <span>
                <span className="status-dot" />
                {complete.length === c.lessons.length ? '复习推荐' : '今天从这里继续'}
              </span>
              <Tag>
                第 {current.number} / {c.lessons.length} 节
              </Tag>
            </div>
            <div className="today-body">
              <div>
                <p className="course-kicker">
                  {stage.short} <span>/</span> {current.track}
                </p>
                <h2>{current.title}</h2>
                <p className="today-description">{current.summary}</p>
                <div className="course-meta">
                  <span>
                    <Clock3 size={15} />约 {current.minutes} 分钟 / 可分多天
                  </span>
                  <span>
                    <ListChecks size={15} />3 项实践验收
                  </span>
                </div>
                <Link className="button primary" to={`/learn/${current.id}`}>
                  {complete.length ? '继续学习' : '开始第一课'}
                  <ArrowRight size={17} />
                </Link>
              </div>
              <div className="learning-mark" aria-hidden="true">
                <div className="mark-code">
                  py<span>_</span>
                </div>
                <div className="mark-line" />
                <span>build. test. learn.</span>
              </div>
            </div>
            <div className="today-footer">
              <GraduationCap size={17} />
              <span>本阶段目标：{stage.outcome}</span>
            </div>
          </section>
          <div className="stats-strip">
            <div>
              <BookOpen size={19} />
              <span>
                已完成课程
                <strong>
                  {complete.length}
                  <small> / {c.lessons.length}</small>
                </strong>
              </span>
            </div>
            <div>
              <FolderCode size={19} />
              <span>
                完成实战
                <strong>
                  {projectCount}
                  <small> / 4</small>
                </strong>
              </span>
            </div>
            <div>
              <FileText size={19} />
              <span>
                学习笔记
                <strong>
                  {noteCount}
                  <small> 篇</small>
                </strong>
              </span>
            </div>
          </div>
          <section>
            <SectionHead title="当前阶段" to="/roadmap" label="完整路线" />
            <div className="stage-preview">
              <div className="stage-preview-title">
                <span className="stage-number">{stage.id.slice(1).padStart(2, '0')}</span>
                <div>
                  <h3>{stage.name}</h3>
                  <p>
                    {stage.weeks} · {stage.focus}
                  </p>
                </div>
                <span className="muted-text">
                  {done} / {stageLessons.length}
                </span>
              </div>
              <Progress value={done} max={stageLessons.length} label="当前阶段进度" />
              {stageLessons
                .filter((l) => l.number >= current.number)
                .slice(0, 3)
                .map((l) => (
                  <Link key={l.id} to={`/learn/${l.id}`} className="lesson-row">
                    <span
                      className={`lesson-status ${s.lessons[l.id]?.completed_at ? 'done' : l.id === current.id ? 'current' : ''}`}
                    >
                      {s.lessons[l.id]?.completed_at ? (
                        <Check size={14} />
                      ) : (
                        l.number.toString().padStart(2, '0')
                      )}
                    </span>
                    <span>
                      {l.title}
                      <small>
                        {l.track} · 约 {l.minutes} 分钟
                      </small>
                    </span>
                    {l.id === current.id ? <Tag>继续这里</Tag> : <ChevronRight size={16} />}
                  </Link>
                ))}
            </div>
          </section>
          <section className="method-note">
            <ShieldCheck size={22} />
            <div>
              <h3>每一步，都留下一点能验证的成果</h3>
              <p>
                先自己写、运行和改错，再勾选验收。每阶段完成一个能解释的结果，最后留下 4
                个可展示项目。
              </p>
            </div>
          </section>
        </div>
        <aside className="dashboard-rail">
          <section className="panel plan-panel">
            <SectionHead title="今日学习安排" />
            <div className="plan-total">
              <strong>{s.settings.daily_minutes}</strong>
              <span>分钟 / 建议节奏</span>
            </div>
            <ol className="daily-steps">
              {[
                ['阅读与理解', '先看中文导读，带着问题读原文', read],
                ['动手写代码', '完成一小步，观察真实输出', practice],
                ['验证与笔记', '记录今天的问题和下一步', review],
              ].map(([title, description, time]) => (
                <li key={title}>
                  <span>
                    {title}
                    <small>{description}</small>
                  </span>
                  <b>{time} 分钟</b>
                </li>
              ))}
            </ol>
            <Link className="text-action" to="/settings">
              调整我的学习节奏
              <ArrowUpRight size={15} />
            </Link>
          </section>
          <section className="panel next-deliverable">
            <div className="small-icon">
              <FolderCode size={22} />
            </div>
            <h3>你的第一个作品</h3>
            <p>学习任务 CLI</p>
            <span>添加任务、标记完成，关闭程序后记录依然存在。</span>
            <div className="mini-tags">
              <Tag muted>Python</Tag>
              <Tag muted>SQLite</Tag>
            </div>
            <Link to="/projects" className="text-action">
              查看项目验收
              <ArrowRight size={15} />
            </Link>
          </section>
          <section className="source-note">
            <span className="reviewed">
              <span className="status-dot" />
              资料已筛选与核验
            </span>
            <h3>学习基础，也跟上变化</h3>
            <p>官方文档 + 开源课程。每条资料标明用途、前置知识和核验日期。</p>
            <Link to="/resources" className="text-action">
              浏览 {c.resources.length} 份学习资料
              <ArrowUpRight size={15} />
            </Link>
          </section>
        </aside>
      </div>
    </>
  )
}

export function Roadmap() {
  const { data } = useLearning()
  const [filter, setFilter] = useState('全部')
  if (!data) return null
  const { curriculum: c, state: s } = data,
    first = c.lessons.find((l) => !s.lessons[l.id]?.completed_at)
  return (
    <>
      <PageHead
        title="从零到独立交付，一条清晰的路。"
        description="Python 是主线，JavaScript 在需要页面时加入。按完成情况前进，所有课程都可以提前查看。"
      />
      <div className="route-overview">
        <div>
          <strong>{c.stages.length}</strong>
          <span>个学习阶段</span>
        </div>
        <div>
          <strong>{c.lessons.length}</strong>
          <span>节实践课程</span>
        </div>
        <div>
          <strong>{c.projects.length}</strong>
          <span>个实战作品</span>
        </div>
        <p>
          约{' '}
          {Math.ceil(
            c.lessons.reduce((sum, l) => sum + l.minutes, 0) / (s.settings.daily_minutes * 5),
          )}{' '}
          周规划
          <br />
          <small>按每周 5 天推进、2 天复盘估算，不是完成承诺。</small>
        </p>
      </div>
      <div className="filter-bar">
        <div className="segments" aria-label="课程状态筛选">
          {['全部', '待完成', '已完成'].map((x) => (
            <button
              className={filter === x ? 'selected' : ''}
              aria-pressed={filter === x}
              key={x}
              onClick={() => setFilter(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <span>先读懂原理，再用框架提高效率</span>
      </div>
      <div className="roadmap">
        {c.stages.map((stage, i) => {
          const all = c.lessons.filter((l) => l.stage === stage.id),
            done = all.filter((l) => s.lessons[l.id]?.completed_at).length,
            list = all.filter(
              (l) =>
                filter === '全部' ||
                (filter === '已完成'
                  ? !!s.lessons[l.id]?.completed_at
                  : !s.lessons[l.id]?.completed_at),
            )
          if (!list.length) return null
          return (
            <section className="roadmap-stage" key={stage.id}>
              <div className="stage-track">
                <span className={first?.stage === stage.id ? 'active' : ''}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="stage-content">
                <div className="stage-header">
                  <div>
                    <div className="stage-week">{stage.weeks} · 每日 60 分钟参考</div>
                    <h2>{stage.name}</h2>
                    <p>{stage.outcome}</p>
                  </div>
                  <Tag muted>
                    {done} / {all.length} 完成
                  </Tag>
                </div>
                <div className="stage-lessons">
                  {list.map((l) => (
                    <Link className="lesson-row" to={`/learn/${l.id}`} key={l.id}>
                      <span
                        className={`lesson-status ${s.lessons[l.id]?.completed_at ? 'done' : ''}`}
                      >
                        {s.lessons[l.id]?.completed_at ? <Check size={15} /> : l.number}
                      </span>
                      <span>
                        {l.title}
                        <small>{l.summary}</small>
                      </span>
                      <Tag muted>{l.track}</Tag>
                      <ChevronRight size={17} />
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )
        })}
      </div>
      {filter === '已完成' && !Object.values(s.lessons).some((l) => l.completed_at) && (
        <Empty
          title="第一节完成后，成果会出现在这里"
          body="完成实践验收并答对自测题，即可完成课程。"
          to="/learn/l01"
          label="开始第一课"
        />
      )}
    </>
  )
}

export function LessonPage() {
  const { id } = useParams()
  const { data } = useLearning()
  const lesson = data?.curriculum.lessons.find((l) => l.id === id)
  return lesson ? (
    <LessonContent key={`${data?.identity || 'local'}:${id}`} lesson={lesson} />
  ) : (
    <NotFound />
  )
}
function LessonContent({ lesson: l }: { lesson: Lesson }) {
  const { data, busy, saveLesson } = useLearning(),
    progress = data!.state.lessons[l.id] || emptyLesson
  const [note, setNote] = useState(progress.note),
    [answer, setAnswer] = useState<number | null>(progress.answer)
  const dirty = note !== progress.note,
    blocker = useBlocker(dirty)
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('笔记尚未保存。要放弃本次修改并离开吗？')) blocker.proceed()
      else blocker.reset()
    }
  }, [blocker])
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const c = data!.curriculum,
    stage = c.stages.find((s) => s.id === l.stage)!,
    next = c.lessons.find((x) => x.number === l.number + 1),
    prev = c.lessons.find((x) => x.number === l.number - 1)
  return (
    <>
      <Link className="text-action back-link" to="/roadmap">
        <ArrowLeft size={16} />
        返回学习路线
      </Link>
      <PageHead title={l.title} description={l.summary}>
        <Tag>{l.track}</Tag>
      </PageHead>
      <div className="lesson-page">
        <article className="lesson-article">
          <div className="lesson-detail-meta">
            <span>
              第 {l.number} / {c.lessons.length} 节
            </span>
            <span>{stage.short}</span>
            <span>
              <Clock3 size={15} />约 {l.minutes} 分钟，可分多天
            </span>
          </div>
          {l.guide ? (
            <GuidedLesson lesson={l} lessons={c.lessons} />
          ) : (
            <>
              <section className="lesson-section">
                <h2>先理解这几个概念</h2>
                {l.concepts.map((p, i) => (
                  <div className="concept" key={p}>
                    <span>{i + 1}</span>
                    <p>{p}</p>
                  </div>
                ))}
              </section>
              {l.lab && (
                <section className="lesson-section" aria-labelledby="lab-setup-heading">
                  <h2 id="lab-setup-heading">先准备完整实战包</h2>
                  <p>{l.lab.prerequisites}</p>
                  <div className="backup-actions">
                    <a
                      className="button primary"
                      href={`${import.meta.env.BASE_URL}${l.lab.download}`}
                      download
                    >
                      <Download size={16} />
                      下载完整实战包
                    </a>
                    <a
                      className="button"
                      href="https://github.com/Yourfirstroad/agent-path/tree/main/examples/agent_labs#readme"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={16} />
                      查看安装与运行说明
                    </a>
                  </div>
                  <p>完整解压后按 README 安装锁定依赖，在同一文件夹运行：</p>
                  <pre>
                    <code>{l.lab.command}</code>
                  </pre>
                  <p className="caption">
                    Windows 请用 .venv/Scripts/python.exe 替换 python；macOS / Linux 用
                    .venv/bin/python。默认不调用远端模型：Agent
                    示例使用明确标注的教学替身，框架、工具和检查点真实执行。真实模型接入可能收费，需另行配置与验收。
                  </p>
                </section>
              )}
              <section className="lesson-section">
                <div className="section-heading">
                  <h2>{l.lab ? `本课文件：${l.lab.file}` : '代码起点'}</h2>
                  <button
                    className="text-action"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(l.code)
                        toast.success('代码已复制')
                      } catch {
                        toast.error('复制失败，请手动选择代码复制')
                      }
                    }}
                  >
                    <Copy size={15} />
                    复制代码
                  </button>
                </div>
                {l.lab ? (
                  <details>
                    <summary className="text-action">
                      查看本课完整代码 <ChevronDown size={16} />
                    </summary>
                    <pre>
                      <code>{l.code}</code>
                    </pre>
                  </details>
                ) : (
                  <pre>
                    <code>{l.code}</code>
                  </pre>
                )}
                <p className="caption">
                  {l.lab
                    ? '当前文件代码完整，须与包内 lab_support.py 等文件一起使用。运行结果和验收需要你亲自确认。'
                    : '在自己的开发环境中练习。标注“示意 / 草案 / mock”的代码用于理解，需按步骤补全。'}
                </p>
              </section>
              <section className="lesson-section">
                <h2>动手练习</h2>
                <ol className="exercise-list">
                  {l.exercise.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ol>
              </section>
            </>
          )}
          <section className="lesson-section">
            <h2>完成标准</h2>
            <p className="muted-text">
              亲自验证后再勾选。这是你的自评记录，不代表代码自动通过测试。
            </p>
            <div className="check-list">
              {l.checks.map((x, i) => (
                <label key={x}>
                  <input
                    type="checkbox"
                    checked={progress.checks[i]}
                    disabled={busy}
                    onChange={(e) => {
                      const checks = [...progress.checks]
                      checks[i] = e.target.checked
                      void saveLesson(l.id, { checks })
                    }}
                  />
                  <span>{x}</span>
                </label>
              ))}
            </div>
          </section>
          <section className="lesson-section">
            <h2>一分钟自测</h2>
            <fieldset className="quiz">
              <legend>{l.quiz.question}</legend>
              {l.quiz.options.map((x, i) => (
                <label key={x} className={answer === i ? 'chosen' : ''}>
                  <input
                    type="radio"
                    name="quiz"
                    checked={answer === i}
                    onChange={() => setAnswer(i)}
                  />
                  <span>{x}</span>
                </label>
              ))}
              <button
                className="button primary"
                disabled={answer === null || busy}
                onClick={() => void saveLesson(l.id, { answer })}
              >
                检查答案
                <Check size={16} />
              </button>
              {progress.answer !== null && (
                <div
                  className={`quiz-result ${progress.answer === l.quiz.answer ? 'correct' : 'incorrect'}`}
                  role="status"
                >
                  <strong>{progress.answer === l.quiz.answer ? '回答正确' : '再想一想'}</strong>
                  <p>{l.quiz.explanation}</p>
                </div>
              )}
            </fieldset>
          </section>
          <section className="lesson-section">
            <div className="section-heading">
              <h2>我的学习笔记</h2>
              <span className="caption">{dirty ? '有未保存修改' : '已与本机记录同步'}</span>
            </div>
            <label htmlFor="lesson-note" className="field-label">
              记下理解、报错和下次要做的事
            </label>
            <textarea
              id="lesson-note"
              rows={7}
              maxLength={30000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="今天我理解了…&#10;遇到的问题…&#10;下一步想尝试…"
            />
            <div className="note-actions">
              <small>{note.length} / 30000</small>
              <button
                className="button primary"
                disabled={busy || !dirty}
                onClick={async () => {
                  if (await saveLesson(l.id, { note }))
                    toast.success(
                      browserEdition ? '笔记已保存到当前浏览器' : '笔记已保存到本机数据库',
                    )
                }}
              >
                {busy ? '保存中…' : '保存笔记'}
              </button>
            </div>
          </section>
          <div className="lesson-end">
            {progress.completed_at ? (
              <div className="completion">
                <CheckCircle2 size={22} />
                <span>本课已完成。继续下一步，也别忘了复习。</span>
              </div>
            ) : (
              <p>完成 3 项实践验收并答对自测题后，本课自动记为完成。</p>
            )}
            <div className="lesson-pagination">
              {prev ? (
                <Link className="button" to={`/learn/${prev.id}`}>
                  <ArrowLeft size={15} />
                  上一课
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link className="button primary" to={`/learn/${next.id}`}>
                  下一课
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </article>
        <aside className="lesson-rail">
          <div className="panel">
            <Tag>本课学习资料</Tag>
            <h3>带着问题读原文</h3>
            <p className="muted-text">先读导读，再挑一份资料。不必同时打开所有链接。</p>
            {l.resources.map((id) => {
              const r = c.resources.find((x) => x.id === id)!
              return (
                <a
                  key={id}
                  className="lesson-resource"
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>
                    {r.title}
                    <small>
                      {r.language} · {r.kind}
                    </small>
                  </span>
                  <ArrowUpRight size={17} />
                </a>
              )
            })}
            <p className="caption">各资料的核验日期见资源图书馆；外部内容可能继续更新。</p>
          </div>
          <div className="rail-tip">
            <Terminal size={20} />
            <h3>卡住时这样做</h3>
            <p>先保留完整报错，再缩小到最少代码。请 AI 解释原因后，自己改一遍并重新运行。</p>
          </div>
        </aside>
      </div>
    </>
  )
}

function ResourceCard({ r }: { r: Resource }) {
  const { data, busy, bookmark } = useLearning(),
    saved = data!.state.bookmarks.includes(r.id)
  return (
    <article className="resource-card">
      <div className="resource-top">
        <span className="resource-icon">
          {r.kind === '开源' ? (
            <Code2 size={21} />
          ) : r.kind === '岗位' ? (
            <FolderCode size={21} />
          ) : (
            <BookOpen size={21} />
          )}
        </span>
        <div className="mini-tags">
          <Tag muted>{r.kind}</Tag>
          <Tag muted>{r.language}</Tag>
        </div>
        <button
          className={`icon-button ${saved ? 'is-saved' : ''}`}
          aria-label={`${saved ? '取消收藏' : '收藏'} ${r.title}`}
          aria-pressed={saved}
          disabled={busy}
          onClick={() => void bookmark(r.id, !saved)}
        >
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <h2>
        <a href={r.url} target="_blank" rel="noreferrer">
          {r.title}
          <ArrowUpRight size={16} />
        </a>
      </h2>
      <p>{r.why}</p>
      <details>
        <summary>
          学习前须知
          <ChevronDown size={14} />
        </summary>
        <p>{r.caution}</p>
      </details>
      <div className="resource-footer">
        <span>
          {r.level} · 核验 {r.reviewed}
        </span>
        <a href={r.url} target="_blank" rel="noreferrer" aria-label={`打开 ${r.title}`}>
          <ExternalLink size={16} />
        </a>
      </div>
    </article>
  )
}
export function Resources() {
  const { data } = useLearning()
  const [params, setParams] = useSearchParams(),
    [kind, setKind] = useState('全部'),
    [lang, setLang] = useState('全部语言'),
    [saved, setSaved] = useState(false)
  if (!data) return null
  const q = params.get('q') || '',
    rows = data.curriculum.resources.filter(
      (r) =>
        (!q || `${r.title} ${r.why} ${r.level}`.toLowerCase().includes(q.toLowerCase())) &&
        (kind === '全部' || kind === r.kind) &&
        (lang === '全部语言' || lang === r.language) &&
        (!saved || data.state.bookmarks.includes(r.id)),
    )
  return (
    <>
      <PageHead
        title="值得打开的学习资料。"
        description="少而有用，按阶段选择。每条资料都写明为什么学，以及开始前需要知道什么。"
      />
      <div className="resource-toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="搜索资料库"
            value={q}
            onChange={(e) =>
              setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })
            }
            placeholder="搜索 Python、MCP、评测…"
          />
        </div>
        <select aria-label="资料语言" value={lang} onChange={(e) => setLang(e.target.value)}>
          {['全部语言', '中文', '英文'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <button
          className={`button ${saved ? 'selected' : ''}`}
          aria-pressed={saved}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark size={16} />
          只看收藏
        </button>
      </div>
      <div className="filter-bar">
        <div className="segments wrap">
          {['全部', '课程', '文档', '开源', '文章', '岗位'].map((x) => (
            <button
              className={kind === x ? 'selected' : ''}
              aria-pressed={kind === x}
              key={x}
              onClick={() => setKind(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <span>{rows.length} 份资料</span>
      </div>
      {rows.length ? (
        <div className="resource-grid">
          {rows.map((r) => (
            <ResourceCard r={r} key={r.id} />
          ))}
        </div>
      ) : (
        <>
          <Empty title="没有匹配的资料" body="换个关键词，或清除筛选后再看看。" />
          <button
            className="button"
            onClick={() => {
              setParams({})
              setKind('全部')
              setLang('全部语言')
              setSaved(false)
            }}
          >
            清除筛选
          </button>
        </>
      )}
      <section className="method-note">
        <ShieldCheck size={22} />
        <div>
          <h3>如何判断一份资料是否值得继续学</h3>
          <p>
            核对官方当前文档、仓库 README
            和依赖要求。基础知识不会因为发布时间早就失效；接口过时则以维护中的文档替换。岗位链接仅是公开样本，不代表市场占比。
          </p>
        </div>
      </section>
    </>
  )
}

export function Projects() {
  const { data, busy, saveProject } = useLearning()
  if (!data) return null
  return (
    <>
      <PageHead
        title="让知识，变成拿得出手的作品。"
        description="四个项目逐步叠加能力。验收项全部勾选后记录为完成，不自动替代实际项目测试。"
      />
      <div className="projects-list">
        {data.curriculum.projects.map((p, i) => {
          const checks = data.state.projects[p.id]?.checks || [false, false, false, false]
          return (
            <article className="project-card" key={p.id}>
              <div className="project-intro">
                <span className="project-number">PROJECT {String(i + 1).padStart(2, '0')}</span>
                <h2>{p.title}</h2>
                <p>{p.subtitle}</p>
                <span className="stack-label">{p.stack}</span>
                <Link to={`/learn/${p.lesson}`} className="button">
                  打开项目任务
                  <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="project-criteria">
                <div className="section-heading">
                  <h3>交付验收</h3>
                  <Tag muted>{checks.filter(Boolean).length} / 4</Tag>
                </div>
                <div className="check-list">
                  {p.checks.map((x, index) => (
                    <label key={x}>
                      <input
                        type="checkbox"
                        checked={checks[index]}
                        disabled={busy}
                        onChange={(e) => {
                          const next = [...checks]
                          next[index] = e.target.checked
                          void saveProject(p.id, next)
                        }}
                      />
                      <span>{x}</span>
                    </label>
                  ))}
                </div>
                <Progress
                  value={checks.filter(Boolean).length}
                  max={4}
                  label={`${p.title}验收进度`}
                />
              </div>
            </article>
          )
        })}
      </div>
      <section className="panel portfolio-note">
        <Flag size={24} />
        <div>
          <h2>作品集要让别人看懂你的判断</h2>
          <p>
            每个项目都附上：解决的问题、启动方式、架构与取舍、测试证据、已知限制。最有说服力的是你能复现并解释的一次完整流程。
          </p>
        </div>
      </section>
    </>
  )
}

export function Notes() {
  const { data } = useLearning()
  const [q, setQ] = useState('')
  if (!data) return null
  const notes = data.curriculum.lessons
    .filter((l) => data.state.lessons[l.id]?.note.trim())
    .filter((l) =>
      `${l.title} ${data.state.lessons[l.id].note}`.toLowerCase().includes(q.toLowerCase()),
    )
  return (
    <>
      <PageHead
        title="把理解，留给未来的自己。"
        description={
          browserEdition
            ? '笔记保存在当前浏览器，仅自己可见。建议定期导出备份，回到对应课程即可继续编辑。'
            : '笔记和课程关联，保存在本机数据库。回到对应课程即可继续编辑。'
        }
      >
        <BackupDownload>
          <Download size={16} />
          导出备份
        </BackupDownload>
      </PageHead>
      <div className="search-field notes-search">
        <Search size={18} />
        <input
          aria-label="搜索笔记"
          placeholder="搜索标题或笔记内容…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {notes.length ? (
        <div className="notes-list">
          {notes.map((l) => (
            <article className="note-card" key={l.id}>
              <div>
                <Tag muted>
                  第 {l.number} 节 · {l.track}
                </Tag>
                <Link to={`/learn/${l.id}`} className="text-action">
                  继续编辑
                  <ArrowUpRight size={16} />
                </Link>
              </div>
              <h2>{l.title}</h2>
              <p>{data.state.lessons[l.id].note}</p>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title={q ? '没有匹配的笔记' : '你的第一条理解，值得记下来'}
          body={q ? '试试不同的关键词。' : '在课程底部写下理解、报错或下一步，再点击保存笔记。'}
          to="/learn/l01"
          label="去第一课记一笔"
        />
      )}
    </>
  )
}

export function Settings() {
  const cloud = useSyncExternalStore(subscribeCloud, getCloudStatus)
  const { data, busy, settings, restore } = useLearning()
  const [file, setFile] = useState<{ name: string; value: unknown } | null>(null),
    [fileError, setFileError] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  if (!data) return null
  return (
    <>
      <PageHead
        title="找到能坚持的学习节奏。"
        description="每天留一小段时间，允许课程跨天完成。进度跟随你实际完成的练习。"
      />
      <div className="settings-grid">
        {browserEdition && (
          <Suspense
            fallback={<section className="panel cloud-settings">正在加载同步设置…</section>}
          >
            <CloudSettings />
          </Suspense>
        )}
        <ThemeSettings />
        <section className="panel">
          <h2>每日学习时长</h2>
          <p className="muted-text">影响首页建议安排与路线总时长估算。</p>
          <div className="time-options">
            {([30, 60, 90] as const).map((x) => (
              <button
                disabled={busy}
                aria-pressed={data.state.settings.daily_minutes === x}
                className={data.state.settings.daily_minutes === x ? 'selected' : ''}
                onClick={() => void settings(x)}
                key={x}
              >
                <strong>{x}</strong>
                <span>分钟</span>
                <small>{x === 30 ? '轻量推进' : x === 60 ? '推荐节奏' : '集中学习'}</small>
              </button>
            ))}
          </div>
          <div className="setting-note">
            <Clock3 size={19} />
            <div>
              <b>每天 09:00 · 北京时间</b>
              <p>
                建议每天 9:00 开始学习。提醒需在自己的日历或 Codex 中另行设置；下载项目不会自动创建
                日程，网页中的时长设置也不会修改已有提醒。
              </p>
            </div>
          </div>
        </section>
        <section className="panel">
          <h2>备份与恢复</h2>
          <p className="muted-text">
            包含课程验收、笔记、项目状态、收藏与学习时长。换电脑前先导出。
          </p>
          <div className="backup-actions">
            <BackupDownload>
              <Download size={16} />
              导出全部记录
            </BackupDownload>
            {browserEdition && (
              <BackupDownload snapshot>
                <Download size={16} />
                导出恢复前快照
              </BackupDownload>
            )}
            <button className="button" onClick={() => ref.current?.click()}>
              <Upload size={16} />
              选择备份文件
            </button>
            <input
              ref={ref}
              type="file"
              className="visually-hidden"
              aria-label="选择 JSON 备份"
              accept="application/json,.json"
              onChange={async (e) => {
                setFile(null)
                setFileError('')
                const f = e.target.files?.[0]
                if (!f) return
                try {
                  if (f.size > 2000000) throw new Error('请选择小于 2 MB 的备份文件')
                  const value = JSON.parse(await f.text())
                  if (value.version !== 1) throw new Error('不是受支持的 Agent Path 备份')
                  setFile({ name: f.name, value })
                } catch (err) {
                  setFileError(err instanceof Error ? err.message : '备份无法读取')
                }
                e.target.value = ''
              }}
            />
          </div>
          {fileError && (
            <p className="error-text" role="alert">
              {fileError}
            </p>
          )}
          {file && (
            <div className="restore-confirm">
              <h3>准备恢复：{file.name}</h3>
              <p>
                {browserEdition
                  ? cloud.owner
                    ? '恢复会替换当前账号的云端进度和这台设备的笔记、收藏；操作前保留恢复前快照。笔记与收藏不会上传。'
                    : '恢复会替换当前浏览器的学习记录。继续前会保留一份恢复前快照，可用上方按钮导出。'
                  : '恢复会替换当前学习记录。继续前会在本机保存一份恢复前快照。'}
              </p>
              <div className="backup-actions">
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={async () => {
                    if (await restore(file.value)) setFile(null)
                  }}
                >
                  确认恢复
                </button>
                <button className="button" onClick={() => setFile(null)}>
                  取消
                </button>
              </div>
            </div>
          )}
          <p className="caption">
            {browserEdition
              ? cloud.owner
                ? '课程、项目与时长已启用账号同步；笔记与收藏只保存在当前设备，建议定期导出。没有将笔记上传到云端。'
                : '未登录时，记录仅保存在当前设备、当前浏览器。清除网站数据或退出无痕模式可能丢失记录；请定期导出备份，也可登录账号同步课程进度。'
              : '数据保存在本工程 data/learning.sqlite3。此版本为本机单人使用，不包含账号和云同步。'}
          </p>
        </section>
        <section className="panel update-policy">
          <h2>路线如何保持更新</h2>
          <div className="policy-row">
            <ShieldCheck size={20} />
            <div>
              <h3>核验与适用范围</h3>
              <p>
                本版资料核验日期为 {data.curriculum.reviewed}
                。后续更新需核对官方来源并更新课程；页面本身不自动抓取，不把旧快照标成实时。
              </p>
            </div>
          </div>
          <div className="policy-row">
            <Code2 size={20} />
            <div>
              <h3>稳定基础优先，框架按需选</h3>
              <p>
                Python、HTTP、SQL、测试是基础；模型、SDK、协议和价格按当前文档核对。Java
                可作为未来岗位需要时的扩展，本路线先专注 Python 与 JavaScript。
              </p>
            </div>
          </div>
          <div className="policy-row">
            <Sparkles size={20} />
            <div>
              <h3>学习成本可控</h3>
              <p>
                站内课程和记录无需模型密钥。早期练习使用本地数据；真实模型调用由你选择提供商并设置额度，费用以当时官方计费为准。
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
export function NotFound() {
  return (
    <Empty
      title="这页还不在学习路线里"
      body="从工作台继续，或者浏览完整路线。"
      to="/"
      label="返回工作台"
    />
  )
}
