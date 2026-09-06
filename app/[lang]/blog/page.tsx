import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import { getBlogPosts } from '@/lib/supabase/queries'
import Blog from '@/views/Blog'

export const revalidate = 3600

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('blog', lang as Locale)
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  return <Blog initialPosts={posts} />
}
