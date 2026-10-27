import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  Globe,
  Command,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Logo, ThemeToggle } from '@/components/shared'
import { usePreferences } from '@/hooks/use-preferences'
import { workspaceNav } from '@/config/site'

export function MarketingLayout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="marketing-shell">
      <a href="#main" className="skip-link">
        跳到内容
      </a>
      <header className="site-header">
        <Logo />
        <nav className="site-links" aria-label="网站导航">
          <NavLink to="/" end>
            起点
          </NavLink>
          <NavLink to="/showcase">精选模板</NavLink>
          <NavLink to="/guide">使用指南</NavLink>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Button asChild className="desktop-entry">
            <Link to="/workspace">
              进入工作台 <ArrowUpRight />
            </Link>
          </Button>
          <Button
            className="mobile-menu"
            variant="ghost"
            size="icon"
            aria-label="打开导航"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
        </div>
      </header>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>探索 Foundry</DialogTitle>
          <DialogDescription>选择一个入口。</DialogDescription>
          <nav className="mobile-links" aria-label="移动端网站导航">
            {[
              ['/', '首页'],
              ['/showcase', '精选模板'],
              ['/guide', '使用指南'],
              ['/workspace', '进入工作台'],
            ].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}>
                {label}
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </nav>
        </DialogContent>
      </Dialog>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <Logo />
        <p>为下一个想法，留一个好起点。</p>
        <Link to="/guide">
          构建属于你的版本 <ArrowUpRight size={15} />
        </Link>
        <span className="mono">REACT / FOUNDRY</span>
      </footer>
    </div>
  )
}
const icons = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  components: Boxes,
  settings: Settings,
}
function WorkspaceNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="nav-group-label">工作空间</div>
      <nav className="workspace-nav" aria-label="工作空间导航">
        {workspaceNav.map((item) => {
          const Icon = icons[item.icon]
          return (
            <NavLink key={item.to} to={item.to} end={item.to === '/workspace'} onClick={onNavigate}>
              <Icon size={18} />
              {item.label}
              {item.icon === 'components' && <span className="nav-pill">UI</span>}
            </NavLink>
          )
        })}
      </nav>
      <div className="nav-group-label second">探索更多</div>
      <nav className="workspace-nav" aria-label="资源导航">
        <Link to="/" onClick={onNavigate}>
          <Globe size={18} />
          官网首页
          <ArrowUpRight className="ml-auto" size={14} />
        </Link>
        <Link to="/showcase" onClick={onNavigate}>
          <Boxes size={18} />
          精选模板
        </Link>
        <Link to="/guide" onClick={onNavigate}>
          <BookOpen size={18} />
          使用指南
        </Link>
      </nav>
    </>
  )
}
export function WorkspaceLayout() {
  const [open, setOpen] = useState(false)
  const { preferences } = usePreferences()
  const { pathname } = useLocation()
  const current =
    [...workspaceNav].reverse().find((n) => pathname.startsWith(n.to))?.label || '工作台'
  return (
    <div className="workspace-shell">
      <a href="#main" className="skip-link">
        跳到内容
      </a>
      <aside className="sidebar">
        <Logo />
        <div className="workspace-label">
          <span className="workspace-avatar">F</span>
          <div>
            <strong>{preferences.name}</strong>
            <small>个人版 · 本地演示</small>
          </div>
        </div>
        <WorkspaceNav />
        <div className="sidebar-note">
          <Command size={20} />
          <strong>把重复的，交给积木。</strong>
          <p>挑选组件，搭建你的下一页。</p>
          <Link to="/workspace/components">打开组件实验室 →</Link>
        </div>
        <div className="sidebar-foot">
          <span className="avatar">我</span>
          <div>
            <strong>个人创作者</strong>
            <small>Made to be yours.</small>
          </div>
          <ThemeToggle />
        </div>
      </aside>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="mobile-sidebar">
          <DialogTitle>工作空间导航</DialogTitle>
          <DialogDescription>{preferences.name}</DialogDescription>
          <WorkspaceNav onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="breadcrumb">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="打开导航"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
            <span>工作空间</span>
            <ChevronRight size={14} />
            <strong>{current}</strong>
          </div>
          <div className="header-actions">
            <span className="local-indicator">
              <span />
              本地存储
            </span>
            <ThemeToggle />
            <Button asChild variant="outline" className="desktop-entry">
              <Link to="/showcase">
                模板预览 <ArrowUpRight size={15} />
              </Link>
            </Button>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="workspace-main">
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>Foundry / 个人前端基础工程</span>
          <span>数据仅保存在当前浏览器</span>
        </footer>
      </div>
    </div>
  )
}
