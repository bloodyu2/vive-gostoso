'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import sanitizeHtml from 'sanitize-html'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types/database'
import { useLocalePath } from '@/hooks/useLocalePath'
import { RelatedPosts, TableOfContents } from '@/components/blog'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'

// Allow-list tuned to what gostoso_blog_posts.content actually contains:
// comparison tables (table.comparison-table), tip/warn/info callouts
// (div.callout), inline CTA cards (a.inline-cta with nested spans), FAQ
// accordions (details.faq > summary), figures/captions, and the usual
// headings/prose. See .blog-prose in src/styles/globals.css for the full
// list of expected structures.
const BLOG_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img',
    'details',
    'summary',
    'h1',
    'h2',
    'h3',
    'h4',
    'figure',
    'figcaption',
    'span',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
    details: ['open'],
    a: ['href', 'name', 'target', 'rel', 'class'],
    h2: ['id'],
    h3: ['id'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
}

function sanitizeBlogContent(html: string): string {
  return sanitizeHtml(html, BLOG_SANITIZE_OPTIONS)
}

function useBlogPost(
  slug: string,
  options?: Pick<UseQueryOptions<BlogPost | null>, 'initialData'>,
) {
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
    ...options,
  })
}

type BlogPostPageProps = {
  initialPost?: BlogPost | null
  slug?: string
}

export default function BlogPostPage({ initialPost, slug: slugProp }: BlogPostPageProps) {
  const slug = slugProp
  const { data: post, isLoading } = useBlogPost(slug ?? '', initialPost !== undefined ? { initialData: initialPost } : undefined)
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()

  const sanitizedContent = useMemo(
    () => (post?.content ? sanitizeBlogContent(post.content) : ''),
    [post],
  )

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
        <Link href={lp('/blog')} className="mt-4 inline-flex items-center gap-2 text-teal font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" />
          {t('blog.voltar_blog')}
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-12">
      <Link
        href={lp('/blog')}
        className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-teal transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('blog.breadcrumb_blog')}
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
              {new Date(post.published_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es' : 'pt-BR', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </time>
          </>
        )}
      </div>

      {post.cover_url && (
        <figure className="mt-8 rounded-2xl overflow-hidden aspect-[16/9] bg-gradient-to-br from-teal to-teal-dark">
          <SafeCoverImage
            src={post.cover_url}
            alt={post.title}
            width={1200}
            height={675}
            loading="eager"
            className="w-full h-full object-cover"
          />
        </figure>
      )}

      <TableOfContents containerSelector="article" levels={[2]} />

      <article
        className="blog-prose mt-2 max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      <RelatedPosts currentSlug={post.slug} tags={post.tags} />
    </main>
  )
}
