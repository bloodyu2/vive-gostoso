import { describe, it, expect } from 'vitest'
import { buildWhatsAppLink, OFFICIAL_WHATSAPP } from './whatsapp'

describe('buildWhatsAppLink', () => {
  it('usa o numero oficial com o 55 e codifica a mensagem', () => {
    const link = buildWhatsAppLink(OFFICIAL_WHATSAPP, { source: 'official_cta' })
    expect(link).toContain('https://wa.me/5584936180839?text=')
    expect(link).not.toContain(' ')
  })

  it('prefixa o 55 quando o numero vem sem ele', () => {
    expect(buildWhatsAppLink('84936180839', 'oi')).toBe(
      'https://wa.me/5584936180839?text=oi'
    )
  })
})
