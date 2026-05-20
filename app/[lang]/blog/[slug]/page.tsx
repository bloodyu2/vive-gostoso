import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPost, getBlogPosts } from '@/lib/supabase/queries'
import BlogPostPage from '@/pages/BlogPost'

export const revalidate = 86400

type Props = { params: Promise<{ lang: string; slug: string }> }

export async function generateStaticParams() {
  const posts = await getBlogPosts(100)
  const langs = ['pt', 'en', 'es']
  return langs.flatMap((lang) =>
    posts.map((p: { slug: string }) => ({ lang, slug: p.slug }))
  )
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
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()
  return <BlogPostPage initialPost={post} slug={slug} />
}
