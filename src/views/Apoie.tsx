'use client'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useLocalePath } from '@/hooks/useLocalePath'

/* Rota direta de doação: mensagem neutra enquanto não houver forma de receber. */
export default function Apoie() {
  const { t } = useTranslation()
  const lp = useLocalePath()

  return (
    <main>
      <section className="max-w-xl mx-auto px-5 md:px-8 py-20 md:py-28 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#737373] mb-3">
          {t('apoie.badge')}
        </p>
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
          {t('apoie.pagamentos_pausados_titulo')}
        </h1>
        <p className="text-[#737373] leading-relaxed mb-8">
          {t('apoie.pagamentos_pausados_desc')}
        </p>
        <Link
          href={lp('/')}
          className="inline-flex items-center justify-center bg-teal text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-dark transition-colors text-sm"
        >
          {t('apoie.pagamentos_pausados_voltar')}
        </Link>
      </section>
    </main>
  )
}
