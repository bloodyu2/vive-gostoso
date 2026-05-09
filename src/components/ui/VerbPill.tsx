import { cn } from '@/lib/utils'

type Verb = 'come' | 'fique' | 'passeie' | 'explore' | 'participe' | 'conheca' | 'apoie'

const VERB_COLORS: Record<Verb, { bg: string; text: string }> = {
  come:      { bg: '#FBF0E3', text: '#C97D2A' },
  fique:     { bg: '#E6F5F5', text: '#0D7C7C' },
  passeie:   { bg: '#EAF5EF', text: '#3D8B5A' },
  explore:   { bg: '#FBEAEA', text: '#E05A3A' },
  participe: { bg: '#E6F5F5', text: '#0D7C7C' },
  conheca:   { bg: '#F5F5F5', text: '#1A1A1A' },
  apoie:     { bg: '#FBF0E3', text: '#C97D2A' },
}

interface VerbPillProps {
  verb: Verb
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

export function VerbPill({ verb, className, size = 'md' }: VerbPillProps) {
  const { bg, text } = VERB_COLORS[verb]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-display font-bold uppercase tracking-tight',
        SIZE_CLASSES[size],
        className
      )}
      style={{ backgroundColor: bg, color: text }}
    >
      {verb.toUpperCase()}.
    </span>
  )
}
