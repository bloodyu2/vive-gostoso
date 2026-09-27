import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/** Trilha visivel (Inicio > Explore > ...). O ultimo item e a pagina atual. */
export function Trilha({ itens }: { itens: Array<{ nome: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-fg-3">
        {itens.map((i, n) => (
          <li key={i.nome} className="flex items-center gap-1">
            {n > 0 && <ChevronRight aria-hidden="true" className="w-3.5 h-3.5" />}
            {i.href ? (
              <Link href={i.href} className="hover:text-teal hover:underline">
                {i.nome}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg-2">
                {i.nome}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
