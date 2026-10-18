import { OrdersBoard } from '@/components/admin/orders-board'
import { orders } from '@/lib/demo-data'

export const metadata = { title: 'Pedidos e preparo' }

export default function OrdersPage() {
  return <OrdersBoard initialOrders={orders} />
}
