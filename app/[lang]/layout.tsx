// app/[lang]/layout.tsx
import { notFound } from 'next/navigation'
import { routing } from '../../i18n/routing'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LocaleSync } from '@/components/i18n/locale-sync'
import { ShareFab } from '@/components/share-fab'
import { CookieBanner } from '@/components/cookie-banner'

type Props = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params

  if (!routing.locales.includes(lang as 'pt' | 'en' | 'es')) {
    notFound()
  }

  return (
    <>
      <LocaleSync lang={lang} />
      <Header />
      <main>{children}</main>
      <Footer />
      <ShareFab />
      <CookieBanner />
    </>
  )
}
