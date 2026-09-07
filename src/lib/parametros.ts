/**
 * Parâmetros do produto: preço e percentual, vindos do banco, nunca escritos à
 * mão.
 *
 * POR QUE ISTO EXISTE:
 *
 * O preço do plano morava em quatro lugares com dois valores diferentes. A
 * /sobre e a /transparencia diziam R$30 e R$50; a /parceiros e o painel de
 * assinatura diziam R$39,90 e R$59,90. Os percentuais 100/80/20/0 moravam em
 * quatro lugares, um deles literal dentro do JSX. Nenhum consultava nada, e por
 * isso nenhum era auditado.
 *
 * A regra que este arquivo serve: número que descreve o estado do produto vem
 * de consulta, ou não é publicado. Sem valor padrão, sem fallback: se a consulta
 * falhar, a superfície esconde o número em vez de inventar um.
 */

export type Parametro = {
  chave: string
  valor: number
  unidade: 'centavos' | 'percentual'
}

export type Parametros = Record<string, number>

/** As chaves em uso. Serve de documentação e de proteção contra erro de digitação. */
export const CHAVES = {
  planoGratuito: 'plano_gratuito_mes_centavos',
  planoAssociado: 'plano_associado_mes_centavos',
  planoDestaque: 'plano_destaque_mes_centavos',
  descontoAnual: 'desconto_anual_percentual',
  rateioCidade: 'rateio_cidade_percentual',
  rateioOperacao: 'rateio_operacao_percentual',
  lucro: 'lucro_percentual',
  gratuito: 'gratuito_percentual',
} as const

export function indexarParametros(linhas: Parametro[]): Parametros {
  return Object.fromEntries(linhas.map((l) => [l.chave, Number(l.valor)]))
}

/** "R$39,90". Centavos entram, texto sai. */
export function precoEmReais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/**
 * O anual é calculado, não guardado: doze meses menos o desconto. Guardar os
 * dois seria criar de novo o problema que este arquivo resolve, com o preço
 * mensal e o anual podendo divergir.
 */
export function precoAnualCentavos(mensalCentavos: number, descontoPercentual: number): number {
  return Math.round(mensalCentavos * 12 * (1 - descontoPercentual / 100))
}

/** `undefined` quando o parâmetro não veio. Quem chama esconde o número. */
export function parametro(p: Parametros | undefined, chave: string): number | undefined {
  const v = p?.[chave]
  return typeof v === 'number' ? v : undefined
}

/**
 * Os quatro preços que o painel de assinatura mostra, derivados da fonte única.
 *
 * O anual não é guardado: é doze meses menos o desconto. Guardar os dois deixaria
 * mensal e anual divergirem, que é o defeito que esta fonte existe para acabar.
 *
 * Devolve `null` no lugar do preço quando o parâmetro não veio, porque preço
 * inventado num painel de cobrança é pior que preço ausente.
 */
export function precosDoPlano(param: Parametros | undefined) {
  const desconto = parametro(param, CHAVES.descontoAnual)
  const texto = (centavos: number | undefined, sufixo: string) =>
    centavos === undefined ? null : `${precoEmReais(centavos)}${sufixo}`
  const anual = (chave: string) => {
    const m = parametro(param, chave)
    return m === undefined || desconto === undefined
      ? undefined
      : precoAnualCentavos(m, desconto)
  }
  return {
    monthly: {
      associado: texto(parametro(param, CHAVES.planoAssociado), '/mês'),
      destaque: texto(parametro(param, CHAVES.planoDestaque), '/mês'),
    },
    annual: {
      associado: texto(anual(CHAVES.planoAssociado), '/ano'),
      destaque: texto(anual(CHAVES.planoDestaque), '/ano'),
    },
  }
}
