/**
 * Canal de ofertas da região (Balaio de Ofertas), KAN-743.
 *
 * Ligado por padrão, com o canal https://t.me/BalaioDeOfertasRN. Duas variáveis
 * podem sobrescrever, as duas lidas só aqui:
 *   NEXT_PUBLIC_OFERTAS_ATIVAS=false  desliga o item da /bio e o banner do site
 *   NEXT_PUBLIC_CANAL_OFERTAS_URL     outro endereço https para o canal
 *
 * URL que não seja https desliga tudo, para nunca publicar link quebrado.
 */

export const CANAL_OFERTAS_URL_PADRAO = 'https://t.me/BalaioDeOfertasRN'

export type OrigemOfertas = 'bio' | 'site'

function urlBase(valor: string | undefined): URL | null {
  if (!valor) return null
  try {
    const url = new URL(valor.trim())
    return url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

type Entrada = string | undefined

function resolver(flag: Entrada, canal: Entrada): URL | null {
  if (flag === 'false') return null
  const valor = canal === undefined || canal.trim() === '' ? CANAL_OFERTAS_URL_PADRAO : canal
  return urlBase(valor)
}

export function ofertasAtivas(
  flag: Entrada = process.env.NEXT_PUBLIC_OFERTAS_ATIVAS,
  canal: Entrada = process.env.NEXT_PUBLIC_CANAL_OFERTAS_URL,
): boolean {
  return resolver(flag, canal) !== null
}

/** URL do canal com a UTM da origem, ou null se o canal não está pronto. */
export function linkOfertas(
  origem: OrigemOfertas,
  flag: Entrada = process.env.NEXT_PUBLIC_OFERTAS_ATIVAS,
  canal: Entrada = process.env.NEXT_PUBLIC_CANAL_OFERTAS_URL,
): string | null {
  const url = resolver(flag, canal)
  if (!url) return null
  url.searchParams.set('utm_source', 'vivegostoso')
  url.searchParams.set('utm_medium', origem)
  url.searchParams.set('utm_campaign', 'ofertas')
  return url.toString()
}

type Textos = { titulo: string; linha: string; botao: string; fechar: string }

const TEXTOS: Record<'pt' | 'en' | 'es', Textos> = {
  pt: {
    titulo: 'Ofertas da região (Balaio de Ofertas)',
    linha: 'Promoções de negócios da região, num canal só',
    botao: 'Ver o canal',
    fechar: 'Fechar aviso',
  },
  en: {
    titulo: 'Local offers (Balaio de Ofertas)',
    linha: 'Deals from businesses around the region, in one channel',
    botao: 'See the channel',
    fechar: 'Dismiss',
  },
  es: {
    titulo: 'Ofertas de la región (Balaio de Ofertas)',
    linha: 'Promociones de negocios de la región, en un solo canal',
    botao: 'Ver el canal',
    fechar: 'Cerrar aviso',
  },
}

export function textosOfertas(lang: string | undefined): Textos {
  const l = (lang ?? 'pt').slice(0, 2)
  return l === 'en' || l === 'es' ? TEXTOS[l] : TEXTOS.pt
}

const SITE: Record<'pt' | 'en' | 'es', string> = {
  pt: 'Conhecer o site',
  en: 'Visit the website',
  es: 'Conocer el sitio',
}

export function rotuloConhecerSite(lang: string | undefined): string {
  const l = (lang ?? 'pt').slice(0, 2)
  return l === 'en' || l === 'es' ? SITE[l] : SITE.pt
}
