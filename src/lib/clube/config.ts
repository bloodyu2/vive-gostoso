// Passaporte Gostoso (clube de vantagens): constantes do lancamento.
//
// ESCONDIDO ATE O LANCAMENTO (ordem do Victor, 26/10/2026). Enquanto esta flag for
// false, a /clube so existe para quem recebe o link direto (noindex, nofollow, fora do
// sitemap) e nenhuma pagina publica aponta para ela: as paginas /p/NN, por exemplo,
// nao mostram a chamada para o Passaporte.
//
// PARA LANCAR: trocar CLUBE_PUBLICO para true neste arquivo. E o unico lugar.
// Isso liga a chamada do Passaporte nas paginas /p/NN. Depois do lancamento, quem
// quiser a /clube na busca tira o noindex de app/[lang]/clube/page.tsx e inclui a
// rota em scripts/generate-sitemap.mjs.
export const CLUBE_PUBLICO = false

export const CLUBE_ROTA = '/clube'
export const CLUBE_URL = 'https://www.vivegostoso.com.br/clube'
