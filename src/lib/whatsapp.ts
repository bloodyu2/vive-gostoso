const DEFAULT_MESSAGE = 'Olá! Vi o Vive Gostoso e gostaria de mais informações.'

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
