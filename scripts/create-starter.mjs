import { cp, mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const arg = process.argv[2]
if (!arg) {
  console.error('用法：npm run starter -- ../my-next-project')
  process.exit(1)
}
const destination = path.resolve(process.cwd(), arg)
const relative = path.relative(source, destination)
if (
  !relative ||
  (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
) {
  console.error('新工程必须放在源工程之外，避免递归复制。')
  process.exit(1)
}
try {
  await access(destination)
  console.error('目标目录已存在，为保护文件已停止。请选择一个新目录。')
  process.exit(1)
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}
// mkdir without recursive refuses even an empty existing directory.
await mkdir(destination)
const excluded = new Set([
  'node_modules',
  'dist',
  '.git',
  '.finesse',
  'test-results',
  'playwright-report',
  'artifacts',
  '.venv',
  'data',
  'work',
  '__pycache__',
])
await cp(source, destination, {
  recursive: true,
  force: false,
  errorOnExist: false,
  filter: (src) => {
    const rel = path.relative(source, src)
    return (
      !rel.split(path.sep).some((part) => excluded.has(part)) &&
      !rel.endsWith('.tsbuildinfo') &&
      !path.basename(rel).startsWith('.env') &&
      !/\.(?:sqlite[^.]*|db|pyc|log|pem|key)$/i.test(rel) &&
      !/^(?:agent-path-backup|before-import-).*\.json$/i.test(path.basename(rel))
    )
  },
})
const slug =
  path
    .basename(destination)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '') || 'my-react-project'
const namespace = `${slug}-${randomUUID().slice(0, 8)}`
const sourceRepository = await readFile(
  path.join(source, 'src/features/projects/repository.ts'),
  'utf8',
)
const currentNamespace = sourceRepository.match(/['"]([^'"]+):projects:v1['"]/)?.[1]
if (!currentNamespace) throw new Error('无法识别源工程的数据命名空间，请检查 repository.ts')
const packagePath = path.join(destination, 'package.json')
const pkg = JSON.parse(await readFile(packagePath, 'utf8'))
pkg.name = slug
await writeFile(packagePath, JSON.stringify(pkg, null, 2) + '\n')
const lockPath = path.join(destination, 'package-lock.json')
const lock = JSON.parse(await readFile(lockPath, 'utf8'))
lock.name = slug
if (lock.packages?.['']) lock.packages[''].name = slug
await writeFile(lockPath, JSON.stringify(lock, null, 2) + '\n')
for (const file of [
  'README.md',
  'index.html',
  'src/hooks/use-preferences.tsx',
  'src/features/projects/repository.ts',
  'tests/app.spec.ts',
  'scripts/audit.mjs',
]) {
  const target = path.join(destination, file)
  const contents = await readFile(target, 'utf8')
  await writeFile(target, contents.replaceAll(`${currentNamespace}:`, `${namespace}:`))
}
console.log(
  `已创建：${destination}\n存储命名空间：${namespace}\n下一步：进入该目录，运行 npm ci，然后运行 npm run dev。`,
)
