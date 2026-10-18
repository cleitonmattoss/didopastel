import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/site/checkout-form'
import { getStoreSettings } from '@/lib/data'

export const metadata: Metadata = { title: 'Finalizar pedido' }

export default async function CheckoutPage() {
  const settings = await getStoreSettings()
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-display text-4xl md:text-5xl">Finalizar pedido</h1>
      <CheckoutForm deliveryFeeCents={settings.deliveryFeeCents} acceptsDelivery={settings.acceptsDelivery} />
    </div>
  )
}
