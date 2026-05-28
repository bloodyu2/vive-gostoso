import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export function isBusinessOpen(
  opening_hours: Record<string, { open: string; close: string; closed: boolean }> | null
): boolean {
  if (!opening_hours) return false
  const days = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
  const now = new Date()
  const day = days[now.getDay()]
  const hours = opening_hours[day]
  if (!hours || hours.closed) return false
  const parseTime = (t: string) => {
    const parts = t?.split(':').map(Number)
    if (!parts || parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null
    return parts[0] * 60 + parts[1]
  }
  const openMin = parseTime(hours.open)
  const closeMin = parseTime(hours.close)
  if (openMin === null || closeMin === null) return false
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return nowMinutes >= openMin && nowMinutes <= closeMin
}
