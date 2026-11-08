'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type LoginState = { error: string | null }

export async function signInWithPassword(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Informe seu e-mail e sua senha.' }
  }

  let supabase: Awaited<ReturnType<typeof createClient>>
  try {
    supabase = await createClient()
  } catch {
    return { error: 'A autenticação não está configurada neste ambiente.' }
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: 'Não foi possível entrar. Confira suas credenciais e tente novamente.' }
    }
  } catch {
    return { error: 'Não foi possível conectar ao serviço de autenticação. Tente novamente.' }
  }

  const cookieStore = await cookies()
  cookieStore.delete('admin_demo_session')
  redirect('/admin')
}

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Keep the logout flow available even if the Auth service cannot be reached.
  }

  const cookieStore = await cookies()
  cookieStore.delete('admin_demo_session')
  redirect('/admin/entrar')
}
