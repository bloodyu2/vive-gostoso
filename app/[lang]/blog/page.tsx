import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/supabase/queries'
import Blog from '@/views/Blog'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog -- Histórias de São Miguel do Gostoso',
  description: 'Artigos, guias e histórias sobre São Miguel do Gostoso, RN.',
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  return <Blog initialPosts={posts} />
}
