import { afterEach, describe, expect, it } from 'vitest'
import {
  DESTINO_PADRAO,
  PLAQUINHAS,
  RESERVADAS,
  codigoValido,
  linkDeAvaliacao,
  linkDeAvaliacaoExtra,
  linkDoInstagram,
  plaquinhaDoCodigo,
  plaquinhaReservada,
} from './plaquinhas'

afterEach(() => {
  for (const k of Object.keys(PLAQUINHAS)) if (k === '99') delete PLAQUINHAS[k]
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
    expect(plaquinhaDoCodigo('11')).toBeNull()
    expect(plaquinhaDoCodigo('00')).toBeNull()
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

describe('mapa das plaquinhas (04/11/2026)', () => {
  const codigos = Object.keys(PLAQUINHAS)

  it('os dez codigos tem negocio, e nenhum negocio se repete', () => {
    expect(codigos.sort()).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'])
    const slugs = codigos.map((c) => PLAQUINHAS[c].slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs).toEqual([
      'gostoso-expedicoes',
      'pousada-parcel-do-gostoso',
      'casa-reduto-artesanato',
      'serido-praia',
      'casa-gostoso-mar',
      'cafe-com-biscoitos-damy',
      'pousada-oasis-dos-ventos',
      'o-pico-surf-skate-shop',
      'flor-de-caju',
      'gostoso-buggy',
    ])
  })

  it('todo negocio do mapa tem link de avaliacao do Google, sempre de place_id', () => {
    for (const c of codigos) {
      const link = linkDeAvaliacao(PLAQUINHAS[c])
      expect(link, c).toMatch(/^https:\/\/search\.google\.com\/local\/writereview\?placeid=ChIJ[A-Za-z0-9_-]{23}$/)
    }
  })

  it('nenhum place_id se repete', () => {
    const ids = codigos.map((c) => PLAQUINHAS[c].placeId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('o 09 e da Flor de Caju (presente), com Google e Instagram', () => {
    expect(PLAQUINHAS['09'].slug).toBe('flor-de-caju')
    expect(linkDeAvaliacao(PLAQUINHAS['09'])).toBe(
      'https://search.google.com/local/writereview?placeid=ChIJm8qC1zQNtAcRjMEUYljgzUw',
    )
    expect(linkDoInstagram(PLAQUINHAS['09'].instagram)).toBe('https://www.instagram.com/flordecajucafe/')
  })

  it('o 10 e o Gostoso Buggy, com Instagram que existe (gostosobuggyturismo)', () => {
    expect(PLAQUINHAS['10'].slug).toBe('gostoso-buggy')
    expect(linkDoInstagram(PLAQUINHAS['10'].instagram)).toBe('https://www.instagram.com/gostosobuggyturismo/')
    expect(linkDeAvaliacao(PLAQUINHAS['10'])).toBe(
      'https://search.google.com/local/writereview?placeid=ChIJ23kqQNUNtAcRkqdHCye6eTM',
    )
  })

  it('nao sobrou codigo reservado: de 01 a 10 todos tem negocio', () => {
    expect(RESERVADAS).toEqual([])
    expect(plaquinhaReservada('10')).toBe(false)
    expect(plaquinhaDoCodigo('10')).not.toBeNull()
  })

  it('codigo reservado e codigo mapeado nunca se misturam', () => {
    for (const c of RESERVADAS) expect(PLAQUINHAS[c]).toBeUndefined()
    expect(plaquinhaReservada('01')).toBe(false)
    expect(plaquinhaReservada('11')).toBe(false)
    expect(plaquinhaReservada('9')).toBe(false)
    expect(plaquinhaReservada('../')).toBe(false)
  })

  it('os dez codigos impressos (01 a 10) tem destino: negocio ou pagina reservada', () => {
    for (let i = 1; i <= 10; i++) {
      const c = String(i).padStart(2, '0')
      expect(Boolean(plaquinhaDoCodigo(c)) || plaquinhaReservada(c), c).toBe(true)
    }
  })

  it('o 04 mostra o nome certo, O Jardim do Seridó, e o Instagram dele', () => {
    expect(PLAQUINHAS['04'].nome).toBe('O Jardim do Seridó')
    expect(linkDoInstagram(PLAQUINHAS['04'].instagram)).toBe('https://www.instagram.com/ojardimdoserido/')
  })

  it('o foco da foto, quando existe, fica entre 0 e 100', () => {
    for (const c of Object.keys(PLAQUINHAS)) {
      const f = PLAQUINHAS[c].foco
      if (f !== undefined) expect(f >= 0 && f <= 100, c).toBe(true)
    }
  })

  it('o botao do Google some quando o negocio nao tem link', () => {
    expect(linkDeAvaliacao({ slug: 'sem-link' })).toBeNull()
  })
})

describe('linkDoInstagram', () => {
  it('monta o link a partir do @, com ou sem arroba', () => {
    expect(linkDoInstagram('opico.smg')).toBe('https://www.instagram.com/opico.smg/')
    expect(linkDoInstagram('@parceldogostosopousada')).toBe('https://www.instagram.com/parceldogostosopousada/')
    expect(linkDoInstagram('  biscoitos_damy ')).toBe('https://www.instagram.com/biscoitos_damy/')
  })
  it('sem @ valido, sem botao', () => {
    expect(linkDoInstagram(null)).toBeNull()
    expect(linkDoInstagram('')).toBeNull()
    expect(linkDoInstagram('a b')).toBeNull()
    expect(linkDoInstagram('a/../b')).toBeNull()
    expect(linkDoInstagram('https://evil.example')).toBeNull()
    expect(linkDoInstagram('x'.repeat(31))).toBeNull()
  })
})

describe('varios negocios na mesma plaquinha', () => {
  const principais = Object.values(PLAQUINHAS)
  const comExtras = Object.entries(PLAQUINHAS).filter(([, p]) => (p.extras ?? []).length > 0)

  it('a 07 (Oasis dos Ventos) traz a Lokos por Kite depois da pousada, com o Instagram dela', () => {
    expect(PLAQUINHAS['07'].slug).toBe('pousada-oasis-dos-ventos')
    const extra = PLAQUINHAS['07'].extras?.[0]
    expect(extra?.slug).toBe('lokos-por-kite')
    expect(extra?.nome).toBe('Lokos por Kite')
    expect(linkDoInstagram(extra?.instagram)).toBe('https://www.instagram.com/lokosporkite/')
  })

  it('negocio extra sem Google nao tem botao de avaliar (a ficha da Lokos nao existe no Maps)', () => {
    const extra = PLAQUINHAS['07'].extras?.[0]
    expect(extra && linkDeAvaliacaoExtra(extra)).toBeNull()
  })

  it('extra com place_id ganha o link de avaliacao, no mesmo padrao do principal', () => {
    expect(linkDeAvaliacaoExtra({ slug: 'x', placeId: 'ChIJabc_-123' })).toBe(
      'https://search.google.com/local/writereview?placeid=ChIJabc_-123',
    )
    expect(linkDeAvaliacaoExtra({ slug: 'x', avaliar: 'https://exemplo.com/r' })).toBeNull()
  })

  it('nenhum negocio aparece duas vezes no mapa (nem como principal e extra, nem em dois codigos)', () => {
    const slugs = [...principais.map((p) => p.slug), ...principais.flatMap((p) => (p.extras ?? []).map((e) => e.slug))]
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('o codigo continua apontando para o negocio principal: os adesivos ja colados nao mudam', () => {
    for (const [codigo] of comExtras) expect(plaquinhaDoCodigo(codigo)?.slug).toBe(PLAQUINHAS[codigo].slug)
    expect(plaquinhaDoCodigo('07')?.slug).toBe('pousada-oasis-dos-ventos')
  })
})
