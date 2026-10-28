import { PGlite } from '@electric-sql/pglite'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const db = new PGlite()
const alice = '00000000-0000-4000-8000-000000000001'
const bob = '00000000-0000-4000-8000-000000000002'
const token = 'A'.repeat(43),
  rotated = 'B'.repeat(43)
const blank = { version: 1, lessons: {}, projects: {}, settings: { daily_minutes: 60 } }
try {
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
    insert into auth.users values ('${alice}'),('${bob}');`)
  for (const file of ['001_progress_sync.sql', '002_curriculum.sql']) {
    await db.exec(await readFile(new URL(`../cloud/${file}`, import.meta.url), 'utf8'))
  }
  async function asUser(id, role = 'authenticated') {
    await db.exec('reset role')
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id || ''])
    await db.exec(`set role ${role}`)
  }
  async function rpc(name, args = []) {
    const placeholders = args.map((_, i) => `$${i + 1}`).join(',')
    const result = await db.query(`select public.${name}(${placeholders}) as value`, args)
    return result.rows[0].value
  }
  await asUser(null, 'anon')
  await assert.rejects(rpc('ap_get_progress'), /permission denied/)
  await assert.rejects(rpc('ap_read_reminder_progress', [token]), /无效/)
  await asUser(alice)
  assert.equal((await rpc('ap_get_progress')).revision, 0)
  let saved = await rpc('ap_save_progress', [
    0,
    'lessons',
    'l01',
    { checks: [true, true, true], answer: 0 },
  ])
  assert.equal(saved.progress.lessons.l01.completed_at, null)
  saved = await rpc('ap_save_progress', [1, 'lessons', 'l01', { answer: 1 }])
  assert.ok(saved.progress.lessons.l01.completed_at)
  const completed = saved.progress.lessons.l01.completed_at
  await assert.rejects(
    rpc('ap_save_progress', [1, 'settings', '', { daily_minutes: 90 }]),
    /AP_CONFLICT/,
  )
  assert.equal((await rpc('ap_get_progress')).revision, 2)
  for (const [kind, id, patch] of [
    ['lessons', 'l01', { note: 'private note must never upload' }],
    ['lessons', 'unknown', { answer: 1 }],
    ['lessons', 'l01', { checks: [true] }],
    ['settings', '', { daily_minutes: 45 }],
    ['projects', 'unknown', { checks: [true, true, true, true] }],
    ['replace', '', { ...blank, note: 'extra private field' }],
  ])
    await assert.rejects(rpc('ap_save_progress', [2, kind, id, patch]))
  saved = await rpc('ap_save_progress', [2, 'settings', '', { daily_minutes: 90 }])
  assert.equal(saved.progress.lessons.l01.completed_at, completed)
  await rpc('ap_set_reminder_key', [token])
  await assert.rejects(
    db.query('update public.ap_progress set revision = 999'),
    /permission denied/,
  )
  await asUser(bob)
  assert.equal((await rpc('ap_get_progress')).revision, 0)
  assert.equal((await db.query('select * from public.ap_progress')).rows.length, 0)
  await rpc('ap_save_progress', [0, 'settings', '', { daily_minutes: 30 }])
  await asUser(null, 'anon')
  const summary = await rpc('ap_read_reminder_progress', [token])
  assert.equal(summary.completed_count, 1)
  assert.equal(summary.next_lesson_id, 'l02')
  assert.equal(summary.daily_minutes, 90)
  assert.ok(!JSON.stringify(summary).includes('note'))
  await assert.rejects(db.query('select * from public.ap_progress'), /permission denied/)
  await asUser(alice)
  await rpc('ap_set_reminder_key', [rotated])
  await assert.rejects(rpc('ap_read_reminder_progress', [token]), /无效/)
  await rpc('ap_revoke_reminder_key')
  await assert.rejects(rpc('ap_read_reminder_progress', [rotated]), /无效/)
  const beforeReplace = await rpc('ap_get_progress')
  await rpc('ap_save_progress', [3, 'replace', '', blank])
  await db.exec('reset role')
  const original = await db.query(
    'select previous_progress from public.ap_progress where owner_id=$1',
    [alice],
  )
  assert.deepEqual(original.rows[0].previous_progress, beforeReplace.progress)
  const curriculum = JSON.parse(
    await readFile(new URL('../public/curriculum.json', import.meta.url), 'utf8'),
  )
  const keys = (
    await db.query('select id,position,answer from public.ap_lessons order by position')
  ).rows
  assert.deepEqual(
    keys,
    curriculum.lessons.map((lesson) => ({
      id: lesson.id,
      position: lesson.number,
      answer: lesson.quiz.answer,
    })),
  )
  console.log(
    'PASS: real PostgreSQL functions, tenant isolation, anonymous denial, revision conflicts, strict inputs, completion calculation, snapshots, summary-only reminder access and revocation; public course keys match.',
  )
} finally {
  await db.close()
}
