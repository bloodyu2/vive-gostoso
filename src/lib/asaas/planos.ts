import { CHAVES, parametro, precoAnualCentavos, type Parametros } from '@/lib/parametros'

/**
 * Preco do plano, em centavos, para a cobranca Asaas.
 *
 * Nao ha tabela propria de preco aqui de proposito. O vive-gostoso ja tem a
 * fonte unica em `gostoso_parametros_produto` (lida por `getParametrosProduto`),
 * e a regra do repo e explicita: numero que descreve o estado do produto vem de
 * consulta, ou nao e publicado. Duplicar os centavos neste arquivo criaria de
 * novo o defeito que o `parametros.ts` existe para acabar, com o painel podendo
 * mostrar R$39,90 e o Asaas cobrando outro valor.
 *
 * Por isso as funcoes aqui recebem os parametros ja lidos e devolvem `null`
 * quando o parametro nao veio: a rota responde erro e cai no Stripe, em vez de
 * inventar preco num caminho de cobranca.
 */

export type Plano = 'associado' | 'destaque'
export type Cobranca = 'monthly' | 'annual'

const CHAVE_DO_PLANO: Record<Plano, string> = {
  associado: CHAVES.planoAssociado,
  destaque: CHAVES.planoDestaque,
}

const CHAVE_DO_DESCONTO = CHAVES.descontoAnual

/** `null` quando o parametro do plano (ou o desconto, no anual) nao veio. */
export function valorDoPlano(
  parametros: Parametros | undefined,
  plan: Plano,
  billing: Cobranca
): number | null {
  const mensal = parametro(parametros, CHAVE_DO_PLANO[plan])
  if (mensal === undefined) return null

  if (billing === 'monthly') return mensal

  const desconto = parametro(parametros, CHAVE_DO_DESCONTO)
  if (desconto === undefined) return null
  return precoAnualCentavos(mensal, desconto)
}

export function ehPlano(valor: unknown): valor is Plano {
  return valor === 'associado' || valor === 'destaque'
}

export function ehCobranca(valor: unknown): valor is Cobranca {
  return valor === 'monthly' || valor === 'annual'
}
