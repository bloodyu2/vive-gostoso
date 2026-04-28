import { Link } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import { useBlogPosts } from '@/hooks/useBlog'

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Blog() {
  const { data: posts = [], isLoading } = useBlogPosts()

  return (
    <main>
      {/* Hero */}
      <section className="bg-[#1A1A1A] dark:bg-[#0D0D0D] text-white px-5 md:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-block w-2 h-2 rounded-full bg-teal animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-white/60">
              São Miguel do Gostoso, RN
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4">
            Blog da cidade.
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl leading-relaxed">
            Dicas, histórias e guias sobre São Miguel do Gostoso — escritos por quem vive aqui.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-[#E8E4DF]">
                <div className="aspect-[16/9] bg-[#E8E4DF]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-[#E8E4DF] rounded w-1/3" />
                  <div className="h-6 bg-[#E8E4DF] rounded w-4/5" />
                  <div className="h-4 bg-[#E8E4DF] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center py-20 text-[#737373]">
            <p className="text-lg font-display font-semibold mb-2">Em breve.</p>
            <p className="text-sm">Os primeiros artigos estão chegando.</p>
          </div>
        )}

        {!isLoading && posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className={`group bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all ${i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}`}
              >
                <div className={`overflow-hidden bg-gradient-to-br from-teal to-teal-dark ${i === 0 ? 'aspect-[16/7]' : 'aspect-[16/9]'}`}>
                  {post.cover_url && (
                    <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
                <div className="p-5 md:p-6">
                  {post.tags.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-teal bg-teal-light px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="font-display font-semibold text-lg md:text-xl leading-snug mb-2 group-hover:text-teal transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[#737373] leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-[#737373]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.published_at)}
                    </span>
                    <span className="flex items-center gap-1 text-teal font-semibold group-hover:gap-2 transition-all">
                      Ler <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
