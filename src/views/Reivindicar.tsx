'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Store, CheckCircle, ArrowRight, ExternalLink, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { usePageMeta } from '@/hooks/usePageMeta'
import { supabase } from '@/lib/supabase'

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
  usePageMeta({
    title: t('reivindicar:hero_titulo', 'Reivindique seu negócio — Vive Gostoso'),
    description: t('reivindicar:hero_desc', 'Seu negócio pode já estar no Vive Gostoso. Encontre e reivindique gratuitamente em poucos minutos.'),
  })

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BusinessResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setSearched(false)
      return
    }
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

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* ── Hero ── */}
      <section className="bg-[#1A1A1A] text-white">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 bg-ocre/20 text-ocre text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Store className="w-3.5 h-3.5" />
            {t('reivindicar:badge')}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4 max-w-xl">
            {t('reivindicar:hero_titulo')}{' '}
            <span className="text-teal">Vive Gostoso</span>
          </h1>

          <p className="text-[#A0A0A0] text-base leading-relaxed max-w-lg mb-8">
            {t('reivindicar:hero_desc')}
          </p>

          {/* ── Search box ── */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
            <input
              ref={inputRef}
              type="text"
              placeholder={t('reivindicar:search_placeholder')}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-white text-[#1A1A1A] rounded-2xl pl-11 pr-10 py-4 text-sm font-medium placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-teal"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setResults([]); setSearched(false) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#737373] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ── Search results ── */}
          {(results.length > 0 || searched) && (
            <div className="mt-3 bg-white rounded-2xl shadow-lg overflow-hidden max-w-lg">
              {loading && (
                <div className="px-5 py-4 text-sm text-[#737373]">{t('reivindicar:search_loading')}</div>
              )}

              {!loading && results.length === 0 && searched && (
                <div className="px-5 py-5">
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                    {t('reivindicar:not_found_titulo')}
                  </p>
                  <p className="text-xs text-[#737373] mb-3">
                    {t('reivindicar:not_found_desc')}
                  </p>
                  <Link
                    href={localePath('/cadastre')}
                    className="inline-flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-teal/90 transition-colors"
                  >
                    {t('reivindicar:not_found_cta')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {!loading && results.map(biz => (
                <div
                  key={biz.id}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-[#F5F2EE] last:border-0"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <Store className="w-4 h-4 text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{biz.name}</p>
                    {biz.category && (
                      <p className="text-xs text-[#737373]">{biz.category.name}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {biz.profile_id ? (
                      <span className="text-xs text-[#A0A0A0] bg-[#F5F2EE] px-2.5 py-1 rounded-full">
                        {t('reivindicar:claimed_badge')}
                      </span>
                    ) : (
                      <Link
                        href={localePath(`/cadastre/claim/${biz.slug}`)}
                        className="text-xs font-semibold text-teal border border-teal/30 bg-teal/5 px-3 py-1.5 rounded-xl hover:bg-teal/10 transition-colors"
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

      {/* ── How it works ── */}
      <section className="max-w-3xl mx-auto px-5 md:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-bold text-[#1A1A1A] mb-2">
            {t('reivindicar:how_titulo')}
          </h2>
          <p className="text-[#737373] text-sm">
            {t('reivindicar:how_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: t('reivindicar:how_step1_titulo'),
              desc: t('reivindicar:how_step1_desc'),
            },
            {
              step: '2',
              title: t('reivindicar:how_step2_titulo'),
              desc: t('reivindicar:how_step2_desc'),
            },
            {
              step: '3',
              title: t('reivindicar:how_step3_titulo'),
              desc: t('reivindicar:how_step3_desc'),
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                {step}
              </div>
              <h3 className="font-semibold text-[#1A1A1A] mb-1">{title}</h3>
              <p className="text-sm text-[#737373] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="bg-white border-y border-[#E8E4DF] py-14">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-2">
              {t('reivindicar:control_titulo')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {t('reivindicar:control_items').split('|').map(item => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-[#3D3D3D]">
                <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-3xl mx-auto px-5 md:px-8 py-16 text-center">
        <div className="bg-[#1A1A1A] text-white rounded-3xl px-8 py-12">
          <Store className="w-10 h-10 text-teal mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-3">
            {t('reivindicar:not_found_cta_titulo')}
          </h2>
          <p className="text-[#A0A0A0] text-sm mb-8 max-w-sm mx-auto">
            {t('reivindicar:not_found_cta_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={localePath('/cadastre')}
              className="inline-flex items-center justify-center gap-2 bg-teal text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-teal/90 transition-colors"
            >
              <Store className="w-4 h-4" />
              {t('reivindicar:not_found_cta_btn')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={localePath('/parceiros')}
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t('reivindicar:not_found_cta_alt')}
            </Link>
          </div>
          <p className="text-xs text-[#737373] mt-5">{t('reivindicar:not_found_fineprint')}</p>
        </div>
      </section>

    </div>
  )
}
