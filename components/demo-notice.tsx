import { FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DemoBadge({ className, children = 'Demonstração' }: { className?: string; children?: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-dashed border-current px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      <FlaskConical className="size-3" aria-hidden="true" />
      {children}
    </span>
  )
}

export function DemoNotice({ title = 'Modo demonstração', children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn('flex gap-3 rounded-xl border border-dashed border-amber-500/60 bg-amber-50 p-3 text-sm text-amber-950', className)}
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">{title}</p>
        <div className="text-pretty text-amber-900">{children}</div>
      </div>
    </div>
  )
}
