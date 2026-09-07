import { describe, it, expect } from 'vitest'
import { buildWhatsAppLink, OFFICIAL_WHATSAPP, sanitizePhone } from './whatsapp'

const MENSAGEM_PADRAO = 'Olá! Vi o Vive Gostoso e gostaria de mais informações.'

describe('buildWhatsAppLink', () => {
  /* Asserção sobre o link inteiro, e não só sobre o prefixo. Um switch sem o
     case cai fora e devolve undefined, que vira a string "undefined" no
     encodeURIComponent: um teste que só olhasse o prefixo passaria com a
     mensagem quebrada, porque o vitest não checa tipo. */
  it('monta o link do CTA fixo com a mensagem padrao inteira', () => {
    expect(buildWhatsAppLink(OFFICIAL_WHATSAPP, { source: 'official_cta' })).toBe(
      `https://wa.me/5584936180839?text=${encodeURIComponent(MENSAGEM_PADRAO)}`
    )
  })

  it('prefixa o 55 quando o numero vem sem ele', () => {
    expect(buildWhatsAppLink('84936180839', 'oi')).toBe(
      'https://wa.me/5584936180839?text=oi'
    )
  })

  it('nunca deixa a palavra undefined virar mensagem', () => {
    const link = buildWhatsAppLink(OFFICIAL_WHATSAPP, { source: 'official_cta' })
    expect(link).not.toContain('undefined')
  })
})

describe('sanitizePhone', () => {
  it('tira formatacao e devolve vazio quando nao ha digito', () => {
    expect(sanitizePhone('(84) 99139-7001')).toBe('5584991397001')
    expect(sanitizePhone('')).toBe('')
  })
})
