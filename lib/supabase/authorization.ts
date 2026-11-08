import { redirect } from 'next/navigation'
import { createClient } from './server'

export type StaffPermissionCode =
  | 'dashboard.access'
  | 'staff.profile.read'
  | 'staff.profile.manage'
  | 'staff.role.assign'
  | 'staff.audit.read'
  | 'operations.orders.read'
  | 'operations.orders.manage'
  | 'operations.preparations.read'
  | 'operations.preparations.manage'
  | 'operations.tables.read'
  | 'operations.tables.manage'
  | 'operations.deliveries.read'
  | 'operations.deliveries.manage'
  | 'operations.deliveries.read_assigned'
  | 'operations.deliveries.manage_assigned'

// Keep authorization fail-closed until local migrations and pgTAP checks have been run and reviewed.
const STAFF_AUTHORIZATION_TESTED = false

export async function hasAuthenticatedIdentity() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims()

    if (error || !data || typeof data.claims.sub !== 'string' || data.claims.sub.length === 0) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export async function hasStaffPermission(permissionCode: StaffPermissionCode): Promise<boolean> {
  if (!(await hasAuthenticatedIdentity())) {
    return false
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('has_staff_permission', {
      p_permission_code: permissionCode,
    })

    return !error && data === true
  } catch {
    return false
  }
}

export async function requireAdminAuthorization(permissionCode: StaffPermissionCode): Promise<void> {
  if (!(await hasAuthenticatedIdentity())) {
    redirect('/admin/entrar')
  }

  if (!STAFF_AUTHORIZATION_TESTED) {
    throw new Error('A autorização administrativa permanece bloqueada até a migração e os testes RLS serem validados.')
  }

  if (!(await hasStaffPermission(permissionCode))) {
    throw new Error('Acesso administrativo negado para a permissão solicitada.')
  }
}
