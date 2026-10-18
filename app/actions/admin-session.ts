'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE = 'admin_demo_session'

export async function enterDemoAdmin() {
  const store = await cookies()
  store.set(COOKIE, '1', { httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: 60 * 60 * 8 })
  redirect('/admin')
}

export async function leaveDemoAdmin() {
  const store = await cookies()
  store.delete(COOKIE)
  redirect('/admin/entrar')
}
