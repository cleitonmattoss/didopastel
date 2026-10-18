import type { Tone } from '@/components/admin/admin-ui'
import { products } from './demo-data'
import type { DeliveryStatus, OrderStatus, PaymentStatus, StockItem, TableStatus } from './types'

export function productLabel(productId: string, flavorId: string | null) {
  const product = products.find((p) => p.id === productId)
  const flavor = product?.flavors.find((f) => f.id === flavorId)
  return { productName: product?.name ?? productId, flavorName: flavor?.name }
}

export function stockLevel(item: StockItem): { tone: Tone; label: string } {
  const available = item.quantity - item.reserved
  if (available <= 0) return { tone: 'danger', label: 'Esgotado' }
  if (available <= item.minimum) return { tone: 'warning', label: 'Estoque baixo' }
  return { tone: 'success', label: 'Normal' }
}

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  recebido: 'info',
  em_preparo: 'warning',
  pronto: 'success',
  saiu_para_entrega: 'info',
  concluido: 'neutral',
  cancelado: 'danger',
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, Tone> = {
  pendente: 'warning',
  aprovado: 'success',
  recusado: 'danger',
  reembolso_pendente: 'warning',
  reembolsado: 'neutral',
  presencial: 'neutral',
}

export const DELIVERY_STATUS_TONE: Record<DeliveryStatus, Tone> = {
  aguardando_entregador: 'warning',
  atribuida: 'info',
  em_rota: 'info',
  entregue: 'success',
  falhou: 'danger',
}

export const TABLE_STATUS_TONE: Record<TableStatus, Tone> = {
  livre: 'success',
  ocupada: 'warning',
  aguardando_conta: 'danger',
}

export const selectClass =
  'h-9 rounded-lg border bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
