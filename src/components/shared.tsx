import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Inbox, Moon, Sun, AlertCircle, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { usePreferences } from '@/hooks/use-preferences'
import { site } from '@/config/site'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" aria-label="Foundry 首页" className="logo">
      <span className="logo-symbol" aria-hidden="true">
        f
      </span>
      {!compact && (
        <span>
          {site.name}
          <span className="logo-dot">·</span>
        </span>
      )}
    </Link>
  )
}
export function ThemeToggle() {
  const { preferences, update } = usePreferences()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={preferences.theme === 'dark' ? '切换浅色主题' : '切换深色主题'}
      onClick={() => update({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })}
    >
      {preferences.theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="heading-actions">{action}</div>}
    </div>
  )
}
export function Panel({
  title,
  action,
  children,
  className = '',
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-heading">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
export function EmptyState({
  title = '还没有内容',
  description = '从创建第一条记录开始。',
  action,
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Inbox size={25} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle />
      <div>
        <h2>暂时无法读取</h2>
        <p>{message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            重新读取
          </Button>
        )}
      </div>
    </div>
  )
}
export function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-label="正在加载">
      <LoaderCircle className="spin" />
      <span>正在准备内容…</span>
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton short" />
    </div>
  )
}
export function StatusBadge({ status }: { status: 'planned' | 'active' | 'done' }) {
  const labels = { planned: '待开始', active: '进行中', done: '已完成' }
  return (
    <span className={`status-badge ${status}`}>
      <span aria-hidden="true" />
      {labels[status]}
    </span>
  )
}
export function ProgressMeter({ value }: { value: number }) {
  return (
    <div className="progress-wrap">
      <div
        className="progress-track"
        role="progressbar"
        aria-label="项目进度"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ transform: `scaleX(${value / 100})` }} />
      </div>
      <span className="mono">{value}%</span>
    </div>
  )
}
export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ArrowUpRight size={16} />
    </Link>
  )
}
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  busy = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  busy?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={busy ? undefined : onOpenChange}>
      <DialogContent showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="destructive" disabled={busy} onClick={onConfirm}>
            {busy ? '正在处理…' : '确认删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
