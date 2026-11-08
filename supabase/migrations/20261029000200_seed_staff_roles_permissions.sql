-- Authorization catalog only. No staff accounts or employee profiles are created here.

insert into public.staff_roles (role_key, display_name) values
  ('owner', 'Proprietário'),
  ('manager', 'Gerente'),
  ('attendant', 'Atendente'),
  ('courier', 'Motoboy');

insert into public.staff_permissions (permission_code, description) values
  ('dashboard.access', 'Acessar a área administrativa'),
  ('staff.profile.read', 'Consultar perfis de funcionários'),
  ('staff.profile.manage', 'Criar, atualizar e desativar perfis de funcionários'),
  ('staff.role.assign', 'Atribuir ou alterar funções de funcionários'),
  ('staff.audit.read', 'Consultar o histórico de auditoria'),
  ('operations.orders.read', 'Consultar pedidos'),
  ('operations.orders.manage', 'Alterar pedidos e preparos'),
  ('operations.preparations.read', 'Consultar preparos'),
  ('operations.preparations.manage', 'Alterar preparos'),
  ('operations.tables.read', 'Consultar mesas'),
  ('operations.tables.manage', 'Alterar mesas'),
  ('operations.deliveries.read', 'Consultar entregas'),
  ('operations.deliveries.manage', 'Gerenciar entregas'),
  ('operations.deliveries.read_assigned', 'Consultar somente entregas atribuídas ao motoboy'),
  ('operations.deliveries.manage_assigned', 'Atualizar somente entregas atribuídas ao motoboy');

insert into public.staff_role_permissions (role_key, permission_code)
select 'owner', permission.permission_code
from public.staff_permissions as permission;

insert into public.staff_role_permissions (role_key, permission_code) values
  ('manager', 'dashboard.access'),
  ('manager', 'staff.profile.read'),
  ('manager', 'staff.profile.manage'),
  ('manager', 'staff.audit.read'),
  ('manager', 'operations.orders.read'),
  ('manager', 'operations.orders.manage'),
  ('manager', 'operations.preparations.read'),
  ('manager', 'operations.preparations.manage'),
  ('manager', 'operations.tables.read'),
  ('manager', 'operations.tables.manage'),
  ('manager', 'operations.deliveries.read'),
  ('manager', 'operations.deliveries.manage'),
  ('attendant', 'dashboard.access'),
  ('attendant', 'operations.orders.read'),
  ('attendant', 'operations.orders.manage'),
  ('attendant', 'operations.preparations.read'),
  ('attendant', 'operations.preparations.manage'),
  ('attendant', 'operations.tables.read'),
  ('attendant', 'operations.tables.manage'),
  ('attendant', 'operations.deliveries.read'),
  ('attendant', 'operations.deliveries.manage');

-- Courier permissions intentionally remain unassigned until delivery ownership and RLS exist.
