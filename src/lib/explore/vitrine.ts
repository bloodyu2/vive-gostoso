import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import { PRAIAS_MARES, type Idioma } from '@/data/praias-mares'
import { preencher } from '@/lib/mares/seo-mares'
import { pagamentosAtivos } from '@/lib/pagamentos'
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
  { id: 'come', caminho: '/come', icone: 'utensils', imagem: '/images/vitrine/come.jpg' },
  { id: 'fique', caminho: '/fique', icone: 'bed-double', imagem: '/images/vitrine/fique.jpg' },
  { id: 'passeie', caminho: '/passeie', icone: 'compass', imagem: '/images/vitrine/passeie.jpg' },
  { id: 'explore', caminho: '/explore', icone: 'map', imagem: '/images/vitrine/explore.jpg' },
  { id: 'participe', caminho: '/participe', icone: 'calendar', imagem: '/images/events/reveillon.jpg' },
  { id: 'conheca', caminho: '/conheca', icone: 'landmark', imagem: '/images/vitrine/conheca.jpg' },
  { id: 'transfer', caminho: '/transfer', icone: 'car', imagem: '/images/vitrine/transfer.jpg' },
  { id: 'blog', caminho: '/blog', icone: 'newspaper', imagem: '/images/vitrine/blog.jpg' },
  { id: 'contrate', caminho: '/contrate', icone: 'briefcase', imagem: '/images/vitrine/contrate.jpg' },
  { id: 'apoie', caminho: '/apoie', icone: 'heart-handshake' },
]

/** Cartões da home/vitrine visíveis ao público. Sem pagamentos ativos, some o
 *  cartão /apoie (entrada de doação Stripe) sem apagar o item da lista canônica. */
export function itensVitrinePublicos(): ItemVitrine[] {
  if (pagamentosAtivos()) return ITENS_VITRINE
  return ITENS_VITRINE.filter((i) => i.id !== 'apoie')
}

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
