import { cn } from '@/lib/utils'

/** Identidade tipográfica provisória da Di do Pastel. */
export function Logo({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-display leading-none', className)}>
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 -rotate-6 place-items-center rounded-full bg-brand-yellow text-lg text-brand-red ring-2 ring-brand-red"
      >
        Di
      </span>
      <span className="flex flex-col">
        <span className={cn('text-xs tracking-wide', tone === 'light' ? 'text-brand-red' : 'text-brand-yellow')}>
          Di do
        </span>
        <span className={cn('text-2xl', tone === 'light' ? 'text-brand-black' : 'text-white')}>Pastel</span>
      </span>
      <span className="sr-only">Di do Pastel</span>
    </span>
  )
}
