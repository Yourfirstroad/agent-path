-- Run once in a dedicated Supabase Free project; no personal records are seeded.
begin;

create table if not exists public.ap_lessons (
  id text primary key, position integer unique not null, answer integer not null check (answer between 0 and 2)
);
create table if not exists public.ap_projects (id text primary key);
create table if not exists public.ap_progress (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null,
  previous_progress jsonb,
  revision bigint not null default 0,
  last_lesson_id text,
  updated_at timestamptz not null default now()
);
create table if not exists public.ap_reminder_keys (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  token_hash text unique not null check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

alter table public.ap_lessons enable row level security;
alter table public.ap_projects enable row level security;
alter table public.ap_progress enable row level security;
alter table public.ap_reminder_keys enable row level security;
drop policy if exists ap_progress_owner on public.ap_progress;
create policy ap_progress_owner on public.ap_progress for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists ap_reminder_owner on public.ap_reminder_keys;
create policy ap_reminder_owner on public.ap_reminder_keys for select to authenticated using (owner_id = (select auth.uid()));
revoke all on public.ap_lessons, public.ap_projects, public.ap_progress, public.ap_reminder_keys from public, anon, authenticated;
grant select on public.ap_progress to authenticated;

create or replace function public.ap_empty_progress() returns jsonb
language sql immutable set search_path = '' as $$
  select '{"version":1,"lessons":{},"projects":{},"settings":{"daily_minutes":60}}'::jsonb;
$$;

create or replace function public.ap_validate_progress(p_value jsonb) returns jsonb
language plpgsql set search_path = '' as $$
declare
  item record; value jsonb; result jsonb := public.ap_empty_progress();
  correct_answer integer; complete boolean;
begin
  if p_value is null or jsonb_typeof(p_value) <> 'object' or octet_length(p_value::text) > 200000
    or p_value->'version' is distinct from '1'::jsonb
    or jsonb_typeof(p_value->'lessons') is distinct from 'object'
    or jsonb_typeof(p_value->'projects') is distinct from 'object'
    or jsonb_typeof(p_value->'settings') is distinct from 'object'
    or exists(select 1 from jsonb_object_keys(p_value) as key where key not in ('version','lessons','projects','settings')) then
    raise exception '无效的进度格式；云端未修改';
  end if;
  value := p_value->'settings';
  if value->'daily_minutes' not in ('30'::jsonb,'60'::jsonb,'90'::jsonb)
    or value->'daily_minutes' is null
    or exists(select 1 from jsonb_object_keys(value) as key where key <> 'daily_minutes') then
    raise exception '无效的每日学习时长';
  end if;
  result := jsonb_set(result, '{settings}', value);
  for item in select * from jsonb_each(p_value->'lessons') loop
    value := item.value;
    select answer into correct_answer from public.ap_lessons where id = item.key;
    if not found then raise exception '未知课程'; end if;
    if jsonb_typeof(value) <> 'object'
      or jsonb_typeof(value->'checks') is distinct from 'array'
      or value->'answer' is null
      or value->'answer' not in ('null'::jsonb,'0'::jsonb,'1'::jsonb,'2'::jsonb)
      or exists(select 1 from jsonb_object_keys(value) as key where key not in ('checks','answer','completed_at')) then
      raise exception '课程进度格式不正确；不接受笔记或额外字段';
    end if;
    if jsonb_array_length(value->'checks') <> 3
      or exists(select 1 from jsonb_array_elements(value->'checks') as check_value where jsonb_typeof(check_value) <> 'boolean') then
      raise exception '课程验收必须是三个布尔值';
    end if;
    complete := value->'checks' = '[true,true,true]'::jsonb and value->'answer' = to_jsonb(correct_answer);
    result := jsonb_set(result, array['lessons',item.key], jsonb_build_object(
      'checks',value->'checks','answer',value->'answer',
      'completed_at',case when complete then to_jsonb(now()) else 'null'::jsonb end
    ));
  end loop;
  for item in select * from jsonb_each(p_value->'projects') loop
    value := item.value;
    if not exists(select 1 from public.ap_projects where id = item.key) then raise exception '未知项目'; end if;
    if jsonb_typeof(value) <> 'object' or jsonb_typeof(value->'checks') is distinct from 'array'
      or exists(select 1 from jsonb_object_keys(value) as key where key <> 'checks') then
      raise exception '项目进度格式不正确';
    end if;
    if jsonb_array_length(value->'checks') <> 4
      or exists(select 1 from jsonb_array_elements(value->'checks') as check_value where jsonb_typeof(check_value) <> 'boolean') then
      raise exception '项目验收必须是四个布尔值';
    end if;
    result := jsonb_set(result,array['projects',item.key],value);
  end loop;
  return result;
end;
$$;

create or replace function public.ap_get_progress() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare item public.ap_progress; uid uuid := auth.uid();
begin
  if uid is null then raise exception '请先登录学习账号'; end if;
  select * into item from public.ap_progress where owner_id = uid;
  if not found then return jsonb_build_object('revision',0,'progress',public.ap_empty_progress(),'updated_at',null); end if;
  return jsonb_build_object('revision',item.revision,'progress',item.progress,'updated_at',item.updated_at);
end;
$$;

create or replace function public.ap_save_progress(p_expected_revision bigint, p_kind text, p_id text, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); item public.ap_progress; next_value jsonb; normalized jsonb;
begin
  if uid is null then raise exception '请先登录学习账号'; end if;
  insert into public.ap_progress(owner_id,progress) values(uid,public.ap_empty_progress()) on conflict do nothing;
  select * into item from public.ap_progress where owner_id = uid for update;
  if p_expected_revision is null or item.revision <> p_expected_revision then
    raise exception using errcode = 'P0001', message = 'AP_CONFLICT:其他设备已更新进度，请刷新后重试';
  end if;
  next_value := item.progress;
  if p_kind = 'lessons' then
    if jsonb_typeof(p_patch) <> 'object' or p_patch is null
      or exists(select 1 from jsonb_object_keys(p_patch) as key where key not in ('checks','answer')) then raise exception '无效的课程修改'; end if;
    next_value := jsonb_set(next_value,array['lessons',p_id],coalesce(next_value->'lessons'->p_id,'{"checks":[false,false,false],"answer":null,"completed_at":null}'::jsonb) || p_patch);
  elsif p_kind = 'projects' then
    next_value := jsonb_set(next_value,array['projects',p_id],p_patch);
  elsif p_kind = 'settings' then
    next_value := jsonb_set(next_value,'{settings}',p_patch);
  elsif p_kind = 'replace' then
    next_value := p_patch;
  else raise exception '不支持的进度操作';
  end if;
  normalized := public.ap_validate_progress(next_value);
  -- Preserve established completion timestamps; imported timestamps are never trusted.
  if p_kind <> 'replace' then
    select jsonb_set(normalized,'{lessons}',coalesce(jsonb_object_agg(key,
      case when value->'completed_at' <> 'null'::jsonb and item.progress->'lessons'->key->'completed_at' <> 'null'::jsonb
        then jsonb_set(value,'{completed_at}',item.progress->'lessons'->key->'completed_at') else value end),'{}'::jsonb))
      into normalized from jsonb_each(normalized->'lessons');
  end if;
  update public.ap_progress set progress = normalized, revision = revision + 1,
    previous_progress = case when p_kind = 'replace' then item.progress else previous_progress end,
    last_lesson_id = case when p_kind = 'lessons' then p_id else last_lesson_id end,
    updated_at = now() where owner_id = uid;
  return public.ap_get_progress();
end;
$$;

create or replace function public.ap_set_reminder_key(p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception '请先登录学习账号'; end if;
  if p_token is null or p_token !~ '^[A-Za-z0-9_-]{43}$' then raise exception '无效的提醒连接'; end if;
  insert into public.ap_reminder_keys(owner_id,token_hash) values(uid,encode(sha256(convert_to(p_token,'UTF8')),'hex'))
  on conflict(owner_id) do update set token_hash = excluded.token_hash, created_at = now();
  return jsonb_build_object('active',true);
end;
$$;

create or replace function public.ap_revoke_reminder_key() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception '请先登录学习账号'; end if;
  delete from public.ap_reminder_keys where owner_id = auth.uid();
end;
$$;

create or replace function public.ap_read_reminder_progress(p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid; item public.ap_progress; next_lesson text; count_done integer;
begin
  if p_token is null or p_token !~ '^[A-Za-z0-9_-]{43}$' then raise exception '提醒连接无效或已撤销'; end if;
  select owner_id into uid from public.ap_reminder_keys where token_hash = encode(sha256(convert_to(p_token,'UTF8')),'hex');
  if uid is null then raise exception '提醒连接无效或已撤销'; end if;
  select * into item from public.ap_progress where owner_id = uid;
  if not found then return jsonb_build_object('has_progress',false,'daily_minutes',60,'completed_count',0,'next_lesson_id','l01','updated_at',null); end if;
  select count(*) into count_done from public.ap_lessons lesson where
    item.progress->'lessons'->lesson.id->'checks' = '[true,true,true]'::jsonb and
    item.progress->'lessons'->lesson.id->'answer' = to_jsonb(lesson.answer);
  select lesson.id into next_lesson from public.ap_lessons lesson where not coalesce(
    item.progress->'lessons'->lesson.id->'checks' = '[true,true,true]'::jsonb and
    item.progress->'lessons'->lesson.id->'answer' = to_jsonb(lesson.answer),false)
    order by lesson.position limit 1;
  return jsonb_build_object('has_progress',true,'completed_count',count_done,
    'total_lessons',(select count(*) from public.ap_lessons), 'next_lesson_id',next_lesson,
    'last_lesson_id',item.last_lesson_id, 'next_lesson_progress',item.progress->'lessons'->next_lesson,
    'daily_minutes',item.progress->'settings'->'daily_minutes','updated_at',item.updated_at);
end;
$$;

revoke all on function public.ap_empty_progress(), public.ap_validate_progress(jsonb), public.ap_get_progress(),
  public.ap_save_progress(bigint,text,text,jsonb), public.ap_set_reminder_key(text), public.ap_revoke_reminder_key(), public.ap_read_reminder_progress(text)
  from public, anon, authenticated;
grant execute on function public.ap_get_progress(), public.ap_save_progress(bigint,text,text,jsonb),
  public.ap_set_reminder_key(text), public.ap_revoke_reminder_key() to authenticated;
grant execute on function public.ap_read_reminder_progress(text) to anon, authenticated;

commit;
