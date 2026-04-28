// src/components/business/claim-cta.tsx
import { Link } from 'react-router-dom'
import { Flag } from 'lucide-react'

interface ClaimCtaProps {
  businessSlug: string
}

export function ClaimCta({ businessSlug }: ClaimCtaProps) {
  return (
    <div className="border border-dashed border-[#C4BFBA] rounded-2xl p-5 text-center">
      <div className="w-9 h-9 rounded-xl bg-[#F0EDEA] flex items-center justify-center mx-auto mb-3">
        <Flag className="w-4 h-4 text-[#737373]" />
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A] mb-1">É o dono deste lugar?</p>
      <p className="text-xs text-[#737373] leading-relaxed mb-4">
        Reivindique este perfil para gerenciar as informações diretamente.
      </p>
      <Link
        to={`/cadastre/claim/${businessSlug}`}
        className="inline-flex items-center justify-center gap-1.5 bg-[#1A1A1A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
      >
        Reivindicar este negócio
      </Link>
    </div>
  )
}
