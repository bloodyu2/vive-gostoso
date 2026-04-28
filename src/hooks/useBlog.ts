import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types/database'

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from('gostoso_blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as BlogPost[]
    },
  })
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    enabled: !!slug,
    queryFn: async (): Promise<BlogPost | null> => {
      const { data, error } = await supabase
        .from('gostoso_blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()
      if (error) return null
      return data as BlogPost
    },
  })
}
