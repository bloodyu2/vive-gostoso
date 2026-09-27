import grupos from '@/data/blog-traducoes.json'

export type IdiomaBlog = 'pt' | 'es' | 'en'
type Grupo = Record<IdiomaBlog, string>

const BASE_URL = 'https://www.vivegostoso.com.br'
const GRUPOS = grupos as Grupo[]

function grupoDoSlug(slug: string): Grupo | undefined {
  return GRUPOS.find((g) => g.pt === slug || g.es === slug || g.en === slug)
}

/** Idioma do slug dentro do seu grupo; null quando o post nao tem grupo. */
export function idiomaDoSlug(slug: string): IdiomaBlog | null {
  const g = grupoDoSlug(slug)
  if (!g) return null
  return (['pt', 'es', 'en'] as const).find((l) => g[l] === slug) ?? null
}

/** Slug do mesmo post no idioma pedido; post sem grupo devolve o proprio slug. */
export function slugNoIdioma(slug: string, lang: IdiomaBlog): string {
  return grupoDoSlug(slug)?.[lang] ?? slug
}

/** Post sem grupo aparece em todos os idiomas; post de grupo so no seu. */
export function visivelNoIdioma(slug: string, lang: IdiomaBlog): boolean {
  const idioma = idiomaDoSlug(slug)
  return idioma === null || idioma === lang
}

export function urlDoPost(slug: string, lang: IdiomaBlog): string {
  const prefixo = lang === 'pt' ? '' : `/${lang}`
  return `${BASE_URL}${prefixo}/blog/${slug}`
}

export function alternatesDoPost(slug: string): Record<'pt-BR' | 'en' | 'es' | 'x-default', string> {
  const pt = urlDoPost(slugNoIdioma(slug, 'pt'), 'pt')
  return {
    'pt-BR': pt,
    en: urlDoPost(slugNoIdioma(slug, 'en'), 'en'),
    es: urlDoPost(slugNoIdioma(slug, 'es'), 'es'),
    'x-default': pt,
  }
}

export function inLanguageDoPost(slug: string, lang: IdiomaBlog): 'pt-BR' | 'en' | 'es' {
  const idioma = idiomaDoSlug(slug) ?? lang
  return idioma === 'pt' ? 'pt-BR' : idioma
}

/** Normaliza i18n.language (ex.: 'pt-BR', 'en-US') para pt/en/es. */
export function normalizarIdioma(language: string | undefined): IdiomaBlog {
  const base = (language ?? 'pt').slice(0, 2).toLowerCase()
  return base === 'en' || base === 'es' ? base : 'pt'
}
