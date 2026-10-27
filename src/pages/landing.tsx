import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Braces,
  Check,
  Layers,
  MousePointer2,
  MoveUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ModuleArt({ variant = 'hero' }: { variant?: 'hero' | 'small' }) {
  return (
    <div className={`module-art ${variant}`} aria-hidden="true">
      <div className="art-grid" />
      <span className="art-caption mono">BUILD SOMETHING YOURS.</span>
      <div className="art-block art-block-a">
        <span className="art-cutout" />
      </div>
      <div className="art-block art-block-b">
        <span />
        <span />
        <span />
      </div>
      <div className="art-block art-block-c">
        <span className="art-ring" />
      </div>
      <div className="art-block art-block-d">
        <MoveUpRight />
      </div>
      <span className="art-coordinate mono">F / 001</span>
      <span className="art-cross">+</span>
    </div>
  )
}

export default function Landing() {
  return (
    <>
      <section className="landing-hero site-width">
        <div className="hero-copy">
          <span className="release-chip">
            <span />
            个人前端基础工程 · v1.0
          </span>
          <h1>
            让想法，
            <br />
            有个<span className="accent-text">好起点。</span>
          </h1>
          <p>
            从一个展示页，到一整个工作台。
            <br />
            把常用的积木准备好，专注于你真正想做的事。
          </p>
          <div className="hero-actions">
            <Button size="lg" asChild>
              <Link to="/workspace">
                打开工作台 <ArrowUpRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/showcase">
                探索页面模板 <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="hero-footnote">
            <span>
              <Check size={14} />
              属于自己的组件
            </span>
            <span>
              <Check size={14} />
              从本地开始
            </span>
          </div>
        </div>
        <ModuleArt />
      </section>
      <div className="foundation-band site-width">
        <span>构建于你熟悉的工具</span>
        <div>
          <span>
            <Braces size={18} />
            React
          </span>
          <span className="tech-ts">
            TS <b>TypeScript</b>
          </span>
          <span>
            <Layers size={18} />
            Tailwind CSS
          </span>
          <span>
            <Box size={18} />
            shadcn/ui
          </span>
        </div>
        <span className="mono">OPEN TO POSSIBILITY ↗</span>
      </div>
      <section className="site-section site-width" id="templates">
        <div className="section-heading">
          <h2>
            两种场景。
            <br />
            <span className="muted-text">同一套好用的基础。</span>
          </h2>
          <p>
            对外，把你的作品讲清楚。
            <br />
            对内，让每天的工作更顺手。
          </p>
        </div>
        <div className="template-duo">
          <Link to="/workspace" className="template-tile tool-tile">
            <div className="tile-heading">
              <span>日常工作 / PRODUCT</span>
              <ArrowUpRight />
            </div>
            <div className="tile-illustration tools-illustration" aria-hidden="true">
              <div className="tool-shape">
                <Layers />
                <span>组织</span>
              </div>
              <span className="connector" />
              <div className="tool-shape">
                <MousePointer2 />
                <span>行动</span>
              </div>
              <span className="connector" />
              <div className="tool-shape">
                <Check />
                <span>完成</span>
              </div>
            </div>
            <h3>你的专属工作空间</h3>
            <p>项目列表、详情和编辑表单，串成一条完整流程。</p>
            <span className="tile-link">
              进入后台模板 <ArrowRight size={18} />
            </span>
          </Link>
          <Link to="/showcase" className="template-tile brand-tile">
            <div className="tile-heading">
              <span>对外表达 / BRAND</span>
              <ArrowUpRight />
            </div>
            <div className="brand-type-art" aria-hidden="true">
              <span>Make</span>
              <span>
                it yours<span className="type-spark">✳</span>
              </span>
            </div>
            <h3>让作品被看见</h3>
            <p>品牌首页与精选作品布局，给你的想法一个展示窗口。</p>
            <span className="tile-link">
              浏览展示模板 <ArrowRight size={18} />
            </span>
          </Link>
        </div>
      </section>
      <section className="reuse-section site-width">
        <div>
          <h2>
            从第一颗按钮，
            <br />
            到下一整个项目。
          </h2>
          <p>
            颜色、间距、状态与布局，都有自己的位置。
            <br />
            调整一次，让每个页面一起变得更好。
          </p>
          <Button variant="outline" asChild>
            <Link to="/workspace/components">
              探索组件实验室 <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className="reuse-list">
          {[
            ['共享基础', '主题变量、基础组件与交互状态，保持一致。'],
            ['分开布局', '后台侧边栏与官网导航，各自适合自己的场景。'],
            ['自由生长', '按业务模块组织代码，给未来的功能留出空间。'],
          ].map(([title, text]) => (
            <div key={title}>
              <Check size={20} />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="closing-banner site-width">
        <div>
          <p>下一次，不必从空白开始。</p>
          <h2>
            你的下一页，
            <br className="mobile-break" />
            现在开始。
          </h2>
        </div>
        <Button size="lg" asChild>
          <Link to="/guide">
            查看复用指南 <ArrowUpRight />
          </Link>
        </Button>
      </section>
    </>
  )
}
