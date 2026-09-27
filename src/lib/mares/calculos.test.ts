import { describe, expect, it } from 'vitest'
import { alturaEm, curvaDoDia } from './curva'
import { faseDaLua } from './lua'
import { melhorJanela } from './melhor-janela'
import { classificarTipos } from './extrair-tabua'
import { formatarHora, paraInstante } from './tempo'

function eventos(lista: Array<[string, string, number]>) {
  return classificarTipos(
    lista.map(([data, hora, altura_m]) => ({ data, hora, altura_m, instante: paraInstante(data, hora) })),
  )
}

// Mares reais de Natal, 01/01/2026 (tabua da Marinha), com vizinhos.
const JAN1 = eventos([
  ['2025-12-31', '2014', 2.20],
  ['2026-01-01', '0221', 2.14],
  ['2026-01-01', '0819', 0.41],
  ['2026-01-01', '1446', 2.27],
  ['2026-01-01', '2057', 0.22],
  ['2026-01-02', '0319', 2.22],
])

describe('curva cosseno entre extremos', () => {
  it('passa exatamente pelos extremos', () => {
    expect(alturaEm(JAN1, paraInstante('2026-01-01', '0819'))).toBeCloseTo(0.41, 5)
    expect(alturaEm(JAN1, paraInstante('2026-01-01', '1446'))).toBeCloseTo(2.27, 5)
  })

  it('vale a media no ponto medio entre dois extremos', () => {
    // 08:19 -> 14:46 sao 387 min; meio = 11:32:30
    const meio = new Date(paraInstante('2026-01-01', '0819').getTime() + (387 / 2) * 60_000)
    expect(alturaEm(JAN1, meio)).toBeCloseTo((0.41 + 2.27) / 2, 5)
  })

  it('sobe sem oscilar entre a baixa e a alta', () => {
    let anterior = -Infinity
    for (let m = 0; m <= 387; m += 5) {
      const h = alturaEm(JAN1, new Date(paraInstante('2026-01-01', '0819').getTime() + m * 60_000))!
      expect(h).toBeGreaterThanOrEqual(anterior)
      anterior = h
    }
  })

  it('devolve null fora do intervalo com dados', () => {
    expect(alturaEm(JAN1, paraInstante('2025-12-30', '1200'))).toBeNull()
  })

  it('curva do dia cobre 00h a 24h em passos de 15 min', () => {
    const pontos = curvaDoDia(JAN1, '2026-01-01', 15)
    expect(pontos).toHaveLength(97)
    expect(pontos[0].minuto).toBe(0)
    expect(pontos[96].minuto).toBe(1440)
    expect(pontos.every((p) => p.altura !== null)).toBe(true)
  })
})

describe('fase da lua', () => {
  // Datas de eclipses de 2026: eclipse solar so acontece na lua nova, lunar so na cheia.
  it('17/02/2026 (eclipse solar anular) e lua nova', () => {
    expect(faseDaLua('2026-02-17').fase).toBe('nova')
  })
  it('03/03/2026 (eclipse lunar total) e lua cheia', () => {
    expect(faseDaLua('2026-03-03').fase).toBe('cheia')
  })
  it('12/08/2026 (eclipse solar total) e lua nova', () => {
    expect(faseDaLua('2026-08-12').fase).toBe('nova')
  })
  it('28/08/2026 (eclipse lunar parcial) e lua cheia', () => {
    expect(faseDaLua('2026-08-28').fase).toBe('cheia')
  })
  it('uma semana depois da nova de 17/02 e quarto crescente', () => {
    expect(faseDaLua('2026-02-24').fase).toBe('quarto_crescente')
  })
  it('iluminacao perto de 0 na nova e de 1 na cheia', () => {
    expect(faseDaLua('2026-02-17').iluminacao).toBeLessThan(0.05)
    expect(faseDaLua('2026-03-03').iluminacao).toBeGreaterThan(0.95)
  })
})

describe('melhor janela por praia', () => {
  // Baixa 10h25 entre duas altas a 6h13 de distancia: faixa de 15% fica a ~94 min do extremo.
  const DIA = eventos([
    ['2026-05-10', '0412', 2.4],
    ['2026-05-10', '1025', 0.2],
    ['2026-05-10', '1638', 2.4],
    ['2026-05-10', '2251', 0.2],
  ])

  it('baixa: janela ao redor da mare baixa do dia', () => {
    const j = melhorJanela(DIA, '2026-05-10', 'baixa')!
    expect(formatarHora(j.inicio)).toMatch(/^8h5[0-2]$/)
    expect(formatarHora(j.fim)).toMatch(/^11h5[89]$|^12h00$/)
  })

  it('alta: janela ao redor da alta da tarde', () => {
    const j = melhorJanela(DIA, '2026-05-10', 'alta')!
    expect(formatarHora(j.inicio)).toMatch(/^15h0[3-5]$/)
    expect(formatarHora(j.fim)).toBe('18h00') // cortada no fim da luz do dia
  })

  it('corta a janela no fim da luz do dia', () => {
    const tarde = eventos([
      ['2026-05-10', '1115', 2.4],
      ['2026-05-10', '1730', 0.2],
      ['2026-05-10', '2345', 2.4],
    ])
    const j = melhorJanela(tarde, '2026-05-10', 'baixa')!
    expect(formatarHora(j.fim)).toBe('18h00')
    expect(formatarHora(j.inicio)).toMatch(/^15h5[4-7]$/)
  })

  it('sem dados, sem janela', () => {
    expect(melhorJanela([], '2026-05-10', 'baixa')).toBeNull()
  })
})
