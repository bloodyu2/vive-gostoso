// src/lib/whatsapp.ts

const DEFAULT_MESSAGE = 'Olá! Vi o Vive Gostoso e gostaria de mais informações.'

/**
 * Número oficial do Vive Gostoso (DDI 55 + DDD 84 + número).
 * Use em todos os CTAs fixos do site (não em CTAs de cards de negócios).
 */
export const OFFICIAL_WHATSAPP = '5584994035461'

export function sanitizePhone(phone: string): string {
  const digits = (phone ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.startsWith('55') ? digits : `55${digits}`
}

// ── Context types ──────────────────────────────────────────────────────────

export type WhatsAppContext =
  | { source: 'professional_profile'; name: string; specialty?: string }
  | { source: 'professional_card'; name: string }
  | { source: 'service_company_card'; name: string }
  | { source: 'business_page'; name: string }
  | { source: 'business_card'; name: string }

function buildContextMessage(ctx: WhatsAppContext): string {
  switch (ctx.source) {
    case 'professional_profile':
      return ctx.specialty
        ? `Olá ${ctx.name}! Vi seu perfil no Vive Gostoso e tenho interesse na sua ${ctx.specialty}. Pode me contar mais?`
        : `Olá ${ctx.name}! Vi seu perfil no Vive Gostoso e gostaria de conversar sobre seus serviços.`
    case 'professional_card':
      return `Olá ${ctx.name}! Vi você no Vive Gostoso (seção Contrate) e gostaria de conversar sobre seus serviços.`
    case 'service_company_card':
      return `Olá ${ctx.name}! Vi vocês na seção Contrate do Vive Gostoso e gostaria de um orçamento.`
    case 'business_page':
      return `Olá ${ctx.name}! Vi vocês no Vive Gostoso e gostaria de conversar.`
    case 'business_card':
      return `Olá ${ctx.name}! Vi o ${ctx.name} no Vive Gostoso e tenho interesse.`
  }
}

// ── Main function ──────────────────────────────────────────────────────────

/**
 * Build a wa.me deep link.
 * @param phone  Raw phone number (digits only, or with formatting — auto-sanitized).
 * @param messageOrContext  Plain string message OR a WhatsAppContext for auto-generated contextual messages.
 */
export function buildWhatsAppLink(
  phone: string,
  messageOrContext?: string | WhatsAppContext
): string {
  const number = sanitizePhone(phone)
  const message =
    typeof messageOrContext === 'string'
      ? messageOrContext
      : messageOrContext
      ? buildContextMessage(messageOrContext)
      : DEFAULT_MESSAGE
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
