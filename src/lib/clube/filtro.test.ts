import { describe, expect, it } from 'vitest'
import { dicionario } from '@/lib/bio/dicionario'
import { juntarCategorias, nomeDaCategoria } from './categorias-vantagem'
import { chipsDeCategorias, filtrarPorCategoria } from './filtro'
import type { CategoriaDaVantagem, StatusVantagem, Vantagem } from './vantagens'

const cat = (id: string, nome: string, ordem: number): CategoriaDaVantagem => ({ id, slug: id, nome, ordem })
const POUSADAS = cat('pousadas', 'Pousadas', 3)
const PASSEIOS = cat('passeios', 'Passeios', 4)
const RESTAURANTES = cat('restaurantes', 'Restaurantes', 1)

const v = (nome: string, categoria: CategoriaDaVantagem | null, status: StatusVantagem = 'no_ar') => ({
  nome,
  status,
  categoria,
})

// A ordem que o servidor manda (no ar primeiro, depois por nome) tem de sobreviver ao filtro.
const LISTA = [
  v('Damy', RESTAURANTES),
  v('Casa Gostoso Mar', POUSADAS),
  v('Expedicoes', PASSEIOS),
  v('Oasis', POUSADAS),
  v('Parcel', POUSADAS),
  v('Serido', RESTAURANTES),
  v('Sem categoria', null),
]

describe('chips de categoria', () => {
  it('um chip por categoria, na ordem do guia, com a conta dos cartoes', () => {
    expect(chipsDeCategorias(LISTA)).toEqual([
      { id: 'restaurantes', rotulo: 'Restaurantes', n: 2 },
      { id: 'pousadas', rotulo: 'Pousadas', n: 3 },
      { id: 'passeios', rotulo: 'Passeios', n: 1 },
    ])
  })

  it('so categorias com parceiro NO AR: categoria so de "em combinacao" nao ganha chip', () => {
    const chips = chipsDeCategorias([v('A', POUSADAS), v('B', PASSEIOS, 'em_combinacao')])
    expect(chips.map((c) => c.id)).toEqual(['pousadas'])
  })

  it('cartao sem categoria nao gera chip', () => {
    expect(chipsDeCategorias([v('A', null)])).toEqual([])
  })

  it('o numero do chip conta os cartoes que aparecem com ele ativo, "em combinacao" incluso', () => {
    const lista = [v('A', POUSADAS), v('B', POUSADAS, 'em_combinacao')]
    expect(chipsDeCategorias(lista)[0].n).toBe(2)
    expect(filtrarPorCategoria(lista, 'pousadas')).toHaveLength(2)
  })
})

describe('filtro por categoria', () => {
  it('Todos (null) devolve tudo, na ordem original, inclusive o cartao sem categoria', () => {
    expect(filtrarPorCategoria(LISTA, null).map((x) => x.nome)).toEqual(LISTA.map((x) => x.nome))
  })

  it('uma categoria devolve so os dela, sem trocar a ordem', () => {
    expect(filtrarPorCategoria(LISTA, 'pousadas').map((x) => x.nome)).toEqual(['Casa Gostoso Mar', 'Oasis', 'Parcel'])
  })

  it('categoria sem cartao devolve vazio (estado vazio da tela)', () => {
    expect(filtrarPorCategoria(LISTA, 'artesanato')).toEqual([])
  })

  it('nao altera a lista de entrada', () => {
    const copia = [...LISTA]
    filtrarPorCategoria(LISTA, 'passeios')
    expect(LISTA).toEqual(copia)
  })
})

describe('nome da categoria nos tres idiomas', () => {
  const slugs = [
    'restaurantes', 'bares', 'bar-balada', 'servicos-locais', 'mercado', 'lavanderia', 'farmacia',
    'barbearia-salao', 'saude', 'pousadas', 'passeios', 'kite-windsurf', 'buggy', 'artesanato',
    'aluguel-bicicletas', 'escola-kite-wind',
  ]

  for (const lang of ['pt', 'en', 'es'] as const) {
    it(`${lang}: as 16 categorias do guia tem nome, sem travessao`, () => {
      const t = dicionario(lang).clube.categorias as Record<string, string>
      for (const slug of slugs) {
        expect(t[slug], `${lang}.${slug}`).toBeTruthy()
        expect(t[slug]).not.toMatch(/[\u2014\u2013]/)
      }
    })

    it(`${lang}: textos do filtro existem`, () => {
      const t = dicionario(lang).clube
      for (const k of ['filtro_rotulo', 'filtro_todos', 'filtro_vazio', 'filtro_ver_todos', 'filtro_resultado'] as const) {
        expect(t[k], `${lang}.${k}`).toBeTruthy()
      }
      expect(t.filtro_resultado).toContain('{n}')
      expect(t.filtro_resultado).toContain('{total}')
    })
  }

  it('slug sem traducao cai no nome do banco', () => {
    expect(nomeDaCategoria({ pousadas: 'Inns' }, { slug: 'pousadas', name: 'Pousadas' })).toBe('Inns')
    expect(nomeDaCategoria({}, { slug: 'nova', name: 'Categoria Nova' })).toBe('Categoria Nova')
  })
})

describe('juntarCategorias', () => {
  const base = (businessId: string): Vantagem => ({
    partnerId: `p-${businessId}`, businessId, nome: businessId, slug: businessId, logoUrl: null, capaUrl: null,
    tipo: null, beneficio: 'x', regra: null, limiteMensal: null, validoAte: null, status: 'no_ar', esgotada: false,
  })

  it('poe a categoria traduzida em cada vantagem e mantem a ordem', () => {
    const r = juntarCategorias(
      [base('b1'), base('b2'), base('b3')],
      [
        { id: 'b2', category: { id: 'c1', name: 'Pousadas', slug: 'pousadas', display_order: 3 } },
        { id: 'b1', category: { id: 'c2', name: 'Passeios', slug: 'passeios', display_order: 4 } },
        { id: 'b3', category: null },
      ],
      { pousadas: 'Inns' },
    )
    expect(r.map((x) => x.businessId)).toEqual(['b1', 'b2', 'b3'])
    expect(r[0].categoria).toEqual({ id: 'c2', slug: 'passeios', nome: 'Passeios', ordem: 4 })
    expect(r[1].categoria?.nome).toBe('Inns')
    expect(r[2].categoria).toBeNull()
  })
})
