'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'

export const ROTAS_MODULO = ['come', 'fique', 'passeie', 'explore', 'conheca'] as const
export type RotaModulo = (typeof ROTAS_MODULO)[number]

/** Bloco de ligação interna ao pé dos módulos. Recebe a rota atual para não
 *  linkar a página para ela mesma. */
export function LinksModulos({ atual }: { atual: RotaModulo }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const outras = ROTAS_MODULO.filter(r => r !== atual)

  return (
    <nav className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16 border-t border-border-1">
      <h2 className="text-xs font-bold tracking-widest uppercase text-fg-3 mb-4">
        {t('links_modulos.titulo')}
      </h2>
      <ul className="flex flex-col gap-2">
        {outras.map(r => (
          <li key={r}>
            <Link href={lp(`/${r}`)} className="text-teal hover:underline text-sm">
              {t(`links_modulos.${r}`)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
