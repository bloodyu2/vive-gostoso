import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogSlugsForBuild, getBlogPostForPage } from '@/lib/supabase/build-queries'
import BlogPostPage from '@/views/BlogPost'
import { articleSchema } from '@/lib/seo'

export const revalidate = 86400

type Props = { params: Promise<{ lang: string; slug: string }> }

export async function generateStaticParams() {
  const slugs = await getBlogSlugsForBuild()
  const langs = ['pt', 'en', 'es']
  return langs.flatMap((lang) => slugs.map((slug) => ({ lang, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params
  const post = await getBlogPostForPage(slug)
  if (!post) return { title: 'Post nao encontrado' }

  const baseUrl = 'https://vivegostoso.com.br'
  const canonical = `${baseUrl}/${lang === 'pt' ? '' : lang + '/'}blog/${slug}`
  const description = post.excerpt ?? `${post.title} no blog do Vive Gostoso.`
  const image = post.cover_url ?? `${baseUrl}/og-image.png`

  return {
    title: post.title,
    description,
    alternates: {
      canonical,
      languages: {
        'pt-BR': `${baseUrl}/blog/${slug}`,
        'en': `${baseUrl}/en/blog/${slug}`,
        'es': `${baseUrl}/es/blog/${slug}`,
        'x-default': `${baseUrl}/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description,
      url: canonical,
      siteName: 'Vive Gostoso',
      locale: lang === 'pt' ? 'pt_BR' : lang === 'en' ? 'en_US' : 'es_ES',
      type: 'article',
      images: post.cover_url ? [{ url: post.cover_url, width: 1200, height: 630 }] : [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [image],
    },
  }
}

export default async function BlogPostRoute({ params }: Props) {
  const { slug, lang } = await params
  const post = await getBlogPostForPage(slug)
  if (!post) notFound()

  const baseUrl = 'https://vivegostoso.com.br'
  const jsonLd = articleSchema({
    title: post.title,
    description: post.excerpt ?? `${post.title} no blog do Vive Gostoso.`,
    url: `${baseUrl}/${lang === 'pt' ? '' : lang + '/'}blog/${slug}`,
    image: post.cover_url ?? undefined,
    publishedTime: post.published_at ?? undefined,
    modifiedTime: post.updated_at ?? undefined,
    tags: post.tags ?? undefined,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostPage initialPost={post} slug={slug} />
    </>
  )
}
