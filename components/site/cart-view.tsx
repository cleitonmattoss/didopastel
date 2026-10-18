'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Leaf, ShoppingBag, Trash2 } from 'lucide-react'
import { formatBRL } from '@/lib/format'
import { useCart } from './cart-provider'
import { QuantityStepper } from './quantity-stepper'

export function CartView({ deliveryFeeCents }: { deliveryFeeCents: number }) {
  const { items, subtotalCents, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed p-10 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-brand-yellow">
          <ShoppingBag className="size-8" aria-hidden="true" />
        </span>
        <p className="font-display text-2xl">Seu carrinho está vazio</p>
        <p className="text-muted-foreground">Escolha seus pastéis e salgados no cardápio.</p>
        <Link href="/cardapio" className="inline-flex h-12 items-center rounded-full bg-brand-red px-6 font-bold text-white">
          Ver cardápio
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 rounded-2xl border-2 bg-card p-3">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-accent">
              <Image src={item.image} alt="" fill sizes="96px" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/produto/${item.slug}`} className="font-display text-lg leading-tight hover:underline">
                    {item.name}
                  </Link>
                  {item.flavorName && <p className="text-sm text-muted-foreground">Sabor: {item.flavorName}</p>}
                  {item.comboSelections?.map((s) => (
                    <p key={s} className="text-sm text-muted-foreground">{s}</p>
                  ))}
                  {item.notes && <p className="text-sm text-muted-foreground italic">Obs.: {item.notes}</p>}
                  {item.slug.startsWith('pastel') && (
                    <p className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                      <Leaf className="size-3" aria-hidden="true" /> Salada inclusa
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remover ${item.name}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <QuantityStepper value={item.quantity} onChange={(q) => updateQuantity(item.id, q)} label={`Quantidade de ${item.name}`} />
                <span className="font-bold">{formatBRL(item.unitPriceCents * item.quantity)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside aria-label="Resumo" className="h-fit rounded-2xl border-2 border-brand-black bg-card p-5 shadow-[4px_4px_0_0_var(--brand-black)] lg:sticky lg:top-28">
        <h2 className="mb-4 font-display text-2xl">Resumo</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="font-semibold">{formatBRL(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Taxa de entrega</dt>
            <dd>{formatBRL(deliveryFeeCents)} se for entrega</dd>
          </div>
          <div className="mt-2 flex justify-between border-t pt-3 text-base">
            <dt className="font-bold">Total (sem entrega)</dt>
            <dd className="font-bold text-brand-red">{formatBRL(subtotalCents)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">Os valores são conferidos novamente ao finalizar o pedido.</p>
        <Link
          href="/finalizar"
          className="mt-5 flex h-12 items-center justify-center rounded-full bg-brand-red font-bold text-white hover:bg-brand-red/90"
        >
          Finalizar pedido
        </Link>
        <Link href="/cardapio" className="mt-2 flex h-11 items-center justify-center rounded-full font-semibold hover:bg-accent">
          Adicionar mais itens
        </Link>
      </aside>
    </div>
  )
}
