import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPost } from '@/lib/supabase/queries'
import { getBlogSlugsForBuild } from '@/lib/supabase/build-queries'
import BlogPostPage from '@/views/BlogPost'

export const revalidate = 86400

type Props = { params: Promise<{ lang: string; slug: string }> }

export async function generateStaticParams() {
  const slugs = await getBlogSlugsForBuild()
  const langs = ['pt', 'en', 'es']
  return langs.flatMap((lang) => slugs.map((slug) => ({ lang, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return { title: 'Post não encontrado' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: post.cover_url ? [{ url: post.cover_url }] : [],
    },
  }
}

export default async function BlogPostRoute({ params }: Props) {
  try {
    const { slug } = await params
    const post = await getBlogPost(slug)
    if (!post) notFound()
    return <BlogPostPage initialPost={post} slug={slug} />
  } catch (e: unknown) {
    if ((e as { digest?: string })?.digest?.startsWith('NEXT_NOT_FOUND')) throw e
    console.error('[BlogPostRoute] SSR error:', e)
    throw e
  }
}
