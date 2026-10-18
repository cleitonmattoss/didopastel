import type {
  DeliveryStatus,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  StockMovementType,
  TableStatus,
} from './types'

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  entrega: 'Entrega',
  retirada: 'Retirada no balcão',
  local: 'Consumo no local',
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  recebido: 'Recebido',
  em_preparo: 'Em preparo',
  pronto: 'Pronto',
  saiu_para_entrega: 'Saiu para entrega',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cartao_online: 'Cartão (online)',
  dinheiro_presencial: 'Dinheiro (presencial/na entrega)',
  cartao_presencial: 'Cartão na maquininha (presencial/na entrega)',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pendente: 'Aguardando pagamento',
  aprovado: 'Pagamento confirmado',
  recusado: 'Pagamento recusado',
  reembolso_pendente: 'Reembolso pendente',
  reembolsado: 'Reembolsado',
  presencial: 'Pagar presencialmente',
}

export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  aguardando_entregador: 'Aguardando entregador',
  atribuida: 'Entregador atribuído',
  em_rota: 'Em rota',
  entregue: 'Entregue',
  falhou: 'Falha na entrega',
}

export const TABLE_STATUS_LABEL: Record<TableStatus, string> = {
  livre: 'Livre',
  ocupada: 'Ocupada',
  aguardando_conta: 'Aguardando conta',
}

export const STOCK_MOVEMENT_LABEL: Record<StockMovementType, string> = {
  entrada: 'Entrada',
  saida_venda: 'Saída por venda',
  reserva: 'Reserva de pedido',
  liberacao_reserva: 'Liberação de reserva',
  ajuste: 'Ajuste manual',
  perda: 'Perda',
}

/** Métodos de pagamento permitidos por modalidade de pedido. */
export const PAYMENT_METHODS_BY_TYPE: Record<OrderType, PaymentMethod[]> = {
  entrega: ['pix', 'cartao_online', 'dinheiro_presencial', 'cartao_presencial'],
  retirada: ['pix', 'cartao_online', 'dinheiro_presencial', 'cartao_presencial'],
  local: ['pix', 'dinheiro_presencial', 'cartao_presencial'],
}

export const ONLINE_PAYMENT_METHODS: PaymentMethod[] = ['pix', 'cartao_online']
