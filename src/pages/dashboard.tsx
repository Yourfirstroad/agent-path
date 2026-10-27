import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Plus,
  FolderOpen,
  CircleCheck,
  CircleDashed,
  Timer,
  LayoutTemplate,
  Boxes,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjects } from '@/features/projects/use-projects'
import { dateLabel } from '@/features/projects/model'
import {
  PageHeader,
  Panel,
  TextLink,
  LoadingState,
  ErrorState,
  StatusBadge,
  ProgressMeter,
  EmptyState,
} from '@/components/shared'

export default function Dashboard() {
  const { projects, loading, error, reload } = useProjects()
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const active = projects.filter((p) => p.status === 'active').length
  const done = projects.filter((p) => p.status === 'done').length
  const planned = projects.filter((p) => p.status === 'planned').length
  return (
    <>
      <PageHeader
        title="把想法，慢慢变成作品。"
        description="这里是你的工作台。挑一个项目，继续上次的进度。"
        action={
          <Button asChild>
            <Link to="/workspace/projects/new">
              <Plus />
              新建项目
            </Link>
          </Button>
        }
      />
      <div className="welcome-strip">
        <div>
          <span className="welcome-dot" />
          一个顺手的开始
        </div>
        <p>已准备好后台与官网两套布局，下一步由你定义。</p>
        <Link to="/guide">
          看看怎么复用 <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="stats-grid">
        {[
          {
            label: '全部项目',
            value: projects.length,
            Icon: FolderOpen,
            note: '当前浏览器中的记录',
          },
          { label: '进行中', value: active, Icon: Timer, note: '保持专注，持续推进' },
          { label: '已完成', value: done, Icon: CircleCheck, note: '每一步，都算数' },
          { label: '待开始', value: planned, Icon: CircleDashed, note: '给新想法留个位置' },
        ].map(({ label, value, Icon, note }) => (
          <div className="stat-card" key={label}>
            <div>
              <span>{label}</span>
              <Icon size={18} />
            </div>
            <strong>{String(value).padStart(2, '0')}</strong>
            <p>{note}</p>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <Panel title="最近的项目" action={<TextLink to="/workspace/projects">查看全部</TextLink>}>
          <p className="panel-subtitle">首次使用含示例项目，可自由编辑或删除。</p>
          {projects.length === 0 ? (
            <EmptyState
              action={
                <Button asChild>
                  <Link to="/workspace/projects/new">新建项目</Link>
                </Button>
              }
            />
          ) : (
            <div className="project-summary-list">
              {projects.slice(0, 4).map((p, i) => (
                <Link to={`/workspace/projects/${p.id}`} className="project-summary" key={p.id}>
                  <span className={`project-icon variant-${i % 3}`}>
                    <FolderOpen size={19} />
                  </span>
                  <div className="project-summary-name">
                    <strong>{p.name}</strong>
                    <small>{dateLabel(p.updatedAt)} 更新</small>
                  </div>
                  <StatusBadge status={p.status} />
                  <div className="summary-progress">
                    <ProgressMeter value={p.progress} />
                  </div>
                  <ArrowUpRight size={17} />
                </Link>
              ))}
            </div>
          )}
          <div className="panel-bottom">
            <span>项目记录会保留在当前浏览器中</span>
            <span className="mono">LOCAL FIRST</span>
          </div>
        </Panel>
        <Panel title="从模板开始" className="quick-start">
          <p className="panel-subtitle">把时间留给真正重要的内容。</p>
          {[
            {
              title: '品牌与展示',
              desc: '官网、作品集与产品介绍',
              to: '/showcase',
              Icon: LayoutTemplate,
            },
            {
              title: '组件实验室',
              desc: '预览、交互与代码示例',
              to: '/workspace/components',
              Icon: Boxes,
            },
            { title: '复用指南', desc: '了解工程结构与扩展方式', to: '/guide', Icon: BookOpen },
          ].map(({ title, desc, to, Icon }) => (
            <Link key={to} to={to} className="quick-link">
              <Icon size={22} />
              <div>
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          ))}
          <div className="quick-tip">
            <span>小提示</span>
            <p>
              先改主题，再做页面。
              <br />
              一个调整，整个工程一起变化。
            </p>
            <TextLink to="/workspace/settings">调整我的主题</TextLink>
          </div>
        </Panel>
      </div>
      <div className="dashboard-bottom">
        <span className="mono">BUILD. REFINE. REUSE.</span>
        <p>每次开始，都比上次更从容。</p>
        <span aria-hidden="true">✳</span>
      </div>
    </>
  )
}
