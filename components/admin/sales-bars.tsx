import { formatBRL } from '@/lib/format'

export function SalesBars({ data }: { data: { day: string; totalCents: number }[] }) {
  const max = Math.max(...data.map((d) => d.totalCents), 1)
  return (
    <figure>
      <div className="flex h-48 items-end gap-2" role="list" aria-label="Vendas por dia">
        {data.map((d) => (
          <div key={d.day} role="listitem" className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] tabular-nums text-muted-foreground sm:text-xs">
              {d.totalCents ? formatBRL(d.totalCents).replace(',00', '') : '—'}
            </span>
            <div
              className="w-full max-w-12 rounded-t-md bg-brand-red"
              style={{ height: `${Math.max((d.totalCents / max) * 100, d.totalCents ? 4 : 1)}%` }}
              aria-label={`${d.day}: ${formatBRL(d.totalCents)}`}
            />
            <span className="text-xs font-medium">{d.day}</span>
          </div>
        ))}
      </div>
      <figcaption className="sr-only">Gráfico de barras com o faturamento por dia da semana.</figcaption>
    </figure>
  )
}
