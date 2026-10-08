'use client'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types/database'
import { PostCard } from './PostCard'
import { useTranslation } from 'react-i18next'
import { normalizarIdioma, visivelNoIdioma } from '@/lib/blog/traducoes'

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
  const { t, i18n } = useTranslation()
  const idioma = normalizarIdioma(i18n.language)
  const { data: todosPosts = [] } = useQuery({
    queryKey: ['related-posts', currentSlug, tags.join(','), idioma],
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
      // Filtra pelo idioma antes de cortar no limite, para nao sobrar menos que `limit`.
      const list = ((data ?? []) as BlogPost[]).filter(p => visivelNoIdioma(p.slug, idioma))

      if (list.length >= limit) return list.slice(0, limit)

      // Fallback: completa com posts recentes se faltou
      const { data: recent } = await supabase
        .from('gostoso_blog_posts')
        .select('*')
        .eq('is_published', true)
        .neq('slug', currentSlug)
        .order('published_at', { ascending: false })
        .limit(limit + list.length + 5)
      const seen = new Set(list.map(p => p.slug))
      ;((recent ?? []) as BlogPost[]).forEach(p => {
        if (list.length < limit && !seen.has(p.slug) && visivelNoIdioma(p.slug, idioma)) {
          list.push(p)
          seen.add(p.slug)
        }
      })
      return list.slice(0, limit)
    },
  })

  const posts = todosPosts

  if (posts.length === 0) return null

  return (
    <section className="not-prose my-12">
      <h2 className="font-display text-2xl font-bold text-[#1A1A1A] dark:text-white mb-6">
        {t('blog.continue_lendo')}
      </h2>
      <div className={`grid grid-cols-1 gap-4 ${posts.length === 1 ? 'max-w-sm' : posts.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </section>
  )
}
