// A frase-chave da secao, em tipografia grande. Sem filete lateral e sem aspas
// decorativas: a hierarquia vem do tamanho e da fonte de exibicao.
import { cn } from '@/lib/utils'

export function Citacao({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('font-display font-semibold text-2xl md:text-3xl leading-snug tracking-tight text-fg-1 max-w-3xl text-balance', className)}>
      {children}
    </p>
  )
}
