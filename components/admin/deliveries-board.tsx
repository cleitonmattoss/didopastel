'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUp, Bike, Check, Clock3, MapPin, PackageCheck, Search, TriangleAlert as AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DELIVERY_STATUS_TONE, ORDER_STATUS_TONE, PAYMENT_STATUS_TONE, selectClass } from '@/lib/admin'
import { formatBRL, formatTime } from '@/lib/format'
import { DELIVERY_STATUS_LABEL, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from '@/lib/labels'
import type { Courier, Delivery, DeliveryStatus, Order, OrderStatus } from '@/lib/types'
import { useDemoOperations } from '@/components/demo-operations-provider'
import { ConfirmAction, EmptyState, PageHeader, Panel, StatCard, StatusPill, inputClass, useDemoFlash } from './admin-ui'

type DeliveryFilter = DeliveryStatus | 'todos'

const FILTERS: { value: DeliveryFilter; label: string }[] = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'aguardando_entregador', label: 'Aguardando motoboy' },
  { value: 'atribuida', label: 'Motoboy atribuído' },
  { value: 'em_rota', label: 'Em rota' },
  { value: 'entregue', label: 'Concluídas' },
  { value: 'falhou', label: 'Falha na entrega' },
  { value: 'cancelada', label: 'Canceladas' },
]

function orderStatusAfterDelivery(status: OrderStatus): OrderStatus {
  return status === 'pronto' || status === 'saiu_para_entrega' ? 'concluido' : status
}

export function DeliveriesBoard({
  initialDeliveries,
  initialOrders,
  couriers,
}: {
  initialDeliveries: Delivery[]
  initialOrders: Order[]
  couriers: Courier[]
}) {
  const { orders: sharedOrders, deliveries: sharedDeliveries, initialize, updateOrders, updateDeliveries } = useDemoOperations()
  const deliveryRows = sharedDeliveries ?? initialDeliveries
  const orders = sharedOrders ?? initialOrders
  const [deliveryOrder, setDeliveryOrder] = useState(initialDeliveries.map((delivery) => delivery.id))
  const [statusFilter, setStatusFilter] = useState<DeliveryFilter>('todos')
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { flash, node } = useDemoFlash()

  useEffect(() => initialize(initialOrders, initialDeliveries), [initialize, initialOrders, initialDeliveries])

  const orderByNumber = new Map(orders.map((order) => [order.number, order]))
  const sortByDeliveryOrder = (a: Delivery, b: Delivery) => {
    const aIndex = deliveryOrder.indexOf(a.id)
    const bIndex = deliveryOrder.indexOf(b.id)
    return (aIndex < 0 ? deliveryOrder.length : aIndex) - (bIndex < 0 ? deliveryOrder.length : bIndex)
  }
  const sortedDeliveries = [...deliveryRows].sort(sortByDeliveryOrder)
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
  const filtered = sortedDeliveries.filter((delivery) => {
    const order = orderByNumber.get(delivery.orderNumber)
    const matchesStatus = statusFilter === 'todos' || delivery.status === statusFilter
    const matchesQuery = !normalizedQuery ||
      delivery.orderNumber.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
      delivery.customerName.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
      order?.customerName.toLocaleLowerCase('pt-BR').includes(normalizedQuery)
    return matchesStatus && matchesQuery
  })
  const hasActiveFilters = statusFilter !== 'todos' || normalizedQuery.length > 0
  const activeDeliveries = sortedDeliveries.filter((delivery) => delivery.status !== 'entregue' && delivery.status !== 'cancelada')
  const stats = [
    { label: 'Entregas pendentes', value: deliveryRows.filter((delivery) => delivery.status !== 'entregue' && delivery.status !== 'cancelada').length, icon: <Bike className="size-4 text-muted-foreground" aria-hidden="true" /> },
    { label: 'Aguardando motoboy', value: deliveryRows.filter((delivery) => delivery.status === 'aguardando_entregador').length, icon: <Clock3 className="size-4 text-muted-foreground" aria-hidden="true" /> },
    { label: 'Em rota', value: deliveryRows.filter((delivery) => delivery.status === 'em_rota').length, icon: <MapPin className="size-4 text-muted-foreground" aria-hidden="true" /> },
    { label: 'Entregas concluídas', value: deliveryRows.filter((delivery) => delivery.status === 'entregue').length, icon: <PackageCheck className="size-4 text-muted-foreground" aria-hidden="true" /> },
  ]

  function updateCourier(delivery: Delivery, courierId: string) {
    if (delivery.status === 'entregue' || delivery.status === 'cancelada' || orderByNumber.get(delivery.orderNumber)?.status === 'cancelado') return
    let nextStatus: DeliveryStatus = delivery.status
    if (courierId && (delivery.status === 'aguardando_entregador' || delivery.status === 'falhou')) {
      nextStatus = 'atribuida'
    } else if (!courierId && (delivery.status === 'atribuida' || delivery.status === 'em_rota')) {
      nextStatus = 'aguardando_entregador'
    }
    updateDeliveries((current) => current.map((row) => row.id === delivery.id
      ? { ...row, courierId: courierId || null, status: nextStatus, updatedAt: new Date().toISOString() }
      : row))
    flash(courierId ? `Motoboy atualizado no pedido #${delivery.orderNumber}.` : `Motoboy removido do pedido #${delivery.orderNumber}.`)
  }

  function dispatch(delivery: Delivery) {
    const order = orderByNumber.get(delivery.orderNumber)
    const orderCanDispatch = order?.status === 'pronto' || order?.status === 'saiu_para_entrega' || order?.status === 'falha_entrega'
    if (delivery.status !== 'atribuida' || !delivery.courierId || !orderCanDispatch) return
    updateDeliveries((current) => current.map((row) => row.id === delivery.id
      ? { ...row, status: 'em_rota', updatedAt: new Date().toISOString() }
      : row))
    updateOrders((current) => current.map((row) => row.number === delivery.orderNumber ? { ...row, status: 'saiu_para_entrega' } : row))
    flash(`Pedido #${delivery.orderNumber} saiu para entrega.`)
  }

  function complete(delivery: Delivery) {
    if (delivery.status !== 'em_rota' || !delivery.courierId || orderByNumber.get(delivery.orderNumber)?.status !== 'saiu_para_entrega') return
    updateDeliveries((current) => current.map((row) => row.id === delivery.id
      ? { ...row, status: 'entregue', updatedAt: new Date().toISOString() }
      : row))
    updateOrders((current) => current.map((row) => row.number === delivery.orderNumber
      ? { ...row, status: orderStatusAfterDelivery(row.status) }
      : row))
    flash(`Entrega do pedido #${delivery.orderNumber} concluída.`)
  }

  function fail(delivery: Delivery) {
    if (delivery.status !== 'em_rota' || !delivery.courierId || orderByNumber.get(delivery.orderNumber)?.status !== 'saiu_para_entrega') return
    updateDeliveries((current) => current.map((row) => row.id === delivery.id
      ? { ...row, status: 'falhou', updatedAt: new Date().toISOString() }
      : row))
    updateOrders((current) => current.map((row) => row.number === delivery.orderNumber ? { ...row, status: 'falha_entrega' } : row))
    flash(`Tentativa de entrega do pedido #${delivery.orderNumber} marcada como falha.`)
  }

  function retry(delivery: Delivery) {
    if (delivery.status !== 'falhou' || orderByNumber.get(delivery.orderNumber)?.status !== 'falha_entrega') return
    const nextStatus: DeliveryStatus = delivery.courierId ? 'atribuida' : 'aguardando_entregador'
    updateDeliveries((current) => current.map((row) => row.id === delivery.id
      ? { ...row, status: nextStatus, updatedAt: new Date().toISOString() }
      : row))
    flash(delivery.courierId
      ? `Pedido #${delivery.orderNumber} voltou para a fila de saída.`
      : `Pedido #${delivery.orderNumber} voltou para a fila de atribuição.`)
  }

  function reassign(delivery: Delivery) {
    if (delivery.status !== 'falhou' || orderByNumber.get(delivery.orderNumber)?.status !== 'falha_entrega') return
    updateDeliveries((current) => current.map((row) => row.id === delivery.id
      ? { ...row, courierId: null, status: 'aguardando_entregador', updatedAt: new Date().toISOString() }
      : row))
    flash(`Pedido #${delivery.orderNumber} voltou para a fila de atribuição.`)
  }

  function cancel(delivery: Delivery) {
    if (delivery.status !== 'falhou' || orderByNumber.get(delivery.orderNumber)?.status !== 'falha_entrega') return
    updateDeliveries((current) => current.map((row) => row.id === delivery.id
      ? { ...row, status: 'cancelada', updatedAt: new Date().toISOString() }
      : row))
    updateOrders((current) => current.map((row) => row.number === delivery.orderNumber
      ? {
          ...row,
          status: 'cancelado',
          cancelReason: 'Entrega cancelada após falha na entrega',
          paymentStatus: row.paymentStatus === 'aprovado' ? 'reembolso_pendente' : row.paymentStatus,
        }
      : row))
    flash(`Pedido #${delivery.orderNumber} cancelado após falha na entrega.`)
  }

  function moveDelivery(delivery: Delivery, direction: -1 | 1) {
    if (hasActiveFilters) return
    const currentIndex = activeDeliveries.findIndex((row) => row.id === delivery.id)
    const target = activeDeliveries[currentIndex + direction]
    if (currentIndex < 0 || !target) return
    setDeliveryOrder((current) => {
      const next = [...current, ...activeDeliveries.map((row) => row.id).filter((id) => !current.includes(id))]
      const fromIndex = next.indexOf(delivery.id)
      const toIndex = next.indexOf(target.id)
      ;[next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]]
      return next
    })
    flash(`Ordem da entrega #${delivery.orderNumber} atualizada.`)
  }

  return (
    <>
      <PageHeader
        title="Entregas"
        description="Organize a fila, atribua motoboys e acompanhe cada pedido até a conclusão."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} value={String(stat.value)} />)}
      </div>

      <Panel
        title="Fila de entregas"
        actions={<span className="max-w-sm text-right text-xs text-muted-foreground">Demonstração · alterações ficam em memória e são compartilhadas entre as telas nesta navegação; ao recarregar, os dados voltam ao exemplo inicial.</span>}
      >
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Buscar por número do pedido ou nome do cliente</span>
            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar pedido ou cliente"
              className={`${inputClass} pl-9`}
            />
          </label>
          <label className="sm:w-56">
            <span className="sr-only">Filtrar entregas por status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as DeliveryFilter)} className={`${selectClass} w-full`}>
              {FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
            </select>
          </label>
        </div>

        {hasActiveFilters && (
          <p className="border-b px-4 py-2 text-xs text-muted-foreground">
            Ordenação manual desativada enquanto a busca ou um filtro estiver ativo. Limpe a busca e selecione “Todos os status” para ordenar a fila.
          </p>
        )}

        {filtered.length === 0 ? (
          <EmptyState title="Nenhuma entrega encontrada" description="Tente outro nome, número de pedido ou status." icon={Bike} />
        ) : (
          <>
            <div className="divide-y md:hidden">
              {filtered.map((delivery) => {
                const order = orderByNumber.get(delivery.orderNumber)
                return (
                  <DeliveryCard
                    key={delivery.id}
                    delivery={delivery}
                    order={order}
                    couriers={couriers}
                    expanded={expandedId === delivery.id}
                    onToggleDetails={() => setExpandedId(expandedId === delivery.id ? null : delivery.id)}
                    onCourierChange={(courierId) => updateCourier(delivery, courierId)}
                    onDispatch={() => dispatch(delivery)}
                    onComplete={() => complete(delivery)}
                    onFail={() => fail(delivery)}
                    onRetry={() => retry(delivery)}
                    onReassign={() => reassign(delivery)}
                    onCancel={() => cancel(delivery)}
                    onMove={(direction) => moveDelivery(delivery, direction)}
                    canMoveUp={!hasActiveFilters && activeDeliveries[0]?.id !== delivery.id}
                    canMoveDown={!hasActiveFilters && delivery.status !== 'entregue' && delivery.status !== 'cancelada' && activeDeliveries.at(-1)?.id !== delivery.id}
                  />
                )
              })}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1120px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-4 py-3 font-medium">Pedido</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Endereço</th>
                    <th className="px-4 py-3 font-medium">Valor e pagamento</th>
                    <th className="px-4 py-3 font-medium">Motoboy</th>
                    <th className="px-4 py-3 font-medium">Entrega</th>
                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((delivery) => {
                    const order = orderByNumber.get(delivery.orderNumber)
                    return (
                      <DesktopDeliveryRow
                        key={delivery.id}
                        delivery={delivery}
                        order={order}
                        couriers={couriers}
                        expanded={expandedId === delivery.id}
                        onToggleDetails={() => setExpandedId(expandedId === delivery.id ? null : delivery.id)}
                        onCourierChange={(courierId) => updateCourier(delivery, courierId)}
                        onDispatch={() => dispatch(delivery)}
                        onComplete={() => complete(delivery)}
                        onFail={() => fail(delivery)}
                        onRetry={() => retry(delivery)}
                        onReassign={() => reassign(delivery)}
                        onCancel={() => cancel(delivery)}
                        onMove={(direction) => moveDelivery(delivery, direction)}
                        canMoveUp={!hasActiveFilters && activeDeliveries[0]?.id !== delivery.id}
                        canMoveDown={!hasActiveFilters && delivery.status !== 'entregue' && delivery.status !== 'cancelada' && activeDeliveries.at(-1)?.id !== delivery.id}
                      />
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>
      {node}
    </>
  )
}

type DeliveryActionsProps = {
  delivery: Delivery
  order?: Order
  couriers: Courier[]
  onCourierChange: (courierId: string) => void
  onDispatch: () => void
  onComplete: () => void
  onFail: () => void
  onRetry: () => void
  onReassign: () => void
  onCancel: () => void
  onMove: (direction: -1 | 1) => void
  canMoveUp: boolean
  canMoveDown: boolean
}

function CourierSelect({ delivery, couriers, onChange }: { delivery: Delivery; couriers: Courier[]; onChange: (id: string) => void }) {
  return (
    <label className="block min-w-40">
      <span className="sr-only">Motoboy do pedido {delivery.orderNumber}</span>
      <select
        value={delivery.courierId ?? ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={delivery.status === 'entregue' || delivery.status === 'cancelada'}
        className={`${selectClass} w-full max-w-52 disabled:bg-zinc-100 disabled:text-muted-foreground`}
      >
        <option value="">Atribuir motoboy</option>
        {couriers.map((courier) => (
          <option key={courier.id} value={courier.id} disabled={!courier.active && courier.id !== delivery.courierId}>
            {courier.name}{courier.active ? '' : ' (inativo)'}
          </option>
        ))}
      </select>
    </label>
  )
}

function DeliveryActionButtons({ delivery, order, onDispatch, onComplete, onFail, onRetry, onReassign, onCancel, onMove, canMoveUp, canMoveDown }: DeliveryActionsProps) {
  const orderCanDispatch = order?.status === 'pronto' || order?.status === 'saiu_para_entrega' || order?.status === 'falha_entrega'
  const canDispatch = delivery.status === 'atribuida' && !!delivery.courierId && orderCanDispatch
  const needsReadyOrder = delivery.status === 'atribuida' && !orderCanDispatch
  const canComplete = delivery.status === 'em_rota' && !!delivery.courierId
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {delivery.status !== 'entregue' && delivery.status !== 'cancelada' && (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => onMove(-1)} disabled={!canMoveUp} aria-label={`Mover pedido ${delivery.orderNumber} para cima`} title="Mover para cima">
            <ArrowUp aria-hidden="true" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onMove(1)} disabled={!canMoveDown} aria-label={`Mover pedido ${delivery.orderNumber} para baixo`} title="Mover para baixo">
            <ArrowDown aria-hidden="true" />
          </Button>
        </>
      )}
      {delivery.status === 'em_rota' ? (
        <>
          <Button type="button" size="sm" onClick={onComplete} disabled={!canComplete} title={!canComplete ? 'Atribua um motoboy para concluir.' : undefined}><Check aria-hidden="true" /> Concluir</Button>
          <Button type="button" size="sm" variant="destructive" onClick={onFail} disabled={!canComplete} title={!canComplete ? 'Atribua um motoboy para registrar a tentativa.' : undefined}><AlertTriangle aria-hidden="true" /> Registrar falha</Button>
        </>
      ) : delivery.status === 'falhou' ? (
        <>
          <Button type="button" size="sm" onClick={onRetry}><ArrowRight aria-hidden="true" /> Tentar novamente</Button>
          <Button type="button" size="sm" variant="outline" onClick={onReassign}>Reatribuir</Button>
          <ConfirmAction
            trigger={<Button type="button" size="sm" variant="destructive">Cancelar</Button>}
            title={`Cancelar pedido #${delivery.orderNumber}?`}
            confirmLabel="Cancelar pedido"
            onConfirm={onCancel}
            description={<>O pedido inteiro será cancelado. Se o pagamento já estiver aprovado, ficará marcado como reembolso pendente. Nenhum pagamento será processado nesta demonstração.</>}
          />
        </>
      ) : delivery.status !== 'entregue' && delivery.status !== 'cancelada' ? (
        <Button
          type="button"
          size="sm"
          onClick={onDispatch}
          disabled={!canDispatch}
          title={needsReadyOrder ? 'O pedido precisa estar pronto para sair.' : undefined}
        >
          Saiu para entrega <ArrowRight aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  )
}

function OrderDetails({ order }: { order?: Order }) {
  if (!order) return <p className="text-sm text-muted-foreground">Detalhes do pedido não disponíveis na demonstração.</p>
  return (
    <div className="space-y-2 text-sm">
      <p className="font-medium">Itens do pedido</p>
      <ul className="space-y-1">
        {order.items.map((item, index) => (
          <li key={`${item.productId}-${index}`}>
            {item.quantity}× {item.productName}{item.flavorName && <span className="text-muted-foreground"> · {item.flavorName}</span>}
            {item.comboSelections?.map((selection) => <span key={selection} className="block pl-5 text-xs text-muted-foreground">{selection}</span>)}
            {item.notes && <span className="block pl-5 text-xs text-amber-800">Obs.: {item.notes}</span>}
          </li>
        ))}
      </ul>
      {order.notes && <p className="rounded-md bg-amber-50 p-2 text-amber-900">Observação: {order.notes}</p>}
      <Link href={`/admin/pedidos/${order.number}/imprimir`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-red hover:underline">
        Ver impressão do pedido <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  )
}

function DeliveryCard(props: DeliveryActionsProps & {
  expanded: boolean
  onToggleDetails: () => void
  onCourierChange: (courierId: string) => void
}) {
  const { delivery, order, couriers, expanded, onToggleDetails, onCourierChange } = props
  return (
    <article className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">Pedido #{delivery.orderNumber}</p>
          <p className="text-xs text-muted-foreground">{formatTime(order?.createdAt ?? delivery.updatedAt)} · {order ? ORDER_STATUS_LABEL[order.status] : 'Pedido demonstrativo'}</p>
        </div>
        <StatusPill tone={DELIVERY_STATUS_TONE[delivery.status]}>{DELIVERY_STATUS_LABEL[delivery.status]}</StatusPill>
      </div>
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">{order?.customerName ?? delivery.customerName}</span><br /><span className="text-muted-foreground">{order?.customerPhone ?? 'Telefone não informado'}</span></p>
        <p className="flex items-start gap-1.5 text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{order?.address ?? `${delivery.neighborhood} (endereço fictício)`}</p>
        <p className="font-semibold">{formatBRL(order?.totalCents ?? 0)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{order ? PAYMENT_METHOD_LABEL[order.paymentMethod] : 'Pagamento indisponível'}</span>
          {order && <StatusPill tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</StatusPill>}
        </div>
      </div>
      <div className="mt-3"><CourierSelect delivery={delivery} couriers={couriers} onChange={onCourierChange} /></div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onToggleDetails} className="text-sm font-medium text-brand-red hover:underline" aria-expanded={expanded}>
          {expanded ? 'Ocultar pedido' : 'Ver detalhes do pedido'}
        </button>
        <DeliveryActionButtons {...props} />
      </div>
      {expanded && <div className="mt-3 rounded-lg bg-zinc-50 p-3"><OrderDetails order={order} /></div>}
    </article>
  )
}

function DesktopDeliveryRow(props: DeliveryActionsProps & {
  expanded: boolean
  onToggleDetails: () => void
  onCourierChange: (courierId: string) => void
}) {
  const { delivery, order, couriers, expanded, onToggleDetails, onCourierChange } = props
  return (
    <>
      <tr className="align-top">
        <td className="px-4 py-3">
          <p className="font-semibold">#{delivery.orderNumber}</p>
          <p className="text-xs text-muted-foreground">{formatTime(order?.createdAt ?? delivery.updatedAt)}</p>
          {order && <StatusPill tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</StatusPill>}
        </td>
        <td className="px-4 py-3">
          <p className="font-medium">{order?.customerName ?? delivery.customerName}</p>
          <p className="text-xs text-muted-foreground">{order?.customerPhone ?? 'Telefone não informado'}</p>
        </td>
        <td className="max-w-64 px-4 py-3">
          <p className="whitespace-normal">{order?.address ?? `${delivery.neighborhood} (endereço fictício)`}</p>
          <p className="mt-1 font-semibold tabular-nums">{formatBRL(order?.totalCents ?? 0)}</p>
        </td>
        <td className="px-4 py-3">
          {order ? <>
            <p className="max-w-52 whitespace-normal text-xs">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</p>
            <StatusPill tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</StatusPill>
          </> : <span className="text-xs text-muted-foreground">Pagamento indisponível</span>}
        </td>
        <td className="px-4 py-3"><CourierSelect delivery={delivery} couriers={couriers} onChange={onCourierChange} /></td>
        <td className="px-4 py-3"><StatusPill tone={DELIVERY_STATUS_TONE[delivery.status]}>{DELIVERY_STATUS_LABEL[delivery.status]}</StatusPill></td>
        <td className="px-4 py-3">
          <div className="flex min-w-56 flex-col items-end gap-2">
            <DeliveryActionButtons {...props} />
            <button type="button" onClick={onToggleDetails} className="text-xs font-medium text-brand-red hover:underline" aria-expanded={expanded}>
              {expanded ? 'Ocultar detalhes' : 'Ver pedido'}
            </button>
          </div>
        </td>
      </tr>
      {expanded && <tr><td colSpan={7} className="bg-zinc-50 px-6 py-4"><OrderDetails order={order} /></td></tr>}
    </>
  )
}
