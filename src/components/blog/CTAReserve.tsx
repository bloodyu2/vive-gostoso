import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface CTAReserveProps {
  /** Caminho relativo. Ex: '/passeie' ou '/negocio/algum-slug' */
  to: string
  /** Título principal */
  title: string
  /** Descrição curta */
  description?: string
  /** Texto do botão */
  cta?: string
}

/**
 * CTA secundário para apontar para uma página interna do site
 * (negócio, passeio, listing). Bom para distribuir link juice
 * para páginas de conversão.
 */
export function CTAReserve({ to, title, description, cta = 'Ver detalhes' }: CTAReserveProps) {
  return (
    <Link
      to={to}
      className="not-prose my-8 group block rounded-2xl border border-[#E8E4DF] dark:border-[#2D2D2D] bg-white dark:bg-[#222] p-6 hover:shadow-lg hover:border-teal transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-lg text-[#1A1A1A] dark:text-white group-hover:text-teal transition-colors">
            {title}
          </div>
          {description && (
            <p className="mt-1 text-sm text-[#737373] leading-relaxed">{description}</p>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal flex-shrink-0">
          {cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  )
}
