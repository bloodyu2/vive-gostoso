import { cn } from '@/lib/utils'

const verbColors: Record<string, string> = {
  come:      'text-ocre',
  fique:     'text-teal',
  passeie:   'text-[#3D8B5A]',
  explore:   'text-coral',
  participe: 'text-teal',
  conheca:   'text-[#1A1A1A]',
  apoie:     'text-ocre',
  resolva:   'text-[#7C3AED]',
}

interface VerbPillProps { verb: string; className?: string; srLabel?: string }

export function VerbPill({ verb, className, srLabel }: VerbPillProps) {
  return (
    <h1 className={cn(
      'font-display font-bold text-4xl sm:text-5xl md:text-[80px] leading-none tracking-tight',
      verbColors[verb] ?? 'text-[#1A1A1A]',
      className
    )}>
      {srLabel && <span className="sr-only">{srLabel}</span>}
      {verb.toUpperCase()}.
    </h1>
  )
}
