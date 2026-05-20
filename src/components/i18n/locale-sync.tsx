'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import i18n from '@/i18n'

const SUPPORTED = ['en', 'es', 'pt'] as const
type Locale = (typeof SUPPORTED)[number]

function detectLocale(pathname: string): Locale {
  const segment = pathname.split('/')[1]
  if (SUPPORTED.includes(segment as Locale)) return segment as Locale
  return 'pt'
}

interface Props {
  children?: React.ReactNode
  /** Locale explícito do [lang] param (server-side). Se omitido, detecta pela URL. */
  lang?: string
}

export function LocaleSync({ children, lang }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    const locale = (lang && SUPPORTED.includes(lang as Locale) ? lang : detectLocale(pathname)) as Locale
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
  }, [pathname, lang])

  return <>{children}</>
}
