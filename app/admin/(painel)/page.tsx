import Link from 'next/link'
import { AlertTriangle, Banknote, ChefHat, Receipt, UtensilsCrossed } from 'lucide-react'
import { Panel, PageHeader, StatCard, StatusPill } from '@/components/admin/admin-ui'
import { SalesBars } from '@/components/admin/sales-bars'
import { DemoNotice } from '@/components/demo-notice'
import { ORDER_STATUS_TONE, productLabel, stockLevel } from '@/lib/admin'
import { orders, salesByDay, stock, tables } from '@/lib/demo-data'
import { formatBRL, formatTime } from '@/lib/format'
import { ORDER_STATUS_LABEL, ORDER_TYPE_LABEL } from '@/lib/labels'

export const metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  const valid = orders.filter((o) => o.status !== 'cancelado')
  const revenue = valid.reduce((sum, o) => sum + o.totalCents, 0)
  const inKitchen = orders.filter((o) => o.status === 'recebido' || o.status === 'em_preparo').length
  const busyTables = tables.filter((t) => t.status !== 'livre').length
  const lowStock = stock.filter((s) => stockLevel(s).tone !== 'success')

  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral do dia." />
      <DemoNotice className="mb-6">Indicadores calculados a partir de pedidos fictícios.</DemoNotice>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Faturamento do dia" value={formatBRL(revenue)} hint="Sem pedidos cancelados" icon={Banknote} />
        <StatCard label="Pedidos" value={String(orders.length)} hint={`Ticket médio ${formatBRL(valid.length ? Math.round(revenue / valid.length) : 0)}`} icon={Receipt} />
        <StatCard label="Na cozinha" value={String(inKitchen)} hint="Recebidos + em preparo" icon={ChefHat} />
        <StatCard label="Mesas ocupadas" value={`${busyTables}/${tables.length}`} icon={UtensilsCrossed} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Panel title="Vendas da semana">
          <div className="p-4">
            <SalesBars data={salesByDay} />
          </div>
        </Panel>

        <Panel title="Alertas de estoque" actions={<Link href="/admin/estoque" className="text-sm text-muted-foreground hover:underline">Ver estoque</Link>}>
          {lowStock.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Nenhum item abaixo do mínimo.</p>
          ) : (
            <ul className="divide-y">
              {lowStock.map((s) => {
                const { productName, flavorName } = productLabel(s.productId, s.flavorId)
                const level = stockLevel(s)
                return (
                  <li key={`${s.productId}-${s.flavorId}`} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-amber-600" aria-hidden="true" />
                      {productName}{flavorName && ` · ${flavorName}`}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="tabular-nums text-muted-foreground">{s.quantity - s.reserved} un.</span>
                      <StatusPill tone={level.tone}>{level.label}</StatusPill>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Pedidos recentes" className="mt-6" actions={<Link href="/admin/pedidos" className="text-sm text-muted-foreground hover:underline">Ver todos</Link>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="px-4 py-2 font-medium">Pedido</th>
                <th className="px-4 py-2 font-medium">Hora</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.slice(0, 6).map((o) => (
                <tr key={o.number}>
                  <td className="px-4 py-2.5 font-medium">#{o.number}</td>
                  <td className="px-4 py-2.5 tabular-nums">{formatTime(o.createdAt)}</td>
                  <td className="px-4 py-2.5">{o.customerName}</td>
                  <td className="px-4 py-2.5">{ORDER_TYPE_LABEL[o.type]}</td>
                  <td className="px-4 py-2.5"><StatusPill tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</StatusPill></td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{formatBRL(o.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
