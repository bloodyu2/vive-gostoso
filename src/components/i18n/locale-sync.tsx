import { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type Locale = 'pt' | 'en' | 'es'

/**
 * Syncs the URL-embedded locale to i18next and renders nested routes.
 * For PT routes: if the user has a saved non-PT preference in localStorage,
 * redirects them to the correct locale-prefixed URL automatically.
 */
export function LocaleSync({ lang }: { lang: Locale }) {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Sync URL locale to i18next on every route change
  useEffect(() => {
    if (i18n.language.slice(0, 2) !== lang) {
      i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  // If landing on a PT route but user has a saved non-PT preference → redirect
  useEffect(() => {
    if (lang !== 'pt') return
    const saved = localStorage.getItem('i18n-lang')
    if (saved === 'en' || saved === 'es') {
      navigate(`/${saved}${pathname === '/' ? '' : pathname}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally only on mount to avoid redirect loops

  return <Outlet />
}
