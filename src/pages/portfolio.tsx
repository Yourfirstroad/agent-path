import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Layers, SquareDashedMousePointer, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModuleArt } from './landing'

const templates = [
  {
    title: '品牌与产品首页',
    kind: 'brand',
    label: '品牌展示',
    description: '清晰表达产品，留下独特的第一印象。',
    to: '/',
    artwork: 'brand',
  },
  {
    title: '个人工作台',
    kind: 'product',
    label: '后台工具',
    description: '聚合项目状态与常用入口，开始今天的工作。',
    to: '/workspace',
    artwork: 'workspace',
  },
  {
    title: '项目列表与详情',
    kind: 'product',
    label: '后台工具',
    description: '搜索、筛选、查看与编辑，在同一条流程里完成。',
    to: '/workspace/projects',
    artwork: 'list',
  },
  {
    title: '作品集与模板目录',
    kind: 'brand',
    label: '品牌展示',
    description: '用有节奏的布局，展示你的精选内容。',
    to: '/showcase',
    artwork: 'portfolio',
  },
  {
    title: '偏好与设置',
    kind: 'product',
    label: '后台工具',
    description: '让主题与工作空间贴合自己的使用习惯。',
    to: '/workspace/settings',
    artwork: 'settings',
  },
]
export default function Portfolio() {
  const [filter, setFilter] = useState('all')
  return (
    <div className="site-width showcase-page">
      <div className="showcase-intro">
        <span className="section-index mono">THE STARTING COLLECTION</span>
        <h1>
          好用的页面，
          <br />
          <span className="accent-text">值得再用一次。</span>
        </h1>
        <p>从这里挑一个起点。每一个示例，都使用相同的主题与组件。</p>
      </div>
      <div className="filter-pills" role="group" aria-label="模板分类">
        {[
          ['all', '全部模板'],
          ['product', '后台工具'],
          ['brand', '品牌展示'],
        ].map(([value, label]) => (
          <Button
            key={value}
            variant={filter === value ? 'default' : 'ghost'}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="portfolio-grid">
        {templates
          .filter((t) => filter === 'all' || t.kind === filter)
          .map((t, i) => (
            <article className={`portfolio-item ${i === 0 ? 'featured' : ''}`} key={t.title}>
              <Link
                to={t.to}
                className={`portfolio-art ${t.artwork}`}
                aria-label={`预览${t.title}`}
              >
                {t.artwork === 'brand' ? (
                  <ModuleArt variant="small" />
                ) : t.artwork === 'portfolio' ? (
                  <span className="portfolio-word">
                    Selected
                    <br />
                    <i>works.</i>
                  </span>
                ) : (
                  <div className="abstract-art">
                    {t.artwork === 'workspace' ? (
                      <Layers />
                    ) : t.artwork === 'settings' ? (
                      <SlidersHorizontal />
                    ) : (
                      <SquareDashedMousePointer />
                    )}
                    <span className="art-orbit" />
                  </div>
                )}
                <span className="preview-chip">
                  打开预览 <ArrowUpRight size={16} />
                </span>
              </Link>
              <div className="portfolio-caption">
                <div>
                  <span>{t.label}</span>
                  <h2>
                    <Link to={t.to}>{t.title}</Link>
                  </h2>
                  <p>{t.description}</p>
                </div>
                <ArrowUpRight size={22} />
              </div>
            </article>
          ))}
      </div>
      <aside className="portfolio-note">
        <p>这是模板展示目录，所有内容均为示例。替换文案与业务数据后，就可以成为你的作品集。</p>
        <Link to="/guide" className="text-link">
          了解如何替换 <ArrowUpRight size={16} />
        </Link>
      </aside>
    </div>
  )
}
