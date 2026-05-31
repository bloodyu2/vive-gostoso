'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLocalePath } from '@/hooks/useLocalePath'

export default function CadastreLayout({ children }: { children: React.ReactNode }) {
  const lp = useLocalePath()
  return (
    <>
      <div className="block md:hidden bg-white border-b border-[#E8E4DF] px-5 py-2.5">
        <Link
          href={lp('/')}
          className="inline-flex items-center gap-1 text-sm font-medium text-teal hover:text-teal-dark transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Vive Gostoso
        </Link>
      </div>
      {children}
    </>
  )
}
