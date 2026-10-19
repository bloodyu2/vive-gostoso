import { describe, expect, it } from 'vitest'
import { CENTRO_DA_VILA, distanciaMetros, formatarDistancia, ordenarPorDistancia } from './perto'

describe('distanciaMetros', () => {
  it('e zero para o mesmo ponto', () => {
    expect(distanciaMetros(CENTRO_DA_VILA, CENTRO_DA_VILA)).toBe(0)
  })
  it('um grau de latitude vale cerca de 111 km', () => {
    const d = distanciaMetros({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })
    expect(d).toBeGreaterThan(111_000)
    expect(d).toBeLessThan(111_400)
  })
  it('Gostoso a Natal, em linha reta, fica entre 85 e 92 km', () => {
    const d = distanciaMetros(CENTRO_DA_VILA, { lat: -5.7945, lng: -35.211 })
    expect(d).toBeGreaterThan(85_000)
    expect(d).toBeLessThan(92_000)
  })
})

describe('formatarDistancia', () => {
  it('arredonda metros para nao fingir precisao', () => {
    expect(formatarDistancia(3)).toBe('10 m')
    expect(formatarDistancia(87)).toBe('90 m')
    expect(formatarDistancia(342)).toBe('350 m')
  })
  it('vira km a partir de 1000 m, com virgula em portugues', () => {
    expect(formatarDistancia(1234, 'pt')).toBe('1,2 km')
    expect(formatarDistancia(1234, 'en')).toBe('1.2 km')
    expect(formatarDistancia(980)).toBe('1 km')
  })
  it('acima de 10 km nao mostra decimal', () => {
    expect(formatarDistancia(18_400)).toBe('18 km')
  })
})

describe('ordenarPorDistancia', () => {
  it('ordena do mais perto e ignora quem nao tem coordenada', () => {
    const origem = { lat: 0, lng: 0 }
    const itens = [
      { n: 'longe', lat: 0, lng: 0.02 },
      { n: 'sem', lat: null, lng: null },
      { n: 'perto', lat: 0, lng: 0.001 },
    ]
    const r = ordenarPorDistancia(origem, itens, (i) => (i.lat == null || i.lng == null ? null : { lat: i.lat, lng: i.lng }))
    expect(r.map((x) => x.item.n)).toEqual(['perto', 'longe'])
  })
})
