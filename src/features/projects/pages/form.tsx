import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader, Panel, ErrorState, LoadingState, StatusBadge } from '@/components/shared'
import { useProjects } from '../use-projects'
import { projectInputSchema, type ProjectInput, type Project, categoryLabels } from '../model'

function Editor({ existing }: { existing?: Project }) {
  const navigate = useNavigate()
  const { save } = useProjects()
  const [data, setData] = useState<ProjectInput>(
    existing ?? { name: '', category: 'product', status: 'planned', description: '', progress: 0 },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const change = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setData((d) => ({ ...d, [key]: value }))
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    const result = projectInputSchema.safeParse(data)
    if (!result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      )
      document.getElementById(String(result.error.issues[0].path[0]))?.focus()
      return
    }
    setErrors({})
    setBusy(true)
    try {
      const project = await save(result.data, existing?.id)
      toast.success(existing ? '修改已保存' : '项目已创建')
      navigate(`/workspace/projects/${project.id}`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <Link
        className="back-link"
        to={existing ? `/workspace/projects/${existing.id}` : '/workspace/projects'}
      >
        <ArrowLeft size={16} />
        返回{existing ? '项目详情' : '项目列表'}
      </Link>
      <PageHeader
        title={existing ? '编辑项目' : '开始一个新项目'}
        description="给想法起一个名字，再一步一步实现它。"
      />
      <div className="editor-layout">
        <form onSubmit={submit} noValidate>
          <Panel title="基本信息">
            <div className="form-fields">
              <div className="field">
                <label htmlFor="name">
                  项目名称 <span>*</span>
                </label>
                <Input
                  id="name"
                  placeholder="例如：我的个人作品集"
                  maxLength={60}
                  value={data.name}
                  onChange={(e) => change('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  required
                />
                {errors.name && (
                  <p id="name-error" className="field-error">
                    {errors.name}
                  </p>
                )}
              </div>
              <fieldset className="field">
                <legend>项目类型</legend>
                <div className="choice-grid">
                  {(['product', 'brand'] as const).map((value) => (
                    <label
                      className={`choice-card ${data.category === value ? 'selected' : ''}`}
                      key={value}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={value}
                        checked={data.category === value}
                        onChange={() => change('category', value)}
                      />
                      <span>
                        <strong>{categoryLabels[value]}</strong>
                        <small>
                          {value === 'product'
                            ? '工作台、管理系统与个人工具'
                            : '官网、作品集与产品介绍'}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="description">
                  项目描述 <small>选填</small>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="它要解决什么问题？你希望它是什么样子？"
                  maxLength={500}
                  value={data.description}
                  onChange={(e) => change('description', e.target.value)}
                />
                <small className="field-hint">{data.description.length}/500 字</small>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="status">当前状态</label>
                  <select
                    id="status"
                    className="select-input"
                    value={data.status}
                    onChange={(e) => {
                      const status = e.target.value as ProjectInput['status']
                      setData((d) => ({
                        ...d,
                        status,
                        progress: status === 'done' ? 100 : status === 'planned' ? 0 : d.progress,
                      }))
                    }}
                  >
                    <option value="planned">待开始</option>
                    <option value="active">进行中</option>
                    <option value="done">已完成</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="progress">完成进度 · {data.progress}%</label>
                  <input
                    id="progress"
                    type="range"
                    min="0"
                    max="100"
                    disabled={data.status !== 'active'}
                    value={data.progress}
                    onChange={(e) => change('progress', Number(e.target.value))}
                  />
                  <small className="field-hint">进行中的项目可手动调整</small>
                </div>
              </div>
            </div>
          </Panel>
          <div className="form-actions">
            <p>
              <Check size={15} />
              保存到当前浏览器
            </p>
            <Button variant="outline" asChild>
              <Link to={existing ? `/workspace/projects/${existing.id}` : '/workspace/projects'}>
                取消
              </Link>
            </Button>
            <Button type="submit" disabled={busy}>
              <Save size={16} />
              {busy ? '正在保存…' : '保存项目'}
            </Button>
          </div>
        </form>
        <aside className="editor-preview">
          <Panel title="项目预览">
            <span className="preview-category">{categoryLabels[data.category]}</span>
            <h2>{data.name || '未命名的想法'}</h2>
            <p>{data.description || '描述一下这个项目，你的想法会在这里呈现。'}</p>
            <StatusBadge status={data.status} />
          </Panel>
          <p className="aside-tip">
            这是本地演示流程。接入自己的后端后，可以继续沿用这套表单与详情布局。
          </p>
        </aside>
      </div>
    </>
  )
}
export default function ProjectForm() {
  const { id } = useParams()
  const { projects, loading, error, reload } = useProjects()
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const existing = projects.find((p) => p.id === id)
  if (id && !existing) return <ErrorState message="项目不存在，请从项目列表重新选择。" />
  return <Editor key={id || 'new'} existing={existing} />
}
