import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const venv = path.join(
  root,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
)
const python = existsSync(venv) ? venv : process.platform === 'win32' ? 'python' : 'python3'
const result = spawnSync(python, [path.join(root, 'scripts/export_curriculum.py')], {
  cwd: root,
  stdio: 'inherit',
})
if (result.error) console.error('无法启动 Python，请先安装 Python 3。')
process.exit(result.status ?? 1)
