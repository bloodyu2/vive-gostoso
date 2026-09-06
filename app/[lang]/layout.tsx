// app/[lang]/layout.tsx
import { notFound } from 'next/navigation'
import { routing } from '../../i18n/routing'
import { ChromeDoSite } from '@/components/layout/chrome-do-site'
import { LocaleSync } from '@/components/i18n/locale-sync'

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
      {/* Cabeçalho, rodapé, botão de compartilhar e banner de cookies, menos nas
          rotas onde eles cobrem o conteúdo. Ver components/layout/chrome-do-site. */}
      <ChromeDoSite>{children}</ChromeDoSite>
    </>
  )
}
