import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Idioma } from '@/data/praias-mares'
import type { DiaDeMare } from '@/lib/mares/semana'
import { ITENS_VITRINE, caminhoNoIdioma, textosVitrine } from '@/lib/explore/vitrine'
import { jsonLdVitrine } from '@/lib/explore/seo-explore'
import { safeJsonLd } from '@/lib/json-ld'
import { IconeVitrineSvg } from '@/components/explore/icone-vitrine'
import { MaresDoDia } from '@/components/explore/mare-de-hoje'

/** Vitrine de recursos, logo abaixo da dobra da home. Renderizada no servidor:
 *  o texto e os links saem no HTML. No celular os cartoes rolam na horizontal
 *  (com encaixe); do tablet para cima viram grade. A tabua de mares abre a
 *  vitrine, maior, com a mare de hoje do Cardeiro. */
export function Vitrine({ lang, mareHoje }: { lang: Idioma; mareHoje: DiaDeMare | null }) {
  const t = textosVitrine(lang)
  const [mares, ...resto] = ITENS_VITRINE

  return (
    <section aria-labelledby="vitrine-titulo" className="max-w-6xl mx-auto py-10 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLdVitrine(lang)) }} />
      <div className="px-5 md:px-8">
        <h2 id="vitrine-titulo" className="font-display text-h3 font-semibold text-fg-1">
          {t.titulo}
        </h2>
        <p className="mt-1 text-sm text-fg-3">{t.sub}</p>
      </div>

      <ul className="mt-6 flex gap-3 overflow-x-auto snap-x snap-mandatory px-5 pb-3 scroll-px-5 md:px-8 md:scroll-px-8 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0 md:gap-4">
        <li className="snap-start shrink-0 w-[85%] sm:w-auto sm:col-span-2 lg:row-span-2">
          <Link
            href={caminhoNoIdioma(lang, mares.caminho)}
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-teal-dark p-6 md:p-8 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            <svg aria-hidden="true" viewBox="0 0 400 120" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-white/10">
              <path d="M0 70 C 60 30, 120 30, 200 65 S 330 105, 400 60 L400 120 L0 120 Z" fill="currentColor" />
              <path d="M0 90 C 70 60, 140 60, 210 88 S 340 118, 400 85 L400 120 L0 120 Z" fill="currentColor" />
            </svg>
            <div className="relative">
              <IconeVitrineSvg nome={mares.icone} className="w-7 h-7 text-teal-light" />
              <h3 className="mt-4 font-display text-3xl md:text-4xl font-bold leading-tight">{t.itens.mares.titulo}</h3>
              <p className="mt-2 text-white/80 leading-relaxed">{t.itens.mares.linha}</p>
            </div>
            <div className="relative mt-8">
              {mareHoje && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{t.mares_hoje}</p>
                  <div className="mt-2">
                    <MaresDoDia dia={mareHoje} lang={lang} claro />
                  </div>
                </>
              )}
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all motion-reduce:transition-none">
                {t.mares_ver}
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </li>
        {resto.map((item) => (
          <li key={item.id} className="snap-start shrink-0 w-[62%] sm:w-auto">
            <Link
              href={caminhoNoIdioma(lang, item.caminho)}
              className="group flex h-full flex-col rounded-2xl border border-border-1 bg-elev p-5 hover:border-teal/40 hover:-translate-y-0.5 transition-all motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              <IconeVitrineSvg nome={item.icone} className="w-5 h-5 text-teal" />
              <h3 className="mt-3 font-display text-lg font-semibold text-fg-1 group-hover:text-teal transition-colors motion-reduce:transition-none">
                {t.itens[item.id].titulo}
              </h3>
              <p className="mt-1 text-sm text-fg-2 leading-snug">{t.itens[item.id].linha}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
