import type { Metadata } from 'next'
import { CartView } from '@/components/site/cart-view'
import { getStoreSettings } from '@/lib/data'

export const metadata: Metadata = { title: 'Carrinho' }

export default async function CartPage() {
  const settings = await getStoreSettings()
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-display text-4xl md:text-5xl">Seu carrinho</h1>
      <CartView deliveryFeeCents={settings.deliveryFeeCents} />
    </div>
  )
}
