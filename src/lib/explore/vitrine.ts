import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import { PRAIAS_MARES, type Idioma } from '@/data/praias-mares'
import { preencher } from '@/lib/mares/seo-mares'

const DICIONARIOS = { pt, en, es } as const

/** Abas do menu que existem hoje em app/[lang]. A ordem pedia tambem VIVE,
 *  mas nao ha rota /vive: a home faz esse papel (ver decisoes.md). */
export const ABAS_DO_MENU = ['come', 'fique', 'passeie', 'explore', 'participe', 'conheca', 'apoie'] as const

export type IdVitrine = keyof typeof pt.vitrine.itens

/** Nome do icone do lucide-react (biblioteca que o projeto ja usa). */
export type IconeVitrine =
  | 'waves'
  | 'utensils'
  | 'bed-double'
  | 'compass'
  | 'map'
  | 'calendar'
  | 'landmark'
  | 'heart-handshake'
  | 'briefcase'
  | 'car'
  | 'newspaper'

export type ItemVitrine = { id: IdVitrine; caminho: string; icone: IconeVitrine; destaque?: boolean }

/* "Eventos" e a aba PARTICIPE: a agenda mora em /participe e cada evento em
   /evento/[id], sem pagina propria de lista. Um cartao so, para nao ter dois
   links iguais lado a lado. */
export const ITENS_VITRINE: ItemVitrine[] = [
  { id: 'mares', caminho: '/explore/mares', icone: 'waves', destaque: true },
  { id: 'come', caminho: '/come', icone: 'utensils' },
  { id: 'fique', caminho: '/fique', icone: 'bed-double' },
  { id: 'passeie', caminho: '/passeie', icone: 'compass' },
  { id: 'explore', caminho: '/explore', icone: 'map' },
  { id: 'participe', caminho: '/participe', icone: 'calendar' },
  { id: 'conheca', caminho: '/conheca', icone: 'landmark' },
  { id: 'transfer', caminho: '/transfer', icone: 'car' },
  { id: 'blog', caminho: '/blog', icone: 'newspaper' },
  { id: 'contrate', caminho: '/contrate', icone: 'briefcase' },
  { id: 'apoie', caminho: '/apoie', icone: 'heart-handshake' },
]

export type TextosVitrine = Omit<typeof pt.vitrine, 'itens'> & {
  itens: Record<IdVitrine, { titulo: string; linha: string }>
}

/** Textos da vitrine, com o numero real de praias da tabua ja preenchido. */
export function textosVitrine(lang: Idioma): TextosVitrine {
  const v = DICIONARIOS[lang].vitrine
  return {
    ...v,
    itens: {
      ...v.itens,
      mares: { ...v.itens.mares, linha: preencher(v.itens.mares.linha, { n: PRAIAS_MARES.length }) },
    },
  }
}

const PREFIXO: Record<Idioma, string> = { pt: '', en: '/en', es: '/es' }

/** Caminho com o prefixo do idioma. */
export function caminhoNoIdioma(lang: Idioma, caminho: string): string {
  return `${PREFIXO[lang]}${caminho}` || '/'
}
