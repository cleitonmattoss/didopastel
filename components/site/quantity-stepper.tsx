'use client'

import { Minus, Plus } from 'lucide-react'
import { MAX_ITEM_QUANTITY } from './cart-provider'

export function QuantityStepper({
  value,
  onChange,
  label = 'Quantidade',
}: {
  value: number
  onChange: (value: number) => void
  label?: string
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full border-2 border-brand-black bg-white">
      <button
        type="button"
        className="grid size-10 place-items-center rounded-full hover:bg-accent disabled:opacity-40"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Diminuir quantidade"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className="min-w-8 text-center font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="grid size-10 place-items-center rounded-full hover:bg-accent disabled:opacity-40"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_ITEM_QUANTITY}
        aria-label="Aumentar quantidade"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
