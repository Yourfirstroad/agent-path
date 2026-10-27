import { Link } from 'react-router-dom'
import { ArrowUpRight, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const command = 'npm run starter -- ../my-next-project'
const references = [
  [
    'shadcn/ui',
    '基础组件源码：按钮、输入、弹窗、标签页与开关。',
    'https://github.com/shadcn-ui/ui',
  ],
  [
    'shadcn-admin',
    '参考后台导航、主题切换和页面分类方式。',
    'https://github.com/satnaing/shadcn-admin',
  ],
  [
    'Bulletproof React',
    '参考按业务模块组织代码与单向依赖的思路。',
    'https://github.com/alan2207/bulletproof-react',
  ],
  [
    'Magic UI',
    '研究官网动效组件方向；本工程几何动画为独立 CSS 实现。',
    'https://github.com/magicuidesign/magicui',
  ],
]
export default function Guide() {
  return (
    <div className="site-width guide-page">
      <aside className="guide-nav">
        <span className="section-index mono">FIELD GUIDE</span>
        <a href="#start">开始使用</a>
        <a href="#structure">工程结构</a>
        <a href="#reuse">复用与扩展</a>
        <a href="#references">参考与来源</a>
      </aside>
      <article className="guide-content">
        <h1>
          把这个起点，
          <br />
          变成你自己的。
        </h1>
        <p className="guide-lead">从主题、页面到业务模块，按你需要的节奏逐步替换。</p>
        <section id="start">
          <h2>开始使用</h2>
          <p>
            这是一个可本地运行的 React
            工程，包含官网展示与后台工具。项目管理中的初始记录是示例，新增与修改会保存在当前浏览器。
          </p>
          <pre className="code-block">
            <code>npm install{'\n'}npm run dev</code>
          </pre>
          <p>
            默认本地地址为 <code>http://127.0.0.1:5177</code>
            。修改端口会改变浏览器存储所属的站点地址。
          </p>
          <div className="guide-links">
            <Link to="/workspace">
              进入工作台 <ArrowUpRight size={16} />
            </Link>
            <Link to="/workspace/components">
              查看组件 <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <section id="structure">
          <h2>每段代码，都有自己的位置。</h2>
          <pre className="code-block">
            <code>{`src/\n├── app/          路由、应用入口与错误边界\n├── components/   UI 基础组件与公共业务组件\n├── config/       网站信息和导航配置\n├── features/     独立业务模块（projects 示例）\n├── hooks/        全局主题与偏好\n├── layouts/      官网与后台两套布局\n├── pages/        页面与模板展示\n└── styles/       设计变量与布局样式`}</code>
          </pre>
          <p>基础组件不依赖业务模块；业务模块调用数据适配层；应用层把它们组合成页面。</p>
        </section>
        <section id="reuse">
          <h2>下一个项目，少做一些重复工作。</h2>
          <ol className="guide-steps">
            <li>
              <strong>复制一个干净的工程</strong>
              <p>
                在工程目录运行以下命令。它会跳过依赖、构建结果、测试报告和本地历史，且不会覆盖已有目录。
              </p>
              <div className="command-line">
                <code>{command}</code>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="复制创建工程命令"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(command)
                      toast.success('命令已复制')
                    } catch {
                      toast.error('复制失败，请手动选择命令')
                    }
                  }}
                >
                  <Copy />
                </Button>
              </div>
              <p>
                进入新目录后运行 <code>npm ci</code>，再运行 <code>npm run dev</code>。
              </p>
            </li>
            <li>
              <strong>换成自己的名字和主题</strong>
              <p>
                修改 <code>src/config/site.ts</code> 和 <code>src/styles/tokens.css</code>
                ，再调整首页文案。新工程的数据命名空间会自动独立。
              </p>
            </li>
            <li>
              <strong>用现有积木，写下一页</strong>
              <p>
                先查看组件实验室。在 <code>features/</code>{' '}
                新建业务模块，再向路由与导航配置添加入口。表单、列表和详情可以参考项目管理示例。
              </p>
            </li>
            <li>
              <strong>把本地演示换成真实接口</strong>
              <p>
                实现 <code>ProjectRepository</code>{' '}
                接口并替换本地适配器。接入后端时，需要另外实现服务端身份验证、权限与数据校验。
              </p>
            </li>
          </ol>
          <div className="guide-callout">
            <h3>和 finesse 一起保持一致</h3>
            <p>
              后续让 AI 修改页面时，先读取 <code>AGENTS.md</code>、<code>PRODUCT.md</code> 和{' '}
              <code>design-model.yaml</code>。优先复用现有组件，沿用主题变量，再补充缺失的部分。
            </p>
          </div>
        </section>
        <section id="references">
          <h2>参考开源，把基础做好。</h2>
          <p>
            以下项目提供了组件或结构思路。除了明确标注的 shadcn/ui
            组件，本工程的页面与业务示例为独立实现。
          </p>
          <div className="reference-list">
            {references.map(([title, description, url]) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
                <ArrowUpRight size={18} />
              </a>
            ))}
          </div>
          <p>
            许可证与具体引用范围见工程中的 <code>THIRD_PARTY_NOTICES.md</code>。
          </p>
        </section>
      </article>
    </div>
  )
}
