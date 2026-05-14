import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import DOMPurify from 'isomorphic-dompurify'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types/database'
import { usePageMeta } from '@/hooks/usePageMeta'
import { articleSchema, breadcrumbSchema, clampDescription } from '@/lib/seo'
import { RelatedPosts, TableOfContents } from '@/components/blog'

const SITE_URL = 'https://vivegostoso.com.br'

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

  const url = slug ? `${SITE_URL}/blog/${slug}` : SITE_URL
  const description = post?.excerpt ? clampDescription(post.excerpt, 160) : undefined

  const jsonLd = useMemo(() => {
    if (!post) return undefined
    return [
      articleSchema({
        title: post.title,
        description: description ?? '',
        url,
        image: post.cover_url ?? undefined,
        author: post.author,
        publishedTime: post.published_at,
        modifiedTime: post.published_at,
        tags: post.tags,
      }),
      breadcrumbSchema([
        { name: 'Início', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
        { name: post.title, url },
      ]),
    ]
  }, [post, description, url])

  usePageMeta({
    title: post?.title ?? 'Blog — São Miguel do Gostoso',
    description: description ?? 'Artigos e dicas sobre São Miguel do Gostoso.',
    image: post?.cover_url ?? undefined,
    url,
    type: 'article',
    publishedTime: post?.published_at ?? undefined,
    modifiedTime: post?.published_at ?? undefined,
    author: post?.author,
    tags: post?.tags,
    jsonLd,
  })

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
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </time>
          </>
        )}
      </div>

      {post.cover_url && (
        <figure className="mt-8 rounded-2xl overflow-hidden aspect-[16/9]">
          <img
            src={post.cover_url}
            alt={post.title}
            width={1200}
            height={675}
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </figure>
      )}

      <TableOfContents containerSelector="article" levels={[2]} />

      <article
        className="blog-prose mt-2 max-w-none"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, {
          ADD_TAGS: ['details', 'summary'],
          ADD_ATTR: ['open'],
        }) }}
      />

      <RelatedPosts currentSlug={post.slug} tags={post.tags} />
    </main>
  )
}
