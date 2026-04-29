import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { stripLocale } from '@/hooks/useLocalePath'

const BASE = 'https://vivegostoso.com.br'

/**
 * Injects hreflang <link> tags into <head> for the current page.
 * Renders nothing visible — side-effect only.
 */
export function HreflangTags() {
  const { pathname } = useLocation()
  const pagePath = stripLocale(pathname)  // e.g. '/come' or '/'

  useEffect(() => {
    // Remove previous hreflang tags injected by this component
    document
      .querySelectorAll('link[data-hreflang]')
      .forEach(el => el.remove())

    const head = document.head
    const addLink = (hreflang: string, href: string) => {
      const link = document.createElement('link')
      link.setAttribute('rel', 'alternate')
      link.setAttribute('hreflang', hreflang)
      link.setAttribute('href', href)
      link.setAttribute('data-hreflang', '1')
      head.appendChild(link)
    }

    const ptUrl  = `${BASE}${pagePath === '/' ? '' : pagePath}`  // '/come' or ''
    const enUrl  = `${BASE}/en${pagePath === '/' ? '' : pagePath}`
    const esUrl  = `${BASE}/es${pagePath === '/' ? '' : pagePath}`

    addLink('pt-BR',    ptUrl  || BASE)
    addLink('en',       enUrl  || `${BASE}/en`)
    addLink('es',       esUrl  || `${BASE}/es`)
    addLink('x-default', ptUrl || BASE)
  }, [pagePath])

  return null
}
