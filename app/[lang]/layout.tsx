// app/[lang]/layout.tsx
import { notFound } from 'next/navigation'
import { routing } from '../../i18n/routing'
import { ChromeDoSite } from '@/components/layout/chrome-do-site'
import { LocaleSync } from '@/components/i18n/locale-sync'
import { ClubeProvider } from '@/components/clube/contexto-clube'
import { carregarIdsDoClube } from '@/lib/clube/parceiros-no-ar'

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

  // Negocios com vantagem do Passaporte no ar, para o selo do clube. Uma leitura com
  // cache de 5 min para o site todo; vazia enquanto CLUBE_PUBLICO for false.
  const idsDoClube = await carregarIdsDoClube()

  return (
    <ClubeProvider ids={idsDoClube}>
      <LocaleSync lang={lang} />
      {/* Cabeçalho, rodapé, flutuantes e banner de cookies, menos nas rotas onde
          eles cobrem o conteúdo. Ver components/layout/chrome-do-site. */}
      <ChromeDoSite>{children}</ChromeDoSite>
    </ClubeProvider>
  )
}
