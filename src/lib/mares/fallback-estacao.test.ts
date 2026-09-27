import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { carregarSemana, lerEstacaoDe } from './carregar'
import { combinarEstacoes, linhasParaEventos, type EventoLido } from './semana'
import { CartaoDoDia, TabelaSemana } from '@/components/mares/partes'
import type { ClienteMares } from './consulta'
import type { CodigoEstacao } from '@/data/praias-mares'

const HOJE = '2026-09-27'

// Natal: 26/09 a 28/09. Guamare: so 28/09 e 29/09 (falta hoje, 27/09).
const NATAL = linhasParaEventos([
  { data_hora: '2026-09-26T19:46:00+00:00', altura_m: 2.4, tipo: 'alta' },
  { data_hora: '2026-09-27T07:25:00+00:00', altura_m: 2.51, tipo: 'alta' },
  { data_hora: '2026-09-27T13:23:00+00:00', altura_m: 0.14, tipo: 'baixa' },
  { data_hora: '2026-09-27T19:46:00+00:00', altura_m: 2.44, tipo: 'alta' },
  { data_hora: '2026-09-28T08:00:00+00:00', altura_m: 2.4, tipo: 'alta' },
  { data_hora: '2026-09-28T14:10:00+00:00', altura_m: 0.2, tipo: 'baixa' },
])
const GUAMARE = linhasParaEventos([
  { data_hora: '2026-09-28T08:50:00+00:00', altura_m: 2.6, tipo: 'alta' },
  { data_hora: '2026-09-28T15:00:00+00:00', altura_m: 0.25, tipo: 'baixa' },
  { data_hora: '2026-09-29T09:30:00+00:00', altura_m: 2.5, tipo: 'alta' },
])

const ler =
  (dados: Partial<Record<CodigoEstacao, EventoLido[]>>) =>
  async (_hoje: string, estacao: CodigoEstacao) => ({ eventos: dados[estacao] ?? [] })

describe('Guamare como principal, Natal como reserva', () => {
  it('combina por dia, sem misturar estacoes no mesmo dia', () => {
    const { eventos, diasDaReserva } = combinarEstacoes(GUAMARE, NATAL)
    expect([...diasDaReserva].sort()).toEqual(['2026-09-26', '2026-09-27'])
    const dia28 = eventos.filter((e) => e.data === '2026-09-28').map((e) => e.altura_m)
    expect(dia28).toEqual([2.6, 0.25])
  })

  it('dia sem Guamare usa Natal e avisa: "Hoje com dados do Porto de Natal"', async () => {
    const { semana, principal, reserva } = await carregarSemana('cardeiro', HOJE, ler({ GUAMARE, COM3DN: NATAL }))
    expect(principal).toBe('GUAMARE')
    expect(reserva).toBe('COM3DN')
    expect(semana[0].usaReserva).toBe(true)
    expect(semana[0].eventos.map((e) => e.hora)).toEqual(['4h25', '10h23', '16h46'])
    expect(semana[1].usaReserva).toBe(false)

    const html = renderToStaticMarkup(createElement(CartaoDoDia, { dia: semana[0], hoje: HOJE, lang: 'pt', reserva }))
    expect(html).toContain('Hoje com dados do Porto de Natal')
    const amanha = renderToStaticMarkup(createElement(CartaoDoDia, { dia: semana[1], hoje: HOJE, lang: 'pt', reserva }))
    expect(amanha).not.toContain('com dados do')

    const tabela = renderToStaticMarkup(createElement(TabelaSemana, { semana, hoje: HOJE, lang: 'pt', reserva }))
    expect(tabela.match(/Dados do Porto de Natal/g)?.length).toBe(1)
  })

  it('o aviso sai nos tres idiomas', async () => {
    const { semana, reserva } = await carregarSemana('cardeiro', HOJE, ler({ COM3DN: NATAL }))
    const en = renderToStaticMarkup(createElement(CartaoDoDia, { dia: semana[0], hoje: HOJE, lang: 'en', reserva }))
    const es = renderToStaticMarkup(createElement(CartaoDoDia, { dia: semana[0], hoje: HOJE, lang: 'es', reserva }))
    expect(en).toContain('Today with data from Porto de Natal')
    expect(es).toContain('Hoy con datos del Porto de Natal')
  })

  it('Guamare ainda fora do banco: os dias com dado saem de Natal, todos com aviso', async () => {
    const { semana, vazia } = await carregarSemana('cardeiro', HOJE, ler({ COM3DN: NATAL }))
    expect(vazia).toBe(false)
    const comDado = semana.filter((d) => d.temDados)
    expect(comDado.length).toBeGreaterThan(0)
    expect(comDado.every((d) => d.usaReserva)).toBe(true)
  })

  it('com Guamare nos dias da tela, nenhum aviso', async () => {
    const { semana } = await carregarSemana('cardeiro', '2026-09-28', ler({ GUAMARE, COM3DN: NATAL }))
    expect(semana.some((d) => d.usaReserva)).toBe(false)
  })

  it('praia de Touros usa Natal como principal e Guamare como reserva', async () => {
    const { semana, principal, reserva } = await carregarSemana('perobas', HOJE, ler({ GUAMARE, COM3DN: NATAL }))
    expect([principal, reserva]).toEqual(['COM3DN', 'GUAMARE'])
    expect(semana[0].usaReserva).toBe(false)
  })

  it('sem nenhuma estacao, a semana fica vazia (estado vazio)', async () => {
    const { vazia } = await carregarSemana('cardeiro', HOJE, ler({}))
    expect(vazia).toBe(true)
  })

  it('lerEstacaoDe consulta a estacao pedida', async () => {
    const pedidas: string[] = []
    const consulta = {
      select: () => consulta,
      eq: (_coluna: string, valor: string) => {
        pedidas.push(valor)
        return consulta
      },
      gte: () => consulta,
      lt: () => consulta,
      order: () => Promise.resolve({ data: [], error: null }),
    }
    await lerEstacaoDe({ from: () => consulta } as unknown as ClienteMares, HOJE, 'GUAMARE')
    expect(pedidas).toEqual(['GUAMARE'])
  })
})
