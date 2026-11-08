'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { SelosDoNegocio } from '@/components/business/selo'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useNovosEmGostoso } from '@/hooks/useNovosEmGostoso'
import { pushDataLayer } from '@/lib/analytics'

/**
 * Faixa dos negocios que acabaram de entrar. Sem rolagem automatica: a pessoa
 * arrasta (ou usa o teclado, a lista e focavel por dentro dos links) e cada
 * cartao e um link inteiro para o perfil.
 */
export function NovosEmGostoso() {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const { data: novos = [] } = useNovosEmGostoso()

  if (novos.length === 0) return null

  return (
    <section aria-labelledby="novos-titulo" className="max-w-6xl mx-auto pb-10 md:pb-14">
      <div className="flex items-end justify-between gap-3 px-5 md:px-8 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal">{t('home.novos_eyebrow_faixa')}</p>
          <h2 id="novos-titulo" className="mt-1 font-display text-h3 font-semibold text-fg-1 text-balance">
            {t('home.novos_titulo_faixa')}
          </h2>
        </div>
        <Link
          href={lp('/explore')}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          {t('home.novos_ver_todos')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory px-5 md:px-8 scroll-px-5 md:scroll-px-8 pb-2 scrollbar-none">
        {novos.map((b, i) => (
          <li key={b.id} className="snap-start shrink-0 w-[62%] sm:w-[34%] md:w-[23%] lg:w-[18.5%]">
            <Link
              href={lp(`/negocio/${b.slug}`)}
              onClick={() => pushDataLayer('home_novo_click', { slug: b.slug, posicao: i + 1 })}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-teal-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              <SafeCoverImage
                src={b.cover_url as string}
                alt=""
                loading={i < 2 ? 'eager' : 'lazy'}
                sizes="(max-width: 639px) 62vw, (max-width: 1023px) 28vw, 200px"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold leading-none text-teal-dark shadow-sm">
                {t('home.carrossel_motivo_novo')}
              </span>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3.5 pb-3.5 pt-16">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <SelosDoNegocio negocio={b} size="md" omitir={['prata']} />
                </div>
                <p className="font-display text-base font-bold leading-tight text-white text-balance">{b.name}</p>
                {b.category && <p className="mt-0.5 text-xs text-white/90">{b.category.name}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
