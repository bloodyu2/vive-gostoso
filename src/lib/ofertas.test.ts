import { describe, expect, it } from 'vitest'
import { linkOfertas, ofertasAtivas, rotuloConhecerSite, textosOfertas } from './ofertas'

const CANAL = 'https://t.me/balaiodeofertasrn'

describe('ofertasAtivas', () => {
  it('liga por padrão, com o canal oficial', () => {
    expect(ofertasAtivas(undefined, undefined)).toBe(true)
    expect(ofertasAtivas('true', '')).toBe(true)
    expect(linkOfertas('bio', undefined, undefined)).toContain('t.me/BalaioDeOfertasRN')
  })
  it('desliga com NEXT_PUBLIC_OFERTAS_ATIVAS=false', () => {
    expect(ofertasAtivas('false', CANAL)).toBe(false)
  })
  it('variável de URL sobrescreve o padrão', () => {
    expect(linkOfertas('bio', 'true', 'https://exemplo.com/c')).toContain('exemplo.com/c')
  })
  it('recusa URL que não é https', () => {
    expect(ofertasAtivas('true', 'http://t.me/x')).toBe(false)
    expect(ofertasAtivas('true', 'javascript:alert(1)')).toBe(false)
    expect(ofertasAtivas('true', 'nao e url')).toBe(false)
  })
  it('liga com flag e https', () => {
    expect(ofertasAtivas('true', CANAL)).toBe(true)
  })
})

describe('linkOfertas', () => {
  it('null quando desligado', () => {
    expect(linkOfertas('bio', 'false', CANAL)).toBeNull()
    expect(linkOfertas('site', 'true', 'http://t.me/x')).toBeNull()
  })
  it('bio leva as três UTM pedidas', () => {
    const url = new URL(linkOfertas('bio', 'true', CANAL)!)
    expect(url.searchParams.get('utm_source')).toBe('vivegostoso')
    expect(url.searchParams.get('utm_medium')).toBe('bio')
    expect(url.searchParams.get('utm_campaign')).toBe('ofertas')
  })
  it('site usa utm_medium=site e preserva query existente', () => {
    const url = new URL(linkOfertas('site', 'true', `${CANAL}?x=1`)!)
    expect(url.searchParams.get('utm_medium')).toBe('site')
    expect(url.searchParams.get('x')).toBe('1')
  })
})

describe('textos', () => {
  it('três idiomas, sem travessão longo e com o nome do canal', () => {
    for (const l of ['pt', 'en', 'es']) {
      const t = textosOfertas(l)
      expect(JSON.stringify(t)).not.toContain('—')
      expect(t.titulo).toContain('Balaio de Ofertas')
      expect(rotuloConhecerSite(l)).not.toContain('—')
    }
    expect(textosOfertas('fr').botao).toBe('Ver o canal')
    expect(rotuloConhecerSite('pt')).toBe('Conhecer o site')
  })
})
