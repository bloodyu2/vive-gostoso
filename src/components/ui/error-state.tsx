'use client'
// src/components/ui/error-state.tsx
// Estado de erro reutilizavel para queries que falham.
// Antes os paineis admin mostravam lista vazia silenciosamente quando a query quebrava.
import { AlertTriangle, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ErrorStateProps {
  /** Refetch da query que falhou */
  onRetry?: () => void
  /** Mensagem opcional; cai no texto padrao traduzido */
  message?: string
}

export function ErrorState({ onRetry, message }: ErrorStateProps) {
  const { t } = useTranslation()
  return (
    <div role="alert" className="text-center py-12 px-5">
      <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-coral" aria-hidden="true" />
      <p className="font-semibold text-[#1A1A1A] dark:text-white mb-1">
        {t('common.erro_titulo', 'Algo deu errado')}
      </p>
      <p className="text-sm text-[#737373] mb-5 max-w-xs mx-auto leading-relaxed">
        {message ?? t('common.erro_desc', 'Nao conseguimos carregar os dados. Verifique sua conexao e tente de novo.')}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-teal text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors"
        >
          <RotateCw className="w-4 h-4" aria-hidden="true" />
          {t('common.tentar_novamente', 'Tentar de novo')}
        </button>
      )}
    </div>
  )
}
