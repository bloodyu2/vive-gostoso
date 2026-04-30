import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types/database'

function useBlogPosts() {
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
  })
}

export default function Blog() {
  const { data: posts = [], isLoading } = useBlogPosts()
  const { t } = useTranslation()

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-white">
          Blog
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

      {!isLoading && posts.length === 0 && (
        <div className="text-center py-20 text-[#737373]">
          <p className="text-lg">{t('blog.sem_artigos')}</p>
          <p className="text-sm mt-2">{t('blog.sem_artigos_sub')}</p>
        </div>
      )}

      {!isLoading && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group rounded-2xl overflow-hidden border border-[#E8E4DF] dark:border-[#2D2D2D] bg-white dark:bg-[#222] hover:shadow-lg transition-shadow"
            >
              {post.cover_url ? (
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={post.cover_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
                  <span className="text-5xl font-display font-bold text-white/30">
                    {post.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="p-5">
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-teal">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="font-display font-bold text-lg text-[#1A1A1A] dark:text-white group-hover:text-teal transition-colors leading-snug">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-[#737373] leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-[#737373]">
                  <span>{post.author}</span>
                  {post.published_at && (
                    <>
                      <span>·</span>
                      <span>
                        {new Date(post.published_at).toLocaleDateString('pt-BR', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
