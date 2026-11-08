'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Check, Clock3, Plus, UtensilsCrossed } from 'lucide-react'
import { placeOrder } from '@/app/actions/orders'
import { useDemoOperations } from '@/components/demo-operations-provider'
import { DemoNotice } from '@/components/demo-notice'
import { Button } from '@/components/ui/button'
import { formatBRL, formatTime } from '@/lib/format'
import { ORDER_STATUS_LABEL, TABLE_STATUS_LABEL } from '@/lib/labels'
import type { Delivery, Order, Product, TableSession, TableStatus } from '@/lib/types'
import { EmptyState, PageHeader, StatusPill, inputClass, useDemoFlash } from './admin-ui'

const ACTIVE_ORDER_STATUSES = new Set<Order['status']>([
  'recebido', 'em_preparo', 'pronto', 'saiu_para_entrega', 'falha_entrega',
])

function tableTone(status: TableStatus): 'success' | 'warning' | 'danger' {
  if (status === 'livre') return 'success'
  return status === 'aguardando_conta' ? 'danger' : 'warning'
}

export function TablesBoard({
  initialTables,
  initialOrders,
  initialDeliveries,
  products,
}: {
  initialTables: TableSession[]
  initialOrders: Order[]
  initialDeliveries: Delivery[]
  products: Product[]
}) {
  const { tables, orders, initialize, initializeTables, updateTables, upsertOrder } = useDemoOperations()
  const { flash, node } = useDemoFlash()
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [orderMode, setOrderMode] = useState<'comanda' | 'independente'>('comanda')
  const [productId, setProductId] = useState(products[0]?.id ?? '')
  const [flavorId, setFlavorId] = useState('')

  useEffect(() => {
    initialize(initialOrders, initialDeliveries)
    initializeTables(initialTables)
  }, [initialOrders, initialDeliveries, initialTables, initialize, initializeTables])

  const currentTables = tables ?? initialTables
  const currentOrders = orders ?? initialOrders
  const selectedTable = currentTables.find((table) => table.tableNumber === selectedNumber) ?? null
  const selectedOrders = useMemo(() => selectedTable?.sessionId
    ? currentOrders.filter((order) => order.tableSessionId === selectedTable.sessionId)
    : [], [currentOrders, selectedTable])
  const nonCancelledOrders = selectedOrders.filter((order) => order.status !== 'cancelado')
  const openOrders = nonCancelledOrders.filter((order) => ACTIVE_ORDER_STATUSES.has(order.status))
  // Nesta fase não há registro de pagamentos. Todo pedido não cancelado ainda representa saldo devido.
  const balanceDueCents = nonCancelledOrders.reduce((sum, order) => sum + order.totalCents, 0)
  const selectedProduct = products.find((product) => product.id === productId)

  function openService(tableNumber: number) {
    const sessionId = `mesa-${tableNumber}-${crypto.randomUUID()}`
    const openedAt = new Date().toISOString()
    updateTables((current) => current.map((table) => table.tableNumber === tableNumber && table.status === 'livre'
      ? { ...table, status: 'ocupada', sessionId, orderMode: 'comanda', orderNumbers: [], openedAt, items: [] }
      : table))
    setSelectedNumber(tableNumber)
    flash(`Atendimento da Mesa ${tableNumber} aberto.`)
  }

  function closeService() {
    if (!selectedTable?.sessionId || openOrders.length > 0 || balanceDueCents > 0) return
    const closedSessionId = selectedTable.sessionId
    updateTables((current) => current.map((table) => table.sessionId === closedSessionId
      ? { tableNumber: table.tableNumber, status: 'livre', items: [] }
      : table))
    setSelectedNumber(null)
    flash(`Atendimento da Mesa ${selectedTable.tableNumber} encerrado.`)
  }

  async function addOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedTable?.sessionId || !selectedProduct || submitting) return

    const form = event.currentTarget
    const formData = new FormData(form)
    const quantity = Number(formData.get('quantity'))
    setSubmitting(true)
    const result = await placeOrder({
      type: 'local',
      paymentMethod: 'dinheiro_presencial',
      customerName: `Mesa ${selectedTable.tableNumber}`,
      customerPhone: '0000000000',
      tableNumber: selectedTable.tableNumber,
      items: [{ productId, flavorId: flavorId || undefined, quantity }],
    })
    setSubmitting(false)

    if (!result.ok) {
      flash(result.error)
      return
    }

    const order: Order = {
      ...result.order,
      // Número único da demonstração, para que um novo envio não sobrescreva outro pedido.
      number: `M-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      tableNumber: selectedTable.tableNumber,
      tableSessionId: selectedTable.sessionId,
      tableOrderMode: orderMode,
    }
    upsertOrder(order)
    updateTables((current) => current.map((table) => table.sessionId === selectedTable.sessionId
      ? { ...table, orderNumbers: [...new Set([...(table.orderNumbers ?? []), order.number])] }
      : table))
    form.reset()
    setProductId(products[0]?.id ?? '')
    setFlavorId('')
    flash(`Pedido #${order.number} enviado para Pedidos e Preparos.`)
  }

  return (
    <>
      <PageHeader title="Mesas" description="Atendimentos e pedidos locais — demonstração em memória, sem persistência." />
      <DemoNotice className="mb-5">As mudanças desta tela são temporárias e desaparecem ao recarregar a página.</DemoNotice>

      <section aria-label="Quatro mesas" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {currentTables.map((table) => {
          const sessionOrders = table.sessionId ? currentOrders.filter((order) => order.tableSessionId === table.sessionId && order.status !== 'cancelado') : []
          const total = sessionOrders.reduce((sum, order) => sum + order.totalCents, 0)
          return (
            <article key={table.tableNumber} className={`rounded-xl border bg-white p-4 ${selectedNumber === table.tableNumber ? 'border-brand-red ring-2 ring-brand-red/15' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">Mesa {table.tableNumber}</p>
                  <StatusPill tone={tableTone(table.status)}>{TABLE_STATUS_LABEL[table.status]}</StatusPill>
                </div>
                <UtensilsCrossed className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              {table.openedAt && <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" aria-hidden="true" /> Desde {formatTime(table.openedAt)}</p>}
              <p className="mt-2 text-sm">{sessionOrders.length} {sessionOrders.length === 1 ? 'pedido' : 'pedidos'} · {formatBRL(total)}</p>
              <div className="mt-4 flex gap-2">
                {table.status === 'livre' ? (
                  <Button size="sm" className="w-full" onClick={() => openService(table.tableNumber)}><Plus aria-hidden="true" /> Abrir atendimento</Button>
                ) : (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setSelectedNumber(table.tableNumber)}>Ver atendimento</Button>
                )}
              </div>
            </article>
          )
        })}
      </section>

      {selectedTable && selectedTable.sessionId && (
        <section className="mt-6 rounded-xl border bg-white" aria-labelledby="table-detail-heading">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
            <div>
              <h2 id="table-detail-heading" className="text-lg font-semibold">Mesa {selectedTable.tableNumber} · Atendimento</h2>
              <p className="break-all text-xs text-muted-foreground">ID {selectedTable.sessionId} · aberto {selectedTable.openedAt ? formatTime(selectedTable.openedAt) : 'agora'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedNumber(null)}>Fechar detalhes</Button>
              <Button size="sm" variant="outline" disabled={openOrders.length > 0 || balanceDueCents > 0} onClick={closeService}>
                <Check aria-hidden="true" /> Encerrar atendimento
              </Button>
            </div>
          </div>

          <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,.9fr)]">
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">Pedidos do atendimento</h3>
                <span className="text-sm font-semibold">Saldo demonstrativo: {formatBRL(balanceDueCents)}</span>
              </div>
              {selectedOrders.length === 0 ? (
                <EmptyState title="Nenhum pedido neste atendimento" description="Adicione um pedido pelo painel para enviá-lo a Pedidos e Preparos." />
              ) : (
                <ul className="divide-y rounded-lg border">
                  {selectedOrders.map((order) => (
                    <li key={order.number} className="p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">Pedido #{order.number} <span className="text-xs font-normal text-muted-foreground">· {order.tableOrderMode === 'independente' ? 'independente' : 'comanda'}</span></p>
                        <StatusPill>{ORDER_STATUS_LABEL[order.status]}</StatusPill>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{order.items.map((item) => `${item.quantity}× ${item.productName}`).join(', ')}</p>
                      <p className="mt-1 text-sm font-semibold">{formatBRL(order.totalCents)}</p>
                    </li>
                  ))}
                </ul>
              )}
              {(openOrders.length > 0 || balanceDueCents > 0) && (
                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                  {openOrders.length > 0 ? `${openOrders.length} pedido(s) ainda estão em andamento. ` : ''}
                  {balanceDueCents > 0 ? 'Há saldo demonstrativo sem confirmação de pagamento. ' : ''}
                  A mesa não pode ser liberada nesta fase.
                </p>
              )}
            </div>

            <form onSubmit={addOrder} className="flex flex-col gap-3 rounded-lg border p-3">
              <h3 className="font-semibold">Registrar pedido do garçom</h3>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Vínculo do pedido
                <select className={inputClass} value={orderMode} onChange={(event) => setOrderMode(event.target.value as 'comanda' | 'independente')}>
                  <option value="comanda">Adicionar à comanda</option>
                  <option value="independente">Pedido independente da mesa</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Produto
                <select className={inputClass} value={productId} onChange={(event) => { setProductId(event.target.value); setFlavorId('') }} required>
                  {products.filter((product) => product.active).map((product) => <option key={product.id} value={product.id}>{product.name} · {formatBRL(product.priceCents)}</option>)}
                </select>
              </label>
              {selectedProduct && selectedProduct.flavors.length > 0 && (
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Sabor
                  <select className={inputClass} value={flavorId} onChange={(event) => setFlavorId(event.target.value)} required>
                    <option value="">Selecione</option>
                    {selectedProduct.flavors.map((flavor) => <option key={flavor.id} value={flavor.id}>{flavor.name}</option>)}
                  </select>
                </label>
              )}
              <label className="flex flex-col gap-1 text-sm font-medium">
                Quantidade
                <input className={inputClass} type="number" name="quantity" min="1" max="20" defaultValue="1" required />
              </label>
              <Button type="submit" disabled={submitting || !selectedProduct}>{submitting ? 'Enviando…' : 'Enviar para preparo'}</Button>
              <p className="text-xs text-muted-foreground">O pedido é validado pelo fluxo existente e compartilhado com Pedidos e Preparos neste navegador. Nenhum pagamento é processado.</p>
            </form>
          </div>
        </section>
      )}
      {node}
    </>
  )
}
