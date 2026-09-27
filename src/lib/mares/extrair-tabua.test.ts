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
