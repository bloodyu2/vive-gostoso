import { describe, expect, it } from 'vitest'
import {
  idiomaDoSlug,
  slugNoIdioma,
  visivelNoIdioma,
  urlDoPost,
  alternatesDoPost,
  inLanguageDoPost,
} from './traducoes'

const B = 'https://www.vivegostoso.com.br'
const PT = 'tabua-de-mares-sao-miguel-do-gostoso'
const ES = 'tabla-de-mareas-sao-miguel-do-gostoso'
const EN = 'tide-table-sao-miguel-do-gostoso'
const SOLTO = 'sao-miguel-gostoso-ou-pipa'

describe('traducoes do blog', () => {
  it('idiomaDoSlug', () => {
    expect(idiomaDoSlug(PT)).toBe('pt')
    expect(idiomaDoSlug(ES)).toBe('es')
    expect(idiomaDoSlug(EN)).toBe('en')
    expect(idiomaDoSlug(SOLTO)).toBeNull()
  })

  it('slugNoIdioma', () => {
    expect(slugNoIdioma(PT, 'en')).toBe(EN)
    expect(slugNoIdioma(EN, 'es')).toBe(ES)
    expect(slugNoIdioma(ES, 'pt')).toBe(PT)
    expect(slugNoIdioma(SOLTO, 'en')).toBe(SOLTO)
  })

  it('visivelNoIdioma', () => {
    expect(visivelNoIdioma(PT, 'pt')).toBe(true)
    expect(visivelNoIdioma(PT, 'en')).toBe(false)
    expect(visivelNoIdioma(EN, 'en')).toBe(true)
    expect(visivelNoIdioma(ES, 'pt')).toBe(false)
    for (const l of ['pt', 'en', 'es'] as const) expect(visivelNoIdioma(SOLTO, l)).toBe(true)
  })

  it('urlDoPost com prefixo', () => {
    expect(urlDoPost(PT, 'pt')).toBe(`${B}/blog/${PT}`)
    expect(urlDoPost(EN, 'en')).toBe(`${B}/en/blog/${EN}`)
    expect(urlDoPost(ES, 'es')).toBe(`${B}/es/blog/${ES}`)
  })

  it('alternatesDoPost de grupo aponta cada idioma pro seu slug', () => {
    const esperado = {
      'pt-BR': `${B}/blog/${PT}`,
      en: `${B}/en/blog/${EN}`,
      es: `${B}/es/blog/${ES}`,
      'x-default': `${B}/blog/${PT}`,
    }
    expect(alternatesDoPost(PT)).toEqual(esperado)
    expect(alternatesDoPost(EN)).toEqual(esperado)
    expect(alternatesDoPost(ES)).toEqual(esperado)
  })

  it('alternatesDoPost sem grupo mantem o mesmo slug', () => {
    expect(alternatesDoPost(SOLTO)).toEqual({
      'pt-BR': `${B}/blog/${SOLTO}`,
      en: `${B}/en/blog/${SOLTO}`,
      es: `${B}/es/blog/${SOLTO}`,
      'x-default': `${B}/blog/${SOLTO}`,
    })
  })

  it('inLanguageDoPost', () => {
    expect(inLanguageDoPost(PT, 'pt')).toBe('pt-BR')
    expect(inLanguageDoPost(EN, 'en')).toBe('en')
    expect(inLanguageDoPost(ES, 'es')).toBe('es')
    expect(inLanguageDoPost(SOLTO, 'en')).toBe('en')
  })
})

describe('normalizarIdioma', () => {
  it('reduz variantes a pt/en/es', async () => {
    const { normalizarIdioma } = await import('./traducoes')
    expect(normalizarIdioma('pt-BR')).toBe('pt')
    expect(normalizarIdioma('en-US')).toBe('en')
    expect(normalizarIdioma('es')).toBe('es')
    expect(normalizarIdioma('fr')).toBe('pt')
    expect(normalizarIdioma(undefined)).toBe('pt')
  })
})
