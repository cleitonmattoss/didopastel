/**
 * Modelo de domínio da Di do Pastel.
 * Valores monetários são sempre armazenados em centavos (inteiros) para evitar erros de ponto flutuante.
 * Estes tipos espelham as tabelas planejadas para o Supabase (ver docs/INTEGRACOES.md).
 */

export type CategoryId = 'pasteis' | 'coxinhas' | 'enroladinhos' | 'refrigerantes' | 'combos'

export interface Category {
  id: CategoryId
  name: string
  description: string
  image: string
  sortOrder: number
}

export interface Flavor {
  id: string
  name: string
}

export interface ComboComponent {
  productId: string
  quantity: number
}

export interface Product {
  id: string
  slug: string
  name: string
  categoryId: CategoryId
  description: string
  priceCents: number
  image: string
  flavors: Flavor[]
  /** Exibe a informação de que a salada acompanha o pastel, sem cobrança extra. */
  includesSalad?: boolean
  popular?: boolean
  active: boolean
  /** Presente apenas em combos: referência aos produtos componentes (o estoque fica nos componentes). */
  components?: ComboComponent[]
}

/** Estoque por produto e, quando aplicável, por sabor. */
export interface StockItem {
  productId: string
  flavorId: string | null
  quantity: number
  reserved: number
  minimum: number
}

export type StockMovementType = 'entrada' | 'saida_venda' | 'reserva' | 'liberacao_reserva' | 'ajuste' | 'perda'

export interface StockMovement {
  id: string
  productId: string
  flavorId: string | null
  type: StockMovementType
  quantity: number
  reason: string
  orderNumber?: string
  createdAt: string
  user: string
}

export type OrderType = 'entrega' | 'retirada' | 'local'

export type PaymentMethod = 'pix' | 'cartao_online' | 'dinheiro_presencial' | 'cartao_presencial'

export type PaymentStatus = 'pendente' | 'aprovado' | 'recusado' | 'reembolso_pendente' | 'reembolsado' | 'presencial'

export type OrderStatus =
  | 'recebido'
  | 'em_preparo'
  | 'pronto'
  | 'saiu_para_entrega'
  | 'concluido'
  | 'cancelado'

/** Snapshot do item: nome e preço são copiados no momento do pedido e não mudam se o cardápio mudar. */
export interface OrderItem {
  productId: string
  productName: string
  unitPriceCents: number
  quantity: number
  flavorName?: string
  comboSelections?: string[]
  notes?: string
}

export interface Order {
  number: string
  createdAt: string
  type: OrderType
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  customerName: string
  customerPhone: string
  address?: string
  tableNumber?: number
  items: OrderItem[]
  subtotalCents: number
  deliveryFeeCents: number
  totalCents: number
  notes?: string
  cancelReason?: string
}

export type DeliveryStatus = 'aguardando_entregador' | 'atribuida' | 'em_rota' | 'entregue' | 'falhou'

export interface Courier {
  id: string
  name: string
  active: boolean
}

export interface Delivery {
  id: string
  orderNumber: string
  customerName: string
  neighborhood: string
  courierId: string | null
  status: DeliveryStatus
  updatedAt: string
}

export type TableStatus = 'livre' | 'ocupada' | 'aguardando_conta'

export interface TableSession {
  tableNumber: number
  status: TableStatus
  openedAt?: string
  items: OrderItem[]
}

export interface Customer {
  id: string
  name: string
  phone: string
  ordersCount: number
  totalSpentCents: number
  lastOrderAt: string
}

export interface TimeInterval {
  start: string
  end: string
}

export interface WeeklyHours {
  /** 0 = domingo ... 6 = sábado */
  weekday: number
  open: boolean
  intervals: TimeInterval[]
}

export interface HoursException {
  date: string
  closed: boolean
  label: string
  intervals?: TimeInterval[]
}

export interface StoreSettings {
  isDemo: boolean
  weekly: WeeklyHours[]
  exceptions: HoursException[]
  deliveryFeeCents: number
  minimumOrderCents: number
  acceptsDelivery: boolean
}
