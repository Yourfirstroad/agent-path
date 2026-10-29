import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Download, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Lesson } from './types'

function Code({ text, label }: { text: string; label: string }) {
  return (
    <div className="guide-code">
      <div className="guide-code-label">
        <span>{label}</span>
        <button
          className="text-action"
          aria-label={`复制${label}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text)
              toast.success('已复制，请按说明粘贴到对应位置')
            } catch {
              toast.error('复制失败，请手动选择内容复制')
            }
          }}
        >
          <Copy size={15} />
          复制
        </button>
      </div>
      <pre tabIndex={0} aria-label={label}>
        <code>{text}</code>
      </pre>
    </div>
  )
}

export function GuidedLesson({ lesson, lessons }: { lesson: Lesson; lessons: Lesson[] }) {
  const guide = lesson.guide!
  const [platform, setPlatform] = useState('windows')
  const command =
    platform === 'windows'
      ? guide.run
      : guide.run
          .replaceAll('.venv/Scripts/python.exe', '.venv/bin/python')
          .replaceAll('python -m venv', 'python3 -m venv')
          .replaceAll('python --version', 'python3 --version')
          .replaceAll('python hello.py', 'python3 hello.py')
  return (
    <div className="guided-lesson">
      <section className="guide-intro" aria-labelledby="guide-goal">
        <span className="eyebrow">手把手跟做 · 先运行，再理解</span>
        <h2 id="guide-goal">这节课，你会做出什么</h2>
        <p>{guide.intro}</p>
        <p className="caption">
          不要求一次学完。今天先做到“对照运行结果”，下次再看讲解和练习；完成状态由你亲自验证后勾选。
        </p>
        {guide.prerequisites.length > 0 && (
          <div className="guide-prerequisites">
            <span>还不熟？先补：</span>
            {guide.prerequisites.map((id) => (
              <Link key={id} to={`/learn/${id}`}>
                {lessons.find((l) => l.id === id)?.title || id}
                <ArrowRight size={13} />
              </Link>
            ))}
          </div>
        )}
      </section>
      <nav className="guide-nav" aria-label="本课跟做步骤">
        {[
          ['setup', '1 准备'],
          ['source', '2 代码'],
          ['run', '3 运行'],
          ['explain', '4 看懂'],
          ['practice', '5 改一次'],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#guide-${id}`}
            onClick={(e) => {
              e.preventDefault()
              const target = document.getElementById(`guide-${id}`)
              target?.focus({ preventScroll: true })
              target?.scrollIntoView({ block: 'start' })
            }}
          >
            {label}
          </a>
        ))}
      </nav>
      <section className="lesson-section guide-section" id="guide-setup" tabIndex={-1}>
        <h2>1. 准备文件与环境</h2>
        <p>{guide.before}</p>
        <div className="backup-actions">
          <a
            className="button primary"
            href={`${import.meta.env.BASE_URL}${guide.download}`}
            download
          >
            <Download size={16} />
            {lesson.lab ? '下载完整实战包' : '下载全套参考代码'}
          </a>
        </div>
        <p>
          完整解压后，打开 <code>{guide.folder}</code>{' '}
          文件夹。下列文件都是本课会用到的；也可以按文件名新建并复制代码。
        </p>
        <p className="caption">
          网页可以在手机阅读，Python / React
          实操请用电脑。命令输入终端，代码保存到对应文件；不要把命令粘进 .py 文件。
        </p>
      </section>
      <section className="lesson-section guide-section" id="guide-source" tabIndex={-1}>
        <h2>2. 完整参考代码</h2>
        <p className="muted-text">
          先原样运行成功。多文件项目请保留全部文件；下载包还附每课 README，方便离线对照。
        </p>
        <div className="guide-files">
          {guide.files.map((file, i) => (
            <details key={file.name} open={i === 0 && !lesson.lab}>
              <summary>
                {file.name}
                <span>{file.code.split('\n').length} 行 · 展开查看</span>
              </summary>
              <Code text={file.code} label={file.name} />
            </details>
          ))}
        </div>
      </section>
      <section className="lesson-section guide-section" id="guide-run" tabIndex={-1}>
        <h2>3. 运行，再对照结果</h2>
        <label className="field-label" htmlFor="guide-platform">
          你的电脑系统
        </label>
        <select id="guide-platform" value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="windows">Windows · PowerShell</option>
          <option value="unix">macOS / Linux · 终端</option>
        </select>
        <p className="caption">
          按顺序逐行执行。以 # 开头的是说明，不必输入；出现“第二个终端”时，保留第一个服务窗口。
        </p>
        <Code text={command} label="运行命令" />
        {platform === 'unix' && (
          <p className="caption">
            Git 课的 Set-Content 是 Windows 命令；macOS / Linux
            请用编辑器创建相同文件。依赖工具安装方法按各课准备说明。
          </p>
        )}
        <div className="guide-result">
          <h3>你应该看到</h3>
          <p>{guide.expected}</p>
        </div>
        <details className="guide-errors">
          <summary>结果不一样？先查这些地方</summary>
          <ul>
            {guide.pitfalls.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      </section>
      <section className="lesson-section guide-section" id="guide-explain" tabIndex={-1}>
        <h2>4. 这段代码为什么这样写</h2>
        {guide.explain.map((part, index) => (
          <div className="guide-explanation" key={part.anchor}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3>{part.anchor}</h3>
              <p>{part.text}</p>
            </div>
          </div>
        ))}
        <details className="guide-errors">
          <summary>再看本课概念小结</summary>
          {lesson.concepts.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </details>
      </section>
      <section className="lesson-section guide-section" id="guide-practice" tabIndex={-1}>
        <h2>5. 只改一处，亲手验证</h2>
        <p>{guide.challenge}</p>
        <details className="guide-solution">
          <summary>卡住时，展开参考答案</summary>
          <p>{guide.solution}</p>
        </details>
        <p className="guide-boundary">{guide.scope}</p>
        {guide.sources && (
          <div className="guide-prerequisites">
            <span>本次核对来源：</span>
            {guide.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                {source.title}
              </a>
            ))}
          </div>
        )}
        <p className="caption">
          本课教程核对日期：{guide.reviewed}。下方验收不会因阅读、复制或下载自动完成。
        </p>
      </section>
    </div>
  )
}
