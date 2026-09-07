// app/[lang]/transparencia/page.tsx
import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import { faqSchema } from '@/lib/seo'
import Transparencia from '@/views/Transparencia'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const DICIONARIOS = { pt, en, es } as const

function faqItemsFor(lang: Locale) {
  return DICIONARIOS[lang].transparencia.faq
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('transparencia', lang as Locale)
}

export default async function TransparenciaPage(
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params
  const locale = (lang === 'en' || lang === 'es' ? lang : 'pt') as Locale
  const jsonLd = faqSchema(faqItemsFor(locale))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Transparencia />
    </>
  )
}
