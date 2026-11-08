/** Links internos do corpo de um post (gravado no banco com caminho de portugues,
 *  ex.: href="/fique") ganham o prefixo do idioma da pagina. Sem isto, quem le o post
 *  em ingles ou espanhol e clica num link interno cai na pagina em portugues quando
 *  ainda nao tem o cookie de idioma (visto no QA de 08/11/2026 nos posts /en e /es).
 *  Feito na renderizacao: o conteudo gravado no banco nao muda. `lp` e o `useLocalePath`. */
const SEM_PREFIXO = /^\/(en|es|pt|api|images|_next|negocios|brand|icons|blog\/.*\.(?:jpg|png|webp))(\/|$|\?|#)/

export function prefixarLinksInternos(html: string, lp: (caminho: string) => string): string {
  return html.replace(/href="(\/(?!\/)[^"]*)"/g, (inteiro, caminho: string) => {
    if (SEM_PREFIXO.test(caminho)) return inteiro
    return `href="${lp(caminho)}"`
  })
}
