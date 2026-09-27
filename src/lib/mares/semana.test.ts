import { describe, expect, it } from 'vitest'
import { montarSemana, diasSemDado, linhasParaEventos } from './semana'
import { praiaPorSlug } from '@/data/praias-mares'

// Linhas no formato que o Supabase devolve (timestamptz em UTC).
const LINHAS = [
  { data_hora: '2026-09-26T19:46:00+00:00', altura_m: 2.4, tipo: 'alta' as const },
  { data_hora: '2026-09-27T01:40:00+00:00', altura_m: 0.2, tipo: 'baixa' as const },
  { data_hora: '2026-09-27T07:25:00+00:00', altura_m: 2.51, tipo: 'alta' as const },
  { data_hora: '2026-09-27T13:23:00+00:00', altura_m: 0.14, tipo: 'baixa' as const },
  { data_hora: '2026-09-27T19:46:00+00:00', altura_m: 2.44, tipo: 'alta' as const },
  { data_hora: '2026-09-28T01:40:00+00:00', altura_m: 0.17, tipo: 'baixa' as const },
  { data_hora: '2026-09-28T08:00:00+00:00', altura_m: 2.4, tipo: 'alta' as const },
]

describe('semana de uma praia', () => {
  const eventos = linhasParaEventos(LINHAS)
  const semana = montarSemana(eventos, '2026-09-27', praiaPorSlug('cardeiro')!)

  it('tem hoje e os proximos 7 dias', () => {
    expect(semana.map((d) => d.data)).toEqual([
      '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30',
      '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04',
    ])
  })

  it('agrupa as mares pelo dia local, nao pelo dia UTC', () => {
    // 01h40 UTC de 27/09 e 22h40 de 26/09 em Gostoso: fica fora de hoje.
    expect(semana[0].eventos.map((e) => e.hora)).toEqual(['4h25', '10h23', '16h46', '22h40'])
  })

  it('calcula a janela de piscinas do Cardeiro em torno da baixa das 10h23', () => {
    // 4h25 -> 10h23 (358 min) e 10h23 -> 16h46 (383 min); 15% da faixa = 25,3% da meia-onda.
    expect(semana[0].janela).toEqual({ inicio: '8h52', fim: '11h59', inicioMin: 532, fimMin: 719 })
  })

  it('dia sem dado fica vazio, sem curva nem janela', () => {
    expect(semana[3].eventos).toEqual([])
    expect(semana[3].janela).toBeNull()
    expect(semana[3].temDados).toBe(false)
  })

  it('traz a fase da lua de cada dia', () => {
    expect(semana[0].lua.fase).toBeDefined()
  })
})

describe('aviso de dados faltando', () => {
  it('conta os dias dos proximos 30 sem nenhuma mare', () => {
    const eventos = linhasParaEventos(LINHAS)
    // Tem 27 e 28/09; faltam 28 dos 30.
    expect(diasSemDado(eventos, '2026-09-27', 30)).toHaveLength(28)
  })

  it('tabela vazia: faltam todos', () => {
    expect(diasSemDado([], '2026-09-27', 30)).toHaveLength(30)
  })
})
