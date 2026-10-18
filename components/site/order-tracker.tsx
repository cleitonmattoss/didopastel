'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2, Search, XCircle } from 'lucide-react'
import { lookupOrder, type PublicOrderView } from '@/app/actions/orders'
import { DemoNotice } from '@/components/demo-notice'
import { formatBRL, formatDateTime } from '@/lib/format'
import { ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from '@/lib/labels'
import type { Order, OrderStatus, OrderType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useCart } from './cart-provider'

function stepsFor(type: OrderType): OrderStatus[] {
  return type === 'entrega'
    ? ['recebido', 'em_preparo', 'pronto', 'saiu_para_entrega', 'concluido']
    : ['recebido', 'em_preparo', 'pronto', 'concluido']
}

function fromLocal(order: Order): PublicOrderView {
  return {
    number: order.number,
    createdAt: order.createdAt,
    type: order.type,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    items: order.items.map(({ productName, quantity, flavorName, unitPriceCents }) => ({ productName, quantity, flavorName, unitPriceCents })),
    totalCents: order.totalCents,
    firstName: order.customerName.split(' ')[0],
  }
}

export function OrderTracker({ initialNumber }: { initialNumber: string }) {
  const { demoOrders } = useCart()
  const localOrder = initialNumber ? demoOrders[initialNumber] : undefined
  const [result, setResult] = useState<PublicOrderView | null>(localOrder ? fromLocal(localOrder) : null)
  const [notFound, setNotFound] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleLookup(formData: FormData) {
    const number = String(formData.get('number') ?? '').trim().toUpperCase()
    const phone = String(formData.get('phone') ?? '')
    setNotFound(false)
    startTransition(async () => {
      const local = demoOrders[number]
      const found = local && local.customerPhone.endsWith(phone.replace(/\D/g, '')) ? fromLocal(local) : await lookupOrder(number, phone)
      setResult(found)
      setNotFound(!found)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {localOrder && (
        <div role="status" className="rounded-2xl bg-success p-5 text-white">
          <p className="font-display text-2xl">Pedido registrado!</p>
          <p>Guarde o número <strong>#{localOrder.number}</strong> para acompanhar.</p>
        </div>
      )}

      <form action={handleLookup} className="grid gap-3 rounded-2xl border-2 bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="number" className="text-sm font-semibold">Número do pedido</label>
          <input id="number" name="number" required defaultValue={initialNumber} placeholder="Ex.: 1042" className="h-12 rounded-xl border-2 bg-white px-3 text-base uppercase" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone-last" className="text-sm font-semibold">Últimos 4 dígitos do telefone</label>
          <input id="phone-last" name="phone" required inputMode="numeric" pattern="\d{4}" maxLength={4} className="h-12 rounded-xl border-2 bg-white px-3 text-base" />
        </div>
        <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-black px-6 font-bold text-white disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Search className="size-4" aria-hidden="true" />}
          Consultar
        </button>
      </form>

      <DemoNotice>
        Para testar, use o pedido <strong>1042</strong> com os dígitos <strong>0001</strong>. Pedidos feitos agora ficam
        disponíveis apenas nesta aba até a integração com o banco de dados.
      </DemoNotice>

      {notFound && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 font-medium text-destructive">
          Não encontramos um pedido com esses dados. Confira o número e o telefone.
        </p>
      )}

      {result && <OrderDetails order={result} />}
    </div>
  )
}

function OrderDetails({ order }: { order: PublicOrderView }) {
  const steps = stepsFor(order.type)
  const currentIndex = steps.indexOf(order.status)
  const cancelled = order.status === 'cancelado'

  return (
    <section aria-labelledby="order-title" className="rounded-2xl border-2 border-brand-black bg-card p-5 shadow-[4px_4px_0_0_var(--brand-black)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="order-title" className="font-display text-3xl">Pedido #{order.number}</h2>
          <p className="text-sm text-muted-foreground">
            {order.firstName} · {ORDER_TYPE_LABEL[order.type]} · {formatDateTime(order.createdAt)}
          </p>
        </div>
        <span className="rounded-full bg-brand-yellow px-3 py-1 text-sm font-bold">{ORDER_STATUS_LABEL[order.status]}</span>
      </div>

      {cancelled ? (
        <p className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 font-semibold text-destructive">
          <XCircle className="size-5" aria-hidden="true" /> Este pedido foi cancelado.
        </p>
      ) : (
        <ol className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-0">
          {steps.map((step, index) => {
            const done = index <= currentIndex
            return (
              <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:text-center" aria-current={index === currentIndex ? 'step' : undefined}>
                <span className={cn('grid size-9 shrink-0 place-items-center rounded-full border-2 font-bold', done ? 'border-success bg-success text-white' : 'border-muted-foreground/30 text-muted-foreground')}>
                  {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                </span>
                <span className={cn('text-sm', done ? 'font-semibold' : 'text-muted-foreground')}>{ORDER_STATUS_LABEL[step]}</span>
              </li>
            )
          })}
        </ol>
      )}

      <ul className="flex flex-col gap-1 border-t pt-4 text-sm">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex justify-between gap-3">
            <span>{i.quantity}× {i.productName}{i.flavorName && ` · ${i.flavorName}`}</span>
            <span>{formatBRL(i.unitPriceCents * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap justify-between gap-2 border-t pt-3">
        <span className="text-sm">
          {PAYMENT_METHOD_LABEL[order.paymentMethod]} · <strong>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</strong>
        </span>
        <span className="font-bold text-brand-red">{formatBRL(order.totalCents)}</span>
      </div>
    </section>
  )
}
