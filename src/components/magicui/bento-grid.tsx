// src/components/magicui/bento-grid.tsx
// Adaptado do `bento-grid` do Magic UI: grade com cartoes de tamanhos
// diferentes (via `className` com col-span e row-span), no lugar de uma fileira
// de cartoes iguais. Cada cartao e um MagicCard (brilho que segue o cursor, so
// com mouse) dentro de um BlurFade (entrada em cascata para quem esta abaixo da
// dobra). Sem dependencia nova e sem animar layout.
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BlurFade } from '@/components/magicui/blur-fade'
import { MagicCard } from '@/components/magicui/magic-card'

export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 auto-rows-[minmax(11rem,auto)]', className)}>
      {children}
    </div>
  )
}

/** Cores de fundo do design system. `papel` e o cartao claro padrao. */
const TONS = {
  papel: 'bg-white dark:bg-card text-fg-1 border border-border-1',
  teal: 'bg-teal-dark text-white border border-teal-dark',
  ocre: 'bg-ocre-light dark:bg-ocre/20 text-fg-1 border border-ocre/30',
  coral: 'bg-[#A83D22] text-white border border-[#A83D22]',
} as const

type BentoCardProps = {
  titulo: string
  descricao?: string
  /** Destino. Sem `href` o cartao nao e clicavel. */
  href?: string
  /** Texto do convite no rodape ("Ver marés"). */
  acao?: string
  icone?: React.ReactNode
  tom?: keyof typeof TONS
  /** Atraso da entrada, em ms. */
  atraso?: number
  /** Classes de tamanho, ex.: "lg:col-span-2 lg:row-span-2". */
  className?: string
  /** Conteudo livre entre o texto e o rodape (numero, mini-grafico, foto). */
  children?: React.ReactNode
}

export function BentoCard({ titulo, descricao, href, acao, icone, tom = 'papel', atraso = 0, className, children }: BentoCardProps) {
  const escuro = tom === 'teal' || tom === 'coral'
  const corpo = (
    <MagicCard className={cn('h-full rounded-2xl p-5 md:p-6 flex flex-col gap-3 transition-shadow hover:shadow-card-hover', TONS[tom])}>
      {icone && <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center', escuro ? 'bg-white/15' : 'bg-teal/10 text-teal')}>{icone}</span>}
      <h3 className="font-display font-semibold text-xl md:text-2xl tracking-tight">{titulo}</h3>
      {descricao && <p className={cn('text-sm leading-relaxed', escuro ? 'text-white/80' : 'text-fg-3-texto')}>{descricao}</p>}
      {children && <div className="flex-1 min-h-0">{children}</div>}
      {href && acao && (
        <span className={cn('mt-auto inline-flex items-center gap-1.5 text-sm font-semibold', escuro ? 'text-white' : 'text-teal')}>
          {acao} <span aria-hidden="true">→</span>
        </span>
      )}
    </MagicCard>
  )

  return (
    <BlurFade delay={atraso} className={cn('h-full', className)}>
      {href ? (
        <Link href={href} className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal">
          {corpo}
        </Link>
      ) : (
        corpo
      )}
    </BlurFade>
  )
}
