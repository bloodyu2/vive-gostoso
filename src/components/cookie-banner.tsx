'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  aplicarConsentimento,
  aplicarEscolhaSalva,
  CHAVE_CONSENTIMENTO,
  type JanelaDeMedicao,
} from '@/lib/consentimento'

const janela = () => window as unknown as JanelaDeMedicao

interface CookieBannerProps {
  forceOpen?: boolean
}

export function CookieBanner({ forceOpen }: CookieBannerProps = {}) {
  const { t } = useTranslation('cookie')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Deferred to a microtask so the state update isn't synchronous within
    // the effect body (avoids react-hooks/set-state-in-effect).
    if (forceOpen) {
      queueMicrotask(() => setVisible(true))
      return
    }
    let stored: string | null = null
    try {
      stored = localStorage.getItem(CHAVE_CONSENTIMENTO)
    } catch {
      // Armazenamento bloqueado: vale como sem resposta, e o banner aparece.
    }
    if (!stored) queueMicrotask(() => setVisible(true))
  }, [forceOpen])

  // Reaplica a escolha ja gravada (Google e Clarity) a cada carregamento de
  // pagina. Sem resposta gravada, o Clarity recebe denied e o Google fica no
  // consent default negado do gtm-script.
  useEffect(() => {
    if (forceOpen) return
    aplicarEscolhaSalva(janela())
  }, [forceOpen])

  function gravar(escolha: 'accepted' | 'declined') {
    try {
      localStorage.setItem(CHAVE_CONSENTIMENTO, escolha)
    } catch {
      // Sem armazenamento a escolha vale so para esta pagina.
    }
  }

  function accept() {
    gravar('accepted')
    aplicarConsentimento(true, janela())
    setVisible(false)
  }

  function decline() {
    gravar('declined')
    aplicarConsentimento(false, janela())
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-[#1A1A1A] text-white rounded-2xl p-5 shadow-2xl pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed">{t('text')}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2"
          >
            {t('decline')}
          </button>
          <button
            onClick={accept}
            className="text-sm font-semibold bg-teal text-white px-5 py-2 rounded-xl hover:bg-teal-dark transition-colors"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
