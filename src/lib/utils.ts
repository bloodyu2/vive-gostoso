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

/**
 * Only allow http/https URLs to be used in an href/src attribute fed by
 * user-supplied data (business "website"/"menu_url", professional "website",
 * portfolio item "url"). Returns undefined for anything else -- javascript:,
 * data:, vbscript:, malformed strings -- so callers can simply omit the link
 * instead of rendering a dangerous href.
 *
 * See docs/security-audit/relatorio-auditoria-seguranca.pdf (2026-08-29),
 * finding F2. This is the actual security boundary: it MUST be applied at
 * render time (not only on form submit), because RLS still lets a business
 * owner write these columns directly via the Supabase REST API, bypassing
 * any client-side form validation.
 */
export function safeExternalUrl(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    // Not an absolute URL -- business owners commonly type "example.com"
    // without a scheme. Try once with an https:// prefix.
    try {
      const url = new URL(`https://${trimmed}`)
      return url.protocol === 'https:' ? url.toString() : undefined
    } catch {
      return undefined
    }
  }
}
