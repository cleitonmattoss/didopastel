'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { getStoreStatus } from '@/lib/store-hours'
import type { StoreSettings } from '@/lib/types'
import { cn } from '@/lib/utils'

export function StoreStatusBar({ settings }: { settings: StoreSettings }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  if (!now) {
    return <div className="h-10 bg-brand-black" aria-hidden="true" />
  }

  const status = getStoreStatus(now, settings)

  return (
    <div
      role="status"
      className={cn(
        'flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-sm font-medium text-white',
        status.isOpen ? 'bg-success' : 'bg-brand-red',
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-4" aria-hidden="true" />
        {status.isOpen ? (
          <>
            <strong>Aberto agora</strong>
            {status.closesAt && <span>· até {status.closesAt}</span>}
          </>
        ) : (
          <>
            <strong>Fechado agora</strong>
            {status.exceptionLabel && <span>({status.exceptionLabel})</span>}
            {status.nextOpening && <span>· abrimos {status.nextOpening}</span>}
          </>
        )}
      </span>
      {status.isOpen && (
        <Link href="/cardapio" className="rounded-full bg-white px-3 py-0.5 text-success underline-offset-2 hover:underline">
          Faça seu pedido
        </Link>
      )}
      {settings.isDemo && (
        <span className="rounded-full border border-dashed border-white/70 px-2 text-xs">horários de demonstração</span>
      )}
    </div>
  )
}
