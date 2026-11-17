'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { AdminGuard } from '@/components/auth/admin-guard'
import { useClubeAnaliseFila, useClubeDecidir } from '@/hooks/useClubeAnalise'
import { motivoValido, MOTIVO_MAX } from '@/lib/clube/analise'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'

export default function AdminClube() {
  return (
    <AdminGuard>
      <AdminClubeInner />
    </AdminGuard>
  )
}

function AdminClubeInner() {
  const { t, i18n } = useTranslation('admin_clube')
  const lp = useLocalePath()
  const { data: fila = [], isLoading, isError, refetch } = useClubeAnaliseFila()
  const decidir = useClubeDecidir()
  const [motivos, setMotivos] = useState<Record<string, string>>({})
  const [erros, setErros] = useState<Record<string, string>>({})
  const idioma = i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es' : 'pt-BR'
  const data = (iso: string) =>
    new Date(iso).toLocaleDateString(idioma, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Fortaleza' })

  function enviar(partnerId: string, aprovar: boolean) {
    const motivo = motivos[partnerId] ?? ''
    if (!aprovar && !motivoValido(motivo)) {
      setErros((e) => ({ ...e, [partnerId]: t('reason_required') }))
      return
    }
    setErros((e) => ({ ...e, [partnerId]: '' }))
    decidir.mutate(
      { partnerId, aprovar, motivo },
      {
        onSuccess: (r) => {
          if (!r.ok) setErros((e) => ({ ...e, [partnerId]: r.motivo === 'nao_esta_em_analise' ? t('not_in_review') : t('error') }))
        },
        onError: () => setErros((e) => ({ ...e, [partnerId]: t('error') })),
      },
    )
  }

  if (isLoading)
    return (
      <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[#E8E4DF] rounded-2xl" />
          ))}
        </div>
      </main>
    )

  if (isError)
    return (
      <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
        <ErrorState onRetry={() => refetch()} />
      </main>
    )

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href={lp('/cadastre/admin')} className="text-sm text-fg-3-texto hover:text-teal transition-colors">
          {t('back')}
        </Link>
        <h1 className="font-display text-3xl font-semibold">{t('title')}</h1>
        {fila.length > 0 && (
          <span className="ml-auto bg-coral-texto text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {t('count', { count: fila.length })}
          </span>
        )}
      </div>

      {fila.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-fg-3-texto">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fila.map((v) => (
            <div key={v.partnerId} className="bg-white border border-[#E8E4DF] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1A1A1A] truncate">{v.nome}</p>
                  <p className="text-xs text-fg-3-texto mt-1">{t('benefit')}</p>
                  <p className="text-base text-[#1A1A1A]">{v.beneficio}</p>
                  {v.regra ? (
                    <>
                      <p className="text-xs text-fg-3-texto mt-2">{t('rule')}</p>
                      <p className="text-sm text-[#3D3D3D]">{v.regra}</p>
                    </>
                  ) : null}
                  <p className="text-xs text-fg-3-texto mt-2">
                    {v.limiteMensal ? t('limit', { n: v.limiteMensal }) : t('no_limit')} ·{' '}
                    {v.validoAte ? t('valid_until', { date: data(v.validoAte) }) : t('no_date')}
                    {v.enviadoEm ? ` · ${t('sent_at', { date: data(v.enviadoEm) })}` : ''}
                  </p>
                  {v.jaAprovadaAntes ? <p className="text-xs text-teal mt-2">{t('was_approved_before')}</p> : null}
                  {v.ultimoMotivo ? <p className="text-xs text-fg-3-texto mt-1">{t('last_reason', { motivo: v.ultimoMotivo })}</p> : null}
                </div>
                <div className="flex flex-col gap-2 sm:items-end sm:min-w-[220px]">
                  {v.slug ? (
                    <Link
                      href={lp(`/negocio/${v.slug}`)}
                      target="_blank"
                      className="text-xs text-fg-3-texto underline hover:text-teal transition-colors"
                    >
                      {t('view_business')}
                    </Link>
                  ) : null}
                  <Button variant="primary" disabled={decidir.isPending} onClick={() => enviar(v.partnerId, true)}>
                    {t('approve')}
                  </Button>
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      maxLength={MOTIVO_MAX}
                      placeholder={t('reason_placeholder')}
                      value={motivos[v.partnerId] ?? ''}
                      onChange={(e) => setMotivos((m) => ({ ...m, [v.partnerId]: e.target.value }))}
                      aria-label={t('reason_placeholder')}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E8E4DF] text-xs focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 min-w-0"
                    />
                    <Button
                      variant="ghost"
                      disabled={decidir.isPending}
                      onClick={() => enviar(v.partnerId, false)}
                      className="text-coral hover:text-coral flex-shrink-0"
                    >
                      {t('reject')}
                    </Button>
                  </div>
                  {erros[v.partnerId] ? (
                    <p role="alert" className="text-xs text-coral-texto">
                      {erros[v.partnerId]}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
