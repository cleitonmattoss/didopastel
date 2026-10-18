import type { Metadata } from 'next'
import { OrderTracker } from '@/components/site/order-tracker'

export const metadata: Metadata = { title: 'Acompanhar pedido' }

export default async function TrackingPage({ searchParams }: { searchParams: Promise<{ numero?: string }> }) {
  const { numero } = await searchParams
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-display text-4xl md:text-5xl">Acompanhar pedido</h1>
      <OrderTracker initialNumber={numero ?? ''} />
    </div>
  )
}
