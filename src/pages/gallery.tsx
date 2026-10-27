import { useState } from 'react'
import { Copy, Check, Plus, ArrowUpRight, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Panel,
  ProgressMeter,
  StatusBadge,
} from '@/components/shared'
import { AppearanceControls } from './settings'

const buttonCode = `import { Button } from '@/components/ui/button'\n\n<Button onClick={() => console.log('开始')}>\n  新建项目\n</Button>\n<Button variant="outline">次要操作</Button>`
const stateCode = `import { EmptyState } from '@/components/shared'\n\n<EmptyState\n  title="还没有记录"\n  description="创建第一条记录，从这里开始。"\n  action={<Button onClick={handleCreate}>新建记录</Button>}\n/>`
function CopyButton({ text }: { text: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          toast.success('代码已复制')
        } catch {
          toast.error('复制失败，请手动选中下方代码')
        }
      }}
    >
      <Copy size={15} />
      复制代码
    </Button>
  )
}
export default function Gallery() {
  const [modal, setModal] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [demoState, setDemoState] = useState('empty')
  return (
    <>
      <PageHeader
        title="组件实验室"
        description="看看、点点、调整一下。找到顺手的积木，再带到你的页面里。"
        action={<Badge variant="outline">共享组件 / LIVE</Badge>}
      />
      <Tabs defaultValue="components">
        <TabsList className="gallery-tabs">
          <TabsTrigger value="components">基础组件</TabsTrigger>
          <TabsTrigger value="states">交互状态</TabsTrigger>
          <TabsTrigger value="theme">主题规范</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="gallery-grid">
            <Panel title="按钮与操作" action={<CopyButton text={buttonCode} />}>
              <p className="panel-subtitle">一个主操作，清晰的次要选择。</p>
              <div className="component-row">
                <Button onClick={() => toast.success('主操作已触发')}>
                  <Plus />
                  主要按钮
                </Button>
                <Button variant="outline" onClick={() => toast('次要操作已触发')}>
                  次要按钮
                </Button>
                <Button variant="ghost" onClick={() => toast('轻量操作已触发')}>
                  文字按钮 <ArrowUpRight />
                </Button>
                <Button disabled>不可用</Button>
              </div>
              <pre className="code-block">
                <code>{buttonCode}</code>
              </pre>
            </Panel>
            <Panel title="输入与选择">
              <div className="form-fields">
                <div className="field">
                  <label htmlFor="demo-input">项目名称</label>
                  <Input id="demo-input" placeholder="输入一个好想法…" />
                </div>
                <div className="field">
                  <label htmlFor="demo-disabled">禁用输入</label>
                  <Input id="demo-disabled" disabled placeholder="当前不可编辑" />
                </div>
                <div className="switch-row">
                  <div>
                    <label htmlFor="demo-switch">紧凑视图</label>
                    <small>切换后，下方示例间距会变化。</small>
                  </div>
                  <Switch id="demo-switch" checked={enabled} onCheckedChange={setEnabled} />
                </div>
                <div className={`density-demo ${enabled ? 'compact' : ''}`}>
                  <span>个人工作台</span>
                  <span>品牌展示页</span>
                </div>
              </div>
            </Panel>
            <Panel title="状态与进度">
              <div className="component-row">
                <StatusBadge status="planned" />
                <StatusBadge status="active" />
                <StatusBadge status="done" />
              </div>
              <div className="meter-examples">
                <ProgressMeter value={25} />
                <ProgressMeter value={68} />
                <ProgressMeter value={100} />
              </div>
              <p className="panel-subtitle">状态同时使用文字与颜色，进度可被辅助技术读取。</p>
            </Panel>
            <Panel title="弹窗与反馈">
              <p className="panel-subtitle">焦点管理、Escape 关闭与键盘操作，由基础组件处理。</p>
              <div className="component-row">
                <Button variant="outline" onClick={() => setModal(true)}>
                  打开示例弹窗
                </Button>
                <Button variant="outline" onClick={() => toast.success('保存成功，这是通知示例')}>
                  成功通知
                </Button>
                <Button variant="outline" onClick={() => toast.error('操作未完成，这是错误示例')}>
                  错误通知
                </Button>
              </div>
              <div className="component-note">
                <Check size={20} />
                <p>把重要操作放在明确的按钮上。操作成功后，给用户可见的回应。</p>
              </div>
            </Panel>
          </div>
        </TabsContent>
        <TabsContent value="states">
          <Panel title="每种情况，都有回应" action={<CopyButton text={stateCode} />}>
            <div className="component-row">
              {[
                ['empty', '空数据'],
                ['loading', '加载中'],
                ['error', '读取失败'],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  variant={demoState === value ? 'default' : 'outline'}
                  aria-pressed={demoState === value}
                  onClick={() => setDemoState(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="state-demo">
              {demoState === 'empty' ? (
                <EmptyState
                  title="你的灵感，还在路上"
                  description="创建第一条记录，从这里开始。"
                  action={
                    <Button onClick={() => toast('示例操作已触发')}>
                      <Plus />
                      新建记录
                    </Button>
                  }
                />
              ) : demoState === 'loading' ? (
                <LoadingState />
              ) : (
                <ErrorState
                  message="这是错误状态示例。实际项目中，请说明原因并提供重试入口。"
                  onRetry={() => {
                    setDemoState('empty')
                    toast.success('重试示例已完成')
                  }}
                />
              )}
            </div>
            <pre className="code-block">
              <code>{stateCode}</code>
            </pre>
            <div className="component-row">
              <Button disabled>
                <LoaderCircle className="spin" />
                正在保存…
              </Button>
              <span className="muted-text">提交中的按钮会被禁用，避免重复操作。</span>
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="theme">
          <div className="gallery-grid">
            <Panel title="主题预览">
              <AppearanceControls />
            </Panel>
            <Panel title="排版与间距">
              <div className="type-specimen">
                <h2>有序，也有个性。</h2>
                <h3>让内容保持清晰的层级</h3>
                <p>
                  正文采用系统字体，无需等待远程字体加载。中文、英文与数字在同一套规则里自然共处。
                </p>
                <span className="mono">0123456789 / ABCDEFG</span>
              </div>
              <div className="spacing-specimen">
                {[4, 8, 12, 16, 24, 32].map((n) => (
                  <div key={n}>
                    <span style={{ width: n, height: n }} />
                    <small>{n}</small>
                  </div>
                ))}
              </div>
              <p className="panel-subtitle">
                主题变量：src/styles/tokens.css
                <br />
                布局与业务样式：src/styles/app.css
              </p>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>每一次操作，都清清楚楚。</DialogTitle>
            <DialogDescription>
              这是可复用弹窗示例。按 Escape、点击关闭或下面的按钮都可以返回。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                setModal(false)
                toast.success('已确认示例操作')
              }}
            >
              确认操作
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
