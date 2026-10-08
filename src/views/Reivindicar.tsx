'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, CheckCircle, ArrowRight, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { supabase } from '@/lib/supabase'
import { BlurFade } from '@/components/magicui/blur-fade'
import { MagicCard } from '@/components/magicui/magic-card'
import { ShimmerButton } from '@/components/magicui/shimmer-button'

interface BusinessResult {
  id: string
  name: string
  slug: string
  profile_id: string | null
  category: { name: string } | null
}

export default function Reivindicar() {
  const { t } = useTranslation()
  const localePath = useLocalePath()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BusinessResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleQueryChange(value: string) {
    setQuery(value)
    if (value.trim().length < 2) {
      setResults([])
      setSearched(false)
    }
  }

  useEffect(() => {
    if (query.trim().length < 2) return
    const timer = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('gostoso_businesses')
        .select('id, name, slug, profile_id, category:gostoso_categories(name)')
        .eq('active', true)
        .ilike('name', `%${query.trim()}%`)
        .order('name')
        .limit(8)
      setResults(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((data ?? []) as any[]).map(b => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          profile_id: b.profile_id,
          category: Array.isArray(b.category) ? (b.category[0] ?? null) : b.category,
        })) as BusinessResult[]
      )
      setSearched(true)
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  /* Ordem de quem chega sem conta: entrar, pedir o perfil, enviar as fotos. */
  const PASSOS = [
    { titulo: t('reivindicar:how_step2_titulo'), desc: t('reivindicar:how_step2_desc') },
    { titulo: t('reivindicar:passo_reivindicar_titulo'), desc: t('reivindicar:passo_reivindicar_desc') },
    { titulo: t('reivindicar:passo_fotos_titulo'), desc: t('reivindicar:passo_fotos_desc') },
  ]

  return (
    <div>
      {/* ── Abertura e passos ── */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-10">
        <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-fg-1 mb-5">
          {t('reivindicar:hero_titulo')}{' '}
          <span className="text-teal-dark dark:text-teal">Vive Gostoso</span>
        </h1>
        <p className="text-xl leading-relaxed text-fg-3-texto max-w-xl mb-10">
          {t('reivindicar:hero_desc')}
        </p>

        <h2 className="font-display font-semibold text-2xl text-fg-1 mb-1">{t('reivindicar:how_titulo')}</h2>
        <p className="text-base text-fg-3-texto mb-5">{t('reivindicar:how_desc')}</p>
        <ol className="grid md:grid-cols-3 gap-3 md:gap-4">
          {PASSOS.map((p, i) => (
            <li key={p.titulo}>
              <BlurFade delay={(i % 4) * 70} className="h-full">
                <MagicCard className="h-full rounded-2xl bg-white dark:bg-card border border-border-1 p-5 flex gap-4 md:block">
                  <span className="font-display font-bold text-4xl leading-none text-teal-dark dark:text-teal md:block md:mb-3" aria-hidden="true">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold text-base text-fg-1 mb-1">{p.titulo}</h3>
                    <p className="text-sm text-fg-3-texto leading-relaxed">{p.desc}</p>
                  </div>
                </MagicCard>
              </BlurFade>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Busca: comportamento igual ao anterior ── */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 pb-16">
        <div className="rounded-2xl bg-teal-dark text-white p-5 md:p-8">
          <label htmlFor="busca-negocio" className="block font-display font-semibold text-2xl mb-4">
            {t('reivindicar:how_step1_titulo')}
          </label>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-3-texto" aria-hidden="true" />
            <input
              id="busca-negocio"
              ref={inputRef}
              type="text"
              placeholder={t('reivindicar:search_placeholder')}
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              className="w-full min-h-14 bg-white text-[#1A1A1A] rounded-2xl pl-12 pr-14 text-base font-medium placeholder:text-[#5C5C5C] focus:outline-none focus:ring-2 focus:ring-white"
            />
            {query && (
              <button
                type="button"
                aria-label={t('reivindicar:limpar_busca')}
                onClick={() => { setQuery(''); setResults([]); setSearched(false) }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-[#5C5C5C] hover:text-[#1A1A1A] transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* ── Resultados ── */}
          {(results.length > 0 || searched) && (
            <div className="mt-3 bg-white text-[#1A1A1A] rounded-2xl overflow-hidden max-w-xl" aria-live="polite">
              {loading && (
                <div className="px-5 py-4 text-sm text-[#5C5C5C]">{t('reivindicar:search_loading')}</div>
              )}

              {!loading && results.length === 0 && searched && (
                <div className="px-5 py-5">
                  <p className="text-base font-semibold mb-1">
                    {t('reivindicar:not_found_titulo')}
                  </p>
                  <p className="text-sm text-[#5C5C5C] mb-3">
                    {t('reivindicar:not_found_desc')}
                  </p>
                  <Link
                    href={localePath('/cadastre')}
                    className="inline-flex items-center gap-2 min-h-11 bg-teal-dark text-white px-5 rounded-xl text-sm font-semibold hover:bg-teal-dark/90 transition-colors"
                  >
                    {t('reivindicar:not_found_cta')}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              )}

              {!loading && results.map(biz => (
                <div
                  key={biz.id}
                  className="flex items-center gap-3 px-5 py-3 min-h-16 border-b border-[#F1ECE6] last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold truncate">{biz.name}</p>
                    {biz.category && (
                      <p className="text-sm text-[#5C5C5C]">{biz.category.name}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {biz.profile_id ? (
                      <span className="text-sm text-[#5C5C5C] bg-[#F5F2EE] px-3 py-1.5 rounded-full">
                        {t('reivindicar:claimed_badge')}
                      </span>
                    ) : (
                      <Link
                        href={localePath(`/cadastre/claim/${biz.slug}`)}
                        className="inline-flex items-center min-h-11 text-sm font-semibold text-teal-dark border border-teal-dark/40 bg-teal/5 px-4 rounded-xl hover:bg-teal/10 transition-colors"
                      >
                        {t('reivindicar:claim_cta')} →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-5 md:px-8 pb-20 space-y-16">
        {/* ── O que voce ganha ── */}
        <section>
          <h2 className="font-display font-semibold text-2xl md:text-3xl tracking-tight text-fg-1 mb-6">
            {t('reivindicar:control_titulo')}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {t('reivindicar:control_items').split('|').map((item, i) => (
              <li key={item}>
                <BlurFade delay={(i % 4) * 70} className="h-full">
                  <div className="h-full flex items-start gap-3 rounded-2xl bg-white dark:bg-card border border-border-1 p-5 text-base text-fg-1">
                    <CheckCircle className="w-5 h-5 text-teal-dark dark:text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {item}
                  </div>
                </BlurFade>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Negocio nao esta na lista ── */}
        <section>
          <BlurFade>
            <div className="rounded-2xl bg-areia dark:bg-card border border-border-1 p-6 md:p-10">
              <h2 className="font-display font-semibold text-2xl md:text-3xl tracking-tight text-fg-1 mb-3">
                {t('reivindicar:not_found_cta_titulo')}
              </h2>
              <p className="text-base text-fg-3-texto mb-6 max-w-md">
                {t('reivindicar:not_found_cta_desc')}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <ShimmerButton
                  href={localePath('/cadastre')}
                  className="bg-teal-dark hover:bg-teal-dark/90 min-h-12 px-8 rounded-full text-base"
                >
                  {t('reivindicar:not_found_cta_btn')}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </ShimmerButton>
                <Link
                  href={localePath('/parceiros')}
                  className="inline-flex items-center min-h-11 text-fg-1 font-semibold underline underline-offset-4 decoration-fg-3-texto/50 hover:decoration-fg-1"
                >
                  {t('reivindicar:not_found_cta_alt')}
                </Link>
              </div>
              <p className="text-sm text-fg-3-texto mt-5">{t('reivindicar:not_found_fineprint')}</p>
            </div>
          </BlurFade>
        </section>
      </div>
    </div>
  )
}
