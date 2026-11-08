import { describe, expect, it } from 'vitest'
import { barraDoAppVisivel, semPrefixoDeIdioma } from './barra-do-app'

describe('barraDoAppVisivel', () => {
  it('aparece na home, no explore e no blog, em qualquer idioma', () => {
    for (const c of ['/', '/en', '/es/explore', '/explore/mares', '/blog/algum-post', '/come', '/participe']) {
      expect(barraDoAppVisivel(c), c).toBe(true)
    }
  })

  it('some no perfil do negocio, nas areas logadas e no admin', () => {
    for (const c of ['/negocio/casa-surya', '/en/negocio/casa-surya', '/cadastre/painel', '/es/cadastre', '/admin/negocios']) {
      expect(barraDoAppVisivel(c), c).toBe(false)
    }
  })

  it('nao confunde rota parecida com a bloqueada', () => {
    expect(barraDoAppVisivel('/negocios-novos')).toBe(true)
  })
})

describe('semPrefixoDeIdioma', () => {
  it('tira pt, en e es e devolve / para a raiz', () => {
    expect(semPrefixoDeIdioma('/en/come')).toBe('/come')
    expect(semPrefixoDeIdioma('/es')).toBe('/')
    expect(semPrefixoDeIdioma('/pt/blog')).toBe('/blog')
    expect(semPrefixoDeIdioma('/explore')).toBe('/explore')
  })
})
