import { describe, expect, it } from 'vitest'
import { comUtm, linksDaBio, linksDoRodape } from './links-bio'

const UTM = 'utm_source=instagram&utm_medium=bio'
const ORDEM = ['mares', 'mapa', 'come', 'fique', 'passeie', 'eventos', 'blog', 'cadastre']

describe('comUtm', () => {
  it('acrescenta com ? quando nao ha query', () => {
    expect(comUtm('/come')).toBe(`/come?${UTM}`)
  })
  it('acrescenta com & quando ja ha query', () => {
    expect(comUtm('/come?x=1')).toBe(`/come?x=1&${UTM}`)
  })
  it('poe a query antes do #', () => {
    expect(comUtm('/blog/a#topo')).toBe(`/blog/a?${UTM}#topo`)
    expect(comUtm('/a?x=1#b')).toBe(`/a?x=1&${UTM}#b`)
  })
})

describe('linksDaBio', () => {
  for (const lang of ['pt', 'en', 'es'] as const) {
    const p = lang === 'pt' ? '' : `/${lang}`

    it(`${lang}: blocos na ordem, todos com UTM`, () => {
      const blocos = linksDaBio(lang, { postSlug: null })
      expect(blocos.map((b) => b.id)).toEqual(ORDEM)
      for (const b of blocos) expect(b.href, b.id).toContain(UTM)
      expect(blocos.map((b) => b.href.split('?')[0])).toEqual([
        `${p}/explore/mares`,
        `${p}/explore/mapa`,
        `${p}/come`,
        `${p}/fique`,
        `${p}/passeie`,
        `${p}/participe`,
        `${p}/blog`,
        '/cadastre',
      ])
    })

    it(`${lang}: blog aponta para o post quando ha slug`, () => {
      const blog = linksDaBio(lang, { postSlug: 'meu-post' }).find((b) => b.id === 'blog')!
      expect(blog.href).toBe(`${p}/blog/meu-post?${UTM}`)
    })

    it(`${lang}: rodape com idiomas e privacidade, todos com UTM`, () => {
      const r = linksDoRodape(lang)
      expect(r.idiomas.map((i) => i.href)).toEqual([`/bio?${UTM}`, `/en/bio?${UTM}`, `/es/bio?${UTM}`])
      expect(r.idiomas.find((i) => i.lang === lang)?.atual).toBe(true)
      expect(r.privacidade).toBe(`${p}/privacidade?${UTM}`)
    })
  }
})
