'use client'

import { useState } from 'react'
import { Inbox, type LucideIcon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ title, actions, children, className }: { title?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border bg-white', className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function EmptyState({ title, description, icon: Icon = Inbox, action }: { title: string; description?: string; icon?: LucideIcon; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-zinc-100">
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </span>
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  )
}

const TONES = {
  neutral: 'bg-zinc-100 text-zinc-700',
  info: 'bg-sky-100 text-sky-800',
  warning: 'bg-amber-100 text-amber-900',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
} as const

export type Tone = keyof typeof TONES

export function StatusPill({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap', TONES[tone])}>{children}</span>
}

/** Confirmação obrigatória para ações destrutivas (excluir, cancelar, reembolsar...). */
export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel = 'Confirmar',
  onConfirm,
  destructive = true,
}: {
  trigger: React.ReactElement
  title: string
  description: React.ReactNode
  confirmLabel?: string
  onConfirm: () => void
  destructive?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm()
              setOpen(false)
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function StatCard({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export const inputClass =
  'h-9 w-full rounded-lg border bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/** Exibe um aviso temporário de que a alteração ficou só na memória (demo). */
export function useDemoFlash() {
  const [message, setMessage] = useState<string | null>(null)
  function flash(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 3500)
  }
  const node = message ? (
    <p role="status" className="fixed right-4 bottom-4 z-50 max-w-sm rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white shadow-lg">
      {message} <span className="text-zinc-400">(demonstração — não salvo no banco)</span>
    </p>
  ) : null
  return { flash, node }
}
