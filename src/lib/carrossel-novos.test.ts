import { describe, it, expect } from 'vitest'
import {
  indiceAnterior,
  montarCarrossel,
  proximoIndice,
  type NegocioDoCarrossel,
} from './carrossel-novos'

const neg = (id: string, extra: Partial<NegocioDoCarrossel> = {}): NegocioDoCarrossel => ({
  id,
  name: `Negocio ${id}`,
  slug: `negocio-${id}`,
  cover_url: `https://exemplo.test/${id}.jpg`,
  category: null,
  is_verified: false,
  ...extra,
})

describe('montarCarrossel', () => {
  it('poe destaque primeiro e alterna novos e verificados', () => {
    const itens = montarCarrossel({
      destaques: [neg('d1')],
      novos: [neg('n1'), neg('n2')],
      verificados: [neg('v1'), neg('v2')],
    })
    expect(itens.map(i => `${i.motivo}:${i.id}`)).toEqual([
      'destaque:d1',
      'novo:n1',
      'verificado:v1',
      'novo:n2',
      'verificado:v2',
    ])
  })

  it('nao repete o negocio que aparece em mais de uma fonte', () => {
    /* A Casa Reduto e destaque, nova e verificada ao mesmo tempo. Tem de ser um
       slide so, com o motivo mais forte (destaque). */
    const reduto = neg('reduto', { is_verified: true })
    const itens = montarCarrossel({
      destaques: [reduto],
      novos: [reduto, neg('n1')],
      verificados: [reduto, neg('v1')],
    })
    expect(itens.map(i => i.id)).toEqual(['reduto', 'n1', 'v1'])
    expect(itens[0].motivo).toBe('destaque')
  })

  it('deixa de fora negocio sem foto', () => {
    const itens = montarCarrossel({
      destaques: [neg('d1', { cover_url: null })],
      novos: [neg('n1', { cover_url: '' }), neg('n2')],
      verificados: [],
    })
    expect(itens.map(i => i.id)).toEqual(['n2'])
  })

  it('respeita o maximo', () => {
    const muitos = Array.from({ length: 20 }, (_, i) => neg(`n${i}`))
    expect(montarCarrossel({ destaques: [], novos: muitos, verificados: [] }, 5)).toHaveLength(5)
    expect(montarCarrossel({ destaques: [], novos: muitos, verificados: [] })).toHaveLength(8)
  })

  it('lista vazia devolve vazia', () => {
    expect(montarCarrossel({ destaques: [], novos: [], verificados: [] })).toEqual([])
  })
})

describe('indices do carrossel', () => {
  it('volta ao inicio depois do ultimo e ao fim antes do primeiro', () => {
    expect(proximoIndice(2, 3)).toBe(0)
    expect(proximoIndice(0, 3)).toBe(1)
    expect(indiceAnterior(0, 3)).toBe(2)
    expect(indiceAnterior(2, 3)).toBe(1)
  })

  it('com zero itens nao quebra', () => {
    expect(proximoIndice(0, 0)).toBe(0)
    expect(indiceAnterior(0, 0)).toBe(0)
  })
})
