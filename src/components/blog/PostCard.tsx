import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import type { BlogPost } from '@/types/database'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { CapaTipografica } from '@/components/business/business-cover'
import { MagicCard } from '@/components/magicui/magic-card'
import { cn } from '@/lib/utils'

function CapaDoPost({ post, className }: { post: BlogPost; className: string }) {
  const tipografica = <CapaTipografica nome={post.title} slug={post.slug} categoria={post.tags?.[0]} />
  return (
    <div className={cn('relative overflow-hidden bg-teal', className)}>
      {post.cover_url ? (
        <SafeCoverImage
          src={post.cover_url}
          alt={post.title}
          className="w-full h-full object-cover"
          fallback={tipografica}
        />
      ) : tipografica}
    </div>
  )
}

function dataDoPost(post: BlogPost, language: string | undefined) {
  if (!post.published_at) return null
  const locale = language?.startsWith('en') ? 'en-US' : language?.startsWith('es') ? 'es' : 'pt-BR'
  return new Date(post.published_at).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Cartao de post: o mesmo no indice do blog e em "Continue lendo". */
export function PostCard({ post, destaque = false }: { post: BlogPost; destaque?: boolean }) {
  const { i18n } = useTranslation()
  const lp = useLocalePath()
  const data = dataDoPost(post, i18n.language)
  const Titulo = destaque ? 'h2' : 'h3'

  return (
    <MagicCard className="h-full rounded-2xl overflow-hidden border border-border-1 bg-card">
      <Link
        href={lp(`/blog/${post.slug}`)}
        className={cn('group h-full flex flex-col', destaque && 'md:grid md:grid-cols-5')}
      >
        <CapaDoPost
          post={post}
          className={destaque ? 'aspect-[16/10] md:aspect-auto md:min-h-72 md:col-span-3' : 'aspect-[16/10]'}
        />
        <div className={cn('flex flex-col p-5', destaque && 'md:col-span-2 md:p-8 md:justify-center')}>
          {post.tags && post.tags.length > 0 && (
            <p className="text-xs font-semibold text-teal mb-2">{post.tags.slice(0, 2).join(' · ')}</p>
          )}
          <Titulo
            className={cn(
              'font-display font-bold text-fg-1 group-hover:text-teal transition-colors leading-snug',
              destaque ? 'text-2xl md:text-3xl' : 'text-lg',
            )}
          >
            {post.title}
          </Titulo>
          {post.excerpt && (
            <p className={cn('mt-2 text-sm text-fg-3-texto leading-relaxed', destaque ? 'line-clamp-4 md:text-base' : 'line-clamp-2')}>
              {post.excerpt}
            </p>
          )}
          <p className="mt-auto pt-3 text-xs text-fg-3-texto">
            {post.author}{data ? ` · ${data}` : ''}
          </p>
        </div>
      </Link>
    </MagicCard>
  )
}
