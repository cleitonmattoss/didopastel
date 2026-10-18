'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Bike, Loader2, Store, UtensilsCrossed } from 'lucide-react'
import { placeOrder } from '@/app/actions/orders'
import { DemoNotice } from '@/components/demo-notice'
import { formatBRL } from '@/lib/format'
import { ONLINE_PAYMENT_METHODS, ORDER_TYPE_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_METHODS_BY_TYPE } from '@/lib/labels'
import type { OrderType, PaymentMethod } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useCart } from './cart-provider'

const TYPE_ICON = { entrega: Bike, retirada: Store, local: UtensilsCrossed } as const

const fieldClass = 'h-12 w-full rounded-xl border-2 bg-white px-3 text-base focus-visible:border-brand-black focus-visible:outline-none'

export function CheckoutForm({ deliveryFeeCents, acceptsDelivery }: { deliveryFeeCents: number; acceptsDelivery: boolean }) {
  const router = useRouter()
  const { items, subtotalCents, clear, saveDemoOrder } = useCart()
  const [type, setType] = useState<OrderType>(acceptsDelivery ? 'entrega' : 'retirada')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const allowedMethods = PAYMENT_METHODS_BY_TYPE[type]
  const effectiveMethod = allowedMethods.includes(paymentMethod) ? paymentMethod : allowedMethods[0]
  const fee = type === 'entrega' ? deliveryFeeCents : 0

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed p-10 text-center">
        <p className="font-display text-2xl">Não há itens para finalizar</p>
        <Link href="/cardapio" className="mt-4 inline-flex h-12 items-center rounded-full bg-brand-red px-6 font-bold text-white">
          Ir ao cardápio
        </Link>
      </div>
    )
  }

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await placeOrder({
        type,
        paymentMethod: effectiveMethod,
        customerName: String(formData.get('name') ?? ''),
        customerPhone: String(formData.get('phone') ?? ''),
        address: type === 'entrega' ? String(formData.get('address') ?? '') : undefined,
        tableNumber: type === 'local' ? Number(formData.get('table')) : undefined,
        notes: String(formData.get('notes') ?? ''),
        items: items.map((i) => ({
          productId: i.productId,
          flavorId: i.flavorId,
          comboSelections: i.comboSelections,
          notes: i.notes,
          quantity: i.quantity,
        })),
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      saveDemoOrder(result.order)
      clear()
      router.push(`/pedido?numero=${result.order.number}`)
    })
  }

  return (
    <form action={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-8">
        <fieldset>
          <legend className="mb-3 font-display text-2xl">1. Como você quer receber?</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {(['entrega', 'retirada', 'local'] as OrderType[]).map((value) => {
              const Icon = TYPE_ICON[value]
              const disabled = value === 'entrega' && !acceptsDelivery
              return (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center font-semibold has-checked:border-brand-red has-checked:bg-accent has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                    disabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={type === value}
                    disabled={disabled}
                    onChange={() => setType(value)}
                    className="sr-only"
                  />
                  <Icon className="size-6" aria-hidden="true" />
                  {ORDER_TYPE_LABEL[value]}
                  {value === 'entrega' && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {disabled ? 'Indisponível' : `Taxa ${formatBRL(deliveryFeeCents)}`}
                    </span>
                  )}
                </label>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 font-display text-2xl">2. Seus dados</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-semibold">Nome</label>
              <input id="name" name="name" required minLength={2} maxLength={80} autoComplete="name" className={fieldClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-semibold">Telefone (WhatsApp)</label>
              <input id="phone" name="phone" type="tel" inputMode="tel" required placeholder="(75) 90000-0000" autoComplete="tel" className={fieldClass} />
            </div>
          </div>
          {type === 'entrega' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="text-sm font-semibold">Endereço de entrega</label>
              <input id="address" name="address" required minLength={8} maxLength={200} autoComplete="street-address" placeholder="Rua, número, bairro e ponto de referência" className={fieldClass} />
            </div>
          )}
          {type === 'local' && (
            <div className="flex flex-col gap-1.5 sm:max-w-40">
              <label htmlFor="table" className="text-sm font-semibold">Número da mesa</label>
              <input id="table" name="table" type="number" required min={1} max={50} inputMode="numeric" className={fieldClass} />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="order-notes" className="text-sm font-semibold">
              Observações do pedido <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <textarea id="order-notes" name="notes" maxLength={200} rows={2} className="rounded-xl border-2 bg-white px-3 py-2 text-base" />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-display text-2xl">3. Pagamento</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {allowedMethods.map((method) => (
              <label
                key={method}
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 font-medium has-checked:border-brand-red has-checked:bg-accent has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
              >
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={effectiveMethod === method}
                  onChange={() => setPaymentMethod(method)}
                  className="size-4 accent-brand-red"
                />
                {PAYMENT_METHOD_LABEL[method]}
              </label>
            ))}
          </div>
          {ONLINE_PAYMENT_METHODS.includes(effectiveMethod) && (
            <DemoNotice title="Pagamento online ainda não integrado" className="mt-4">
              Nesta versão nenhuma cobrança é gerada. O pedido ficará como &quot;Aguardando pagamento&quot; — ele só será
              confirmado quando o provedor de pagamento for integrado.
            </DemoNotice>
          )}
        </fieldset>
      </div>

      <aside aria-label="Resumo do pedido" className="h-fit rounded-2xl border-2 border-brand-black bg-card p-5 shadow-[4px_4px_0_0_var(--brand-black)] lg:sticky lg:top-28">
        <h2 className="mb-4 font-display text-2xl">Resumo</h2>
        <ul className="mb-4 flex flex-col gap-2 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span>
                {i.quantity}× {i.name}
                {i.flavorName && <span className="text-muted-foreground"> · {i.flavorName}</span>}
              </span>
              <span className="shrink-0">{formatBRL(i.unitPriceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-2 border-t pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatBRL(subtotalCents)}</dd></div>
          <div className="flex justify-between"><dt>Taxa de entrega</dt><dd>{fee ? formatBRL(fee) : 'Grátis'}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd className="text-brand-red">{formatBRL(subtotalCents + fee)}</dd></div>
        </dl>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-red font-bold text-white hover:bg-brand-red/90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Enviar pedido (demonstração)
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">O pedido não é enviado à cozinha nesta versão.</p>
      </aside>
    </form>
  )
}
