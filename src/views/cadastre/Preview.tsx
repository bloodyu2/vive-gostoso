'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, Pencil, ExternalLink } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/useAuth'
import { BusinessCard } from '@/components/business/business-card'
import { supabase } from '@/lib/supabase'
import type { Business } from '@/types/database'

export default function Preview() {
  return <AuthGuard><PreviewInner /></AuthGuard>
}

function PreviewInner() {
  const { user } = useAuth()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('gostoso_profiles')
      .select('business_id')
      .eq('auth_user_id', user.id)
      .single()
      .then(({ data: profile }) => {
        if (!profile) { setLoading(false); return }
        const p = profile as { business_id: string | null }
        if (!p.business_id) { setLoading(false); return }
        supabase
          .from('gostoso_businesses')
          .select('*, category:gostoso_categories(*)')
          .eq('id', p.business_id)
          .single()
          .then(({ data: biz }) => {
            if (biz) setBusiness(biz as Business)
            setLoading(false)
          })
      })
  }, [user])

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E8E4DF]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/cadastre/painel"
              className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Painel
            </Link>
            <span className="text-[#E8E4DF]">/</span>
            <span className="text-sm font-medium text-[#1A1A1A]">Preview do negócio</span>
          </div>
          {business && (
            <Link
              href={`/cadastre/perfil?bizId=${business.id}`}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:text-teal/80 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </Link>
          )}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-[#737373]" />
            <h1 className="font-display text-2xl font-semibold text-[#1A1A1A]">
              Como aparece no diretório
            </h1>
          </div>
          <p className="text-sm text-[#737373]">
            Veja como os turistas enxergam seu negócio. Edite sempre que quiser atualizar.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-56 bg-[#E8E4DF] rounded-2xl" />
            <div className="h-8 bg-[#E8E4DF] rounded-xl w-1/2" />
            <div className="h-4 bg-[#E8E4DF] rounded w-3/4" />
          </div>
        ) : business ? (
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
            {/* Card preview */}
            <div>
              <p className="text-xs text-[#A0A0A0] font-medium uppercase tracking-wide mb-3">
                Card no diretório
              </p>
              <div className="max-w-sm">
                <BusinessCard business={business} />
              </div>
            </div>

            {/* Meta info */}
            <div className="space-y-4 lg:pt-8">
              {/* Status chip */}
              <div className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full ${
                business.is_published
                  ? 'bg-teal/10 text-teal'
                  : 'bg-[#F5F2EE] text-[#737373]'
              }`}>
                <span className={`w-2 h-2 rounded-full ${business.is_published ? 'bg-teal' : 'bg-[#A0A0A0]'}`} />
                {business.is_published ? 'Publicado e visível' : 'Rascunho (não visível)'}
              </div>

              {/* Quick actions */}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/cadastre/perfil?bizId=${business.id}`}
                  className="flex items-center gap-3 bg-white border border-[#E8E4DF] rounded-2xl px-5 py-4 hover:border-teal transition-colors group"
                >
                  <Pencil className="w-4 h-4 text-[#737373] group-hover:text-teal transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">Editar perfil</p>
                    <p className="text-xs text-[#737373]">Atualizar fotos, horários, contato...</p>
                  </div>
                </Link>
                <a
                  href={`/negocio/${business.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white border border-[#E8E4DF] rounded-2xl px-5 py-4 hover:border-teal transition-colors group"
                >
                  <ExternalLink className="w-4 h-4 text-[#737373] group-hover:text-teal transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">Ver página pública</p>
                    <p className="text-xs text-[#737373] font-mono truncate">
                      vivegostoso.com.br/negocio/{business.slug}
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* ── Empty state ── */
          <div className="text-center py-16 border-2 border-dashed border-[#E8E4DF] rounded-2xl bg-white">
            <Eye className="w-10 h-10 mb-3 text-[#C4BFBA] mx-auto" />
            <h2 className="font-display text-base font-semibold text-[#1A1A1A] mb-2">
              Nenhum negócio cadastrado
            </h2>
            <p className="text-sm text-[#737373] mb-5 max-w-xs mx-auto">
              Cadastre seu negócio para ver como ele aparece para os turistas de São Miguel do Gostoso.
            </p>
            <Link
              href="/cadastre/perfil"
              className="inline-flex items-center gap-2 bg-teal text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal/90 transition-colors"
            >
              Cadastrar meu negócio
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
