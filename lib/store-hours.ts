import { WEEKDAYS } from './format'
import type { StoreSettings, TimeInterval } from './types'

// America/Bahia não adota horário de verão: o deslocamento é fixo em UTC-3.
const BAHIA_OFFSET_MINUTES = -3 * 60

export interface StoreStatus {
  isOpen: boolean
  closesAt?: string
  nextOpening?: string
  exceptionLabel?: string
}

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function bahiaWallClock(now: Date) {
  return new Date(now.getTime() + BAHIA_OFFSET_MINUTES * 60_000)
}

function dateKey(wall: Date) {
  return wall.toISOString().slice(0, 10)
}

function intervalsFor(wall: Date, settings: StoreSettings): { intervals: TimeInterval[]; label?: string } {
  const exception = settings.exceptions.find((e) => e.date === dateKey(wall))
  if (exception) return { intervals: exception.closed ? [] : (exception.intervals ?? []), label: exception.label }
  const day = settings.weekly.find((d) => d.weekday === wall.getUTCDay())
  return { intervals: day?.open ? day.intervals : [] }
}

export function getStoreStatus(now: Date, settings: StoreSettings): StoreStatus {
  const wall = bahiaWallClock(now)
  const minutesNow = wall.getUTCHours() * 60 + wall.getUTCMinutes()
  const today = intervalsFor(wall, settings)

  const current = today.intervals.find((i) => minutesNow >= toMinutes(i.start) && minutesNow < toMinutes(i.end))
  if (current) return { isOpen: true, closesAt: current.end }

  for (let offset = 0; offset < 14; offset++) {
    const day = new Date(wall.getTime() + offset * 86_400_000)
    const { intervals } = intervalsFor(day, settings)
    const next = intervals
      .filter((i) => offset > 0 || toMinutes(i.start) > minutesNow)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0]
    if (next) {
      const dayLabel = offset === 0 ? 'hoje' : offset === 1 ? 'amanhã' : WEEKDAYS[day.getUTCDay()].toLowerCase()
      return { isOpen: false, nextOpening: `${dayLabel} às ${next.start}`, exceptionLabel: today.label }
    }
  }
  return { isOpen: false, exceptionLabel: today.label }
}
