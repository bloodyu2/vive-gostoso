import { afterEach, describe, expect, it } from 'vitest'
import { DESTINO_PADRAO, PLAQUINHAS, codigoValido, linkDeAvaliacao, plaquinhaDoCodigo } from './plaquinhas'

afterEach(() => {
  for (const k of Object.keys(PLAQUINHAS)) if (k.startsWith('9')) delete PLAQUINHAS[k]
})

describe('codigoValido', () => {
  it('so aceita dois digitos', () => {
    expect(codigoValido('01')).toBe(true)
    expect(codigoValido('10')).toBe(true)
    expect(codigoValido('1')).toBe(false)
    expect(codigoValido('001')).toBe(false)
    expect(codigoValido('abc')).toBe(false)
    expect(codigoValido('../x')).toBe(false)
  })
})

describe('plaquinhaDoCodigo', () => {
  it('codigo sem negocio cadastrado nao tem pagina (cai na home)', () => {
    expect(plaquinhaDoCodigo('01')).toBeNull()
    expect(DESTINO_PADRAO).toBe('https://www.vivegostoso.com.br/')
  })
  it('codigo invalido nao tem pagina, mesmo que alguem tente forcar', () => {
    PLAQUINHAS['99'] = { slug: 'x' }
    expect(plaquinhaDoCodigo('99')).toEqual({ slug: 'x' })
    expect(plaquinhaDoCodigo('9')).toBeNull()
    expect(plaquinhaDoCodigo('099')).toBeNull()
  })
})

describe('linkDeAvaliacao', () => {
  it('sem dado, sem link (o botao some)', () => {
    expect(linkDeAvaliacao({ slug: 'x' })).toBeNull()
  })
  it('monta o link do Google a partir do place_id', () => {
    expect(linkDeAvaliacao({ slug: 'x', placeId: 'ChIJabc_-123' })).toBe(
      'https://search.google.com/local/writereview?placeid=ChIJabc_-123',
    )
  })
  it('recusa place_id com caracteres estranhos', () => {
    expect(linkDeAvaliacao({ slug: 'x', placeId: 'abc&x=1' })).toBeNull()
    expect(linkDeAvaliacao({ slug: 'x', placeId: '' })).toBeNull()
  })
  it('aceita link pronto so em https e em dominio do Google', () => {
    expect(linkDeAvaliacao({ slug: 'x', avaliar: 'https://g.page/r/abc/review' })).toBe('https://g.page/r/abc/review')
    expect(linkDeAvaliacao({ slug: 'x', avaliar: 'https://search.google.com/local/writereview?placeid=ChIJ1' })).toBe(
      'https://search.google.com/local/writereview?placeid=ChIJ1',
    )
    expect(linkDeAvaliacao({ slug: 'x', avaliar: 'http://g.page/r/abc/review' })).toBeNull()
    expect(linkDeAvaliacao({ slug: 'x', avaliar: 'javascript:alert(1)' })).toBeNull()
    expect(linkDeAvaliacao({ slug: 'x', avaliar: 'https://exemplo.com/review' })).toBeNull()
    expect(linkDeAvaliacao({ slug: 'x', avaliar: 'https://g.page.evil.com/r/abc' })).toBeNull()
  })
  it('o link pronto vence o place_id', () => {
    expect(linkDeAvaliacao({ slug: 'x', avaliar: 'https://g.page/r/abc/review', placeId: 'ChIJ1' })).toBe(
      'https://g.page/r/abc/review',
    )
  })
})

describe('o mapa preenchido (PLAQUINHAS) e coerente', () => {
  const entradas = Object.entries(PLAQUINHAS)
  it('so tem codigos de 01 a 10', () => {
    for (const [codigo] of entradas) expect(codigo, codigo).toMatch(/^(0[1-9]|10)$/)
  })
  it('cada linha traz um slug no formato dos slugs do site', () => {
    for (const [codigo, p] of entradas) expect(p.slug, codigo).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })
  it('nenhum negocio aparece em duas plaquinhas', () => {
    const slugs = entradas.map(([, p]) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
  it('link de avaliacao e place_id, quando informados, sao validos (senao o botao some sem aviso)', () => {
    for (const [codigo, p] of entradas) {
      if (p.avaliar || p.placeId) expect(linkDeAvaliacao(p), codigo).not.toBeNull()
    }
  })
})
