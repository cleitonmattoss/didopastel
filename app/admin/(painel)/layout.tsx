import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/admin-session'
import { hasAuthenticatedIdentity } from '@/lib/supabase/authorization'

export const metadata: Metadata = {
  title: { default: 'Painel', template: '%s · Painel Di do Pastel' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasAuthenticatedIdentity())) {
    redirect('/admin/entrar')
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-zinc-100 px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Acesso administrativo bloqueado</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Sua identidade foi autenticada, mas o sistema ainda não possui um cadastro confiável de funcionários e
          permissões. Nenhuma conta recebe acesso ao painel até essa autorização ser implementada.
        </p>
        <form action={signOut} className="mt-6">
          <button type="submit" className="h-10 rounded-lg bg-brand-red px-4 text-sm font-semibold text-white">
            Sair
          </button>
        </form>
      </section>
    </main>
  )
}
