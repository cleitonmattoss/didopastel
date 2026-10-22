'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Bike, ChefHat, Printer, Store, UtensilsCrossed, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ORDER_STATUS_TONE, PAYMENT_STATUS_TONE, selectClass } from '@/lib/admin'
import { formatBRL, formatTime } from '@/lib/format'
import { ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from '@/lib/labels'
import type { Delivery, Order, OrderStatus, OrderType } from '@/lib/types'
import { useDemoOperations } from '@/components/demo-operations-provider'
import { ConfirmAction, EmptyState, PageHeader, StatusPill, inputClass, useDemoFlash } from './admin-ui'

const COLUMNS: OrderStatus[] = ['recebido', 'em_preparo', 'pronto', 'saiu_para_entrega', 'falha_entrega']
const TYPE_ICON = { entrega: Bike, retirada: Store, local: UtensilsCrossed } as const

function nextStatus(order: Order): OrderStatus | null {
  switch (order.status) {
    case 'recebido': return 'em_preparo'
    case 'em_preparo': return 'pronto'
    case 'pronto': return order.type === 'entrega' ? 'saiu_para_entrega' : 'concluido'
    case 'saiu_para_entrega': return 'concluido'
    default: return null
  }
}

export function OrdersBoard({ initialOrders, initialDeliveries }: { initialOrders: Order[]; initialDeliveries: Delivery[] }) {
  const { orders: sharedOrders, deliveries: sharedDeliveries, initialize, updateOrders, updateDeliveries } = useDemoOperations()
  const orders = sharedOrders ?? initialOrders
  const deliveries = sharedDeliveries ?? initialDeliveries
  const [typeFilter, setTypeFilter] = useState<OrderType | 'todos'>('todos')
  const [view, setView] = useState<'preparo' | 'historico'>('preparo')
  const { flash, node } = useDemoFlash()

  useEffect(() => initialize(initialOrders, initialDeliveries), [initialize, initialOrders, initialDeliveries])

  const filtered = orders.filter((o) => typeFilter === 'todos' || o.type === typeFilter)

  function advance(order: Order) {
    if (order.status === 'cancelado' || deliveries.some((delivery) => delivery.orderNumber === order.number && delivery.status === 'cancelada')) return
    const next = nextStatus(order)
    if (!next) return
    updateOrders((prev) => prev.map((o) => (o.number === order.number ? { ...o, status: next } : o)))
    flash(`Pedido #${order.number}: ${ORDER_STATUS_LABEL[next]}.`)
  }

  function cancel(order: Order, reason: string) {
    // Regra: se o pagamento online já foi aprovado, o cancelamento gera reembolso pendente e o estoque reservado é liberado.
    updateOrders((prev) =>
      prev.map((o) =>
        o.number === order.number
          ? { ...o, status: 'cancelado', cancelReason: reason, paymentStatus: o.paymentStatus === 'aprovado' ? 'reembolso_pendente' : o.paymentStatus }
          : o,
      ),
    )
    updateDeliveries((prev) => prev.map((delivery) => delivery.orderNumber === order.number
      ? { ...delivery, status: 'cancelada', updatedAt: new Date().toISOString() }
      : delivery))
    flash(`Pedido #${order.number} cancelado. Reserva de estoque liberada.`)
  }

  return (
    <>
      <PageHeader
        title="Pedidos e preparo"
        description="Fila da cozinha em tempo real (atualização automática após integração)."
        actions={
          <>
            <div role="tablist" aria-label="Visualização" className="inline-flex rounded-lg border bg-white p-0.5">
              {(['preparo', 'historico'] as const).map((v) => (
                <button
                  key={v}
                  role="tab"
                  type="button"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className="h-8 rounded-md px-3 text-sm font-medium aria-selected:bg-zinc-900 aria-selected:text-white"
                >
                  {v === 'preparo' ? 'Fila de preparo' : 'Todos os pedidos'}
                </button>
              ))}
            </div>
            <label className="sr-only" htmlFor="type-filter">Filtrar por tipo</label>
            <select id="type-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as OrderType | 'todos')} className={selectClass}>
              <option value="todos">Todos os tipos</option>
              <option value="entrega">Entrega</option>
              <option value="retirada">Retirada</option>
              <option value="local">Consumo no local</option>
            </select>
          </>
        }
      />

      {view === 'preparo' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {COLUMNS.map((status) => {
            const column = filtered.filter((o) => o.status === status)
            return (
              <section key={status} aria-labelledby={`col-${status}`} className="flex flex-col rounded-xl border bg-zinc-100/70">
                <h2 id={`col-${status}`} className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold">
                  {ORDER_STATUS_LABEL[status]}
                  <span className="rounded-full bg-white px-2 text-xs tabular-nums">{column.length}</span>
                </h2>
                <div className="flex flex-col gap-2 p-2 pt-0">
                  {column.length === 0 ? (
                    <EmptyState title="Nenhum pedido" icon={ChefHat} />
                  ) : (
                    column.map((o) => <OrderCard key={o.number} order={o} onAdvance={advance} onCancel={cancel} />)
                  )}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          {filtered.length === 0 ? (
            <EmptyState title="Nenhum pedido encontrado" description="Ajuste o filtro de tipo." />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-4 py-2 font-medium">Pedido</th>
                  <th className="px-4 py-2 font-medium">Hora</th>
                  <th className="px-4 py-2 font-medium">Cliente</th>
                  <th className="px-4 py-2 font-medium">Tipo</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Pagamento</th>
                  <th className="px-4 py-2 text-right font-medium">Total</th>
                  <th className="px-4 py-2"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((o) => (
                  <tr key={o.number}>
                    <td className="px-4 py-2.5 font-medium">#{o.number}</td>
                    <td className="px-4 py-2.5 tabular-nums">{formatTime(o.createdAt)}</td>
                    <td className="px-4 py-2.5">{o.customerName}</td>
                    <td className="px-4 py-2.5">{ORDER_TYPE_LABEL[o.type]}{o.tableNumber && ` · Mesa ${o.tableNumber}`}</td>
                    <td className="px-4 py-2.5">
                      <StatusPill tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</StatusPill>
                      {o.cancelReason && <p className="mt-0.5 text-xs text-muted-foreground">{o.cancelReason}</p>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="block text-xs text-muted-foreground">{PAYMENT_METHOD_LABEL[o.paymentMethod]}</span>
                      <StatusPill tone={PAYMENT_STATUS_TONE[o.paymentStatus]}>{PAYMENT_STATUS_LABEL[o.paymentStatus]}</StatusPill>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatBRL(o.totalCents)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/admin/pedidos/${o.number}/imprimir`} className="inline-grid size-8 place-items-center rounded-lg hover:bg-zinc-100" aria-label={`Imprimir pedido ${o.number}`}>
                        <Printer className="size-4" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {node}
    </>
  )
}

function OrderCard({ order, onAdvance, onCancel }: { order: Order; onAdvance: (o: Order) => void; onCancel: (o: Order, reason: string) => void }) {
  const [reason, setReason] = useState('')
  const next = nextStatus(order)
  const Icon = TYPE_ICON[order.type]

  return (
    <article className="rounded-lg border bg-white p-3 shadow-xs">
      <header className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">#{order.number}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icon className="size-3" aria-hidden="true" />
            {ORDER_TYPE_LABEL[order.type]}{order.tableNumber && ` · Mesa ${order.tableNumber}`} · {formatTime(order.createdAt)}
          </p>
        </div>
        <Link href={`/admin/pedidos/${order.number}/imprimir`} className="grid size-8 place-items-center rounded-lg hover:bg-zinc-100" aria-label={`Imprimir pedido ${order.number}`}>
          <Printer className="size-4" aria-hidden="true" />
        </Link>
      </header>
      <ul className="mb-2 flex flex-col gap-0.5 text-sm">
        {order.items.map((i, idx) => (
          <li key={idx}>
            <strong>{i.quantity}×</strong> {i.productName}
            {i.flavorName && <span className="text-muted-foreground"> · {i.flavorName}</span>}
            {i.comboSelections?.map((s) => <span key={s} className="block pl-5 text-xs text-muted-foreground">{s}</span>)}
            {i.notes && <span className="block pl-5 text-xs font-medium text-amber-700">Obs.: {i.notes}</span>}
          </li>
        ))}
      </ul>
      {order.notes && <p className="mb-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-900">{order.notes}</p>}
      <div className="mb-3 flex items-center justify-between text-xs">
        <StatusPill tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</StatusPill>
        <span className="font-semibold tabular-nums">{formatBRL(order.totalCents)}</span>
      </div>
      <div className="flex gap-2">
        {next && (
          <Button size="sm" className="flex-1" onClick={() => onAdvance(order)}>
            {ORDER_STATUS_LABEL[next]} <ArrowRight aria-hidden="true" />
          </Button>
        )}
        <ConfirmAction
          trigger={<Button size="icon-sm" variant="outline" aria-label={`Cancelar pedido ${order.number}`}><X aria-hidden="true" /></Button>}
          title={`Cancelar pedido #${order.number}?`}
          confirmLabel="Cancelar pedido"
          onConfirm={() => onCancel(order, reason.trim() || 'Sem motivo informado')}
          description={
            <span className="flex flex-col gap-3">
              <span>
                A reserva de estoque será liberada.
                {order.paymentStatus === 'aprovado' && ' O pagamento online já foi aprovado: o reembolso ficará pendente.'}
              </span>
              <label className="flex flex-col gap-1 text-left text-foreground">
                <span className="text-xs font-medium">Motivo do cancelamento</span>
                <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} maxLength={120} />
              </label>
            </span>
          }
        />
      </div>
    </article>
  )
}
