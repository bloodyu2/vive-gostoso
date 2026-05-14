import { useEffect } from 'react'

interface PageMetaOptions {
  title: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  /** ISO 8601 — only used when type='article' */
  publishedTime?: string
  modifiedTime?: string
  author?: string
  /** Tag list — only used when type='article' */
  tags?: string[]
  /** Optional structured data (JSON-LD) — array of objects to inject as separate <script type="application/ld+json"> tags */
  jsonLd?: Array<Record<string, unknown>>
}

const DEFAULT_IMAGE = 'https://vivegostoso.com.br/og-image.png'
const SITE_NAME = 'Vive Gostoso'
const BASE_URL = 'https://vivegostoso.com.br'
const JSONLD_DATA_ATTR = 'data-vg-jsonld'

function setMeta(property: string, content: string, isName = false) {
  const attr = isName ? 'name' : 'property'
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeMeta(property: string, isName = false) {
  const attr = isName ? 'name' : 'property'
  const el = document.querySelector(`meta[${attr}="${property}"]`)
  if (el) el.remove()
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function clearAllArticleTags() {
  document.querySelectorAll('meta[property^="article:"]').forEach(el => el.remove())
}

function clearJsonLd() {
  document.querySelectorAll(`script[${JSONLD_DATA_ATTR}]`).forEach(el => el.remove())
}

function setJsonLd(blocks: Array<Record<string, unknown>>) {
  clearJsonLd()
  blocks.forEach((data, idx) => {
    const script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.setAttribute(JSONLD_DATA_ATTR, String(idx))
    script.text = JSON.stringify(data)
    document.head.appendChild(script)
  })
}

export function usePageMeta({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags,
  jsonLd,
}: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`
    document.title = fullTitle

    const desc = description ?? 'O guia digital de São Miguel do Gostoso. Come. Fique. Passeie.'
    const img = image ?? DEFAULT_IMAGE
    const canonical = url ?? BASE_URL

    setMeta('og:title', fullTitle)
    setMeta('og:description', desc)
    setMeta('og:image', img)
    setMeta('og:url', canonical)
    setMeta('og:type', type)
    setMeta('og:site_name', SITE_NAME)
    setMeta('twitter:card', 'summary_large_image', true)
    setMeta('twitter:title', fullTitle, true)
    setMeta('twitter:description', desc, true)
    setMeta('twitter:image', img, true)
    setMeta('description', desc, true)
    setLink('canonical', canonical)

    // Article-specific tags
    clearAllArticleTags()
    if (type === 'article') {
      if (publishedTime) setMeta('article:published_time', publishedTime)
      if (modifiedTime) setMeta('article:modified_time', modifiedTime)
      if (author) setMeta('article:author', author)
      tags?.forEach(tag => {
        const el = document.createElement('meta')
        el.setAttribute('property', 'article:tag')
        el.setAttribute('content', tag)
        document.head.appendChild(el)
      })
    } else {
      removeMeta('article:published_time')
      removeMeta('article:modified_time')
      removeMeta('article:author')
    }

    // JSON-LD blocks
    if (jsonLd && jsonLd.length > 0) {
      setJsonLd(jsonLd)
    } else {
      clearJsonLd()
    }
  }, [title, description, image, url, type, publishedTime, modifiedTime, author, tags, jsonLd])
}
