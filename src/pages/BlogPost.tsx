import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { useBlogPost } from '@/hooks/useBlog'

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function renderMarkdown(text: string) {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="font-display font-semibold text-xl mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-display font-bold text-2xl mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-display font-bold text-3xl mt-10 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc mb-1">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, m => `<ul class="my-4 space-y-1">${m}</ul>`)
    .replace(/^(?!<[h|u|l]).+$/gm, m => m.trim() ? `<p class="mb-4 leading-relaxed">${m}</p>` : '')
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading } = useBlogPost(slug ?? '')

  if (isLoading) return (
    <main className="max-w-2xl mx-auto px-5 md:px-8 py-16">
      <div className="animate-pulse space-y-6">
        <div className="h-64 bg-[#E8E4DF] rounded-2xl" />
        <div className="h-8 bg-[#E8E4DF] rounded w-3/4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-[#E8E4DF] rounded" />)}
        </div>
      </div>
    </main>
  )

  if (!post) return (
    <main className="max-w-2xl mx-auto px-5 md:px-8 py-16 text-center">
      <div className="text-5xl mb-4">🤔</div>
      <h2 className="font-display text-2xl font-semibold mb-2">Artigo não encontrado</h2>
      <Link to="/blog" className="text-teal font-semibold">← Voltar ao blog</Link>
    </main>
  )

  return (
    <main>
      {/* Cover */}
      {post.cover_url && (
        <div className="w-full aspect-[21/9] overflow-hidden bg-gradient-to-br from-teal to-teal-dark">
          <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <article className="max-w-2xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao blog
        </Link>

        {post.tags.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {post.tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-teal bg-teal-light px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight tracking-tight mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-[#737373] mb-10 pb-8 border-b border-[#E8E4DF] dark:border-[#2D2D2D]">
          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{post.author}</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(post.published_at)}</span>
        </div>

        <div
          className="text-[#3D3D3D] dark:text-[#C0BCB8] text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* CTA */}
        <div className="mt-16 p-6 bg-teal-light dark:bg-teal/10 rounded-2xl border border-teal/20">
          <p className="font-display font-semibold text-lg mb-1">Está planejando vir para Gostoso?</p>
          <p className="text-sm text-[#737373] mb-4">Encontre onde ficar, onde comer e o que fazer — tudo na plataforma.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/come" className="bg-teal text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors">
              Ver restaurantes
            </Link>
            <Link to="/fique" className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] text-[#1A1A1A] dark:text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-sm transition-all">
              Ver hospedagens
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
