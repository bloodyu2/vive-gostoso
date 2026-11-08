'use client'

import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Eye, ExternalLink, Pencil } from 'lucide-react'
import { useLocalePath } from '@/hooks/useLocalePath'
import type { BusinessSummary } from '@/hooks/useMyBusinesses'
import { BusinessCard } from '@/components/business/business-card'
import { supabase } from '@/lib/supabase'
import { PUBLIC_BUSINESS_COLUMNS_WITH_CATEGORY } from '@/lib/supabase/business-columns'
import type { Business } from '@/types/database'
import Perfil from '../Perfil'
import { useTrocarUrlDoPainel } from './use-url-do-painel'

type Vista = 'editar' | 'previa'

/** Como o negocio aparece na listagem do site: o mesmo card que o visitante ve. */
function Previa({ negocio, onEditar }: { negocio: BusinessSummary; onEditar: () => void }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const consulta = useQuery<Business | null>({
    queryKey: ['painel-previa', negocio.id],
    // a previa tem de refletir o que acabou de ser salvo no formulario
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_businesses')
        // Colunas explicitas: `SELECT *` falha para o papel `anon` depois do revoke das
        // colunas stripe_* (KAN-341). Mesma consulta da tela antiga de pre-visualizacao.
        .select(PUBLIC_BUSINESS_COLUMNS_WITH_CATEGORY)
        .eq('id', negocio.id)
        .maybeSingle()
      if (error) throw error
      return (data as unknown as Business | null) ?? null
    },
  })
  const b = consulta.data

  if (consulta.isLoading) {
    return (
      <div className="space-y-3 animate-pulse" aria-busy="true">
        <div className="h-56 bg-[#E8E4DF] rounded-2xl" />
        <div className="h-8 bg-[#E8E4DF] rounded-xl w-1/2" />
      </div>
    )
  }
  if (consulta.isError || !b) {
    return (
      <p role="alert" className="text-sm text-coral">
        {t('painel:abas.previa_erro')}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
      <div>
        <p className="text-xs text-fg-3-texto font-medium uppercase tracking-wide mb-3">{t('preview:card_label')}</p>
        <div className="max-w-sm">
          <BusinessCard business={b} />
        </div>
      </div>

      <div className="space-y-4 lg:pt-8">
        <div
          className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full ${
            b.is_published ? 'bg-teal/10 text-teal' : 'bg-[#F5F2EE] text-fg-3-texto'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${b.is_published ? 'bg-teal' : 'bg-[#737373]'}`} />
          {b.is_published ? t('preview:status_published') : t('preview:status_draft')}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onEditar}
            className="flex items-center gap-3 min-h-11 text-left bg-white border border-[#E8E4DF] rounded-2xl px-5 py-4 hover:border-teal transition-colors group"
          >
            <Pencil className="w-4 h-4 text-fg-3-texto group-hover:text-teal transition-colors" aria-hidden="true" />
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-[#1A1A1A]">{t('preview:action_edit_title')}</span>
              <span className="block text-xs text-fg-3-texto">{t('preview:action_edit_desc')}</span>
            </span>
          </button>
          <a
            href={lp(`/negocio/${b.slug}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 min-h-11 bg-white border border-[#E8E4DF] rounded-2xl px-5 py-4 hover:border-teal transition-colors group"
          >
            <ExternalLink className="w-4 h-4 text-fg-3-texto group-hover:text-teal transition-colors" aria-hidden="true" />
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-[#1A1A1A]">{t('preview:action_public_title')}</span>
              <span className="block text-xs text-fg-3-texto font-mono truncate">
                {t('preview:action_public_url', { slug: b.slug })}
              </span>
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}

/** Aba "Perfil e fotos": o formulario de edicao do negocio (o mesmo da tela antiga, com fotos,
 *  horarios e servicos) e, ao lado, a previa de como ele aparece no site. O formulario fica na
 *  pagina enquanto se olha a previa, para nao perder o que ainda nao foi salvo. */
export function PerfilAba({ negocio }: { negocio: BusinessSummary }) {
  const { t } = useTranslation('painel')
  const params = useSearchParams()
  const trocarUrl = useTrocarUrlDoPainel()
  const vista: Vista = params?.get('vista') === 'previa' ? 'previa' : 'editar'

  function irPara(v: Vista) {
    trocarUrl((p) => {
      if (v === 'previa') p.set('vista', 'previa')
      else p.delete('vista')
      return p
    })
  }

  const botao = (v: Vista, rotulo: string, icone: ReactNode) => (
    <button
      type="button"
      aria-pressed={vista === v}
      onClick={() => irPara(v)}
      className={`inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl text-sm font-semibold border transition-colors ${
        vista === v
          ? 'bg-teal text-white border-teal'
          : 'bg-white text-[#1A1A1A] border-[#E8E4DF] hover:border-teal hover:text-teal'
      }`}
    >
      {icone}
      {rotulo}
    </button>
  )

  return (
    <div>
      <div role="group" aria-label={t('abas.perfil_vistas')} className="flex flex-wrap gap-2 mb-6">
        {botao('editar', t('abas.perfil_editar'), <Pencil className="w-4 h-4" aria-hidden="true" />)}
        {botao('previa', t('abas.perfil_previa'), <Eye className="w-4 h-4" aria-hidden="true" />)}
      </div>

      <div hidden={vista === 'previa'}>
        <Perfil key={negocio.id} embedded bizId={negocio.id} />
      </div>
      {vista === 'previa' && <Previa negocio={negocio} onEditar={() => irPara('editar')} />}
    </div>
  )
}
