import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { enterDemoAdmin } from '@/app/actions/admin-session'
import { Logo } from '@/components/brand/logo'
import { DemoNotice } from '@/components/demo-notice'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Entrar no painel', robots: { index: false, follow: false } }

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-zinc-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-1 text-xl font-semibold">Painel administrativo</h1>
        <p className="mb-5 text-sm text-muted-foreground">Acesso restrito a funcionários da pastelaria.</p>
        <DemoNotice title="Autenticação ainda não integrada" className="mb-5">
          O login real (e-mail e senha de funcionários) será feito com Supabase Auth. Por enquanto, entre em modo
          demonstração — todos os dados exibidos são fictícios.
        </DemoNotice>
        <form action={enterDemoAdmin}>
          <Button type="submit" size="lg" className="h-11 w-full">
            <ShieldCheck aria-hidden="true" /> Entrar em modo demonstração
          </Button>
        </form>
        <Link href="/" className="mt-4 block text-center text-sm text-muted-foreground hover:underline">
          Voltar ao site
        </Link>
      </div>
    </main>
  )
}
