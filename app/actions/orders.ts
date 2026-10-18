'use server'

/**
 * Ações de pedido (modo demonstração).
 * PONTO DE INTEGRAÇÃO: na próxima etapa, `placeOrder` deve gravar o pedido no Supabase dentro de uma
 * transação que reserva o estoque (movimento "reserva") e, para Pix/cartão online, criar a cobrança no
 * provedor de pagamento. O status de pagamento só muda para "aprovado" via webhook do provedor.
 */
import { getProductById, isFlavorAvailable, isProductAvailable, getStoreSettings } from '@/lib/data'
import { orders as demoOrders } from '@/lib/demo-data'
import { ONLINE_PAYMENT_METHODS, PAYMENT_METHODS_BY_TYPE } from '@/lib/labels'
import type { Order, OrderItem, OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '@/lib/types'

const MAX_ITEM_QUANTITY = 20
const MAX_ORDER_UNITS = 60

export interface PlaceOrderInput {
  type: OrderType
  paymentMethod: PaymentMethod
  customerName: string
  customerPhone: string
  address?: string
  tableNumber?: number
  notes?: string
  items: {
    productId: string
    flavorId?: string
    comboSelections?: string[]
    notes?: string
    quantity: number
  }[]
}

export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; error: string }

function clean(value: string | undefined, max: number) {
  return (value ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const settings = await getStoreSettings()

  if (!['entrega', 'retirada', 'local'].includes(input.type)) return { ok: false, error: 'Modalidade inválida.' }
  if (input.type === 'entrega' && !settings.acceptsDelivery) return { ok: false, error: 'Entregas indisponíveis no momento.' }
  if (!PAYMENT_METHODS_BY_TYPE[input.type].includes(input.paymentMethod)) {
    return { ok: false, error: 'Forma de pagamento não permitida para esta modalidade.' }
  }

  const customerName = clean(input.customerName, 80)
  const phoneDigits = (input.customerPhone ?? '').replace(/\D/g, '')
  if (customerName.length < 2) return { ok: false, error: 'Informe seu nome.' }
  if (phoneDigits.length < 10 || phoneDigits.length > 11) return { ok: false, error: 'Informe um telefone com DDD.' }

  const address = clean(input.address, 200)
  if (input.type === 'entrega' && address.length < 8) return { ok: false, error: 'Informe o endereço completo para entrega.' }

  const tableNumber = input.type === 'local' ? Number(input.tableNumber) : undefined
  if (input.type === 'local' && (!Number.isInteger(tableNumber) || tableNumber! < 1 || tableNumber! > 50)) {
    return { ok: false, error: 'Informe o número da mesa.' }
  }

  if (!Array.isArray(input.items) || input.items.length === 0) return { ok: false, error: 'Seu carrinho está vazio.' }

  const totalsByProduct = new Map<string, number>()
  const items: OrderItem[] = []

  for (const line of input.items) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_ITEM_QUANTITY) {
      return { ok: false, error: 'Quantidade inválida em um dos itens.' }
    }
    const product = getProductById(line.productId)
    if (!product || !product.active || !isProductAvailable(product)) {
      return { ok: false, error: `${product?.name ?? 'Um item'} está esgotado. Remova-o do carrinho.` }
    }

    let flavorName: string | undefined
    if (product.flavors.length > 0) {
      const flavor = product.flavors.find((f) => f.id === line.flavorId)
      if (!flavor) return { ok: false, error: `Escolha o sabor de ${product.name}.` }
      if (!isFlavorAvailable(product.id, flavor.id)) return { ok: false, error: `${product.name} — ${flavor.name} está esgotado.` }
      flavorName = flavor.name
    }

    const key = `${product.id}:${line.flavorId ?? ''}`
    totalsByProduct.set(key, (totalsByProduct.get(key) ?? 0) + line.quantity)

    items.push({
      productId: product.id,
      productName: product.name,
      unitPriceCents: product.priceCents,
      quantity: line.quantity,
      flavorName,
      comboSelections: line.comboSelections?.slice(0, 10).map((s) => clean(s, 80)),
      notes: clean(line.notes, 140) || undefined,
    })
  }

  const totalUnits = [...totalsByProduct.values()].reduce((a, b) => a + b, 0)
  if (totalUnits > MAX_ORDER_UNITS) return { ok: false, error: `Limite de ${MAX_ORDER_UNITS} unidades por pedido.` }
  if ([...totalsByProduct.values()].some((q) => q > MAX_ITEM_QUANTITY)) {
    return { ok: false, error: `Limite de ${MAX_ITEM_QUANTITY} unidades por item.` }
  }

  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0)
  if (subtotalCents < settings.minimumOrderCents) return { ok: false, error: 'Pedido abaixo do valor mínimo.' }
  const deliveryFeeCents = input.type === 'entrega' ? settings.deliveryFeeCents : 0

  const paymentStatus: PaymentStatus = ONLINE_PAYMENT_METHODS.includes(input.paymentMethod) ? 'pendente' : 'presencial'

  const order: Order = {
    number: `D${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    type: input.type,
    status: 'recebido',
    paymentMethod: input.paymentMethod,
    paymentStatus,
    customerName,
    customerPhone: phoneDigits,
    address: input.type === 'entrega' ? address : undefined,
    tableNumber,
    items,
    subtotalCents,
    deliveryFeeCents,
    totalCents: subtotalCents + deliveryFeeCents,
    notes: clean(input.notes, 200) || undefined,
  }

  return { ok: true, order }
}

export interface PublicOrderView {
  number: string
  createdAt: string
  type: OrderType
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  items: { productName: string; quantity: number; flavorName?: string; unitPriceCents: number }[]
  totalCents: number
  firstName: string
}

/** Retorna apenas dados não sensíveis, e somente se o telefone conferir (evita expor pedidos de terceiros). */
export async function lookupOrder(number: string, phoneLast4: string): Promise<PublicOrderView | null> {
  const digits = phoneLast4.replace(/\D/g, '')
  if (digits.length !== 4) return null
  const order = demoOrders.find((o) => o.number === number.trim().toUpperCase())
  if (!order || !order.customerPhone.replace(/\D/g, '').endsWith(digits)) return null
  return toPublicView(order)
}

function toPublicView(order: Order): PublicOrderView {
  return {
    number: order.number,
    createdAt: order.createdAt,
    type: order.type,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    items: order.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      flavorName: i.flavorName,
      unitPriceCents: i.unitPriceCents,
    })),
    totalCents: order.totalCents,
    firstName: order.customerName.split(' ')[0],
  }
}
