begin;

select plan(6);

create temporary table staff_authorization_test_users (
  test_case text primary key,
  user_id uuid not null unique
);

insert into staff_authorization_test_users (test_case, user_id) values
  ('inactive_owner', 'f0af5620-7c67-4a86-a5ed-ff9f03c73d91'),
  ('active_attendant', '876a5723-3fc5-4ac9-bf09-7eef929547e6'),
  ('active_owner', 'ddf877fd-a001-42c5-bf24-5bf91e993d11');

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data
)
select
  user_id,
  'authenticated',
  'authenticated',
  'authorization-test-' || user_id::text || '@example.test',
  '',
  now(),
  case when test_case = 'active_attendant' then '{"provider":"email","providers":["email"],"role":"owner"}'::jsonb
       else '{"provider":"email","providers":["email"]}'::jsonb end,
  '{"role":"owner"}'::jsonb
from staff_authorization_test_users;

insert into public.staff_profiles (user_id, role_key, is_active)
select user_id, 'owner', false
from staff_authorization_test_users
where test_case = 'inactive_owner';

insert into public.staff_profiles (user_id, role_key, is_active)
select user_id, 'attendant', true
from staff_authorization_test_users
where test_case = 'active_attendant';

insert into public.staff_profiles (user_id, role_key, is_active)
select user_id, 'owner', true
from staff_authorization_test_users
where test_case = 'active_owner';

set local request.jwt.claim.sub = '';
set local role anon;
select throws_ok(
  $$select public.has_staff_permission('dashboard.access')$$,
  '42501',
  null,
  'anonymous callers cannot invoke the permission RPC'
);
reset role;

set local request.jwt.claim.sub = 'f0af5620-7c67-4a86-a5ed-ff9f03c73d91';
set local role authenticated;
select is(
  public.has_staff_permission('dashboard.access'),
  false,
  'inactive employees receive no permissions'
);
reset role;

set local request.jwt.claim.sub = '876a5723-3fc5-4ac9-bf09-7eef929547e6';
set local role authenticated;
select is(
  public.has_staff_permission('staff.role.assign'),
  false,
  'attendants cannot assign roles even when Auth metadata claims owner'
);
reset role;

set local request.jwt.claim.sub = 'ddf877fd-a001-42c5-bf24-5bf91e993d11';
set local role authenticated;
select is(
  public.has_staff_permission('dashboard.access'),
  true,
  'active owner receives an explicitly mapped permission'
);
reset role;

select ok(
  not has_table_privilege('authenticated', 'public.staff_profiles', 'INSERT'),
  'authenticated callers cannot create or self-assign staff profiles'
);
select ok(
  not has_table_privilege('authenticated', 'public.staff_profiles', 'UPDATE'),
  'authenticated callers cannot change their own role or active state'
);

select * from finish();
rollback;
