import { describe, it, expect } from 'vitest'
import {
  CORES_DE_CAPA,
  corDaCapa,
  ehCapaGenerica,
  escalaDoNome,
  iniciaisDoNome,
  usaCapaTipografica,
} from './capa-negocio'

describe('corDaCapa', () => {
  it('e sempre a mesma para o mesmo slug', () => {
    /* Se a cor mudasse entre chamadas, o servidor pintaria uma capa e o cliente
       outra, e a hidratacao quebraria a arvore inteira. */
    const cores = new Set(Array.from({ length: 50 }, () => corDaCapa('pousada-do-sol')))
    expect(cores.size).toBe(1)
  })

  it('slugs diferentes nao caem todos na mesma cor', () => {
    /* 42 pousadas dividiam a mesma foto. Se dividissem tambem a mesma cor, a
       capa tipografica teria trocado uma repeticao por outra. */
    const slugs = Array.from({ length: 200 }, (_, i) => `pousada-numero-${i}`)
    const contagem = new Map<string, number>()
    for (const s of slugs) contagem.set(corDaCapa(s), (contagem.get(corDaCapa(s)) ?? 0) + 1)
    expect(contagem.size).toBe(CORES_DE_CAPA.length)
    for (const [cor, n] of contagem) expect(n, cor).toBeGreaterThan(slugs.length * 0.2)
  })

  it('devolve uma cor da paleta, nunca outra coisa', () => {
    for (const s of ['a', 'balaio', 'casa-reduto-artesanato', '', 'ãçé-1']) {
      expect(CORES_DE_CAPA).toContain(corDaCapa(s))
    }
  })
})

describe('ehCapaGenerica', () => {
  it('reconhece os doze arquivos por categoria', () => {
    expect(ehCapaGenerica('/images/businesses/pousada.jpg')).toBe(true)
    expect(ehCapaGenerica('/images/businesses/restaurante.jpg')).toBe(true)
    expect(ehCapaGenerica('/images/businesses/bar.jpg')).toBe(true)
  })

  it('nao confunde foto de verdade com generico', () => {
    expect(ehCapaGenerica(null)).toBe(false)
    expect(ehCapaGenerica(undefined)).toBe(false)
    expect(ehCapaGenerica('')).toBe(false)
    expect(
      ehCapaGenerica(
        'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/x/y.jpg'
      )
    ).toBe(false)
    expect(ehCapaGenerica('https://images.unsplash.com/photo-1?w=800')).toBe(false)
    expect(ehCapaGenerica('/images/blog/praias.jpg')).toBe(false)
  })
})

describe('usaCapaTipografica', () => {
  it('sem capa e capa generica caem na tipografica', () => {
    expect(usaCapaTipografica(null)).toBe(true)
    expect(usaCapaTipografica(undefined)).toBe(true)
    expect(usaCapaTipografica('')).toBe(true)
    expect(usaCapaTipografica('/images/businesses/bar.jpg')).toBe(true)
  })

  it('foto de verdade nao cai', () => {
    expect(usaCapaTipografica('https://images.unsplash.com/photo-1?w=800')).toBe(false)
    expect(
      usaCapaTipografica('https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/x.jpg')
    ).toBe(false)
  })
})

describe('escalaDoNome', () => {
  it('nome mais longo do banco recebe o menor corpo', () => {
    /* "Casa Reduto Artesanato Colaborativo", 35 caracteres, medido em
       2026-09-07. E o pior caso de quebra da capa. */
    expect(escalaDoNome('Casa Reduto Artesanato Colaborativo')).toBe(9)
    expect(escalaDoNome('Balaio')).toBe(17)
  })

  it('nunca cresce quando o nome cresce', () => {
    let anterior = Infinity
    for (let n = 1; n <= 60; n++) {
      const atual = escalaDoNome('x'.repeat(n))
      expect(atual, `${n} caracteres`).toBeLessThanOrEqual(anterior)
      anterior = atual
    }
  })

  it('espaco nas pontas nao muda o corpo', () => {
    expect(escalaDoNome('  Balaio  ')).toBe(escalaDoNome('Balaio'))
  })
})

describe('iniciaisDoNome', () => {
  it('pula preposicao, que nao diz nada sobre o negocio', () => {
    expect(iniciaisDoNome('Pousada do Sol')).toBe('PS')
    expect(iniciaisDoNome('Casa de Praia e Mar')).toBe('CP')
  })

  it('uma palavra so devolve uma letra', () => {
    expect(iniciaisDoNome('Balaio')).toBe('B')
  })

  it('nomes reais do banco', () => {
    expect(iniciaisDoNome('Casa Reduto Artesanato Colaborativo')).toBe('CR')
    expect(iniciaisDoNome('Dr. Wind Beach Club & Watersports')).toBe('DW')
    expect(iniciaisDoNome('Ore Cozinha')).toBe('OC')
  })

  it('acento vira maiuscula com acento, nao lixo', () => {
    expect(iniciaisDoNome('Ácala Ébano')).toBe('ÁÉ')
  })

  it('nome sem letra nenhuma nao quebra', () => {
    expect(iniciaisDoNome('   ')).toBe('?')
    expect(iniciaisDoNome('123')).toBe('?')
  })
})
