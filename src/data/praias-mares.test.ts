import { describe, expect, it } from 'vitest'
import { PRAIAS_MARES, ESTACOES, distanciaKm, praiaPorSlug } from './praias-mares'

describe('praias da tabua de mares', () => {
  it('slugs unicos e em minusculas sem acento', () => {
    const slugs = PRAIAS_MARES.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/)
  })

  it('toda praia aponta para uma estacao cadastrada', () => {
    for (const p of PRAIAS_MARES) expect(ESTACOES[p.estacao]).toBeDefined()
  })

  it('dica existe nos tres idiomas ou em nenhum', () => {
    for (const p of PRAIAS_MARES) {
      const idiomas = p.dica ? Object.keys(p.dica).sort() : []
      expect([[], ['en', 'es', 'pt']]).toContainEqual(idiomas)
    }
  })

  it('janela recomendada so existe com rotulo nos tres idiomas', () => {
    for (const p of PRAIAS_MARES) {
      if (p.melhorMare) expect(Object.keys(p.rotuloJanela ?? {}).sort()).toEqual(['en', 'es', 'pt'])
    }
  })

  it('coordenadas no litoral norte do RN', () => {
    for (const p of PRAIAS_MARES) {
      expect(p.lat).toBeGreaterThan(-5.4)
      expect(p.lat).toBeLessThan(-4.9)
      expect(p.lon).toBeGreaterThan(-36.1)
      expect(p.lon).toBeLessThan(-35.2)
    }
  })

  it('distancia de Cardeiro ao Porto de Natal fica perto de 86 km', () => {
    const c = praiaPorSlug('cardeiro')!
    expect(distanciaKm(c, ESTACOES.COM3DN)).toBeGreaterThan(84)
    expect(distanciaKm(c, ESTACOES.COM3DN)).toBeLessThan(88)
  })

  it('praia inexistente devolve undefined', () => {
    expect(praiaPorSlug('praia-que-nao-existe')).toBeUndefined()
  })
})
