import { describe, expect, it } from 'vitest'
import { CATEGORIAS_PONTO, PONTOS_MAPA, PRAIAS_FORA_DO_MAPA, linkComoChegar } from './pontos-mapa'
import { PRAIAS_MARES } from './praias-mares'

/* Caixa da regiao: Pedra Grande a Touros, com folga. Um ponto fora dela e
   coordenada trocada (lat/lon invertidos, sinal errado). */
const CAIXA = { latMin: -5.4, latMax: -5.0, lonMin: -35.9, lonMax: -35.3 }

describe('pontos do mapa', () => {
  it('toda coordenada e numero valido e cai na regiao', () => {
    expect(PONTOS_MAPA.length).toBeGreaterThan(0)
    for (const p of PONTOS_MAPA) {
      expect(Number.isFinite(p.lat), p.id).toBe(true)
      expect(Number.isFinite(p.lon), p.id).toBe(true)
      expect(p.lat, p.id).toBeGreaterThan(CAIXA.latMin)
      expect(p.lat, p.id).toBeLessThan(CAIXA.latMax)
      expect(p.lon, p.id).toBeGreaterThan(CAIXA.lonMin)
      expect(p.lon, p.id).toBeLessThan(CAIXA.lonMax)
    }
  })

  it('todo ponto tem fonte com nome e URL https', () => {
    for (const p of PONTOS_MAPA) {
      expect(p.fonte.nome.trim().length, p.id).toBeGreaterThan(0)
      expect(p.fonte.url, p.id).toMatch(/^https:\/\//)
    }
  })

  it('todo ponto tem nome, municipio, categoria conhecida e descricao nos tres idiomas', () => {
    for (const p of PONTOS_MAPA) {
      expect(p.nome.length, p.id).toBeGreaterThan(2)
      expect(p.municipio.length, p.id).toBeGreaterThan(2)
      expect(CATEGORIAS_PONTO, p.id).toContain(p.categoria)
      for (const l of ['pt', 'en', 'es'] as const) expect(p.descricao[l].length, `${p.id} ${l}`).toBeGreaterThan(10)
    }
  })

  it('ids unicos', () => {
    const ids = PONTOS_MAPA.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('toda praia da tabua com coordenada esta no mapa e aponta para a mare dela', () => {
    const comCoord = PRAIAS_MARES.filter((p) => p.lat !== undefined)
    for (const praia of comCoord) {
      const ponto = PONTOS_MAPA.find((p) => p.mareSlug === praia.slug)
      expect(ponto, praia.slug).toBeDefined()
      expect(ponto!.categoria).toBe('praias')
      expect(ponto!.lat).toBe(praia.lat)
    }
  })

  it('praia sem coordenada fica fora do mapa e listada a parte', () => {
    const semCoord = PRAIAS_MARES.filter((p) => p.lat === undefined).map((p) => p.slug)
    expect(PRAIAS_FORA_DO_MAPA.map((p) => p.slug)).toEqual(semCoord)
    for (const slug of semCoord) expect(PONTOS_MAPA.some((p) => p.mareSlug === slug)).toBe(false)
  })

  it('as tres categorias tem ao menos um ponto', () => {
    for (const c of CATEGORIAS_PONTO) expect(PONTOS_MAPA.some((p) => p.categoria === c), c).toBe(true)
  })

  it('"Como chegar" abre a rota no Google Maps pela coordenada', () => {
    expect(linkComoChegar({ lat: -5.1, lon: -35.6 })).toBe('https://www.google.com/maps/dir/?api=1&destination=-5.1,-35.6')
  })
})
