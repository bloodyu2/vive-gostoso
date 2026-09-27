import { describe, expect, it } from 'vitest'
import { PRAIAS_MARES, ESTACOES, MUNICIPIOS, distanciaKm, praiaPorSlug, praiasPorMunicipio } from './praias-mares'

describe('praias da tabua de mares', () => {
  it('slugs unicos e em minusculas sem acento', () => {
    const slugs = PRAIAS_MARES.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/)
  })

  it('toda praia tem principal e reserva cadastradas, e diferentes', () => {
    for (const p of PRAIAS_MARES) {
      expect(ESTACOES[p.estacaoPrincipal]).toBeDefined()
      expect(ESTACOES[p.estacaoReserva]).toBeDefined()
      expect(p.estacaoReserva).not.toBe(p.estacaoPrincipal)
    }
  })

  it('a principal e a estacao mais perto de cada praia com coordenada', () => {
    for (const p of PRAIAS_MARES) {
      if (p.lat === undefined) continue
      expect(distanciaKm(p, ESTACOES[p.estacaoPrincipal])!).toBeLessThan(distanciaKm(p, ESTACOES[p.estacaoReserva])!)
    }
  })

  it('Gostoso e Pedra Grande usam Guamare; Touros usa Natal', () => {
    for (const p of PRAIAS_MARES) {
      expect(p.estacaoPrincipal).toBe(p.municipio === 'Touros' ? 'COM3DN' : 'GUAMARE')
    }
  })

  it('Minhoto, Praia do Amor, Ze Martins e Malhada ficam em Gostoso, sem coordenada inventada', () => {
    for (const slug of ['minhoto', 'praia-do-amor', 'ze-martins', 'malhada']) {
      const p = praiaPorSlug(slug)!
      expect(p.municipio).toBe('São Miguel do Gostoso')
      expect(p.lat).toBeUndefined()
      expect(p.dica).toBeUndefined()
      expect(distanciaKm(p, ESTACOES.GUAMARE)).toBeUndefined()
    }
  })

  it('agrupa o seletor por municipio, na ordem Gostoso, Touros, Pedra Grande', () => {
    const grupos = praiasPorMunicipio()
    expect(grupos.map((g) => g.municipio)).toEqual([...MUNICIPIOS])
    expect(grupos.flatMap((g) => g.praias).length).toBe(PRAIAS_MARES.length)
    expect(grupos[1].praias.map((p) => p.slug)).toEqual(['perobas', 'carnaubinha', 'farol-do-calcanhar', 'cajueiro'])
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
      if (p.lat === undefined || p.lon === undefined) continue
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

  it('distancias a Guamare das praias de Gostoso e Pedra Grande ficam entre 58 e 77 km', () => {
    const kms = PRAIAS_MARES.filter((p) => p.municipio !== 'Touros' && p.lat !== undefined).map((p) =>
      Math.round(distanciaKm(p, ESTACOES.GUAMARE)!),
    )
    expect(Math.min(...kms)).toBe(58)
    expect(Math.max(...kms)).toBe(77)
  })

  it('praia inexistente devolve undefined', () => {
    expect(praiaPorSlug('praia-que-nao-existe')).toBeUndefined()
  })
})
