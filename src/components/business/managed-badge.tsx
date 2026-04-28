// src/components/business/managed-badge.tsx
interface ManagedBadgeProps {
  profileId: string | null
  isVerified: boolean
  size?: 'sm' | 'md'
}

export function ManagedBadge({ profileId, isVerified, size = 'sm' }: ManagedBadgeProps) {
  const base = size === 'sm'
    ? 'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full'
    : 'inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full'

  if (!profileId) {
    return (
      <span className={`${base} bg-[#F0EDEA] text-[#737373]`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#BDBDBD] flex-shrink-0" />
        Perfil da plataforma
      </span>
    )
  }

  if (isVerified) {
    return (
      <span className={`${base} bg-teal text-white`}>
        <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
        Dono verificado
      </span>
    )
  }

  return (
    <span className={`${base} bg-teal-light text-teal`}>
      <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
      Dono cadastrado
    </span>
  )
}
