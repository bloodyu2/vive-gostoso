/**
 * seo.ts — helpers para gerar JSON-LD schema.org consumido pelo
 * hook usePageMeta. Mantém o schema fora dos componentes para
 * facilitar testes e reuso.
 */

const BASE_URL = 'https://vivegostoso.com.br'
const SITE_NAME = 'Vive Gostoso'
const PUBLISHER_LOGO = `${BASE_URL}/icons/pwa/icon-512.png`

export interface ArticleSchemaInput {
  title: string
  description: string
  url: string
  image?: string
  author?: string
  publishedTime?: string | null
  modifiedTime?: string | null
  tags?: string[]
}

/** schema.org Article / BlogPosting */
export function articleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  const img = input.image ?? `${BASE_URL}/og-image.png`
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    image: img,
    url: input.url,
    datePublished: input.publishedTime ?? undefined,
    dateModified: input.modifiedTime ?? input.publishedTime ?? undefined,
    keywords: input.tags?.join(', '),
    inLanguage: 'pt-BR',
    author: {
      '@type': 'Organization',
      name: input.author ?? SITE_NAME,
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: PUBLISHER_LOGO,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.url,
    },
  }
}

export interface FaqItem {
  question: string
  answer: string
}

/** schema.org FAQPage */
export function faqSchema(items: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

/** schema.org BreadcrumbList */
export function breadcrumbSchema(crumbs: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: c.name,
      item: c.url,
    })),
  }
}

/** Truncate a description to ~160 chars on a word boundary for meta descriptions */
export function clampDescription(text: string, max = 160): string {
  if (text.length <= max) return text
  const truncated = text.slice(0, max - 1)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim() + '…'
}
