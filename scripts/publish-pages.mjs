import { cp, mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const remote = 'https://github.com/Yourfirstroad/agent-path.git'
function git(cwd, args, accepted = [0]) {
  const result = spawnSync(
    'git',
    ['-c', 'http.proxy=', '-c', 'https.proxy=', '-c', 'credential.interactive=never', ...args],
    {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never' },
    },
  )
  if (!accepted.includes(result.status)) throw new Error(`Git ${args[0]} failed: ${result.stderr}`)
  return { status: result.status, output: result.stdout.trim() }
}
if (git(root, ['remote', 'get-url', 'origin']).output !== remote)
  throw new Error('发布目标与项目仓库不一致。')
if (git(root, ['status', '--porcelain']).output)
  throw new Error('请先审核并提交源码，再发布同一版本。')
const sourceCommit = git(root, ['rev-parse', 'HEAD']).output
const dist = path.join(root, 'dist-pages')
const index = await readFile(path.join(dist, 'index.html'), 'utf8')
if (!index.includes('/agent-path/assets/')) throw new Error('请先运行 npm run build:pages。')
for (const entry of await readdir(dist, { withFileTypes: true })) {
  if (
    !['index.html', 'favicon.svg', 'curriculum.json', 'assets', 'downloads'].includes(entry.name)
  ) {
    throw new Error(`发布目录含意外文件：${entry.name}`)
  }
}
const downloads = await readdir(path.join(dist, 'downloads'))
if (downloads.length !== 1 || downloads[0] !== 'agent-labs.zip')
  throw new Error('下载目录仅允许经过核对的实战 ZIP。')
const curriculum = JSON.parse(await readFile(path.join(dist, 'curriculum.json'), 'utf8'))
if ('state' in curriculum || !Array.isArray(curriculum.lessons))
  throw new Error('课程导出内容不正确。')
const work = path.join(root, 'work')
await mkdir(work, { recursive: true })
const target = await mkdtemp(path.join(work, 'pages-publish-'))
git(target, ['init', '-b', 'publish'])
git(target, ['remote', 'add', 'origin', remote])
const exists = git(target, ['ls-remote', '--exit-code', '--heads', 'origin', 'gh-pages'], [0, 2])
if (exists.status === 0) {
  git(target, ['fetch', '--depth', '1', 'origin', 'gh-pages'])
  git(target, ['checkout', '-b', 'gh-pages', 'FETCH_HEAD'])
}
await cp(dist, target, { recursive: true })
await writeFile(path.join(target, '.nojekyll'), '')
await writeFile(
  path.join(target, 'release.json'),
  JSON.stringify({
    source_commit: sourceCommit,
    published_at: new Date().toISOString(),
    edition: 'pages',
  }) + '\n',
)
git(target, ['config', 'user.name', git(root, ['config', 'user.name']).output])
git(target, ['config', 'user.email', git(root, ['config', 'user.email']).output])
git(target, ['add', '--all'])
git(target, ['commit', '-m', `Deploy online learning edition from ${sourceCommit.slice(0, 7)}`])
git(target, ['push', 'origin', 'HEAD:gh-pages'])
console.log(
  `Published source ${sourceCommit.slice(0, 7)} to gh-pages. Site: https://yourfirstroad.github.io/agent-path/`,
)
