import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type Locale = 'pt' | 'en' | 'es'

/**
 * Syncs the URL-embedded locale to i18next and renders nested routes.
 * Wrap each locale tree in App.tsx with this component.
 */
export function LocaleSync({ lang }: { lang: Locale }) {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.language.slice(0, 2) !== lang) {
      i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  return <Outlet />
}
