import type { FundEntry } from '@/types/database'

export type LinhaDoFundo = Pick<FundEntry, 'amount_cents' | 'status' | 'category'>

export type ResumoDoFundo = {
  /** Dinheiro que ENTROU no fundo. Não é a soma das linhas. */
  totalCents: number
  marketingCents: number
  operacaoCents: number
  acumuladoCents: number
}

/**
 * O resumo da prestação de contas, a partir das linhas realizadas.
 *
 * POR QUE "ARRECADADO" NÃO É A SOMA DE TUDO:
 *
 * A tabela não tem uma coluna dizendo "isto é receita" ou "isto é gasto". O que
 * existe é `category`, e ela é o destino: `operacao` e `marketing` são baldes de
 * GASTO, `acumulado` é o único que já guardou dinheiro que entrou.
 *
 * Até 2026-09-07 o cálculo somava toda linha realizada com valor positivo e
 * chamava o resultado de "arrecadados esse mês". O domínio de R$40 e o e-mail de
 * R$9,90, que são gastos, entravam como se fossem dinheiro que entrou, e a
 * página publicou "R$ 279,90 arrecadados" com receita real de zero.
 *
 * A correção durável é uma coluna que separe receita de gasto. Enquanto ela não
 * existe, o arrecadado se mede pelo balde `acumulado`.
 */
export function resumirFundo(linhas: LinhaDoFundo[]): ResumoDoFundo {
  const realizadas = linhas.filter((l) => l.status === 'realizado')
  const somaDe = (categoria: string) =>
    realizadas.filter((l) => l.category === categoria).reduce((s, l) => s + l.amount_cents, 0)

  const acumuladoCents = realizadas
    .filter((l) => l.category === 'acumulado' && l.amount_cents > 0)
    .reduce((s, l) => s + l.amount_cents, 0)

  return {
    totalCents: acumuladoCents,
    marketingCents: somaDe('marketing'),
    operacaoCents: somaDe('operacao'),
    acumuladoCents,
  }
}
