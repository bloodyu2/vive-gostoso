import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import type { Idioma } from '@/data/praias-mares'
import { PONTOS_MAPA, type PontoMapa } from '@/data/pontos-mapa'
import { localizedUrl } from '@/lib/seo'
import { ITENS_VITRINE, textosVitrine } from './vitrine'
import { urlMares } from '@/lib/mares/seo-mares'

const DICIONARIOS = { pt, en, es } as const
const IN_LANGUAGE: Record<Idioma, string> = { pt: 'pt-BR', en: 'en', es: 'es' }

function trilha(itens: Array<{ name: string; url: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
  }
}

/** Itens do indice do Explore, na ordem da pagina. Compartilhado com a tela. */
export function itensDoExplore(lang: Idioma): Array<{ id: string; titulo: string; linha: string; caminho: string }> {
  const d = DICIONARIOS[lang]
  const v = textosVitrine(lang)
  const e = d.explore_indice
  return [
    { id: 'mares', titulo: v.itens.mares.titulo, linha: v.itens.mares.linha, caminho: '/explore/mares' },
    { id: 'mapa', titulo: e.mapa_titulo, linha: e.mapa_linha, caminho: '/explore/mapa' },
    { id: 'passeie', titulo: v.itens.passeie.titulo, linha: e.passeie_linha, caminho: '/passeie' },
    { id: 'conheca', titulo: v.itens.conheca.titulo, linha: e.conheca_linha, caminho: '/conheca' },
    { id: 'participe', titulo: v.itens.participe.titulo, linha: e.participe_linha, caminho: '/participe' },
    { id: 'transfer', titulo: v.itens.transfer.titulo, linha: e.transfer_linha, caminho: '/transfer' },
  ]
}

/** ItemList da vitrine da home: um item por cartao. */
export function jsonLdVitrine(lang: Idioma): Record<string, unknown> {
  const t = textosVitrine(lang)
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.titulo,
    itemListElement: ITENS_VITRINE.map((i, n) => ({
      '@type': 'ListItem',
      position: n + 1,
      name: t.itens[i.id].titulo,
      description: t.itens[i.id].linha,
      url: localizedUrl(i.caminho, lang),
    })),
  }
}

/** Pagina indice do Explore: WebPage, trilha Inicio > Explore e a lista do que
 *  da para explorar. */
export function jsonLdExplore(lang: Idioma): Record<string, unknown> {
  const d = DICIONARIOS[lang]
  const url = localizedUrl('/explore', lang)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#pagina`,
        url,
        name: d.meta.explore.title,
        description: d.meta.explore.description,
        inLanguage: IN_LANGUAGE[lang],
      },
      trilha([
        { name: d.explore_indice.trilha_inicio, url: localizedUrl('', lang) },
        { name: d.explore_indice.trilha_explore, url },
      ]),
      {
        '@type': 'ItemList',
        name: d.explore_indice.h1,
        itemListElement: itensDoExplore(lang).map((i, n) => ({
          '@type': 'ListItem',
          position: n + 1,
          name: i.titulo,
          url: localizedUrl(i.caminho, lang),
        })),
      },
    ],
  }
}

function lugar(p: PontoMapa, lang: Idioma): Record<string, unknown> {
  return {
    '@type': p.tipoSchema,
    name: p.nome,
    description: p.descricao[lang],
    geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lon },
    address: { '@type': 'PostalAddress', addressLocality: p.municipio, addressRegion: 'RN', addressCountry: 'BR' },
    ...(p.mareSlug ? { url: urlMares(lang, p.mareSlug) } : p.site ? { url: p.site } : {}),
  }
}

/** Pagina do mapa: trilha Inicio > Explore > Mapa e um lugar por ponto. */
export function jsonLdMapa(lang: Idioma): Record<string, unknown> {
  const d = DICIONARIOS[lang]
  const url = localizedUrl('/explore/mapa', lang)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      trilha([
        { name: d.explore_indice.trilha_inicio, url: localizedUrl('', lang) },
        { name: d.explore_indice.trilha_explore, url: localizedUrl('/explore', lang) },
        { name: d.explore_indice.trilha_mapa, url },
      ]),
      {
        '@type': 'ItemList',
        name: d.mapa.lista_titulo,
        itemListElement: PONTOS_MAPA.map((p, n) => ({ '@type': 'ListItem', position: n + 1, item: lugar(p, lang) })),
      },
    ],
  }
}
