create table if not exists public.pairing_codes (
  code text primary key,
  device_id text not null,
  device_name text not null,
  device_type text not null check (device_type in ('parent', 'child')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.paired_devices (
  id uuid primary key default gen_random_uuid(),
  parent_device_id text not null,
  child_device_id text not null,
  child_name text not null,
  device_name text not null,
  paired_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  is_online boolean not null default true,
  unique (parent_device_id, child_device_id)
);

create index if not exists pairing_codes_expiry_idx on public.pairing_codes (expires_at);
create index if not exists paired_devices_parent_idx on public.paired_devices (parent_device_id);
create index if not exists paired_devices_child_idx on public.paired_devices (child_device_id);

alter table public.pairing_codes enable row level security;
alter table public.paired_devices enable row level security;
revoke all on public.pairing_codes, public.paired_devices from anon, authenticated;

create or replace function public.create_pairing_code(
  p_code text,
  p_device_id text,
  p_device_name text,
  p_device_type text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_created_at timestamptz := now();
  v_expires_at timestamptz := now() + interval '5 minutes';
begin
  if p_code !~ '^[A-Z0-9]{6,12}$' or p_device_id = '' or p_device_type not in ('parent', 'child') then
    raise exception 'Invalid pairing code details';
  end if;

  delete from public.pairing_codes where expires_at <= now();
  insert into public.pairing_codes (code, device_id, device_name, device_type, created_at, expires_at)
  values (p_code, p_device_id, coalesce(nullif(p_device_name, ''), 'Device'), p_device_type, v_created_at, v_expires_at);

  return jsonb_build_object('code', p_code, 'expiresAt', v_expires_at, 'createdAt', v_created_at);
end;
$$;

create or replace function public.pair_child_with_parent_code(
  p_code text,
  p_child_device_id text,
  p_child_name text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code public.pairing_codes%rowtype;
  v_device public.paired_devices%rowtype;
begin
  select * into v_code from public.pairing_codes where code = p_code for update;
  if not found or v_code.expires_at <= now() or v_code.device_type <> 'parent' then
    raise exception 'Invalid or expired parent pairing code';
  end if;
  delete from public.pairing_codes where code = p_code;

  insert into public.paired_devices (parent_device_id, child_device_id, child_name, device_name, paired_at, last_seen, is_online)
  values (v_code.device_id, p_child_device_id, coalesce(nullif(p_child_name, ''), 'Child Device'), coalesce(nullif(p_child_name, ''), 'Child Device'), now(), now(), true)
  on conflict (parent_device_id, child_device_id) do update
    set child_name = excluded.child_name, device_name = excluded.device_name, paired_at = now(), last_seen = now(), is_online = true
  returning * into v_device;

  return jsonb_build_object(
    'success', true,
    'parentDeviceId', v_device.parent_device_id,
    'parentDeviceName', v_code.device_name,
    'childDeviceId', v_device.child_device_id,
    'childName', v_device.child_name,
    'pairedAt', v_device.paired_at
  );
end;
$$;

create or replace function public.pair_parent_with_child_code(
  p_code text,
  p_parent_device_id text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code public.pairing_codes%rowtype;
  v_device public.paired_devices%rowtype;
begin
  select * into v_code from public.pairing_codes where code = p_code for update;
  if not found or v_code.expires_at <= now() or v_code.device_type <> 'child' then
    raise exception 'Invalid or expired child pairing code';
  end if;
  delete from public.pairing_codes where code = p_code;

  insert into public.paired_devices (parent_device_id, child_device_id, child_name, device_name, paired_at, last_seen, is_online)
  values (p_parent_device_id, v_code.device_id, coalesce(nullif(v_code.device_name, ''), 'Child Device'), coalesce(nullif(v_code.device_name, ''), 'Child Device'), now(), now(), true)
  on conflict (parent_device_id, child_device_id) do update
    set child_name = excluded.child_name, device_name = excluded.device_name, paired_at = now(), last_seen = now(), is_online = true
  returning * into v_device;

  return jsonb_build_object(
    'success', true,
    'childDeviceId', v_device.child_device_id,
    'childName', v_device.child_name,
    'pairedAt', v_device.paired_at
  );
end;
$$;

create or replace function public.get_paired_devices(p_parent_device_id text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', d.id,
    'parentDeviceId', d.parent_device_id,
    'childDeviceId', d.child_device_id,
    'childName', d.child_name,
    'deviceName', d.device_name,
    'pairedAt', d.paired_at,
    'lastSeen', d.last_seen,
    'isOnline', d.last_seen > now() - interval '2 minutes'
  ) order by d.paired_at), '[]'::jsonb)
  from public.paired_devices d
  where d.parent_device_id = p_parent_device_id;
$$;

create or replace function public.unpair_device(p_parent_device_id text, p_child_device_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.paired_devices
  where parent_device_id = p_parent_device_id and child_device_id = p_child_device_id;
  get diagnostics v_deleted = row_count;
  return jsonb_build_object('success', true, 'removed', v_deleted > 0);
end;
$$;

create or replace function public.record_child_heartbeat(p_child_device_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_seen integer;
  v_now timestamptz := now();
begin
  update public.paired_devices set last_seen = v_now, is_online = true where child_device_id = p_child_device_id;
  get diagnostics v_seen = row_count;
  return jsonb_build_object('success', true, 'childDeviceId', p_child_device_id, 'lastSeen', v_now, 'updated', v_seen > 0);
end;
$$;

revoke all on function public.create_pairing_code(text, text, text, text) from public, anon, authenticated;
revoke all on function public.pair_child_with_parent_code(text, text, text) from public, anon, authenticated;
revoke all on function public.pair_parent_with_child_code(text, text) from public, anon, authenticated;
revoke all on function public.get_paired_devices(text) from public, anon, authenticated;
revoke all on function public.unpair_device(text, text) from public, anon, authenticated;
revoke all on function public.record_child_heartbeat(text) from public, anon, authenticated;

grant execute on function public.create_pairing_code(text, text, text, text) to anon, authenticated;
grant execute on function public.pair_child_with_parent_code(text, text, text) to anon, authenticated;
grant execute on function public.pair_parent_with_child_code(text, text) to anon, authenticated;
grant execute on function public.get_paired_devices(text) to anon, authenticated;
grant execute on function public.unpair_device(text, text) to anon, authenticated;
grant execute on function public.record_child_heartbeat(text) to anon, authenticated;
