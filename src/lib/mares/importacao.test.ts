import { describe, expect, it } from 'vitest'
import { montarLinhas, resumoPorMes, formatarResumo } from './importacao'
import { classificarTipos } from './extrair-tabua'
import { paraInstante } from './tempo'

const EVENTOS = classificarTipos(
  ([
    ['2026-01-31', '2147', 0.13],
    ['2026-02-01', '0406', 2.28],
    ['2026-02-01', '0957', 0.27],
  ] as Array<[string, string, number]>).map(([data, hora, altura_m]) => ({
    data,
    hora,
    altura_m,
    instante: paraInstante(data, hora),
  })),
)

describe('linhas para gostoso_mares', () => {
  const linhas = montarLinhas(EVENTOS, 'COM3DN', 'Tabuas de Mare CHM/DHN 2026', 2026)

  it('grava data_hora com o deslocamento de America/Fortaleza', () => {
    expect(linhas[0].data_hora).toBe('2026-01-31T21:47:00-03:00')
  })

  it('leva estacao, tipo, altura, fonte e ano', () => {
    expect(linhas[1]).toEqual({
      estacao: 'COM3DN',
      data_hora: '2026-02-01T04:06:00-03:00',
      altura_m: 2.28,
      tipo: 'alta',
      fonte: 'Tabuas de Mare CHM/DHN 2026',
      ano: 2026,
    })
  })

  it('resume por estacao e mes local', () => {
    expect(resumoPorMes(linhas)).toEqual({ COM3DN: { '2026-01': 1, '2026-02': 2 } })
  })

  it('formata o resumo para o terminal', () => {
    const texto = formatarResumo(resumoPorMes(linhas))
    expect(texto).toContain('COM3DN')
    expect(texto).toContain('2026-02  2')
    expect(texto).toContain('total  3')
  })
})
