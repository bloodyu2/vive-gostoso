import { describe, it, expect } from 'vitest'
import { buildPageMetadata } from './page-metadata'

const ROTAS = ['home','come','fique','passeie','explore','participe','conheca','contrate','apoie','blog','sobre','resolva','transparencia'] as const
const LOCALES = ['pt','en','es'] as const

describe('buildPageMetadata', () => {
  it('usa o titulo do locale pedido', () => {
    const pt = buildPageMetadata('come', 'pt')
    const en = buildPageMetadata('come', 'en')
    expect(pt.title).toContain('Restaurantes em São Miguel do Gostoso')
    expect(en.title).not.toBe(pt.title)
    expect(String(en.title).length).toBeGreaterThan(10)
  })

  it('nao deixa passar titulo sem acento nem travessao', () => {
    for (const lang of LOCALES) {
      const t = String(buildPageMetadata('conheca', lang).title)
      expect(t).toContain('São Miguel do Gostoso')
      expect(t.length).toBeGreaterThan(20)
      expect(t).not.toContain('--')
      expect(t).not.toContain('—')
    }
    expect(String(buildPageMetadata('conheca', 'pt').title)).toContain('Conheça')
  })

  it('nao repete a marca no fim do titulo', () => {
    for (const lang of LOCALES) {
      for (const r of ROTAS) {
        expect(String(buildPageMetadata(r, lang).title)).not.toContain('| Vive Gostoso')
      }
    }
  })

  it('monta canonical sem prefixo no pt e com prefixo nos outros', () => {
    expect(buildPageMetadata('come', 'pt').alternates?.canonical)
      .toBe('https://www.vivegostoso.com.br/come')
    expect(buildPageMetadata('come', 'es').alternates?.canonical)
      .toBe('https://www.vivegostoso.com.br/es/come')
  })

  it('a home nao vira barra dupla', () => {
    expect(buildPageMetadata('home', 'pt').alternates?.canonical)
      .toBe('https://www.vivegostoso.com.br')
    expect(buildPageMetadata('home', 'en').alternates?.canonical)
      .toBe('https://www.vivegostoso.com.br/en')
  })

  it('declara as quatro alternates, com x-default no portugues', () => {
    const langs = buildPageMetadata('apoie', 'pt').alternates?.languages ?? {}
    expect(Object.keys(langs).sort()).toEqual(['en','es','pt-BR','x-default'])
    expect(langs['x-default']).toBe(langs['pt-BR'])
  })

  it('cobre as 13 rotas nos 3 locales, com title e description na faixa', () => {
    let contados = 0
    for (const r of ROTAS) {
      for (const lang of LOCALES) {
        const m = buildPageMetadata(r, lang)
        const t = String(m.title), d = String(m.description)
        expect(t.length, `${r}/${lang} title`).toBeGreaterThan(20)
        expect(t.length, `${r}/${lang} title`).toBeLessThanOrEqual(60)
        expect(d.length, `${r}/${lang} desc`).toBeGreaterThanOrEqual(140)
        expect(d.length, `${r}/${lang} desc`).toBeLessThanOrEqual(160)
        contados++
      }
    }
    expect(contados).toBe(39)
  })

  it('openGraph e twitter herdam o mesmo par title/description', () => {
    const m = buildPageMetadata('fique', 'es')
    expect(m.openGraph?.title).toBe(m.title)
    expect(m.twitter?.description).toBe(m.description)
    expect(m.openGraph?.url).toBe(m.alternates?.canonical)
  })
})
