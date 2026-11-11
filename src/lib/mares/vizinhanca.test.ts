import { describe, it, expect } from 'vitest'
import { PRAIAS_MARES, praiaPorSlug } from '@/data/praias-mares'
import { MAX_VIZINHAS, RAIO_PONTOS_KM, linkMapaDaPraia, pontosPerto, praiasVizinhas } from './vizinhanca'

const praia = (slug: string) => {
  const p = praiaPorSlug(slug)
  if (!p) throw new Error(`sem praia ${slug}`)
  return p
}
const semCoordenada = PRAIAS_MARES.filter((p) => p.lat === undefined || p.lon === undefined)

describe('praiasVizinhas', () => {
  it('praia com coordenada: as mais perto, em ordem crescente, sem ela mesma e com km', () => {
    const v = praiasVizinhas(praia('cardeiro'))
    expect(v).toHaveLength(MAX_VIZINHAS)
    expect(v.every((x) => x.praia.slug !== 'cardeiro' && typeof x.km === 'number')).toBe(true)
    const kms = v.map((x) => x.km as number)
    expect([...kms].sort((a, b) => a - b)).toEqual(kms)
    // Xepa e Cardeiro ficam a menos de 1 km uma da outra (coordenadas do OSM em praias-mares.ts)
    expect(v[0].praia.slug).toBe('xepa')
    expect(kms[0]).toBeLessThan(1)
  })

  it('so sugere vizinha que tem coordenada (distancia nunca inventada)', () => {
    for (const p of PRAIAS_MARES.filter((x) => x.lat !== undefined)) {
      for (const v of praiasVizinhas(p)) {
        expect(v.praia.lat).toBeDefined()
        expect(Number.isFinite(v.km)).toBe(true)
      }
    }
  })

  it('praia sem coordenada: vizinhas do mesmo municipio, sem km', () => {
    expect(semCoordenada.length).toBeGreaterThan(0)
    for (const p of semCoordenada) {
      const v = praiasVizinhas(p)
      expect(v.length).toBeGreaterThan(0)
      for (const x of v) {
        expect(x.km).toBeUndefined()
        expect(x.praia.municipio).toBe(p.municipio)
        expect(x.praia.slug).not.toBe(p.slug)
      }
    }
  })

  it('toda praia tem ao menos uma vizinha (nenhuma pagina sem links para o resto do conjunto)', () => {
    for (const p of PRAIAS_MARES) expect(praiasVizinhas(p).length).toBeGreaterThan(0)
  })
})

describe('pontosPerto', () => {
  it('praia sem coordenada nao tem ponto perto', () => {
    for (const p of semCoordenada) expect(pontosPerto(p)).toEqual([])
  })

  it('so devolve ponto que nao e praia, dentro do raio e em ordem crescente', () => {
    for (const p of PRAIAS_MARES) {
      const r = pontosPerto(p)
      expect(r.every((x) => x.ponto.categoria !== 'praias' && x.km <= RAIO_PONTOS_KM)).toBe(true)
      const kms = r.map((x) => x.km)
      expect([...kms].sort((a, b) => a - b)).toEqual(kms)
    }
  })

  it('o Farol do Calcanhar aparece perto das praias de Touros que tem coordenada', () => {
    const r = pontosPerto(praia('cajueiro'))
    expect(r.some((x) => x.ponto.id === 'farol-do-calcanhar')).toBe(true)
  })
})

describe('linkMapaDaPraia', () => {
  it('so existe com coordenada e leva a coordenada, sem busca por nome', () => {
    expect(linkMapaDaPraia(praia('cardeiro'))).toBe('https://www.google.com/maps/search/?api=1&query=-5.12024,-35.62901')
    for (const p of semCoordenada) expect(linkMapaDaPraia(p)).toBeUndefined()
  })
})

describe('parceiros por praia', () => {
  it('so lista praia que existe na tabua, com slug de negocio e nome', async () => {
    const { PARCEIROS_POR_PRAIA } = await import('@/data/parceiros-por-praia')
    for (const [slug, lista] of Object.entries(PARCEIROS_POR_PRAIA)) {
      expect(praiaPorSlug(slug)).toBeDefined()
      expect(lista.length).toBeGreaterThan(0)
      for (const p of lista) expect(p.slug && p.nome).toBeTruthy()
    }
  })
})
