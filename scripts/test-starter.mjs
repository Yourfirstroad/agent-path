import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, access, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tempParent = await realpath(tmpdir())
const temporary = await mkdtemp(path.join(tempParent, 'foundry-verify-'))
const target = path.join(temporary, 'my-app')
const run = (destination) =>
  spawnSync(process.execPath, [path.join(source, 'scripts/create-starter.mjs'), destination], {
    cwd: source,
    encoding: 'utf8',
  })
try {
  const first = run(target)
  assert.equal(first.status, 0, first.stderr)
  assert.equal(JSON.parse(await readFile(path.join(target, 'package.json'), 'utf8')).name, 'my-app')
  assert.equal(
    JSON.parse(await readFile(path.join(target, 'package-lock.json'), 'utf8')).packages[''].name,
    'my-app',
  )
  for (const excluded of [
    'node_modules',
    'dist',
    '.git',
    'artifacts',
    'test-results',
    '.finesse',
    '.venv',
    'data',
    'work',
    '__pycache__',
  ]) {
    await assert.rejects(access(path.join(target, excluded)), `${excluded} must not be copied`)
  }
  const repo = await readFile(path.join(target, 'src/features/projects/repository.ts'), 'utf8')
  assert.ok(!repo.includes('foundry:projects:v1'))
  assert.match(repo, /my-app-[a-f0-9]{8}:projects:v1/)
  const html = await readFile(path.join(target, 'index.html'), 'utf8')
  assert.ok(!html.includes('foundry:preferences:v1'))
  assert.equal(run(target).status, 1, 'Existing directories must be refused')
  assert.equal(
    run(path.join(source, 'nested-copy-check')).status,
    1,
    'Nested destination must be refused',
  )
  assert.equal(run(source).status, 1, 'Source directory must be refused')
  const nextTarget = path.join(temporary, 'next-app')
  const next = spawnSync(
    process.execPath,
    [path.join(target, 'scripts/create-starter.mjs'), nextTarget],
    { cwd: target, encoding: 'utf8' },
  )
  assert.equal(next.status, 0, next.stderr)
  const nextRepository = await readFile(
    path.join(nextTarget, 'src/features/projects/repository.ts'),
    'utf8',
  )
  assert.match(nextRepository, /next-app-[a-f0-9]{8}:projects:v1/)
  assert.ok(!nextRepository.includes(repo.match(/my-app-[a-f0-9]{8}:projects:v1/)[0]))
  console.log(
    'PASS: clean copy, package/lock consistency, isolated data keys, existing/source/nested path protection',
  )
} finally {
  const resolved = await realpath(temporary)
  if (
    path.dirname(resolved) !== tempParent ||
    !path.basename(resolved).startsWith('foundry-verify-')
  ) {
    throw new Error('Refusing cleanup outside the verified temporary directory')
  }
  await rm(resolved, { recursive: true, force: true })
}
