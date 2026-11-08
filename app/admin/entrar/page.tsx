import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { AdminLoginForm } from '@/components/admin/admin-login-form'

export const metadata: Metadata = { title: 'Entrar no painel', robots: { index: false, follow: false } }

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-zinc-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-1 text-xl font-semibold">Painel administrativo</h1>
        <p className="mb-5 text-sm text-muted-foreground">Entre com a conta fornecida pela administração.</p>
        <AdminLoginForm />
        <Link href="/" className="mt-4 block text-center text-sm text-muted-foreground hover:underline">
          Voltar ao site
        </Link>
      </div>
    </main>
  )
}
