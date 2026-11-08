'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Trans, useTranslation } from 'react-i18next'
import { ArrowRight, Eye, ExternalLink, PartyPopper, Pencil, Plus, Store, Ticket, User, X } from 'lucide-react'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useInvalidateMyBusinesses, type BusinessSummary } from '@/hooks/useMyBusinesses'
import type { Professional } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { corteDaJanela, diaMenos, hojeNoFuso, somarVistas, type AbaId } from '@/lib/clube/painel-abas'
import { useParceiro, type Parceiro } from '../Passaporte'
import { CompletionBar, CopyLinkButton, PublishToggle, completionScore } from '../MeusNegocios'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-[#E8E4DF] rounded-2xl px-5 py-4 min-w-0">
      <p className="text-2xl font-bold text-[#1A1A1A] tabular-nums">{value}</p>
      <p className="text-xs text-fg-3-texto mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-[11px] text-teal mt-1 font-medium">{sub}</p>}
    </div>
  )
}

interface NumerosDosCupons {
  pegos7: number
  pegos30: number
  usados7: number
  usados30: number
  vistas7: number
  vistas30: number
}

/** Cupons pegos e usados e vezes que a vantagem foi vista, em 7 e 30 dias. Os cupons vem de
 *  contagens exatas no banco (sem puxar a lista, que o PostgREST corta em mil linhas); as
 *  vistas vem de gostoso_club_views, uma linha por dia. O dono le as duas tabelas pela RLS. */
function useNumerosDosCupons(parceiro: Parceiro | null) {
  const id = parceiro?.id ?? null
  return useQuery<NumerosDosCupons>({
    queryKey: ['painel-resumo-cupons', id],
    enabled: !!id,
    staleTime: 30_000,
    queryFn: async () => {
      const agora = new Date()
      const contar = async (coluna: 'created_at' | 'usado_em', dias: number, soUsados: boolean) => {
        let q = supabase
          .from('gostoso_club_vouchers')
          .select('id', { count: 'exact', head: true })
          .eq('partner_id', id!)
          .gte(coluna, corteDaJanela(agora, dias))
        if (soUsados) q = q.eq('status', 'usado')
        const { count, error } = await q
        if (error) throw error
        return count ?? 0
      }
      const hoje = hojeNoFuso(agora)
      const [pegos7, pegos30, usados7, usados30, vistas] = await Promise.all([
        contar('created_at', 7, false),
        contar('created_at', 30, false),
        contar('usado_em', 7, true),
        contar('usado_em', 30, true),
        supabase.from('gostoso_club_views').select('dia, n').eq('partner_id', id!).gte('dia', diaMenos(hoje, 29)),
      ])
      if (vistas.error) throw vistas.error
      const linhas = (vistas.data ?? []) as { dia: string; n: number }[]
      return {
        pegos7,
        pegos30,
        usados7,
        usados30,
        vistas7: somarVistas(linhas, hoje, 7),
        vistas30: somarVistas(linhas, hoje, 30),
      }
    },
  })
}

function BlocoDeCupons({ negocio, onAba }: { negocio: BusinessSummary; onAba: (aba: AbaId) => void }) {
  const { t } = useTranslation('painel')
  const parceiro = useParceiro(negocio.id)
  const numeros = useNumerosDosCupons(parceiro.data ?? null)

  return (
    <section aria-labelledby="resumo-cupons" className="mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Ticket className="w-4 h-4 text-teal" aria-hidden="true" />
        <h2 id="resumo-cupons" className="font-display text-lg font-semibold text-[#1A1A1A]">
          {t('abas.cupons_titulo')}
        </h2>
      </div>
      <p className="text-sm text-fg-3-texto mb-4">{t('abas.cupons_sub', { negocio: negocio.name })}</p>

      {parceiro.isLoading ? (
        <p className="text-sm text-fg-3-texto">{t('abas.carregando')}</p>
      ) : parceiro.isError ? (
        <p role="alert" className="text-sm text-coral">{t('abas.cupons_erro')}</p>
      ) : !parceiro.data ? (
        <div className="bg-white border border-[#E8E4DF] rounded-2xl px-5 py-4">
          <p className="text-sm text-fg-3-texto">{t('abas.cupons_sem_passaporte')}</p>
          <button
            type="button"
            onClick={() => onAba('passaporte')}
            className="mt-3 inline-flex items-center gap-1.5 min-h-11 text-sm font-semibold text-teal hover:underline"
          >
            {t('abas.cupons_ir_passaporte')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : numeros.isError ? (
        <p role="alert" className="text-sm text-coral">{t('abas.cupons_erro')}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-[#E8E4DF] bg-white">
            <table className="w-full text-sm min-w-[320px]">
              <caption className="sr-only">{t('abas.cupons_titulo')}</caption>
              <thead>
                <tr className="text-left text-xs text-fg-3-texto">
                  <th scope="col" className="px-4 py-3 font-medium">
                    <span className="sr-only">{t('abas.cupons_titulo')}</span>
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">{t('abas.janela_7')}</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">{t('abas.janela_30')}</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    [t('abas.cupons_pegos'), numeros.data?.pegos7, numeros.data?.pegos30],
                    [t('abas.cupons_usados'), numeros.data?.usados7, numeros.data?.usados30],
                    [t('abas.cupons_vistas'), numeros.data?.vistas7, numeros.data?.vistas30],
                  ] as const
                ).map(([rotulo, a, b]) => (
                  <tr key={rotulo} className="border-t border-[#F5F2EE]">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-[#1A1A1A]">{rotulo}</th>
                    <td className="px-4 py-3 text-right text-xl font-bold tabular-nums text-[#1A1A1A]">{a ?? '–'}</td>
                    <td className="px-4 py-3 text-right text-xl font-bold tabular-nums text-[#1A1A1A]">{b ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-fg-3-texto mt-3">{t('abas.cupons_nota')}</p>
        </>
      )}
    </section>
  )
}

/** A aba Resumo: quem sao os negocios, como vao os cupons nos ultimos 7 e 30 dias e o atalho
 *  para os outros assuntos. O bloco de planos e a assinatura vem de fora (children). */
export function ResumoAba({
  negocios,
  negocio,
  profissional,
  novoNegocio,
  onFecharNovo,
  onAba,
  onEscolher,
  children,
}: {
  negocios: BusinessSummary[]
  negocio: BusinessSummary | null
  profissional: Pick<Professional, 'display_name' | 'headline'> | null
  novoNegocio: boolean
  onFecharNovo: () => void
  onAba: (aba: AbaId) => void
  onEscolher: (id: string) => void
  children?: ReactNode
}) {
  const { t } = useTranslation('painel')
  const lp = useLocalePath()
  const invalidar = useInvalidateMyBusinesses()
  const publicados = negocios.filter((b) => b.is_published).length
  const rascunhos = negocios.length - publicados

  return (
    <div>
      {novoNegocio && (
        <div className="relative flex items-start gap-3 bg-teal/5 border border-teal/30 rounded-2xl px-5 py-4 mb-6">
          <PartyPopper className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-[#1A1A1A]">{t('created_title')}</p>
            <p className="text-sm text-fg-3-texto mt-0.5">
              <Trans t={t} i18nKey="created_desc" components={[<strong key="a" />, <strong key="b" />]} />
            </p>
          </div>
          <button
            type="button"
            onClick={onFecharNovo}
            aria-label={t('abas.fechar')}
            className="min-h-11 min-w-11 -m-3 flex items-center justify-center text-placeholder hover:text-fg-3-texto transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {negocios.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <StatCard label={t('stats_businesses')} value={negocios.length} />
          <StatCard
            label={t('stats_published')}
            value={publicados}
            sub={publicados > 0 ? t('stats_published_sub') : undefined}
          />
          <StatCard
            label={t('stats_drafts')}
            value={rascunhos}
            sub={rascunhos > 0 ? t('stats_drafts_sub') : undefined}
          />
        </div>
      )}

      {rascunhos > 0 && (
        <div className="mb-8 bg-ocre/8 border border-ocre/25 rounded-2xl px-5 py-4 flex items-start gap-3">
          <Eye className="w-4 h-4 text-ocre mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ocre">{t('draft_alert_title', { count: rascunhos })}</p>
            <p className="text-xs text-fg-3-texto mt-0.5">{t('draft_alert_desc')}</p>
          </div>
          <a
            href="#resumo-negocios"
            className="flex items-center gap-1 min-h-11 text-xs font-semibold text-ocre hover:underline flex-shrink-0"
          >
            {t('draft_alert_cta')} <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      )}

      {negocio && <BlocoDeCupons key={negocio.id} negocio={negocio} onAba={onAba} />}

      <section id="resumo-negocios" aria-labelledby="resumo-negocios-titulo" className="mb-10 scroll-mt-32">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-teal" aria-hidden="true" />
            <h2 id="resumo-negocios-titulo" className="font-display text-lg font-semibold text-[#1A1A1A]">
              {t('abas.negocios_titulo')}
            </h2>
          </div>
          <Link
            href={lp('/cadastre/perfil')}
            className="inline-flex items-center gap-1.5 min-h-11 px-3 text-sm font-semibold text-teal hover:underline"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t('module_add')}
          </Link>
        </div>

        {negocios.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#E8E4DF] rounded-2xl bg-white">
            <Store className="w-10 h-10 mb-3 text-[#C4BFBA] mx-auto" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold text-[#1A1A1A] mb-2">{t('empty_title')}</h3>
            <p className="text-sm text-fg-3-texto mb-5 max-w-xs mx-auto">{t('empty_desc')}</p>
            <Link
              href={lp('/cadastre/perfil')}
              className="inline-flex items-center justify-center min-h-11 bg-teal text-white px-5 rounded-xl text-sm font-semibold hover:bg-teal/90 transition-colors"
            >
              {t('empty_cta')}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {negocios.map((b) => {
              const pontos = completionScore(b)
              const escolhido = negocio?.id === b.id
              return (
                <li
                  key={b.id}
                  className={`bg-white rounded-2xl border p-4 md:p-5 transition-colors ${
                    escolhido ? 'border-teal/40' : b.is_published ? 'border-teal/15' : 'border-[#E8E4DF]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal/30 to-teal/10">
                      {b.cover_url && <SafeCoverImage src={b.cover_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#1A1A1A] truncate">{b.name}</span>
                        {b.active ? (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                              b.is_published ? 'bg-teal/10 text-teal' : 'bg-[#F5F2EE] text-fg-3-texto'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${b.is_published ? 'bg-teal' : 'bg-[#737373]'}`} />
                            {b.is_published ? t('status_published') : t('status_draft')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 bg-coral/10 text-coral">
                            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
                            {t('status_deactivated')}
                          </span>
                        )}
                      </div>
                      {b.category && <p className="text-xs text-fg-3-texto mt-0.5">{b.category.name}</p>}
                      <p className="text-[11px] text-fg-3-texto font-mono mt-0.5 truncate">
                        vivegostoso.com.br/negocio/{b.slug}
                      </p>
                      {pontos < 100 && <CompletionBar score={pontos} />}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#F5F2EE]">
                    <CopyLinkButton slug={b.slug} />
                    <a
                      href={lp(`/negocio/${b.slug}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={t('view_public_title')}
                      className="flex items-center gap-1 min-h-9 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-[#E8E4DF] text-fg-3-texto hover:border-teal hover:text-teal transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      {t('view_label')}
                    </a>
                    <PublishToggle biz={b} onDone={() => invalidar()} />
                    <button
                      type="button"
                      onClick={() => {
                        onEscolher(b.id)
                        onAba('perfil')
                      }}
                      className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl text-xs font-semibold bg-teal text-white hover:bg-teal/90 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      {t('edit_label')}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {profissional && (
        <Link
          href={lp('/cadastre/profissional')}
          className="block bg-white rounded-2xl border border-[#E8E4DF] p-5 mb-10 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
              <User className="w-5 h-5 text-teal" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A] text-sm">{profissional.display_name}</p>
              <p className="text-xs text-fg-3-texto">{profissional.headline}</p>
            </div>
          </div>
          <p className="text-xs text-teal font-semibold">{t('module_edit_professional')}</p>
        </Link>
      )}

      {children}
    </div>
  )
}
