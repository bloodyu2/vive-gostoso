import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Phone, Globe, AtSign, Clock, ArrowLeft, CheckCircle, Share2, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useBusiness } from '@/hooks/useBusinesses'
import { isBusinessOpen } from '@/lib/utils'

const DAYS: Record<string, string> = {
  seg: 'Segunda', ter: 'Terça', qua: 'Quarta',
  qui: 'Quinta', sex: 'Sexta', sab: 'Sábado', dom: 'Domingo',
}
const DAY_ORDER = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']

export default function Negocio() {
  const { slug } = useParams<{ slug: string }>()
  const { data: b, isLoading } = useBusiness(slug ?? '')
  const [copied, setCopied] = useState(false)

  if (isLoading) return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-16">
      <div className="animate-pulse space-y-6">
        <div className="h-64 bg-[#E8E4DF] rounded-2xl" />
        <div className="h-8 bg-[#E8E4DF] rounded w-1/2" />
        <div className="h-4 bg-[#E8E4DF] rounded w-full" />
      </div>
    </main>
  )

  if (!b) return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-16 text-center">
      <div className="text-6xl mb-4">🤔</div>
      <h2 className="font-display text-2xl font-semibold mb-2">Negócio não encontrado</h2>
      <p className="text-[#737373] mb-6">Pode ter sido removido ou o link está incorreto.</p>
      <Link to="/" className="text-teal font-semibold">← Voltar ao início</Link>
    </main>
  )

  const open = isBusinessOpen(b.opening_hours)
  const verb = b.category?.verb ?? 'come'
  const backTo = verb === 'fique' ? '/fique' : verb === 'passeie' ? '/passeie' : '/come'
  const backLabel = verb === 'fique' ? 'FIQUE' : verb === 'passeie' ? 'PASSEIE' : 'COME'

  const business = b
  const shareUrl = `https://vivegostoso.com.br/negocio/${business.slug}`
  const shareText = `Encontrei ${business.name} no Vive Gostoso 🌊\nConfira: ${shareUrl}`

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, text: `Encontrei ${business.name} no Vive Gostoso 🌊`, url: shareUrl })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-10">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar a {backLabel}
      </Link>

      {/* Cover */}
      <div className="aspect-[21/9] bg-gradient-to-br from-teal to-teal-dark rounded-2xl overflow-hidden mb-8 relative">
        {b.cover_url && <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover" />}
        {b.is_featured && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur text-teal text-xs font-semibold px-3 py-1.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Verificado pela cidade
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-3 flex-wrap items-center">
            {b.category && <Badge kind="cat">{b.category.name}</Badge>}
            {open ? <Badge kind="open" dot>Aberto agora</Badge> : <Badge kind="closed" dot>Fechado agora</Badge>}
            {b.plan === 'associado' && <Badge kind="verif">Associado</Badge>}
          </div>

          <h1 className="font-display font-bold text-4xl tracking-tight mb-1">{b.name}</h1>
          {b.address && (
            <p className="flex items-center gap-1.5 text-sm text-[#737373] mb-6">
              <MapPin className="w-4 h-4 flex-shrink-0" /> {b.address}
            </p>
          )}

          {b.description && (
            <p className="text-[#3D3D3D] leading-relaxed text-base mb-8">{b.description}</p>
          )}

          {/* Fotos */}
          {b.photos && b.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {b.photos.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#E8E4DF]">
                  <img src={url} alt={`${b.name} foto ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Share */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-2xl px-5 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Link copiado!' : 'Compartilhar este lugar'}
          </button>

          {/* Contatos */}
          <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-sm text-[#1A1A1A] uppercase tracking-wide">Contato</h3>

            {b.whatsapp && (
              <a href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[#3D3D3D] hover:text-teal transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-[#25D366]" />
                </div>
                WhatsApp
              </a>
            )}

            {b.phone && !b.whatsapp && (
              <a href={`tel:${b.phone}`} className="flex items-center gap-2.5 text-sm text-[#3D3D3D] hover:text-teal transition-colors">
                <div className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-teal" />
                </div>
                {b.phone}
              </a>
            )}

            {b.instagram && (
              <a href={`https://instagram.com/${b.instagram}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[#3D3D3D] hover:text-teal transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#E8E4DF] flex items-center justify-center flex-shrink-0">
                  <AtSign className="w-4 h-4 text-[#1A1A1A]" />
                </div>
                @{b.instagram}
              </a>
            )}

            {b.website && (
              <a href={b.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[#3D3D3D] hover:text-teal transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#E8E4DF] flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-[#1A1A1A]" />
                </div>
                Site
              </a>
            )}
          </div>

          {/* Horários */}
          {b.opening_hours && Object.keys(b.opening_hours).length > 0 && (
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
              <h3 className="font-semibold text-sm text-[#1A1A1A] uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Horários
              </h3>
              <div className="space-y-1.5">
                {DAY_ORDER.map(day => {
                  const h = (b.opening_hours as Record<string, { open: string; close: string; closed: boolean }>)[day]
                  if (!h) return null
                  return (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-[#737373]">{DAYS[day]}</span>
                      <span className={h.closed ? 'text-coral' : 'text-[#1A1A1A] font-medium'}>
                        {h.closed ? 'Fechado' : `${h.open} – ${h.close}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Fundo */}
          {b.plan === 'associado' && (
            <div className="bg-teal-light border border-teal/20 rounded-2xl p-5 text-sm text-teal leading-relaxed">
              <strong>Negócio associado.</strong> Parte da mensalidade deste estabelecimento vai para o Fundo Público da Cidade.{' '}
              <Link to="/apoie" className="underline">Saiba mais →</Link>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
