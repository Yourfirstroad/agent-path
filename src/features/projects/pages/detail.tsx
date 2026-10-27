import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjects } from '../use-projects'
import { categoryLabels } from '../model'
import {
  PageHeader,
  Panel,
  StatusBadge,
  ProgressMeter,
  ErrorState,
  LoadingState,
} from '@/components/shared'

export default function ProjectDetail() {
  const { id } = useParams()
  const { projects, loading, error, reload } = useProjects()
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const project = projects.find((p) => p.id === id)
  if (!project)
    return (
      <>
        <Link className="back-link" to="/workspace/projects">
          <ArrowLeft size={16} />
          返回列表
        </Link>
        <ErrorState message="项目不存在或已删除。" />
      </>
    )
  return (
    <>
      <Link className="back-link" to="/workspace/projects">
        <ArrowLeft size={16} />
        返回项目列表
      </Link>
      <PageHeader
        title={project.name}
        description={categoryLabels[project.category]}
        action={
          <Button asChild>
            <Link to={`/workspace/projects/${project.id}/edit`}>
              <Pencil />
              编辑项目
            </Link>
          </Button>
        }
      />
      <div className="detail-grid">
        <Panel title="关于这个项目">
          <div className="detail-icon">
            <FolderOpen size={30} />
          </div>
          <p className="detail-description">
            {project.description || '暂无描述。点击编辑，为这个项目补充一些想法。'}
          </p>
          <div className="detail-progress">
            <h3>完成进度</h3>
            <ProgressMeter value={project.progress} />
          </div>
        </Panel>
        <Panel title="项目概览">
          <dl className="detail-meta">
            <div>
              <dt>当前状态</dt>
              <dd>
                <StatusBadge status={project.status} />
              </dd>
            </div>
            <div>
              <dt>项目类型</dt>
              <dd>{categoryLabels[project.category]}</dd>
            </div>
            <div>
              <dt>创建时间</dt>
              <dd>{new Date(project.createdAt).toLocaleString('zh-CN')}</dd>
            </div>
            <div>
              <dt>最近更新</dt>
              <dd>{new Date(project.updatedAt).toLocaleString('zh-CN')}</dd>
            </div>
            <div>
              <dt>保存位置</dt>
              <dd>当前浏览器 · 本地存储</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </>
  )
}
