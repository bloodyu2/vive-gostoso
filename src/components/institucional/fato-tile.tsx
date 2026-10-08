// Bloco com o fato em destaque: o numero grande, o rotulo curto e, se houver,
// uma linha de contexto. So tipografia; o brilho vem do MagicCard.
import { cn } from '@/lib/utils'
import { BlurFade } from '@/components/magicui/blur-fade'
import { MagicCard } from '@/components/magicui/magic-card'

const TONS = {
  papel: 'bg-white dark:bg-card text-fg-1 border border-border-1',
  teal: 'bg-teal-dark text-white border border-teal-dark',
  ocre: 'bg-ocre-light dark:bg-ocre/20 text-fg-1 border border-ocre/30',
} as const

type FatoTileProps = {
  valor: React.ReactNode
  rotulo: string
  descricao?: string
  tom?: keyof typeof TONS
  atraso?: number
  className?: string
  children?: React.ReactNode
}

export function FatoTile({ valor, rotulo, descricao, tom = 'papel', atraso = 0, className, children }: FatoTileProps) {
  const escuro = tom === 'teal'
  return (
    <BlurFade delay={atraso} className={cn('h-full', className)}>
      <MagicCard className={cn('h-full rounded-2xl p-5 md:p-6 flex flex-col gap-2', TONS[tom])}>
        <div className="font-display font-bold text-4xl md:text-5xl leading-none tracking-tight tabular-nums">{valor}</div>
        <h3 className="font-semibold text-base md:text-lg">{rotulo}</h3>
        {descricao && <p className={cn('text-sm leading-relaxed', escuro ? 'text-white/80' : 'text-fg-3-texto')}>{descricao}</p>}
        {children}
      </MagicCard>
    </BlurFade>
  )
}
