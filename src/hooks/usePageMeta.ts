import { useEffect } from 'react'

interface PageMetaOptions {
  title: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
}

const DEFAULT_IMAGE = 'https://vivegostoso.com.br/icon-192.png'
const SITE_NAME = 'Vive Gostoso'
const BASE_URL = 'https://vivegostoso.com.br'

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

export function usePageMeta({ title, description, image, url, type = 'website' }: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} — ${SITE_NAME}`
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
    setMeta('twitter:title', fullTitle, true)
    setMeta('twitter:description', desc, true)
    setMeta('twitter:image', img, true)
    setMeta('description', desc, true)
  }, [title, description, image, url, type])
}
