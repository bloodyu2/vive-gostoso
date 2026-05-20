'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[PageError]', error)
  }, [error])

  return (
    <main className="max-w-2xl mx-auto px-5 py-20 text-center">
      <div className="font-display font-bold text-[80px] leading-none text-[#E8E4DF] select-none mb-4">
        Ops
      </div>
      <h1 className="font-display font-bold text-2xl text-[#1A1A1A] mb-3">
        Algo deu errado
      </h1>
      <p className="text-[#737373] text-base leading-relaxed mb-8">
        Nao foi possivel carregar esta pagina. Tente novamente ou volte ao inicio.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="bg-teal text-white font-semibold px-6 py-3 rounded-full hover:bg-teal-dark transition-colors text-sm"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="text-teal font-semibold text-sm hover:underline"
        >
          Voltar ao inicio
        </Link>
      </div>
    </main>
  )
}
