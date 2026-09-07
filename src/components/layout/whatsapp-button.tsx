'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { buildWhatsAppLink, OFFICIAL_WHATSAPP } from '@/lib/whatsapp'
import { pushDataLayer } from '@/lib/analytics'
import { cn } from '@/lib/utils'

type Origem = 'header' | 'fab'

/** Rolagem a partir da qual o flutuante aparece. Abaixo disso a pessoa ainda
 *  está no hero, que já tem CTA próprio, e o botão só competiria com ele. */
const APARECE_APOS = 400

function useApareceAoRolar(ativo: boolean) {
  const [visivel, setVisivel] = useState(false)
  useEffect(() => {
    if (!ativo) return
    const aoRolar = () => setVisivel(window.scrollY > APARECE_APOS)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [ativo])
  return visivel
}

export function WhatsAppButton({ variante }: { variante: Origem }) {
  const { t } = useTranslation()
  const visivel = useApareceAoRolar(variante === 'fab')

  const href = buildWhatsAppLink(OFFICIAL_WHATSAPP, { source: 'official_cta' }, t)
  const aoClicar = () => pushDataLayer('whatsapp_click', { origem: variante })

  if (variante === 'fab') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={aoClicar}
        aria-label={t('nav.falar_aria')}
        aria-hidden={!visivel}
        tabIndex={visivel ? 0 : -1}
        className={cn(
          'fixed bottom-20 right-4 z-[60] w-11 h-11 rounded-full md:hidden',
          'bg-teal text-white shadow-md flex items-center justify-center',
          'transition-opacity duration-200 motion-reduce:transition-none',
          visivel ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      >
        <MessageCircle className="w-5 h-5" />
      </a>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={aoClicar}
      aria-label={t('nav.falar_aria')}
      className="flex items-center justify-center gap-2 min-w-11 min-h-11 px-3 rounded-full border border-border-1 text-fg-2 hover:border-teal hover:text-teal transition-colors motion-reduce:transition-none text-xs"
    >
      <MessageCircle className="w-4 h-4" />
      <span className="hidden lg:inline">{t('nav.falar')}</span>
    </a>
  )
}
