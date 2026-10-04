// src/lib/media-avaliacoes.ts

/**
 * Media das avaliacoes a partir da soma e da quantidade REAIS (agregado do
 * banco). Antes, a media do perfil do negocio era calculada so com os reviews
 * da pagina atual: um negocio com 25 avaliacoes e media 4,8 podia mostrar 3,0
 * se as cinco primeiras fossem ruins. O calculo mora aqui, com teste, para
 * ninguem voltar a fazer a media da pagina.
 */
export function mediaAvaliacoes(soma: number, quantidade: number): number {
  if (!Number.isFinite(soma) || !Number.isFinite(quantidade) || quantidade <= 0) return 0
  return soma / quantidade
}
