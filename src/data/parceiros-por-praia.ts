/* Parceiros do Passaporte Gostoso cujo lugar numa praia da tabua esta confirmado.
   So entra aqui o que o proprio Victor ja publicou ou aprovou com a praia no texto: a
   legenda do post da Gostoso Surf School (11/11/2026: "escola de surf e SUP na Praia de
   Tourinhos") e a do Cafe com Biscoitos Damy ("na Praia de Tourinhos"). O banco nao
   tem endereco nem coordenada de negocio, entao nada aqui e deduzido por distancia.
   Praia ausente da lista = nenhum parceiro confirmado nela: a pagina nao mostra o card.
   Se um parceiro sair do clube ou mudar de lugar, tirar daqui. */
export type ParceiroDaPraia = { slug: string; nome: string }

export const PARCEIROS_POR_PRAIA: Record<string, ParceiroDaPraia[]> = {
  tourinhos: [
    { slug: 'gostoso-surf-school', nome: 'Gostoso Surf School' },
    { slug: 'cafe-com-biscoitos-damy', nome: 'Café com Biscoitos Damy' },
  ],
}
