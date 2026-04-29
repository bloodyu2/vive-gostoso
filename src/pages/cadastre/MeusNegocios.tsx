import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Eye, EyeOff, ExternalLink, Copy, Check } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useMyBusinesses, useInvalidateMyBusinesses, type BusinessSummary } from '@/hooks/useMyBusinesses'

function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/negocio/${slug}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={copy}
      title={copied ? 'Link copiado!' : 'Copiar link público'}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-[#E8E4DF] text-[#737373] hover:border-teal hover:text-teal transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-teal" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copiado' : 'Copiar link'}
    </button>
  )
}

export default function MeusNegocios() {
  return <AuthGuard><MeusNegociosInner /></AuthGuard>
}

function PublishToggle({ biz, onDone }: { biz: BusinessSummary; onDone: () => void }) {
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await supabase
      .from('gostoso_businesses')
      .update({ is_published: !biz.is_published })
      .eq('id', biz.id)
    onDone()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={biz.is_published ? 'Despublicar' : 'Publicar'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 ${
        biz.is_published
          ? 'border-teal/30 text-teal hover:bg-teal/5'
          : 'border-[#E8E4DF] text-[#737373] hover:border-teal hover:text-teal'
      }`}
    >
      {biz.is_published
        ? <><EyeOff className="w-3.5 h-3.5" /> Despublicar</>
        : <><Eye className="w-3.5 h-3.5" /> Publicar</>}
    </button>
  )
}

function MeusNegociosInner() {
  const { data: businesses = [], isLoading } = useMyBusinesses()
  const invalidate = useInvalidateMyBusinesses()

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-5 md:px-8 py-12">
        <div className="space-y-3 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-[#E8E4DF] rounded-2xl" />
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">Meus negócios</h1>
          <p className="text-sm text-[#737373] mt-1">
            {businesses.length === 0
              ? 'Nenhum negócio cadastrado ainda.'
              : `${businesses.length} negócio${businesses.length !== 1 ? 's' : ''} cadastrado${businesses.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link to="/cadastre/perfil">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo negócio
          </Button>
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#E8E4DF] rounded-2xl">
          <div className="text-4xl mb-3">🏪</div>
          <p className="text-[#737373] text-sm mb-4">
            Ainda não tem nenhum negócio vinculado à sua conta.
          </p>
          <Link to="/cadastre/perfil">
            <Button variant="primary">Cadastrar meu negócio</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {businesses.map(b => (
            <div
              key={b.id}
              className="bg-white border border-[#E8E4DF] rounded-2xl px-5 py-4 flex items-center gap-4"
            >
              {/* Cover thumb */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal to-teal-dark">
                {b.cover_url && (
                  <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-[#1A1A1A] truncate">{b.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      b.is_published
                        ? 'bg-teal/10 text-teal'
                        : 'bg-[#E8E4DF] text-[#737373]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${b.is_published ? 'bg-teal' : 'bg-[#A0A0A0]'}`} />
                    {b.is_published ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {b.category && (
                    <p className="text-xs text-[#737373]">{b.category.name}</p>
                  )}
                  <span className="text-xs text-[#C4BFBA] font-mono truncate max-w-[160px]">
                    vivegostoso.com.br/negocio/{b.slug}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                <CopyLinkButton slug={b.slug} />
                <a
                  href={`/negocio/${b.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver página pública"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-[#E8E4DF] text-[#737373] hover:border-teal hover:text-teal transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver
                </a>
                <PublishToggle biz={b} onDone={() => invalidate()} />
                <Link
                  to={`/cadastre/perfil?bizId=${b.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal text-white hover:bg-teal/90 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link to="/cadastre/painel" className="text-sm text-[#737373] hover:text-teal transition-colors">
          ← Voltar ao painel
        </Link>
      </div>
    </main>
  )
}
