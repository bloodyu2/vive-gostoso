import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/supabase/queries'
import Blog from '@/views/Blog'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog -- Historias de Sao Miguel do Gostoso',
  description: 'Artigos, guias e historias sobre Sao Miguel do Gostoso, RN.',
  openGraph: {
    title: 'Blog -- Historias de Sao Miguel do Gostoso',
    description: 'Artigos, guias e historias sobre Sao Miguel do Gostoso, RN.',
    url: 'https://vivegostoso.com.br/blog',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog -- Historias de Sao Miguel do Gostoso',
    description: 'Artigos, guias e historias sobre Sao Miguel do Gostoso, RN.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  return <Blog initialPosts={posts} />
}
