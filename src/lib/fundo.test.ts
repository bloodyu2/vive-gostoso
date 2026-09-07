import { describe, it, expect } from 'vitest'
import { resumirFundo, type LinhaDoFundo } from './fundo'

const linha = (
  amount_cents: number,
  category: string,
  status = 'realizado'
): LinhaDoFundo => ({ amount_cents, category, status } as LinhaDoFundo)

describe('resumirFundo', () => {
  it('gasto realizado NAO conta como arrecadado', () => {
    /* Este e o defeito de 2026-09-07: dominio R$40 e e-mail R$9,90, os dois
       gastos, apareciam somados em "arrecadados esse mes". */
    const resumo = resumirFundo([linha(4000, 'operacao'), linha(990, 'operacao')])
    expect(resumo.totalCents).toBe(0)
    expect(resumo.operacaoCents).toBe(4990)
  })

  it('estado real do fundo em 2026-09-07: zero arrecadado, R$49,90 de gasto', () => {
    const resumo = resumirFundo([
      linha(4000, 'operacao'),
      linha(990, 'operacao'),
      linha(990, 'operacao', 'programado'),
      linha(5800, 'operacao', 'programado'),
      linha(600000, 'marketing', 'programado'),
    ])
    expect(resumo.totalCents).toBe(0)
    expect(resumo.operacaoCents).toBe(4990)
    expect(resumo.marketingCents).toBe(0)
  })

  it('receita realizada conta, e so ela', () => {
    const resumo = resumirFundo([linha(23000, 'acumulado'), linha(4000, 'operacao')])
    expect(resumo.totalCents).toBe(23000)
    expect(resumo.acumuladoCents).toBe(23000)
  })

  it('linha programada nao entra em conta nenhuma', () => {
    const resumo = resumirFundo([
      linha(23000, 'acumulado', 'programado'),
      linha(600000, 'marketing', 'programado'),
    ])
    expect(resumo).toEqual({ totalCents: 0, marketingCents: 0, operacaoCents: 0, acumuladoCents: 0 })
  })

  it('sem linha nenhuma devolve zeros, nao NaN', () => {
    expect(resumirFundo([])).toEqual({
      totalCents: 0, marketingCents: 0, operacaoCents: 0, acumuladoCents: 0,
    })
  })
})
