import { DeliveriesBoard } from '@/components/admin/deliveries-board'
import { couriers, deliveries, orders } from '@/lib/demo-data'

export const metadata = { title: 'Entregas' }

export default function DeliveriesPage() {
  return <DeliveriesBoard initialDeliveries={deliveries} initialOrders={orders} couriers={couriers} />
}
