'use client'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { useLocalePath } from '@/hooks/useLocalePath'
import { LINK_APOIO } from '@/lib/apoie'

/* Apoio ao Vive Gostoso por link de pagamento do Asaas (valor livre). Nao ha
   checkout proprio nem extrato no site: o extrato completo fica para depois
   (Victor, 16/11/2026). O Stripe saiu do codigo em KAN-872. */
export default function Apoie() {
  const { t } = useTranslation()
  const lp = useLocalePath()

  return (
    <main>
      <section className="max-w-xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-10 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#737373] mb-3">
          {t('apoie.badge')}
        </p>
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
          {t('apoie.contribua_titulo')}
        </h1>
        <p className="text-[#737373] leading-relaxed mb-8">{t('apoie.contribua_desc')}</p>
        <a
          href={LINK_APOIO}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-teal text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-dark transition-colors text-sm min-h-11"
        >
          {t('apoie.contribua_btn')} <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
        <p className="text-sm text-[#737373] leading-relaxed mt-5">{t('apoie.contribua_nota')}</p>
      </section>

      <section className="max-w-xl mx-auto px-5 md:px-8 pb-20 md:pb-28">
        <div className="rounded-2xl border border-border-1 bg-white dark:bg-card p-6">
          <h2 className="font-display font-semibold text-xl tracking-tight mb-2">{t('apoie.extrato_titulo')}</h2>
          <p className="text-sm text-[#737373] leading-relaxed mb-4">{t('apoie.extrato_desc')}</p>
          <Link
            href={lp('/transparencia')}
            className="inline-flex items-center gap-1.5 min-h-11 text-sm font-semibold text-teal-dark dark:text-teal hover:underline"
          >
            {t('apoie.extrato_link')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  )
}
