import { TablesBoard } from '@/components/admin/tables-board'
import { deliveries, orders, products, tables } from '@/lib/demo-data'

export default function TablesPage() {
  return <TablesBoard initialTables={tables} initialOrders={orders} initialDeliveries={deliveries} products={products} />
}
