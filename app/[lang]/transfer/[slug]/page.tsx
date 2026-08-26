import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import TransferDetailPage from '@/views/TransferDetailPage'

export const revalidate = 3600

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getTransfer(slug: string) {
  const { data } = await supabaseServer
    .from('gostoso_transfers')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }): Promise<Metadata> {
  const { slug } = await params
  const transfer = await getTransfer(slug)
  if (!transfer) return {}

  const title = `${transfer.provider_name} | Transfer São Miguel do Gostoso`
  const description = transfer.description ??
    `Serviço de transfer oferecido por ${transfer.provider_name} em São Miguel do Gostoso.`
  const url = `https://vivegostoso.com.br/transfer/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'pt-BR': url,
        'en': `https://vivegostoso.com.br/en/transfer/${slug}`,
        'es': `https://vivegostoso.com.br/es/transfer/${slug}`,
        'x-default': url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Vive Gostoso',
      locale: 'pt_BR',
      type: 'website',
      images: transfer.photo_url
        ? [{ url: transfer.photo_url, width: 1200, height: 630 }]
        : [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
    },
  }
}

export default async function TransferSlugPage({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug } = await params
  const transfer = await getTransfer(slug)
  if (!transfer) notFound()

  return <TransferDetailPage transfer={transfer} />
}
