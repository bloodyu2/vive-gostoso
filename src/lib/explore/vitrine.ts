import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import { PRAIAS_MARES, type Idioma } from '@/data/praias-mares'
import { preencher } from '@/lib/mares/seo-mares'
import type { Contagens } from './contagens'

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

/** `imagem`: foto local em public/ (decorativa). Sem foto, o cartao usa o icone
 *  grande sobre fundo de cor. */
export type ItemVitrine = { id: IdVitrine; caminho: string; icone: IconeVitrine; destaque?: boolean; imagem?: string }

/* "Eventos" e a aba PARTICIPE: a agenda mora em /participe e cada evento em
   /evento/[id], sem pagina propria de lista. Um cartao so, para nao ter dois
   links iguais lado a lado. */
export const ITENS_VITRINE: ItemVitrine[] = [
  { id: 'mares', caminho: '/explore/mares', icone: 'waves', destaque: true },
  { id: 'come', caminho: '/come', icone: 'utensils' },
  { id: 'fique', caminho: '/fique', icone: 'bed-double', imagem: '/images/blog/pousadas.jpg' },
  { id: 'passeie', caminho: '/passeie', icone: 'compass', imagem: '/images/blog/kitesurf.jpg' },
  { id: 'explore', caminho: '/explore', icone: 'map', imagem: '/images/blog/praias.jpg' },
  { id: 'participe', caminho: '/participe', icone: 'calendar', imagem: '/images/events/reveillon.jpg' },
  { id: 'conheca', caminho: '/conheca', icone: 'landmark', imagem: '/images/blog/festa-sao-miguel-arcanjo-2026-praia-da-xepa-gostoso.jpg' },
  { id: 'transfer', caminho: '/transfer', icone: 'car', imagem: '/images/blog/como-chegar.jpg' },
  { id: 'blog', caminho: '/blog', icone: 'newspaper', imagem: '/images/blog/o-que-fazer.jpg' },
  { id: 'contrate', caminho: '/contrate', icone: 'briefcase' },
  { id: 'apoie', caminho: '/apoie', icone: 'heart-handshake' },
]

export type TextosVitrine = Omit<typeof pt.vitrine, 'itens'> & {
  itens: Record<IdVitrine, { titulo: string; linha: string; botao: string }>
}

/** Textos da vitrine. A linha das mares leva o numero real de praias da tabua;
 *  come, fique, passeie e participe usam a frase com {n} quando ha contagem do
 *  banco (2 ou mais) e a frase sem numero quando nao ha (erro, 0 ou 1). */
export function textosVitrine(lang: Idioma, contagens: Contagens = {}): TextosVitrine {
  const v = DICIONARIOS[lang].vitrine
  const itens = {} as TextosVitrine['itens']
  for (const [id, item] of Object.entries(v.itens) as [IdVitrine, { titulo: string; linha: string; linha_n?: string; botao: string }][]) {
    const n = id === 'mares' ? PRAIAS_MARES.length : contagens[id as keyof Contagens]
    const usaNumero = typeof n === 'number' && n >= 2
    const linha = id === 'mares' ? preencher(item.linha, { n: PRAIAS_MARES.length }) : usaNumero && item.linha_n ? preencher(item.linha_n, { n }) : item.linha
    itens[id] = { titulo: item.titulo, linha, botao: item.botao }
  }
  return { ...v, itens }
}

const PREFIXO: Record<Idioma, string> = { pt: '', en: '/en', es: '/es' }

/** Caminho com o prefixo do idioma. */
export function caminhoNoIdioma(lang: Idioma, caminho: string): string {
  return `${PREFIXO[lang]}${caminho}` || '/'
}
