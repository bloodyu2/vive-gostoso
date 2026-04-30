import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types/database'

function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()
      if (error) throw error
      return data as BlogPost | null
    },
    enabled: !!slug,
  })
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading } = useBlogPost(slug ?? '')
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-5 md:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#E8E4DF] dark:bg-[#2D2D2D] rounded w-3/4" />
          <div className="h-4 bg-[#E8E4DF] dark:bg-[#2D2D2D] rounded w-1/2" />
          <div className="aspect-[16/9] bg-[#E8E4DF] dark:bg-[#2D2D2D] rounded-2xl mt-6" />
        </div>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-5 md:px-8 py-20 text-center">
        <p className="text-[#737373] text-lg">{t('blog.nao_encontrado')}</p>
        <Link to="/blog" className="mt-4 inline-flex items-center gap-2 text-teal font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" />
          {t('blog.voltar_blog')}
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-12">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-teal transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Blog
      </Link>

      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs font-bold uppercase tracking-wider text-teal">
              {tag}
            </span>
          ))}
        </div>
      )}

      <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1A1A1A] dark:text-white leading-tight">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="mt-3 text-lg text-[#737373] leading-relaxed">
          {post.excerpt}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-[#737373]">
        <span className="font-medium">{post.author}</span>
        {post.published_at && (
          <>
            <span>·</span>
            <span>
              {new Date(post.published_at).toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          </>
        )}
      </div>

      {post.cover_url && (
        <div className="mt-8 rounded-2xl overflow-hidden aspect-[16/9]">
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article
        className="mt-8 prose prose-lg prose-headings:font-display prose-headings:text-[#1A1A1A] dark:prose-headings:text-white prose-p:text-[#3D3D3D] dark:prose-p:text-[#C0BCB8] prose-a:text-teal max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </main>
  )
}
