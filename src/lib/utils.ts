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
  const [oh, om] = hours.open.split(':').map(Number)
  const [ch, cm] = hours.close.split(':').map(Number)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return nowMinutes >= oh * 60 + om && nowMinutes <= ch * 60 + cm
}
