'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Delivery, Order, OrderStatus, PaymentStatus, TableSession } from '@/lib/types'

type DemoOperationsContextValue = {
  orders: Order[] | null
  deliveries: Delivery[] | null
  tables: TableSession[] | null
  initialize: (orders: Order[], deliveries: Delivery[]) => void
  initializeTables: (tables: TableSession[]) => void
  updateTables: (update: (current: TableSession[]) => TableSession[]) => void
  updateOrders: (update: (current: Order[]) => Order[]) => void
  updateDeliveries: (update: (current: Delivery[]) => Delivery[]) => void
  upsertOrder: (order: Order) => void
  upsertDelivery: (delivery: Delivery) => void
  orderStatus: (number: string) => { status: OrderStatus; paymentStatus: PaymentStatus } | null
}

const DemoOperationsContext = createContext<DemoOperationsContextValue | null>(null)

function mergeByKey<T>(base: T[], updates: T[], key: (item: T) => string) {
  const merged = new Map(base.map((item) => [key(item), item]))
  for (const item of updates) merged.set(key(item), item)
  return [...merged.values()]
}

export function DemoOperationsProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [deliveries, setDeliveries] = useState<Delivery[] | null>(null)
  const [tables, setTables] = useState<TableSession[] | null>(null)

  const initialize = useCallback((initialOrders: Order[], initialDeliveries: Delivery[]) => {
    setOrders((current) => current ? mergeByKey(initialOrders, current, (order) => order.number) : initialOrders)
    setDeliveries((current) => current ? mergeByKey(initialDeliveries, current, (delivery) => delivery.id) : initialDeliveries)
  }, [])

  const initializeTables = useCallback((initialTables: TableSession[]) => {
    setTables((current) => current ?? initialTables)
  }, [])

  const updateTables = useCallback((update: (current: TableSession[]) => TableSession[]) => {
    setTables((current) => current ? update(current) : current)
  }, [])

  const updateOrders = useCallback((update: (current: Order[]) => Order[]) => {
    setOrders((current) => current ? update(current) : current)
  }, [])

  const updateDeliveries = useCallback((update: (current: Delivery[]) => Delivery[]) => {
    setDeliveries((current) => current ? update(current) : current)
  }, [])

  const upsertOrder = useCallback((order: Order) => {
    setOrders((current) => mergeByKey(current ?? [], [order], (item) => item.number))
  }, [])

  const upsertDelivery = useCallback((delivery: Delivery) => {
    setDeliveries((current) => mergeByKey(current ?? [], [delivery], (item) => item.id))
  }, [])

  const orderStatus = useCallback((number: string) => {
    const order = orders?.find((item) => item.number === number)
    return order ? { status: order.status, paymentStatus: order.paymentStatus } : null
  }, [orders])

  const value = useMemo(() => ({
    orders,
    deliveries,
    tables,
    initialize,
    initializeTables,
    updateTables,
    updateOrders,
    updateDeliveries,
    upsertOrder,
    upsertDelivery,
    orderStatus,
  }), [orders, deliveries, tables, initialize, initializeTables, updateTables, updateOrders, updateDeliveries, upsertOrder, upsertDelivery, orderStatus])

  return <DemoOperationsContext.Provider value={value}>{children}</DemoOperationsContext.Provider>
}

export function useDemoOperations() {
  const context = useContext(DemoOperationsContext)
  if (!context) throw new Error('useDemoOperations deve ser usado dentro de DemoOperationsProvider')
  return context
}

export function useDemoOrderStatus(number: string | undefined) {
  const { orderStatus } = useDemoOperations()
  return number ? orderStatus(number) : null
}
