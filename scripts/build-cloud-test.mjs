import { spawnSync } from 'node:child_process'
const env = {
  ...process.env,
  VITE_SUPABASE_URL: 'https://agent-path-test.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_local_fixture_only',
}
for (const args of [
  ['scripts/export-curriculum.mjs'],
  ['node_modules/typescript/bin/tsc', '-b'],
  ['node_modules/vite/bin/vite.js', 'build', '--mode', 'pages', '--outDir', 'work/cloud-preview'],
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
