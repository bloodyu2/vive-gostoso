/**
 * Faixa "Novos em Gostoso" da home: os negocios que entraram por ultimo.
 *
 * Antes, os novos dividiam o carrossel com destaques e verificados e, com 12
 * destaques, nunca chegavam la (Casa Surya e Lokos por Kite caiam na posicao 7
 * e 8 de um limite de 8). Agora a faixa e so deles: a ordem e a data de
 * cadastro, do mais recente para o mais antigo, sem depender de destaque.
 *
 * Negocio sem foto fica de fora (cartao sem imagem e um retangulo vazio) e o
 * mesmo negocio nunca aparece duas vezes.
 */

export type NegocioNovo = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  created_at: string
  is_verified: boolean
  category: { name: string } | null
}

export const MAXIMO_DE_NOVOS = 8

export function selecionarNovos(negocios: readonly NegocioNovo[], maximo: number = MAXIMO_DE_NOVOS): NegocioNovo[] {
  const vistos = new Set<string>()
  return [...negocios]
    .filter(n => Boolean(n.cover_url))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .filter(n => {
      if (vistos.has(n.id)) return false
      vistos.add(n.id)
      return true
    })
    .slice(0, maximo)
}
