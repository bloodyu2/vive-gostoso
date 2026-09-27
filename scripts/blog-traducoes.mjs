/**
 * Logica pura das traducoes do blog para o sitemap (Node, sem TS).
 * Os grupos vem de src/data/blog-traducoes.json: cada grupo liga o mesmo
 * post em pt, es e en, cada um com seu slug.
 */

const IDIOMAS = [
  { code: 'pt', hreflang: 'pt-BR', prefix: '' },
  { code: 'en', hreflang: 'en', prefix: '/en' },
  { code: 'es', hreflang: 'es', prefix: '/es' },
]

/**
 * Post de grupo: devolve { loc, alternates } com a URL so do idioma do slug.
 * Post sem grupo: devolve null (o chamador segue com urlGroup).
 */
export function entradaSitemapDoPost(slug, grupos, baseUrl) {
  const grupo = grupos.find((g) => g.pt === slug || g.en === slug || g.es === slug)
  if (!grupo) return null
  const url = (code) => `${baseUrl}${IDIOMAS.find((i) => i.code === code).prefix}/blog/${grupo[code]}`
  const idioma = IDIOMAS.find((i) => grupo[i.code] === slug).code
  return {
    loc: url(idioma),
    alternates: [
      ...IDIOMAS.map((i) => ({ hreflang: i.hreflang, href: url(i.code) })),
      { hreflang: 'x-default', href: url('pt') },
    ],
  }
}
