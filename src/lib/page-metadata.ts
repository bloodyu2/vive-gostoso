import type { Metadata } from 'next'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const BASE_URL = 'https://www.vivegostoso.com.br'
const OG_IMAGE = `${BASE_URL}/og-image.png`
const SITE_NAME = 'Vive Gostoso'

const DICIONARIOS = { pt, en, es } as const

export type Locale = keyof typeof DICIONARIOS
export type RotaPublica = keyof typeof pt.meta

/** Caminho da rota sem prefixo de idioma. A home é o único caso de caminho
 *  vazio, e é o que evita a barra dupla no canonical. */
const CAMINHOS: Record<RotaPublica, string> = {
  home: '',
  come: '/come',
  fique: '/fique',
  passeie: '/passeie',
  explore: '/explore',
  participe: '/participe',
  conheca: '/conheca',
  contrate: '/contrate',
  apoie: '/apoie',
  blog: '/blog',
  sobre: '/sobre',
  resolva: '/resolva',
  transparencia: '/transparencia',
}

const PREFIXO: Record<Locale, string> = { pt: '', en: '/en', es: '/es' }
const OG_LOCALE: Record<Locale, string> = { pt: 'pt_BR', en: 'en_US', es: 'es_ES' }

export function urlDaRota(rota: RotaPublica, lang: Locale): string {
  return `${BASE_URL}${PREFIXO[lang]}${CAMINHOS[rota]}`
}

export function buildPageMetadata(rota: RotaPublica, lang: Locale): Metadata {
  const textos = DICIONARIOS[lang].meta[rota]
  const url = urlDaRota(rota, lang)

  return {
    title: textos.title,
    description: textos.description,
    alternates: {
      canonical: url,
      languages: {
        'pt-BR': urlDaRota(rota, 'pt'),
        en: urlDaRota(rota, 'en'),
        es: urlDaRota(rota, 'es'),
        'x-default': urlDaRota(rota, 'pt'),
      },
    },
    openGraph: {
      title: textos.title,
      description: textos.description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      type: 'website',
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: textos.title,
      description: textos.description,
      images: [OG_IMAGE],
    },
  }
}
