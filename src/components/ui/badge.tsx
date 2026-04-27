import { cn } from '@/lib/utils'

const kinds = {
  cat:    'bg-ocre-light text-[#A05E1A]',
  pous:   'bg-teal-light text-[#085E5E]',
  pass:   'bg-[#EAF5EF] text-[#2D7A4A]',
  fest:   'bg-[rgba(224,90,58,0.12)] text-[#C44A2C]',
  open:   'bg-[#EAF5EF] text-[#2D7A4A]',
  closed: 'bg-areia text-[#737373]',
  verif:  'bg-ocre-light text-[#A05E1A] border border-ocre',
}

const dotColors: Partial<Record<keyof typeof kinds, string>> = {
  open:   'bg-[#2D7A4A]',
  closed: 'bg-[#C4C4C4]',
}

interface BadgeProps {
  kind?: keyof typeof kinds
  dot?: boolean
  children: React.ReactNode
  className?: string
}

export function Badge({ kind = 'cat', dot, children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full tracking-wide whitespace-nowrap',
      kinds[kind], className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[kind] ?? 'bg-current')} />}
      {children}
    </span>
  )
}
