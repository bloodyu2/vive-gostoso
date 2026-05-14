import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types/database'

interface RelatedPostsProps {
  /** Slug do post atual — para excluir da listagem */
  currentSlug: string
  /** Tags do post atual — busca posts que compartilham tags */
  tags?: string[]
  /** Quantos mostrar. Default 3 */
  limit?: number
}

/**
 * Lista 3 posts relacionados com base em tags compartilhadas.
 * Fallback para posts mais recentes se não houver overlap.
 */
export function RelatedPosts({ currentSlug, tags = [], limit = 3 }: RelatedPostsProps) {
  const { data: posts = [] } = useQuery({
    queryKey: ['related-posts', currentSlug, tags.join(',')],
    queryFn: async () => {
      let query = supabase
        .from('gostoso_blog_posts')
        .select('*')
        .eq('is_published', true)
        .neq('slug', currentSlug)
        .order('published_at', { ascending: false })
        .limit(limit + 5)

      if (tags.length > 0) {
        query = query.overlaps('tags', tags)
      }
      const { data, error } = await query
      if (error) throw error
      const list = (data ?? []) as BlogPost[]

      if (list.length >= limit) return list.slice(0, limit)

      // Fallback: completa com posts recentes se faltou
      const { data: recent } = await supabase
        .from('gostoso_blog_posts')
        .select('*')
        .eq('is_published', true)
        .neq('slug', currentSlug)
        .order('published_at', { ascending: false })
        .limit(limit + list.length)
      const seen = new Set(list.map(p => p.slug))
      ;((recent ?? []) as BlogPost[]).forEach(p => {
        if (list.length < limit && !seen.has(p.slug)) {
          list.push(p)
          seen.add(p.slug)
        }
      })
      return list.slice(0, limit)
    },
  })

  if (posts.length === 0) return null

  return (
    <section className="not-prose my-12">
      <h2 className="font-display text-2xl font-bold text-[#1A1A1A] dark:text-white mb-6">
        Continue lendo
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map(post => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group rounded-2xl overflow-hidden border border-[#E8E4DF] dark:border-[#2D2D2D] bg-white dark:bg-[#222] hover:shadow-lg transition-shadow"
          >
            {post.cover_url ? (
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.cover_url}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="aspect-[16/10] bg-gradient-to-br from-teal to-teal-dark" />
            )}
            <div className="p-4">
              <h3 className="font-display font-bold text-base text-[#1A1A1A] dark:text-white group-hover:text-teal transition-colors leading-snug line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-1.5 text-xs text-[#737373] line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
