// src/components/magicui/border-beam.tsx
// Adaptado do `border-beam` do Magic UI: um feixe de luz percorre a borda do
// cartao. Reservado a quem apoia a cidade (planos destaque e associado), para
// o brilho significar alguma coisa. Fica `aria-hidden`, nao captura clique e
// para de girar com prefers-reduced-motion (a borda fica estatica no teal).
import { cn } from '@/lib/utils'

export function BorderBeam({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('vg-beam pointer-events-none absolute inset-0 rounded-[inherit]', className)} />
}
