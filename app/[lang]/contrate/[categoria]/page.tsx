// app/[lang]/contrate/[categoria]/page.tsx
//
// Link compartilhavel por categoria (ex: /contrate/eletrica, /en/contrate/baba).
// Mesma UI de /contrate, so que abre ja filtrada -- serve pra compartilhar
// "preciso de um eletricista em Gostoso" direto no WhatsApp/grupo do bairro
// em vez do link generico da pagina toda.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { routing } from '../../../../i18n/routing'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import {
  PROFESSIONAL_CATEGORIES,
  type ProfessionalCategory,
} from '@/types/professional'
import Contrate from '@/views/Contrate'

const BASE_URL = 'https://www.vivegostoso.com.br'
const OG_IMAGE = `${BASE_URL}/og-image.png`
const SITE_NAME = 'Vive Gostoso'

const DICIONARIOS = { pt, en, es } as const
type Locale = keyof typeof DICIONARIOS

const PREFIXO: Record<Locale, string> = { pt: '', en: '/en', es: '/es' }
const OG_LOCALE: Record<Locale, string> = { pt: 'pt_BR', en: 'en_US', es: 'es_ES' }

function isCategoria(value: string): value is ProfessionalCategory {
  return (PROFESSIONAL_CATEGORIES as string[]).includes(value)
}

function urlCategoria(categoria: string, lang: Locale): string {
  return `${BASE_URL}${PREFIXO[lang]}/contrate/${categoria}`
}

type Props = { params: Promise<{ lang: string; categoria: string }> }

export function generateStaticParams() {
  return routing.locales.flatMap(lang =>
    PROFESSIONAL_CATEGORIES.map(categoria => ({ lang, categoria }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, categoria } = await params
  const locale = (lang in DICIONARIOS ? lang : 'pt') as Locale

  if (!isCategoria(categoria)) {
    return { title: 'Categoria nao encontrada' }
  }

  const dict = DICIONARIOS[locale]
  const rotulo = dict.contrate.categorias[categoria]
  const title = dict.contrate.categoria_title.replace('{{categoria}}', rotulo)
  const description = dict.contrate.categoria_desc.replace('{{categoria}}', rotulo)
  const url = urlCategoria(categoria, locale)

  return {
    // `absolute` e nao string simples: app/layout.tsx define title.template =
    // '%s | Vive Gostoso', e sem o absolute o Next reanexaria a marca --
    // mesma razao documentada em src/lib/page-metadata.ts.
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: {
        'pt-BR': urlCategoria(categoria, 'pt'),
        en: urlCategoria(categoria, 'en'),
        es: urlCategoria(categoria, 'es'),
        'x-default': urlCategoria(categoria, 'pt'),
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      type: 'website',
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  }
}

export default async function ContrateCategoriaPage({ params }: Props) {
  const { categoria } = await params
  if (!isCategoria(categoria)) {
    notFound()
  }
  return <Contrate categoriaInicial={categoria} />
}
