'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { formatBRL } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCart } from './cart-provider'
import { QuantityStepper } from './quantity-stepper'

export interface FlavorOption {
  id: string
  name: string
  available: boolean
}

export interface ComboSlot {
  key: string
  label: string
  productName: string
  flavors: FlavorOption[]
}

const NOTES_MAX = 140

export function ProductConfigurator({
  product,
  flavors,
  comboSlots,
}: {
  product: { id: string; slug: string; name: string; image: string; priceCents: number }
  flavors: FlavorOption[]
  comboSlots: ComboSlot[]
}) {
  const { addItem } = useCart()
  const [flavorId, setFlavorId] = useState<string>(() => flavors.find((f) => f.available)?.id ?? '')
  const [slotChoices, setSlotChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      comboSlots.filter((s) => s.flavors.length > 0).map((s) => [s.key, s.flavors.find((f) => f.available)?.id ?? '']),
    ),
  )
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [added, setAdded] = useState(false)

  const flavorMissing = flavors.length > 0 && !flavorId
  const slotsMissing = Object.values(slotChoices).some((v) => !v)
  const canAdd = !flavorMissing && !slotsMissing

  function handleAdd() {
    if (!canAdd) return
    const flavor = flavors.find((f) => f.id === flavorId)
    const comboSelections = comboSlots.map((slot) => {
      const choice = slot.flavors.find((f) => f.id === slotChoices[slot.key])
      return choice ? `${slot.label}: ${choice.name}` : slot.label
    })
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      unitPriceCents: product.priceCents,
      quantity,
      flavorId: flavor?.id,
      flavorName: flavor?.name,
      comboSelections: comboSelections.length ? comboSelections : undefined,
      notes: notes.trim() || undefined,
    })
    setAdded(true)
    setQuantity(1)
    setNotes('')
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        handleAdd()
      }}
    >
      {flavors.length > 0 && (
        <fieldset>
          <legend className="mb-3 font-display text-xl">
            Escolha o sabor <span className="font-sans text-sm text-brand-red">(obrigatório)</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {flavors.map((flavor) => (
              <label
                key={flavor.id}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 has-checked:border-brand-red has-checked:bg-accent has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                  !flavor.available && 'cursor-not-allowed opacity-60',
                )}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="flavor"
                    value={flavor.id}
                    checked={flavorId === flavor.id}
                    disabled={!flavor.available}
                    onChange={() => {
                      setFlavorId(flavor.id)
                      setAdded(false)
                    }}
                    className="size-4 accent-brand-red"
                  />
                  <span className="font-medium">{flavor.name}</span>
                </span>
                {!flavor.available && <span className="text-xs font-bold text-muted-foreground uppercase">Esgotado</span>}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {comboSlots.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 font-display text-xl">Monte seu combo</legend>
          {comboSlots.map((slot) =>
            slot.flavors.length > 0 ? (
              <div key={slot.key} className="flex flex-col gap-1.5">
                <label htmlFor={slot.key} className="text-sm font-semibold">
                  {slot.label}
                </label>
                <select
                  id={slot.key}
                  value={slotChoices[slot.key]}
                  onChange={(e) => {
                    setSlotChoices((c) => ({ ...c, [slot.key]: e.target.value }))
                    setAdded(false)
                  }}
                  className="h-11 rounded-xl border-2 bg-white px-3 text-base"
                  required
                >
                  {slot.flavors.map((f) => (
                    <option key={f.id} value={f.id} disabled={!f.available}>
                      {f.name}
                      {!f.available ? ' — esgotado' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p key={slot.key} className="rounded-xl bg-muted px-4 py-3 text-sm font-medium">
                {slot.label}
              </p>
            ),
          )}
        </fieldset>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="font-display text-xl">
          Observações <span className="font-sans text-sm text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          maxLength={NOTES_MAX}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Ex.: sem salada, bem passado..."
          className="rounded-xl border-2 bg-white px-3 py-2 text-base"
        />
        <span className="self-end text-xs text-muted-foreground">
          {notes.length}/{NOTES_MAX}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <button
          type="submit"
          disabled={!canAdd}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-brand-red px-6 text-base font-bold text-white shadow-[3px_3px_0_0_var(--brand-black)] hover:bg-brand-red/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar · {formatBRL(product.priceCents * quantity)}
        </button>
      </div>

      {added && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-success/10 p-4 text-success">
          <span className="inline-flex items-center gap-2 font-semibold">
            <CheckCircle2 className="size-5" aria-hidden="true" /> Item adicionado ao carrinho
          </span>
          <span className="flex gap-3 text-sm font-semibold">
            <Link href="/cardapio" className="underline">Continuar comprando</Link>
            <Link href="/carrinho" className="rounded-full bg-success px-3 py-1 text-white">Ir para o carrinho</Link>
          </span>
        </div>
      )}
    </form>
  )
}
