'use client'

import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { buildWhatsAppLink, OFFICIAL_WHATSAPP } from '@/lib/whatsapp'
import { pushDataLayer } from '@/lib/analytics'

type Origem = 'header' | 'fab'

/**
 * Botao de WhatsApp.
 *
 * - `header`: icone no cabecalho.
 * - `fab`: pilula flutuante so no desktop (md+), sempre visivel, com texto.
 *   Antes ela era `md:hidden`: no desktop o botao simplesmente nao existia, e no
 *   celular so aparecia depois de 400 px de rolagem e empilhava com o de
 *   compartilhar. No celular o atalho agora mora na barra do app (barra-do-app.tsx).
 */
export function WhatsAppButton({ variante }: { variante: Origem }) {
  const { t } = useTranslation()

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
        className="fixed bottom-6 right-6 z-[60] hidden min-h-12 items-center gap-2 rounded-full bg-teal px-5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal motion-reduce:transition-none md:flex"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        {t('nav.falar_pilula')}
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
