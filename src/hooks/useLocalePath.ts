import { useLocation } from 'react-router-dom'

type Locale = 'pt' | 'en' | 'es'
const LOCALES: Locale[] = ['en', 'es']

/**
 * Returns a function that converts any absolute path to a locale-prefixed path.
 * PT (default) has no prefix: `/come`
 * EN:  `/en/come`
 * ES:  `/es/come`
 */
export function useLocalePath() {
  const { pathname } = useLocation()
  const segments = pathname.split('/')
  const firstSeg = segments[1] as Locale
  const currentLocale: Locale = LOCALES.includes(firstSeg) ? firstSeg : 'pt'

  return function localePath(path: string): string {
    if (currentLocale === 'pt') return path
    // Normalise: strip any leading locale prefix the path already has
    const cleaned = path.startsWith(`/${currentLocale}`)
      ? path.slice(`/${currentLocale}`.length) || '/'
      : path
    return `/${currentLocale}${cleaned === '/' ? '' : cleaned}`
  }
}

/** Strip the locale prefix from a URL pathname */
export function stripLocale(pathname: string): string {
  const segments = pathname.split('/')
  const firstSeg = segments[1] as Locale
  if (LOCALES.includes(firstSeg)) {
    const rest = segments.slice(2).join('/')
    return '/' + rest  // may be '/'
  }
  return pathname
}

/** Return the locale embedded in a URL pathname (default 'pt') */
export function localeFromPath(pathname: string): Locale {
  const firstSeg = pathname.split('/')[1] as Locale
  return LOCALES.includes(firstSeg) ? firstSeg : 'pt'
}
