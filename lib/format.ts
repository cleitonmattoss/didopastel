export const TIME_ZONE = 'America/Bahia'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatBRL(cents: number) {
  return currency.format(cents / 100)
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function parseBRLToCents(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const number = Number.parseFloat(normalized)
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 100) : null
}

export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace('.', ',')
}
