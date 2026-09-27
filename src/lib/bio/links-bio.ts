import { prefixo } from './dicionario'

/** Os links da /bio do Instagram, em ordem, todos marcados com UTM.
 *
 *  O cadastro de negocio e /cadastre SEM prefixo de idioma: a rota vive em
 *  app/cadastre (fora de app/[lang]) e e o destino que o rodape e o cabecalho do
 *  site usam para "Cadastre seu negocio". A /bio antiga apontava para /parceiros,
 *  que e a pagina institucional, nao o formulario. */

export const UTM_BIO = 'utm_source=instagram&utm_medium=bio'

export type IdBloco = 'mares' | 'mapa' | 'come' | 'fique' | 'passeie' | 'eventos' | 'blog' | 'cadastre'
export type BlocoBio = { id: IdBloco; href: string }

/** Acrescenta a UTM respeitando query existente e ancora. */
export function comUtm(href: string): string {
  const [semAncora, ancora] = href.split('#', 2)
  const sep = semAncora.includes('?') ? '&' : '?'
  return `${semAncora}${sep}${UTM_BIO}${ancora !== undefined ? `#${ancora}` : ''}`
}

export function linksDaBio(lang: string, opcoes: { postSlug?: string | null } = {}): BlocoBio[] {
  const p = prefixo(lang)
  const blog = opcoes.postSlug ? `${p}/blog/${opcoes.postSlug}` : `${p}/blog`
  const destinos: Array<[IdBloco, string]> = [
    ['mares', `${p}/explore/mares`],
    ['mapa', `${p}/explore/mapa`],
    ['come', `${p}/come`],
    ['fique', `${p}/fique`],
    ['passeie', `${p}/passeie`],
    ['eventos', `${p}/participe`],
    ['blog', blog],
    ['cadastre', '/cadastre'],
  ]
  return destinos.map(([id, href]) => ({ id, href: comUtm(href) }))
}

const IDIOMAS = [
  { lang: 'pt', rotulo: 'PT', nome: 'Português' },
  { lang: 'en', rotulo: 'EN', nome: 'English' },
  { lang: 'es', rotulo: 'ES', nome: 'Español' },
] as const

export function linksDoRodape(lang: string) {
  return {
    idiomas: IDIOMAS.map((i) => ({ ...i, href: comUtm(`${prefixo(i.lang)}/bio`), atual: i.lang === lang })),
    privacidade: comUtm(`${prefixo(lang)}/privacidade`),
  }
}
