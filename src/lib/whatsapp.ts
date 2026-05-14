const DEFAULT_MESSAGE = 'Olá! Vi o Vive Gostoso e gostaria de mais informações.'

/**
 * Número oficial do Vive Gostoso (DDI 55 + DDD 84 + número).
 * Use em todos os CTAs fixos do site (não em CTAs de cards de negócios,
 * que devem usar o número do business).
 */
export const OFFICIAL_WHATSAPP = '5584994035461'

export function sanitizePhone(phone: string): string {
  const digits = (phone ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.startsWith('55') ? digits : `55${digits}`
}

export function buildWhatsAppLink(phone: string, message?: string): string {
  const number = sanitizePhone(phone)
  const text = encodeURIComponent(message ?? DEFAULT_MESSAGE)
  return `https://wa.me/${number}?text=${text}`
}
