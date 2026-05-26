'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Store, CheckCircle, ArrowRight, ExternalLink, X } from 'lucide-react'
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
  usePageMeta({
    title: 'Reivindique seu negócio — Vive Gostoso',
    description: 'Seu negócio pode já estar no Vive Gostoso. Encontre e reivindique gratuitamente em poucos minutos.',
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
            Para donos de negócios em São Miguel do Gostoso
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4 max-w-xl">
            Seu negócio já pode estar no{' '}
            <span className="text-teal">Vive Gostoso</span>
          </h1>

          <p className="text-[#A0A0A0] text-base leading-relaxed max-w-lg mb-8">
            Mais de 180 estabelecimentos de São Miguel do Gostoso já estão listados na plataforma. O seu pode ser um deles, esperando por você.
          </p>

          {/* ── Search box ── */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Digite o nome do seu negócio..."
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
                <div className="px-5 py-4 text-sm text-[#737373]">Buscando...</div>
              )}

              {!loading && results.length === 0 && searched && (
                <div className="px-5 py-5">
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                    Negócio não encontrado
                  </p>
                  <p className="text-xs text-[#737373] mb-3">
                    Parece que seu negócio ainda não está listado. Crie seu perfil grátis agora.
                  </p>
                  <Link
                    href="/cadastre"
                    className="inline-flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-teal/90 transition-colors"
                  >
                    Cadastrar meu negócio
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
                        Reivindicado
                      </span>
                    ) : (
                      <Link
                        href={`/cadastre/claim/${biz.slug}`}
                        className="text-xs font-semibold text-teal border border-teal/30 bg-teal/5 px-3 py-1.5 rounded-xl hover:bg-teal/10 transition-colors"
                      >
                        Reivindicar →
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
            Como reivindicar seu negócio
          </h2>
          <p className="text-[#737373] text-sm">
            Em menos de 5 minutos você assume o controle do perfil.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Pesquise seu negócio',
              desc: 'Use o campo acima para encontrar o nome do seu estabelecimento no diretório.',
            },
            {
              step: '2',
              title: 'Clique em Reivindicar',
              desc: 'Se ainda não tem dono, é só criar uma conta gratuita e assumir o perfil.',
            },
            {
              step: '3',
              title: 'Complete e publique',
              desc: 'Adicione fotos, horários, WhatsApp e descrição. Clique em Publicar e apareça.',
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
              Ao reivindicar, você passa a controlar
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {[
              'Fotos e descrição do negócio',
              'Horários de funcionamento',
              'WhatsApp, Instagram e website',
              'Status publicado ou rascunho',
              'Serviços e comodidades',
              'Visibilidade no diretório local',
            ].map(item => (
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
            Não encontrou seu negócio?
          </h2>
          <p className="text-[#A0A0A0] text-sm mb-8 max-w-sm mx-auto">
            Sem problema. Crie seu perfil do zero. É gratuito e leva menos de 5 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cadastre"
              className="inline-flex items-center justify-center gap-2 bg-teal text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-teal/90 transition-colors"
            >
              <Store className="w-4 h-4" />
              Cadastrar meu negócio grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/parceiros"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Saiba mais sobre planos
            </Link>
          </div>
          <p className="text-xs text-[#737373] mt-5">Grátis · Sem comissão · Pronto em 5 minutos</p>
        </div>
      </section>

    </div>
  )
}
