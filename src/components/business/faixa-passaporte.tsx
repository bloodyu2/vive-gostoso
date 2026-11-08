'use client'

import Link from 'next/link'
import { ArrowRight, Ticket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNoClube } from '@/components/clube/contexto-clube'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useVantagemDoNegocio } from '@/hooks/useVantagemDoNegocio'
import { pushDataLayer } from '@/lib/analytics'
import { CLUBE_PUBLICO } from '@/lib/clube/config'

type Props = { businessId: string; slug: string; nome: string; temDono: boolean }

/**
 * Faixa do Passaporte no perfil do negocio.
 *
 * - Parceiro com vantagem no ar: mostra a vantagem e leva ao clube.
 * - Quem nao e parceiro: nada para o turista; para o dono (e para negocio ainda
 *   sem dono), um convite discreto para entrar.
 * Com o clube desligado (flag), nao renderiza nada.
 */
export function FaixaPassaporte({ businessId, slug, nome, temDono }: Props) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const noClube = useNoClube(businessId)
  const { data: vantagem } = useVantagemDoNegocio(businessId, noClube)

  if (!CLUBE_PUBLICO) return null

  if (noClube && vantagem) {
    return (
      <section
        aria-label={t('negocio.passaporte_titulo')}
        className="relative mb-8 overflow-hidden rounded-2xl border border-ocre-400/40 bg-card"
      >
        <span aria-hidden="true" className="absolute -left-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-page" />
        <span aria-hidden="true" className="absolute -right-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-page" />
        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ocre-texto">
              <Ticket className="size-4" aria-hidden="true" />
              {t('negocio.passaporte_titulo')}
            </p>
            <p className="mt-1.5 font-display text-xl font-bold leading-snug text-fg-1 text-balance">{vantagem.beneficio}</p>
            {vantagem.regra && <p className="mt-1 text-sm text-fg-2 text-pretty">{vantagem.regra}</p>}
            {vantagem.limiteMensal != null && (
              <p className="mt-1 text-xs text-fg-3-texto">{t('negocio.passaporte_limite', { n: vantagem.limiteMensal })}</p>
            )}
          </div>
          <Link
            href={lp('/clube')}
            onClick={() => pushDataLayer('perfil_passaporte_click', { slug, acao: 'ver_clube' })}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-teal px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal motion-reduce:transition-none"
          >
            {t('negocio.passaporte_cta')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    )
  }

  if (noClube) return null

  /* Nao e parceiro: convite ao dono, so quando o negocio ainda nao tem dono
     ou para quem esta logado como dono (o link leva ao cadastro do Passaporte,
     que ja pede o login). Fica pequeno de proposito. */
  if (temDono) return null
  return (
    <p className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-ocre-light px-4 py-3 text-sm text-fg-1">
      <Ticket className="size-4 shrink-0 text-ocre-texto" aria-hidden="true" />
      <span>{t('negocio.passaporte_convite', { nome })}</span>
      <Link
        href="/cadastre/passaporte"
        onClick={() => pushDataLayer('perfil_passaporte_click', { slug, acao: 'convite_dono' })}
        className="inline-flex min-h-11 items-center font-semibold text-teal-dark underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
      >
        {t('negocio.passaporte_convite_cta')}
      </Link>
    </p>
  )
}
