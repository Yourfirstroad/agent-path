// Auth/HTTP are local fixtures; SQL and tenant isolation run on real PostgreSQL (WASM).
import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import type { BrowserContext } from '@playwright/test'
export const actors = {
  alice: { id: '00000000-0000-4000-8000-000000000001', email: 'alice@example.test' },
  bob: { id: '00000000-0000-4000-8000-000000000002', email: 'bob@example.test' },
}
export async function createCloudFixture() {
  const db = new PGlite()
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
    insert into auth.users values ('${actors.alice.id}'),('${actors.bob.id}');`)
  for (const file of ['001_progress_sync.sql', '002_curriculum.sql'])
    await db.exec(await readFile(`cloud/${file}`, 'utf8'))
  let chain: Promise<unknown> = Promise.resolve()
  let offline = false
  const methods: Record<string, string[]> = {
    ap_get_progress: [],
    ap_save_progress: ['p_expected_revision', 'p_kind', 'p_id', 'p_patch'],
    ap_set_reminder_key: ['p_token'],
    ap_revoke_reminder_key: [],
    ap_read_reminder_progress: ['p_token'],
  }
  async function rpc(owner: string | null, name: string, args: Record<string, unknown> = {}) {
    const operation = chain.then(async () => {
      await db.exec('reset role')
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [owner || ''])
      await db.exec(`set role ${owner ? 'authenticated' : 'anon'}`)
      if (!(name in methods)) throw new Error('unsupported fixture RPC')
      const values = methods[name].map((key) => args[key])
      const result = await db.query(
        `select public.${name}(${values.map((_, index) => '$' + (index + 1)).join(',')}) as value`,
        values,
      )
      return result.rows[0].value as any
    })
    chain = operation.catch(() => {})
    return operation
  }
  const user = (actor: typeof actors.alice) => ({
    ...actor,
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2026-10-28T00:00:00Z',
    email_confirmed_at: '2026-10-28T00:00:00Z',
    app_metadata: { provider: 'email' },
    user_metadata: {},
    identities: [],
  })
  const token = (id: string) =>
    [
      Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
      Buffer.from(
        JSON.stringify({
          sub: id,
          role: 'authenticated',
          aud: 'authenticated',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ).toString('base64url'),
      Buffer.from('fixture-signature-not-a-real-credential').toString('base64url'),
    ].join('.')
  async function attach(context: BrowserContext) {
    await context.route('https://agent-path-test.supabase.co/**', async (route) => {
      const request = route.request(),
        url = new URL(request.url())
      const headers = {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': '*',
        'content-type': 'application/json',
      }
      if (request.method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers, body: '{}' })
        return
      }
      if (url.pathname.startsWith('/auth/v1/token')) {
        const body = request.postDataJSON()
        const actor = Object.values(actors).find((actor) => actor.email === body.email)
        if (!actor || body.password !== 'fixture-password-only') {
          await route.fulfill({
            status: 400,
            headers,
            body: JSON.stringify({ message: 'Invalid login credentials' }),
          })
          return
        }
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify({
            access_token: token(actor.id),
            refresh_token: 'fixture-refresh-' + actor.id,
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: user(actor),
          }),
        })
        return
      }
      if (url.pathname === '/auth/v1/logout') {
        await route.fulfill({ status: 204, headers })
        return
      }
      let owner: string | null = null
      try {
        owner = JSON.parse(
          Buffer.from(
            request.headers().authorization.split(' ')[1].split('.')[1],
            'base64url',
          ).toString(),
        ).sub
      } catch {
        /* anonymous */
      }
      if (url.pathname === '/auth/v1/user') {
        const actor = Object.values(actors).find((actor) => actor.id === owner)
        await route.fulfill({
          status: actor ? 200 : 401,
          headers,
          body: JSON.stringify(actor ? user(actor) : { message: 'Unauthorized' }),
        })
        return
      }
      if (offline) {
        await route.abort('internetdisconnected')
        return
      }
      try {
        const result = await rpc(owner, url.pathname.split('/').pop()!, request.postDataJSON())
        await route.fulfill({ status: 200, headers, body: JSON.stringify(result ?? null) })
      } catch (error) {
        await route.fulfill({
          status: 400,
          headers,
          body: JSON.stringify({ code: 'P0001', message: (error as Error).message }),
        })
      }
    })
  }
  return {
    attach,
    rpc,
    setOffline: (value: boolean) => {
      offline = value
    },
    close: async () => {
      await chain
      await db.close()
    },
  }
}
