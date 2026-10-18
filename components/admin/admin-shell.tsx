'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ExternalLink, LogOut, Menu } from 'lucide-react'
import { leaveDemoAdmin } from '@/app/actions/admin-session'
import { DemoBadge } from '@/components/demo-notice'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AdminNav } from './admin-nav'

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2 px-2">
        <span className="grid size-8 place-items-center rounded-md bg-brand-red font-display text-white">Di</span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold text-white">Di do Pastel</span>
          <span className="block text-xs text-zinc-400">Painel</span>
        </span>
      </Link>
      <AdminNav onNavigate={onNavigate} />
      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4">
        <Link href="/" target="_blank" className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-zinc-300 hover:bg-white/10">
          <ExternalLink className="size-4" aria-hidden="true" /> Ver site
        </Link>
        <form action={leaveDemoAdmin}>
          <button type="submit" className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm text-zinc-300 hover:bg-white/10">
            <LogOut className="size-4" aria-hidden="true" /> Sair
          </button>
        </form>
      </div>
    </div>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-dvh bg-zinc-50 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh bg-zinc-900 lg:block print:hidden">
        <SidebarContent />
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white px-4 print:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <button type="button" className="grid size-9 place-items-center rounded-lg border lg:hidden" aria-label="Abrir menu" />
              }
            >
              <Menu className="size-4" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-0 bg-zinc-900 p-0">
              <SheetTitle className="sr-only">Menu do painel</SheetTitle>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium text-muted-foreground">Administração</span>
          <DemoBadge className="ml-auto text-muted-foreground">Dados fictícios</DemoBadge>
          <span className="grid size-8 place-items-center rounded-full bg-zinc-200 text-xs font-semibold" aria-label="Usuário de demonstração">
            AD
          </span>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
