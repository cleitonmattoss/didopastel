-- Employee identities and permissions. Review the target project's existing schema before applying.
-- This migration intentionally fails if any of these object names already exist.

create schema if not exists private;

create table public.staff_roles (
  role_key text primary key
    check (role_key in ('owner', 'manager', 'attendant', 'courier')),
  display_name text not null,
  created_at timestamptz not null default now()
);

create table public.staff_permissions (
  permission_code text primary key
    check (permission_code ~ '^[a-z][a-z0-9_.-]{2,95}$'),
  description text not null,
  created_at timestamptz not null default now()
);

create table public.staff_role_permissions (
  role_key text not null references public.staff_roles(role_key) on delete cascade,
  permission_code text not null references public.staff_permissions(permission_code) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_key, permission_code)
);

create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  role_key text not null references public.staff_roles(role_key) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index staff_profiles_role_active_idx
  on public.staff_profiles (role_key, is_active);

create index staff_role_permissions_permission_idx
  on public.staff_role_permissions (permission_code, role_key);

create table public.staff_audit_log (
  event_id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action_code text not null check (action_code ~ '^[a-z][a-z0-9_.-]{2,95}$'),
  entity_type text not null check (entity_type ~ '^[a-z][a-z0-9_.-]{1,63}$'),
  entity_id text not null check (length(entity_id) between 1 and 160),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index staff_audit_log_created_at_idx
  on public.staff_audit_log (created_at desc);

create index staff_audit_log_actor_created_at_idx
  on public.staff_audit_log (actor_user_id, created_at desc);

create index staff_audit_log_entity_idx
  on public.staff_audit_log (entity_type, entity_id, created_at desc);

alter table public.staff_roles enable row level security;
alter table public.staff_permissions enable row level security;
alter table public.staff_role_permissions enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.staff_audit_log enable row level security;

-- Explicitly remove any default Data API grants. Read access is granted narrowly below.
revoke all on table
  public.staff_roles,
  public.staff_permissions,
  public.staff_role_permissions,
  public.staff_profiles,
  public.staff_audit_log
from public, anon, authenticated;

grant select on table public.staff_profiles to authenticated;
grant select on table public.staff_audit_log to authenticated;

create function private.staff_has_permission(p_permission_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.staff_profiles as profile
      join public.staff_role_permissions as role_permission
        on role_permission.role_key = profile.role_key
      join public.staff_permissions as permission
        on permission.permission_code = role_permission.permission_code
      where profile.user_id = (select auth.uid())
        and profile.is_active
        and permission.permission_code = p_permission_code
    );
$$;

revoke all on function private.staff_has_permission(text) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.staff_has_permission(text) to authenticated;

create function private.can_read_staff_profile(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and (
      p_user_id = (select auth.uid())
      or private.staff_has_permission('staff.profile.read')
    );
$$;

revoke all on function private.can_read_staff_profile(uuid) from public, anon, authenticated;
grant execute on function private.can_read_staff_profile(uuid) to authenticated;

-- Public RPC wrapper is SECURITY INVOKER; the narrowly-scoped helper lives in non-exposed schema.
create function public.has_staff_permission(p_permission_code text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.staff_has_permission(p_permission_code);
$$;

revoke all on function public.has_staff_permission(text) from public, anon, authenticated;
grant execute on function public.has_staff_permission(text) to authenticated;

create policy staff_profiles_read_self_or_authorized_staff
  on public.staff_profiles
  for select
  to authenticated
  using ((select private.can_read_staff_profile(user_id)));

create policy staff_audit_read_authorized_staff
  on public.staff_audit_log
  for select
  to authenticated
  using ((select private.staff_has_permission('staff.audit.read')));

create function private.set_staff_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_staff_profile_updated_at() from public, anon, authenticated;

create trigger staff_profiles_set_updated_at
  before update on public.staff_profiles
  for each row execute function private.set_staff_profile_updated_at();

create function private.audit_staff_profile_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_user_id uuid;
  event_action text;
  event_metadata jsonb;
begin
  if tg_op = 'INSERT' then
    affected_user_id := new.user_id;
    event_action := 'staff.profile.created';
    event_metadata := jsonb_build_object('role_key', new.role_key, 'is_active', new.is_active);
  elsif tg_op = 'DELETE' then
    affected_user_id := old.user_id;
    event_action := 'staff.profile.deleted';
    event_metadata := jsonb_build_object('role_key', old.role_key, 'is_active', old.is_active);
  else
    if old.role_key is not distinct from new.role_key
      and old.is_active is not distinct from new.is_active then
      return new;
    end if;

    affected_user_id := new.user_id;
    event_action := 'staff.profile.authorization_changed';
    event_metadata := jsonb_build_object(
      'old_role_key', old.role_key,
      'new_role_key', new.role_key,
      'old_is_active', old.is_active,
      'new_is_active', new.is_active
    );
  end if;

  insert into public.staff_audit_log (
    actor_user_id,
    action_code,
    entity_type,
    entity_id,
    metadata
  ) values (
    (select auth.uid()),
    event_action,
    'staff_profile',
    affected_user_id::text,
    event_metadata
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.audit_staff_profile_change() from public, anon, authenticated;

create trigger staff_profiles_audit_changes
  after insert or update or delete on public.staff_profiles
  for each row execute function private.audit_staff_profile_change();
