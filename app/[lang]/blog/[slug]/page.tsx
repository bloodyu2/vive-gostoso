import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogSlugsForBuild, getBlogPostForPage } from '@/lib/supabase/build-queries'
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
  const post = await getBlogPostForPage(slug)
  if (!post) return { title: 'Post nao encontrado' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: post.cover_url ? [{ url: post.cover_url }] : [],
    },
  }
}

export default async function BlogPostRoute({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostForPage(slug)
  if (!post) notFound()
  return <BlogPostPage initialPost={post} slug={slug} />
}
