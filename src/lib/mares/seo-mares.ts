import type { Metadata } from 'next'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import { ESTACOES, type Idioma, type PraiaMare } from '@/data/praias-mares'
import { localizedUrl } from '@/lib/seo'

const DICIONARIOS = { pt, en, es } as const
const OG_LOCALE: Record<Idioma, string> = { pt: 'pt_BR', en: 'en_US', es: 'es_ES' }
const IN_LANGUAGE: Record<Idioma, string> = { pt: 'pt-BR', en: 'en', es: 'es' }

export type TextosMares = typeof pt.mares

export function textosMares(lang: Idioma): TextosMares {
  return DICIONARIOS[lang].mares
}

/** H1 da pagina indice: o mesmo texto do title, com o nome da cidade. */
export function tituloDoIndice(lang: Idioma): string {
  return DICIONARIOS[lang].meta.mares.title
}

export function textosNav(lang: Idioma) {
  return DICIONARIOS[lang].nav
}

/** Troca {chave} pelo valor. */
export function preencher(modelo: string, valores: Record<string, string | number>): string {
  return modelo.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? `{${k}}`))
}

export function caminhoMares(slug?: string): string {
  return slug ? `/explore/mares/${slug}` : '/explore/mares'
}

export function urlMares(lang: Idioma, slug?: string): string {
  return localizedUrl(caminhoMares(slug), lang)
}

/** Metadados da pagina de uma praia. `resumoHoje` e a mare do dia em texto
 *  ("Baixa 10h23 (0,14 m), alta 16h46 (2,44 m)"), que vai para a descricao do
 *  Open Graph: o link colado no WhatsApp ja mostra a mare. */
export function metadadosDaPraia(praia: PraiaMare, lang: Idioma, resumoHoje: string | null): Metadata {
  const t = textosMares(lang)
  const titulo = preencher(t.titulo_praia, { praia: praia.nome })
  const descricaoBase = preencher(t.desc_praia, { praia: praia.nome, municipio: praia.municipio })
  const descricao = resumoHoje ? `${t.og_hoje}: ${resumoHoje}. ${descricaoBase}` : descricaoBase
  const url = urlMares(lang, praia.slug)
  return {
    title: { absolute: titulo },
    description: descricao,
    alternates: {
      canonical: url,
      languages: {
        'pt-BR': urlMares('pt', praia.slug),
        en: urlMares('en', praia.slug),
        es: urlMares('es', praia.slug),
        'x-default': urlMares('pt', praia.slug),
      },
    },
    openGraph: {
      title: titulo,
      description: descricao,
      url,
      siteName: 'Vive Gostoso',
      locale: OG_LOCALE[lang],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: titulo, description: descricao },
  }
}

/** JSON-LD da tabua: WebPage que se baseia na publicacao da Marinha, a praia
 *  como schema.org/Beach com coordenadas, e a trilha Explore > Mares > Praia. */
export function jsonLdMares(lang: Idioma, praia?: PraiaMare): Record<string, unknown> {
  const t = textosMares(lang)
  const url = urlMares(lang, praia?.slug)
  const nome = praia ? preencher(t.titulo_praia, { praia: praia.nome }) : t.titulo
  const pagina: Record<string, unknown> = {
    '@type': 'WebPage',
    '@id': `${url}#pagina`,
    url,
    name: nome,
    inLanguage: IN_LANGUAGE[lang],
    isPartOf: { '@type': 'WebSite', name: 'Vive Gostoso', url: localizedUrl('', lang) },
    isBasedOn: {
      '@type': 'CreativeWork',
      name: `Tábuas de Maré da Marinha do Brasil, ${ESTACOES[praia?.estacaoPrincipal ?? 'GUAMARE'].nome}`,
      url: ESTACOES[praia?.estacaoPrincipal ?? 'GUAMARE'].fonteUrl,
      publisher: { '@type': 'GovernmentOrganization', name: 'Marinha do Brasil, Centro de Hidrografia da Marinha (CHM/DHN)' },
    },
  }
  const trilha = [
    { name: DICIONARIOS[lang].explore_indice.trilha_explore, url: localizedUrl('/explore', lang) },
    { name: t.titulo, url: urlMares(lang) },
    ...(praia ? [{ name: praia.nome, url }] : []),
  ]
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: trilha.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
  }
  if (!praia) {
    const marinha = { '@type': 'GovernmentOrganization', name: 'Marinha do Brasil, Centro de Hidrografia da Marinha (CHM/DHN)' }
    const dataset = {
      '@type': 'Dataset',
      '@id': `${url}#dados`,
      name: t.titulo,
      description: DICIONARIOS[lang].meta.mares.description,
      url,
      inLanguage: IN_LANGUAGE[lang],
      creator: marinha,
      isBasedOn: (Object.values(ESTACOES) as Array<(typeof ESTACOES)[keyof typeof ESTACOES]>).map((e) => ({
        '@type': 'CreativeWork',
        name: `Tábuas de Maré da Marinha do Brasil, ${e.nome}`,
        url: e.fonteUrl,
        publisher: marinha,
      })),
      temporalCoverage: '2026',
      spatialCoverage: { '@type': 'Place', name: 'São Miguel do Gostoso, Touros e Pedra Grande, RN' },
    }
    pagina.mainEntity = { '@id': `${url}#dados` }
    return { '@context': 'https://schema.org', '@graph': [pagina, dataset, breadcrumb] }
  }

  pagina.about = { '@id': `${url}#praia` }
  const beach = {
    '@type': 'Beach',
    '@id': `${url}#praia`,
    name: praia.nome,
    ...(praia.lat !== undefined && praia.lon !== undefined
      ? { geo: { '@type': 'GeoCoordinates', latitude: praia.lat, longitude: praia.lon } }
      : {}),
    address: { '@type': 'PostalAddress', addressLocality: praia.municipio, addressRegion: 'RN', addressCountry: 'BR' },
    ...(praia.dica ? { description: praia.dica[lang] } : {}),
  }
  return { '@context': 'https://schema.org', '@graph': [pagina, beach, breadcrumb] }
}
