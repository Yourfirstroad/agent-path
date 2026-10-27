import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Download,
  Plus,
  Search,
  ArrowDownUp,
  ArrowUpRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ProgressMeter,
  StatusBadge,
} from '@/components/shared'
import { useProjects } from '../use-projects'
import { categoryLabels, dateLabel, type Project } from '../model'

export default function ProjectList() {
  const { projects, loading, error, reload, remove } = useProjects()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || '',
    status = params.get('status') || 'all'
  const [sort, setSort] = useState<'updated' | 'name'>('updated')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<Project | null>(null)
  const [busy, setBusy] = useState(false)
  const filtered = useMemo(
    () =>
      projects
        .filter(
          (p) =>
            (p.name + p.description).toLowerCase().includes(query.toLowerCase()) &&
            (status === 'all' || p.status === status),
        )
        .sort((a, b) =>
          sort === 'name'
            ? a.name.localeCompare(b.name, 'zh-CN')
            : b.updatedAt.localeCompare(a.updatedAt),
        ),
    [projects, query, status, sort],
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / 5)),
    current = Math.min(page, pageCount)
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params)
    value && value !== 'all' ? next.set(key, value) : next.delete(key)
    setParams(next, { replace: true })
    setPage(1)
  }
  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await remove(deleting.id)
      setDeleting(null)
      toast.success('项目已删除')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({ version: 1, projects: filtered }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'foundry-projects.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success(`已导出 ${filtered.length} 个项目`)
  }
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={reload} />
  return (
    <>
      <PageHeader
        title="项目管理"
        description="从一个想法，到一次完成。让每个项目都有迹可循。"
        action={
          <>
            <Button variant="outline" onClick={exportData}>
              <Download />
              导出记录
            </Button>
            <Button asChild>
              <Link to="/workspace/projects/new">
                <Plus />
                新建项目
              </Link>
            </Button>
          </>
        }
      />
      <section className="panel table-panel">
        <div className="list-toolbar">
          <div className="search-field">
            <Search size={18} />
            <Input
              aria-label="搜索项目"
              placeholder="搜索名称或描述…"
              value={query}
              onChange={(e) => filter('q', e.target.value)}
            />
          </div>
          <select
            className="select-input"
            aria-label="筛选状态"
            value={status}
            onChange={(e) => filter('status', e.target.value)}
          >
            <option value="all">全部状态</option>
            <option value="active">进行中</option>
            <option value="planned">待开始</option>
            <option value="done">已完成</option>
          </select>
          <Button
            variant="outline"
            onClick={() => {
              setSort(sort === 'name' ? 'updated' : 'name')
              setPage(1)
            }}
          >
            <ArrowDownUp />
            {sort === 'name' ? '名称排序' : '最近更新'}
          </Button>
        </div>
        <div className="result-summary">
          <span>
            共 <strong>{filtered.length}</strong> 个项目
          </span>
          {(query || status !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setParams({})
                setPage(1)
              }}
            >
              清除筛选
            </Button>
          )}
          <span className="sample-note">初始记录为示例数据</span>
        </div>
        {filtered.length ? (
          <div className="table-scroll">
            <table>
              <caption className="sr-only">项目列表</caption>
              <thead>
                <tr>
                  <th>项目名称</th>
                  <th>类型</th>
                  <th>状态</th>
                  <th>完成进度</th>
                  <th>最近更新</th>
                  <th>
                    <span className="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((current - 1) * 5, current * 5).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link className="table-project-name" to={`/workspace/projects/${p.id}`}>
                        {p.name}
                      </Link>
                      <p className="table-description">{p.description || '暂无描述'}</p>
                    </td>
                    <td>{categoryLabels[p.category]}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <ProgressMeter value={p.progress} />
                    </td>
                    <td className="mono">{dateLabel(p.updatedAt)}</td>
                    <td>
                      <div className="row-actions">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/workspace/projects/${p.id}`} aria-label={`查看${p.name}`}>
                            <ArrowUpRight />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`删除${p.name}`}
                          onClick={() => setDeleting(p)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={projects.length ? '没有匹配的项目' : '从第一个项目开始'}
            description={
              projects.length ? '换个关键词，或清除筛选再看看。' : '记录一个想法，让它慢慢发生。'
            }
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setParams({})
                  setPage(1)
                }}
              >
                清除筛选
              </Button>
            }
          />
        )}
        <div className="table-pagination">
          <span>
            每页 5 条 · 第 {current} / {pageCount} 页
          </span>
          <div>
            <Button
              variant="outline"
              size="icon"
              aria-label="上一页"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="下一页"
              disabled={current >= pageCount}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </section>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title="删除这个项目？"
        description={`“${deleting?.name ?? ''}”将从当前浏览器永久删除。此操作无法撤销，必要时请先导出记录。`}
        busy={busy}
        onConfirm={confirmDelete}
      />
    </>
  )
}
