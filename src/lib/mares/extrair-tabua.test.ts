import { beforeAll, describe, expect, it } from 'vitest'
import { resolve } from 'node:path'
import { lerItensDoPdf } from './ler-pdf'
import { extrairEventos, type EventoMare } from './extrair-tabua'

/* Conferencia da extracao contra o PDF oficial da Marinha (Porto de Natal, 2026,
   scripts/mares/fontes/natal-2026.pdf). Os valores esperados abaixo foram lidos
   de uma renderizacao independente do mesmo PDF (poppler, `pdftotext -layout`),
   nao da saida deste extrator. Cobrem as tres paginas, as duas metades de cada
   mes (dias 1-16 e 17-31), dias com tres mares e o ultimo dia do ano. */
const CONFERIDOS: Record<string, Array<[string, number]>> = {
  '2026-01-01': [['0221', 2.14], ['0819', 0.41], ['1446', 2.27], ['2057', 0.22]],
  '2026-01-17': [['0342', 1.99], ['0929', 0.5], ['1547', 2.17], ['2159', 0.35]],
  '2026-02-05': [['0019', 0.23], ['0640', 2.24], ['1225', 0.36], ['1857', 2.32]],
  '2026-03-06': [['0602', 2.3], ['1153', 0.32], ['1821', 2.3]],
  '2026-03-31': [['0323', 2.31], ['0916', 0.32], ['1542', 2.46], ['2140', 0.23]],
  '2026-04-15': [['0247', 2.28], ['0840', 0.35], ['1501', 2.44], ['2102', 0.23]],
  '2026-06-15': [['0410', 2.44], ['1021', 0.09], ['1649', 2.33], ['2240', 0.3]],
  '2026-07-31': [['0517', 2.34], ['1123', 0.29], ['1744', 2.2], ['2332', 0.41]],
  '2026-08-15': [['0602', 2.53], ['1202', 0.17], ['1823', 2.32]],
  '2026-08-31': [['0604', 2.42], ['1202', 0.27], ['1823', 2.29]],
  '2026-09-12': [['0459', 2.56], ['1053', 0.11], ['1714', 2.42], ['2304', 0.19]],
  '2026-09-15': [['0012', 0.4], ['0642', 2.13], ['1229', 0.51], ['1855', 2.1]],
  '2026-10-31': [['0144', 0.46], ['0808', 1.91], ['1401', 0.72], ['2032', 2.03]],
  '2026-11-15': [['0131', 0.68], ['0749', 1.72], ['1342', 0.85], ['2002', 1.86]],
  '2026-11-28': [['0040', 0.21], ['0702', 2.13], ['1251', 0.48], ['1921', 2.28]],
  '2026-12-15': [['0147', 0.63], ['0802', 1.82], ['1401', 0.78], ['2019', 1.96]],
  '2026-12-31': [['0406', 0.68], ['1025', 1.86], ['1632', 0.77], ['2255', 1.88]],
}

let eventos: EventoMare[] = []

beforeAll(async () => {
  const paginas = await lerItensDoPdf(resolve(process.cwd(), 'scripts/mares/fontes/natal-2026.pdf'))
  eventos = extrairEventos(paginas, 2026)
}, 30_000)

describe('extracao da tabua de Natal 2026', () => {
  for (const [data, esperado] of Object.entries(CONFERIDOS)) {
    it(`confere ${data} com o PDF`, () => {
      const doDia = eventos.filter((e) => e.data === data).map((e) => [e.hora, e.altura_m])
      expect(doDia).toEqual(esperado)
    })
  }

  it('cobre os 365 dias de 2026', () => {
    expect(new Set(eventos.map((e) => e.data)).size).toBe(365)
  })

  it('tem entre 3 e 4 mares por dia', () => {
    const porDia = new Map<string, number>()
    for (const e of eventos) porDia.set(e.data, (porDia.get(e.data) ?? 0) + 1)
    for (const n of porDia.values()) expect(n === 3 || n === 4).toBe(true)
  })

  it('esta em ordem cronologica e alterna alta e baixa', () => {
    for (let i = 1; i < eventos.length; i++) {
      expect(eventos[i].instante.getTime()).toBeGreaterThan(eventos[i - 1].instante.getTime())
      expect(eventos[i].tipo).not.toBe(eventos[i - 1].tipo)
    }
  })

  it('classifica a maior altura do par como alta', () => {
    const jan1 = eventos.filter((e) => e.data === '2026-01-01').map((e) => e.tipo)
    expect(jan1).toEqual(['alta', 'baixa', 'alta', 'baixa'])
  })
})

/* Porto de Guamare 2026 (scripts/mares/fontes/guamare-2026.pdf). Valores lidos
   a mao de `pdftotext -layout` do mesmo PDF (poppler), nao deste extrator.
   Cobrem as tres paginas, as duas metades de cada mes, dias com tres mares,
   uma altura negativa (18/04) e o ultimo dia do ano. */
const CONFERIDOS_GUAMARE: Record<string, Array<[string, number]>> = {
  '2026-01-01': [['0306', 2.33], ['0931', 0.43], ['1523', 2.5], ['2201', 0.26]],
  '2026-01-17': [['0414', 2.12], ['1008', 0.48], ['1625', 2.22], ['2231', 0.31]],
  '2026-02-03': [['0006', 0.21], ['0616', 2.8], ['1223', 0.25], ['1836', 2.79]],
  '2026-03-19': [['0512', 2.69], ['1125', 0.16], ['1734', 2.7], ['2347', 0.19]],
  '2026-03-31': [['0406', 2.54], ['1017', 0.24], ['1627', 2.63], ['2238', 0.24]],
  '2026-04-07': [['0142', 0.73], ['0753', 2.17], ['1404', 0.64], ['2017', 1.98]],
  '2026-04-18': [['0523', 2.62], ['1151', -0.02], ['1751', 2.56]],
  '2026-05-17': [['0504', 2.61], ['1138', 0.04], ['1738', 2.58]],
  '2026-06-15': [['0455', 2.68], ['1127', 0.17], ['1729', 2.69], ['2353', 0.35]],
  '2026-07-31': [['0604', 2.45], ['1206', 0.4], ['1821', 2.43]],
  '2026-08-17': [['0159', 0.38], ['0821', 2.44], ['1414', 0.55], ['2036', 2.37]],
  '2026-09-01': [['0121', 0.25], ['0719', 2.23], ['1342', 0.35], ['1931', 2.17]],
  '2026-10-17': [['0240', 0.73], ['0851', 1.78], ['1501', 0.83], ['2104', 1.74]],
  '2026-11-15': [['0210', 0.6], ['0823', 1.82], ['1429', 0.7], ['2042', 1.8]],
  '2026-12-31': [['0512', 0.66], ['1119', 2.05], ['1747', 0.62], ['2359', 2.02]],
}

describe('extracao da tabua de Guamare 2026', () => {
  let guamare: EventoMare[] = []

  beforeAll(async () => {
    const paginas = await lerItensDoPdf(resolve(process.cwd(), 'scripts/mares/fontes/guamare-2026.pdf'))
    guamare = extrairEventos(paginas, 2026)
  }, 30_000)

  for (const [data, esperado] of Object.entries(CONFERIDOS_GUAMARE)) {
    it(`confere ${data} com o PDF`, () => {
      const doDia = guamare.filter((e) => e.data === data).map((e) => [e.hora, e.altura_m])
      expect(doDia).toEqual(esperado)
    })
  }

  it('cobre os 365 dias de 2026, com 1411 mares', () => {
    expect(new Set(guamare.map((e) => e.data)).size).toBe(365)
    expect(guamare.length).toBe(1411)
  })

  it('esta em ordem cronologica e alterna alta e baixa', () => {
    for (let i = 1; i < guamare.length; i++) {
      expect(guamare[i].instante.getTime()).toBeGreaterThan(guamare[i - 1].instante.getTime())
      expect(guamare[i].tipo).not.toBe(guamare[i - 1].tipo)
    }
  })

  it('a mesma mare chega a Guamare depois de Natal (01/01: 37 a 72 min)', () => {
    const minutos = (e: EventoMare) => e.instante.getTime() / 60_000
    const g = guamare.filter((e) => e.data === '2026-01-01')
    const n = eventos.filter((e) => e.data === '2026-01-01')
    const atrasos = g.map((e, i) => minutos(e) - minutos(n[i]))
    expect(Math.min(...atrasos)).toBe(37)
    expect(Math.max(...atrasos)).toBe(72)
  })
})
