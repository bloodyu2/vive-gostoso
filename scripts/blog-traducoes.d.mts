export type GrupoTraducao = { pt: string; es: string; en: string }
export function entradaSitemapDoPost(
  slug: string,
  grupos: GrupoTraducao[],
  baseUrl: string,
): { loc: string; alternates: Array<{ hreflang: string; href: string }> } | null
