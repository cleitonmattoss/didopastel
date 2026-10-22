import { OrdersBoard } from '@/components/admin/orders-board'
import { deliveries, orders } from '@/lib/demo-data'

export const metadata = { title: 'Pedidos e preparo' }

export default function OrdersPage() {
  return <OrdersBoard initialOrders={orders} initialDeliveries={deliveries} />
}
