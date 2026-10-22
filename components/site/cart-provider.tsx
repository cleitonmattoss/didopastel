'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Delivery, Order } from '@/lib/types'
import { useDemoOperations } from '@/components/demo-operations-provider'

export const MAX_ITEM_QUANTITY = 20

export interface CartItem {
  id: string
  productId: string
  slug: string
  name: string
  image: string
  unitPriceCents: number
  quantity: number
  flavorId?: string
  flavorName?: string
  comboSelections?: string[]
  notes?: string
}

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotalCents: number
  addItem: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clear: () => void
  demoOrders: Record<string, Order>
  saveDemoOrder: (order: Order) => void
}

const CartContext = createContext<CartContextValue | null>(null)

function clampQuantity(quantity: number) {
  return Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(quantity)))
}

/**
 * Carrinho mantido em memória durante a navegação (não exige conta).
 * PONTO DE INTEGRAÇÃO: preços e disponibilidade serão revalidados no servidor ao finalizar o pedido.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [demoOrderNumbers, setDemoOrderNumbers] = useState<string[]>([])
  const { orders, upsertOrder, upsertDelivery } = useDemoOperations()

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setItems((current) => {
      const existing = current.find(
        (i) =>
          i.productId === item.productId &&
          i.flavorId === item.flavorId &&
          (i.notes ?? '') === (item.notes ?? '') &&
          JSON.stringify(i.comboSelections ?? []) === JSON.stringify(item.comboSelections ?? []),
      )
      if (existing) {
        return current.map((i) =>
          i.id === existing.id ? { ...i, quantity: clampQuantity(i.quantity + item.quantity) } : i,
        )
      }
      return [...current, { ...item, quantity: clampQuantity(item.quantity), id: crypto.randomUUID() }]
    })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) => current.map((i) => (i.id === id ? { ...i, quantity: clampQuantity(quantity) } : i)))
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((i) => i.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const demoOrders = useMemo(() => Object.fromEntries(
    demoOrderNumbers.flatMap((number) => {
      const order = orders?.find((item) => item.number === number)
      return order ? [[number, order]] : []
    }),
  ) as Record<string, Order>, [demoOrderNumbers, orders])

  const saveDemoOrder = useCallback((order: Order) => {
    upsertOrder(order)
    if (order.type === 'entrega') {
      const delivery: Delivery = {
        id: `demo-${order.number}`,
        orderNumber: order.number,
        customerName: order.customerName,
        neighborhood: '',
        courierId: null,
        status: 'aguardando_entregador',
        updatedAt: order.createdAt,
      }
      upsertDelivery(delivery)
    }
    setDemoOrderNumbers((current) => current.includes(order.number) ? current : [...current, order.number])
  }, [upsertOrder, upsertDelivery])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotalCents: items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clear,
      demoOrders,
      saveDemoOrder,
    }),
    [items, addItem, updateQuantity, removeItem, clear, demoOrders, saveDemoOrder],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart deve ser usado dentro de CartProvider')
  return context
}
