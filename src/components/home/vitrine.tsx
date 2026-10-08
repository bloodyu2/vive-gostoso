import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Idioma } from '@/data/praias-mares'
import type { DiaDeMare } from '@/lib/mares/semana'
import { ITENS_VITRINE, caminhoNoIdioma, textosVitrine, type IdVitrine } from '@/lib/explore/vitrine'
import { contagensDaVitrine } from '@/lib/explore/contagens'
import { jsonLdVitrine } from '@/lib/explore/seo-explore'
import { safeJsonLd } from '@/lib/json-ld'
import { SLUG_GUIA_MARES, caminhoDoGuiaMares, postPublicado } from '@/lib/blog/post-publicado'
import { slugNoIdioma } from '@/lib/blog/traducoes'
import { IconeVitrineSvg } from '@/components/explore/icone-vitrine'
import { MaresDoDia } from '@/components/explore/mare-de-hoje'
import { VitrineControles } from './vitrine-controles'
import { ProgressiveBlur } from '@/components/magicui/progressive-blur'
import { BlurFade } from '@/components/magicui/blur-fade'

/** Cartoes largos: quebram a fileira de cartoes iguais e dao ritmo a grade. */
const LARGOS: IdVitrine[] = ['come', 'apoie']

const LISTA_ID = 'vitrine-lista'

/** Painel dos cartoes sem foto: icone grande sobre cor suave da marca. */
const PAINEL_SEM_FOTO: Partial<Record<IdVitrine, string>> = {
  come: 'bg-ocre-light text-ocre-dark',
  contrate: 'bg-teal-light text-teal-dark',
  apoie: 'bg-coral/10 text-coral-dark',
}

const CARTAO =
  'group relative flex h-full flex-col overflow-hidden rounded-2xl transition-[border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-teal has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-page'

/** Link esticado: o pseudo-elemento cobre o cartao inteiro. */
const ESTICADO = "after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none"

/** Vitrine de recursos, logo abaixo da dobra da home. Server component: textos,
 *  contagens e links saem no HTML. Cada cartao e clicavel inteiro por um link
 *  esticado no titulo (sem link dentro de link); o "botao" do pe e so visual.
 *  No celular os cartoes rolam na horizontal, com setas e bolinhas; do sm para
 *  cima viram grade. A tabua de mares abre a vitrine, maior. */
export async function Vitrine({ lang, mareHoje }: { lang: Idioma; mareHoje: DiaDeMare | null }) {
  const [contagens, temGuia] = await Promise.all([
    contagensDaVitrine(),
    postPublicado(slugNoIdioma(SLUG_GUIA_MARES, lang)),
  ])
  const t = textosVitrine(lang, contagens)
  const [mares, ...resto] = ITENS_VITRINE

  return (
    <section aria-labelledby="vitrine-titulo" className="max-w-6xl mx-auto py-10 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLdVitrine(lang)) }} />
      <div className="px-5 md:px-8">
        <h2 id="vitrine-titulo" className="font-display text-h3 font-semibold text-fg-1 text-balance">
          {t.titulo}
        </h2>
        <p className="mt-1 text-sm text-fg-2">{t.sub}</p>
      </div>

      <div className="relative">
        <ul
          id={LISTA_ID}
          className="mt-6 flex gap-3 overflow-x-auto snap-x snap-mandatory px-5 pt-1 pb-3 scroll-px-5 md:px-8 md:scroll-px-8 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0 md:gap-4"
        >
        <li className="snap-start shrink-0 w-[85%] sm:w-auto sm:col-span-2 lg:row-span-2">
          <div className={`${CARTAO} bg-teal-dark p-6 md:p-8 text-white`}>
            <svg aria-hidden="true" viewBox="0 0 400 120" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-white/10">
              <path d="M0 70 C 60 30, 120 30, 200 65 S 330 105, 400 60 L400 120 L0 120 Z" fill="currentColor" />
              <path d="M0 90 C 70 60, 140 60, 210 88 S 340 118, 400 85 L400 120 L0 120 Z" fill="currentColor" />
            </svg>
            <div className="relative">
              <IconeVitrineSvg nome={mares.icone} className="w-8 h-8 text-teal-100" />
              <h3 className="mt-4 font-display text-3xl md:text-4xl font-bold leading-tight text-balance">
                <Link href={caminhoNoIdioma(lang, mares.caminho)} className={ESTICADO}>
                  {t.itens.mares.titulo}
                </Link>
              </h3>
              <p className="mt-2 max-w-[40ch] text-white/85 leading-relaxed">{t.itens.mares.linha}</p>
            </div>
            {mareHoje && (
              <div className="relative mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/75">{t.mares_hoje}</p>
                <div className="mt-2">
                  <MaresDoDia dia={mareHoje} lang={lang} claro />
                </div>
              </div>
            )}
            <div className="relative mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-8">
              <span
                aria-hidden="true"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-teal-dark transition-[gap] duration-200 ease-out group-hover:gap-3 motion-reduce:transition-none"
              >
                {t.itens.mares.botao}
                <ArrowRight className="w-4 h-4" />
              </span>
              {temGuia && (
                <Link
                  href={caminhoDoGuiaMares(lang)}
                  className="relative z-10 inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {t.guia_mares}
                </Link>
              )}
            </div>
          </div>
        </li>

        {resto.map((item, i) => {
          const texto = t.itens[item.id]
          const largo = LARGOS.includes(item.id)
          return (
            <li key={item.id} className={`snap-start shrink-0 w-[72%] sm:w-auto ${largo ? 'sm:col-span-2' : ''}`}>
              <BlurFade delay={(i % 4) * 70} className="h-full">
              <div className={`${CARTAO} border border-border-1 bg-elev hover:border-teal/50 hover:shadow-md`}>
                <div className={`relative min-h-32 flex-1 sm:h-32 sm:flex-none ${item.imagem ? 'bg-teal-light' : (PAINEL_SEM_FOTO[item.id] ?? 'bg-teal-light text-teal-dark')}`}>
                  {item.imagem ? (
                    <Image
                      src={item.imagem}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 72vw"
                      className="object-cover"
                    />
                  ) : (
                    <IconeVitrineSvg nome={item.icone} className="absolute right-4 bottom-3 w-20 h-20 opacity-80" />
                  )}
                </div>
                <div className="flex flex-col p-5 sm:flex-1">
                  <h3 className="font-display text-lg font-semibold leading-snug text-fg-1">
                    <Link href={caminhoNoIdioma(lang, item.caminho)} className={ESTICADO}>
                      {texto.titulo}
                    </Link>
                  </h3>
                  <p className="mt-1 min-h-[2lh] text-sm leading-snug text-fg-2 text-pretty">{texto.linha}</p>
                  <span
                    aria-hidden="true"
                    className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-3 text-sm font-semibold text-teal transition-[gap] duration-200 ease-out group-hover:gap-3 motion-reduce:transition-none"
                  >
                    {texto.botao}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
              </BlurFade>
            </li>
          )
        })}
      </ul>
        <ProgressiveBlur side="right" className="sm:hidden" />
      </div>

      <VitrineControles
        listaId={LISTA_ID}
        total={ITENS_VITRINE.length}
        anterior={t.anterior}
        proximo={t.proximo}
        pagina={t.pagina}
      />
    </section>
  )
}
