import { useState } from 'react'
import { Check, Monitor, Moon, Palette, Save, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader, Panel } from '@/components/shared'
import { usePreferences } from '@/hooks/use-preferences'

export function AppearanceControls() {
  const { preferences, update } = usePreferences()
  return (
    <>
      <fieldset className="appearance-field">
        <legend>外观模式</legend>
        <div className="theme-options">
          {(['light', 'dark'] as const).map((theme) => (
            <button
              key={theme}
              className={`theme-option ${preferences.theme === theme ? 'selected' : ''}`}
              aria-pressed={preferences.theme === theme}
              onClick={() => update({ theme })}
            >
              <span className={`theme-preview ${theme}`}>
                <span className="preview-rail" />
                <span className="preview-cells">
                  <i />
                  <i />
                  <i />
                </span>
              </span>
              <span>
                {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'light' ? '浅色 · 纸与光' : '深色 · 夜间专注'}
                {preferences.theme === theme && <Check size={16} />}
              </span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="appearance-field">
        <legend>品牌强调色</legend>
        <div className="color-options">
          {(
            [
              { value: 'clay', label: '陶土橙' },
              { value: 'forest', label: '森林绿' },
              { value: 'indigo', label: '靛青蓝' },
            ] as const
          ).map((c) => (
            <button
              key={c.value}
              className={`color-option ${preferences.accent === c.value ? 'selected' : ''}`}
              aria-pressed={preferences.accent === c.value}
              onClick={() => update({ accent: c.value })}
            >
              <span className={`swatch ${c.value}`} />
              {c.label}
              {preferences.accent === c.value && <Check size={15} />}
            </button>
          ))}
        </div>
      </fieldset>
    </>
  )
}
export default function Settings() {
  const { preferences, update } = usePreferences()
  const [name, setName] = useState(preferences.name)
  return (
    <>
      <PageHeader
        title="让这里，更像你。"
        description="一次调整，官网与后台同步生效。偏好自动保存在当前浏览器。"
      />
      <div className="settings-layout">
        <div>
          <Panel title="外观与主题">
            <AppearanceControls />
          </Panel>
          <Panel title="工作空间">
            <form
              className="workspace-name-form"
              onSubmit={(e) => {
                e.preventDefault()
                if (update({ name: name.trim() })) toast.success('工作空间名称已保存')
              }}
            >
              <div className="field">
                <label htmlFor="workspace-name">工作空间名称</label>
                <Input
                  id="workspace-name"
                  value={name}
                  maxLength={30}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="field-hint">显示在后台侧边栏，最多 30 个字。</p>
              </div>
              <Button type="submit">
                <Save size={16} />
                保存名称
              </Button>
            </form>
          </Panel>
        </div>
        <aside className="settings-aside">
          <Palette size={28} />
          <h2>自己的设计语言</h2>
          <p>从一个强调色开始，再慢慢建立自己的组件与页面。</p>
          <div>
            <Monitor size={18} />
            <span>官网与后台共享主题</span>
          </div>
          <div>
            <Check size={18} />
            <span>刷新后保留偏好</span>
          </div>
          <p className="small-note">
            这里调整的是当前浏览器偏好。复制工程后的默认主题，可以在主题文件中修改。
          </p>
        </aside>
      </div>
    </>
  )
}
