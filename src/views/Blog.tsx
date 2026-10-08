'use client'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types/database'
import { ErrorState } from '@/components/ui/error-state'
import { PostCard } from '@/components/blog'
import { BlurFade } from '@/components/magicui/blur-fade'
import { normalizarIdioma, visivelNoIdioma } from '@/lib/blog/traducoes'

function useBlogPosts(options?: Pick<UseQueryOptions<BlogPost[]>, 'initialData'>) {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as BlogPost[]
    },
    ...options,
  })
}

type BlogProps = {
  initialPosts?: BlogPost[]
}

export default function Blog({ initialPosts = [] }: BlogProps) {
  const { t, i18n } = useTranslation()
  const { data: todosPosts = [], isLoading, isError, refetch } = useBlogPosts({ initialData: initialPosts })
  const idioma = normalizarIdioma(i18n.language)
  const posts = todosPosts.filter(p => visivelNoIdioma(p.slug, idioma))

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-white">
          {t('blog.blog_h1')}
        </h1>
        <p className="mt-3 text-lg text-[#3D3D3D] dark:text-[#C0BCB8] max-w-xl leading-relaxed">
          {t('blog.subtitulo')}
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#E8E4DF] dark:bg-[#2D2D2D] animate-pulse aspect-[4/3]" />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorState onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <div className="text-center py-20 text-fg-3-texto">
          <p className="text-lg">{t('blog.sem_artigos')}</p>
          <p className="text-sm mt-2">{t('blog.sem_artigos_sub')}</p>
        </div>
      )}

      {!isLoading && !isError && posts.length > 0 && (
        <div className="space-y-6">
          <PostCard post={posts[0]} destaque />
          {posts.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(1).map((post, i) => (
                <BlurFade key={post.id} delay={(i % 4) * 70}>
                  <PostCard post={post} />
                </BlurFade>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
