'use client'
// src/components/magicui/theme-toggler.tsx
// Adaptado do `animated-theme-toggler` do Magic UI: o registro usa next-themes e
// motion; aqui o tema vem de src/hooks/useTheme.ts e a revelacao usa a View
// Transitions API nativa (sem dependencia nova).
import { useCallback } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/hooks/useTheme'
import { aplicarTema } from '@/lib/tema'
import { cn } from '@/lib/utils'

type DocumentComViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> }
}

/** Botao de tema. Ao trocar, a cor "se abre" em circulo a partir do botao
 *  (clip-path animado pela View Transitions). Sem suporte a API ou com
 *  prefers-reduced-motion, troca instantanea, sem flash. */
export function ThemeToggler({ comRotulo = false, className }: { comRotulo?: boolean; className?: string }) {
  const { theme, toggle } = useTheme()
  const { t } = useTranslation()
  const escuro = theme === 'dark'
  const rotulo = escuro ? t('footer.modo_claro') : t('footer.modo_escuro')

  const aoClicar = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const doc = document as DocumentComViewTransition
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduz || typeof doc.startViewTransition !== 'function') {
      toggle()
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const raio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const root = document.documentElement
    root.style.setProperty('--vg-tema-x', `${x}px`)
    root.style.setProperty('--vg-tema-y', `${y}px`)
    root.style.setProperty('--vg-tema-raio', `${raio}px`)
    // A classe do <html> precisa mudar de forma sincrona dentro do callback: o
    // snapshot "depois" e tirado quando ele retorna. O `toggle()` mantem o
    // estado do React em dia.
    doc.startViewTransition(() => {
      aplicarTema(escuro ? 'light' : 'dark')
      toggle()
    })
  }, [escuro, toggle])

  return (
    <button
      onClick={aoClicar}
      className={cn(
        comRotulo
          ? 'flex items-center gap-2 w-full min-h-11 text-sm font-medium text-fg-2 hover:text-teal transition-colors motion-reduce:transition-none'
          : 'w-11 h-11 flex items-center justify-center rounded-full text-fg-3 hover:text-teal transition-colors motion-reduce:transition-none',
        className,
      )}
      aria-label={rotulo}
    >
      {escuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {comRotulo && <span>{rotulo}</span>}
    </button>
  )
}
