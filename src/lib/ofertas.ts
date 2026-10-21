/**
 * Canal de ofertas da região (Balaio de Ofertas), KAN-743.
 *
 * Duas variáveis, as duas lidas só aqui:
 *   NEXT_PUBLIC_CANAL_OFERTAS_URL    endereço do canal (ainda não existe, o Victor cria)
 *   NEXT_PUBLIC_OFERTAS_ATIVAS=true  liga o item da /bio e o banner do site
 *
 * Desligado por padrão. Mesmo com a flag ligada, sem uma URL https válida nada
 * aparece, para nunca publicar link quebrado.
 */

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

export function ofertasAtivas(
  flag: string | undefined = process.env.NEXT_PUBLIC_OFERTAS_ATIVAS,
  canal: string | undefined = process.env.NEXT_PUBLIC_CANAL_OFERTAS_URL,
): boolean {
  return flag === 'true' && urlBase(canal) !== null
}

/** URL do canal com a UTM da origem, ou null se o canal não está pronto. */
export function linkOfertas(
  origem: OrigemOfertas,
  flag: string | undefined = process.env.NEXT_PUBLIC_OFERTAS_ATIVAS,
  canal: string | undefined = process.env.NEXT_PUBLIC_CANAL_OFERTAS_URL,
): string | null {
  if (flag !== 'true') return null
  const url = urlBase(canal)
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
