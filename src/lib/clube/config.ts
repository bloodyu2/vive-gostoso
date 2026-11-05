// Passaporte Gostoso (clube de vantagens): constantes do clube.
//
// NO AR desde 05/11/2026. CLUBE_PUBLICO = true liga a chamada do Passaporte nas paginas
// /p/NN, o selo "Parceiro do Passaporte Gostoso" e o botao do clube na /bio. A /clube
// e indexavel (app/[lang]/clube/page.tsx, com canonical e hreflang) e esta no sitemap
// (scripts/paginas-sitemap.mjs). Para desligar o clube, trocar a flag para false e
// devolver o noindex da /clube.
export const CLUBE_PUBLICO = true

export const CLUBE_ROTA = '/clube'
export const CLUBE_URL = 'https://www.vivegostoso.com.br/clube'

/** Tamanho da 1a leva do Passaporte: 20 ESTABELECIMENTOS parceiros (cada um recebe plaquinha),
 *  nao 20 cupons nem 20 resgates (Victor, 30/10/2026). E so informacao para a /clube:
 *  nada no banco nem no codigo impede o 21o estabelecimento de entrar. Unico lugar do 20. */
export const LEVA_ESTABELECIMENTOS = 20
