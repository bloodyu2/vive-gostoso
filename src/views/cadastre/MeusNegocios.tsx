'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation, Trans } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import {
  Plus, Pencil, Eye, EyeOff, ExternalLink, Copy, Check,
  Store, X, PartyPopper, ArrowLeft, ChevronRight,
} from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useMyBusinesses, useInvalidateMyBusinesses, type BusinessSummary } from '@/hooks/useMyBusinesses'

// Returns 0–100 completion score for a business card
function completionScore(b: BusinessSummary): number {
  let score = 0
  if (b.name)                      score += 20
  if (b.description)               score += 20
  if (b.cover_url)                 score += 20
  if (b.instagram || b.whatsapp)   score += 20
  if (b.address)                   score += 20
  return score
}

function CompletionBar({ score }: { score: number }) {
  const { t } = useTranslation('painel')
  const color = score >= 80 ? 'bg-teal' : score >= 40 ? 'bg-ocre' : 'bg-coral'
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[#737373]">{t('completion_label')}</span>
        <span className={`text-[10px] font-semibold ${score >= 80 ? 'text-teal' : score >= 40 ? 'text-ocre' : 'text-coral'}`}>
          {score}%
        </span>
      </div>
      <div className="h-1 bg-[#F5F2EE] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation('painel')
  const url = `${window.location.origin}/negocio/${slug}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
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
      title={copied ? t('copy_success_title') : t('copy_title')}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-[#E8E4DF] text-[#737373] hover:border-teal hover:text-teal transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-teal" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? t('copy_success') : t('copy_label')}
    </button>
  )
}

export default function MeusNegocios() {
  return <AuthGuard><MeusNegociosInner /></AuthGuard>
}

function PublishToggle({ biz, onDone }: { biz: BusinessSummary; onDone: () => void }) {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation('painel')

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
      title={biz.is_published ? t('btn_unpublish') : t('btn_publish_now')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 ${
        biz.is_published
          ? 'border-[#E8E4DF] text-[#737373] hover:border-coral hover:text-coral'
          : 'bg-teal text-white border-teal hover:bg-teal/90'
      }`}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : biz.is_published ? (
        <EyeOff className="w-3.5 h-3.5" />
      ) : (
        <Eye className="w-3.5 h-3.5" />
      )}
      {biz.is_published ? t('btn_unpublish') : t('btn_publish')}
    </button>
  )
}

function MeusNegociosInner() {
  const { t } = useTranslation('painel')
  const lp = useLocalePath()
  const { data: businesses = [], isLoading } = useMyBusinesses()
  const invalidate = useInvalidateMyBusinesses()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNew = searchParams?.get('new') === '1'

  function dismissNew() {
    router.replace(lp('/cadastre/negocios'), { scroll: false })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-12">
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-[#E8E4DF] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <main className="max-w-3xl mx-auto px-5 md:px-8 py-8">
        <Link
          href={lp('/cadastre/painel')}
          className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('back_to_painel')}
        </Link>

        {isNew && (
          <div className="relative flex items-start gap-3 bg-teal/5 border border-teal/30 rounded-2xl px-5 py-4 mb-6">
            <PartyPopper className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#1A1A1A]">{t('created_title')}</p>
              <p className="text-sm text-[#737373] mt-0.5">
                <Trans t={t} i18nKey="created_desc" components={[<strong />, <strong />]} />
              </p>
            </div>
            <button onClick={dismissNew} className="text-[#B0A99F] hover:text-[#737373] transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#1A1A1A]">{t('page_title')}</h1>
            <p className="text-sm text-[#737373] mt-1">
              {businesses.length === 0
                ? t('empty_count')
                : t('business_count', { count: businesses.length })}
            </p>
          </div>
          <Link href={lp('/cadastre/perfil')}>
            <Button variant="primary" className="flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-4 h-4" />
              {t('btn_new')}
            </Button>
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-[#E8E4DF] rounded-2xl bg-white">
            <Store className="w-10 h-10 mb-3 text-[#C4BFBA] mx-auto" />
            <h2 className="font-display text-base font-semibold text-[#1A1A1A] mb-2">
              {t('empty_title')}
            </h2>
            <p className="text-sm text-[#737373] mb-5 max-w-xs mx-auto">
              {t('empty_desc')}
            </p>
            <Link href={lp('/cadastre/perfil')}>
              <Button variant="primary">{t('empty_cta')}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {businesses.map(b => {
              const score = completionScore(b)
              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl border transition-colors ${
                    !b.is_published ? 'border-[#E8E4DF]' : 'border-teal/15'
                  }`}
                >
                  <div className="p-4 md:p-5">
                    {/* Top row: thumb + info */}
                    <div className="flex items-start gap-3">
                      {/* Cover thumb */}
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal/30 to-teal/10">
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
                                : 'bg-[#F5F2EE] text-[#737373]'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${b.is_published ? 'bg-teal' : 'bg-[#A0A0A0]'}`} />
                            {b.is_published ? t('status_published') : t('status_draft')}
                          </span>
                        </div>
                        {b.category && (
                          <p className="text-xs text-[#737373] mt-0.5">{b.category.name}</p>
                        )}
                        <p className="text-[10px] text-[#C4BFBA] font-mono mt-0.5 truncate">
                          vivegostoso.com.br/negocio/{b.slug}
                        </p>

                        {/* Completion bar */}
                        {score < 100 && <CompletionBar score={score} />}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#F5F2EE]">
                      <CopyLinkButton slug={b.slug} />
                      <a
                        href={lp(`/negocio/${b.slug}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('view_public_title')}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-[#E8E4DF] text-[#737373] hover:border-teal hover:text-teal transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {t('view_label')}
                      </a>
                      <PublishToggle biz={b} onDone={() => invalidate()} />
                      <Link
                        href={lp(`/cadastre/perfil?bizId=${b.id}`)}
                        className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal text-white hover:bg-teal/90 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {t('edit_label')}
                        <ChevronRight className="w-3 h-3 opacity-60" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
