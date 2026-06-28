import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface FundHeroProps {
  totalCents: number
  marketingCents: number
  operacaoCents: number
  acumuladoCents: number
  associadosCount: number
  hasEntries: boolean
}

export function FundHero({
  totalCents, marketingCents, operacaoCents, acumuladoCents,
  associadosCount, hasEntries,
}: FundHeroProps) {
  const { t } = useTranslation('fund')
  const lp = useLocalePath()
  const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <section className="bg-teal text-white px-5 md:px-8 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-xs font-medium tracking-widest uppercase opacity-80 mb-3">
          {t('section_label', { month })}
        </div>
        <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-8xl leading-none tracking-tight mb-4">
          {t('title')}
        </h1>
        <p className="text-base md:text-lg opacity-90 max-w-lg leading-relaxed">
          {t('desc')}
        </p>

        {!hasEntries ? (
          <div className="mt-10 md:mt-12 bg-white/10 border border-white/20 rounded-2xl p-8 max-w-2xl">
            <div className="text-3xl font-display font-bold mb-3">{t('launch_title')}</div>
            <p className="opacity-85 leading-relaxed mb-6">
              {t('launch_desc')}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
                <div className="font-display font-bold text-2xl">{associadosCount}</div>
                <div className="text-xs opacity-75 mt-0.5">{t('launch_associados')}</div>
              </div>
              <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
                <div className="font-display font-bold text-2xl">80%</div>
                <div className="text-xs opacity-75 mt-0.5">{t('launch_city_share')}</div>
              </div>
              <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
                <div className="font-display font-bold text-2xl">0%</div>
                <div className="text-xs opacity-75 mt-0.5">{t('launch_no_profit')}</div>
              </div>
            </div>
            <Link
              href={lp('/cadastre')}
              className="inline-block mt-6 bg-white text-teal font-semibold text-sm px-6 py-3 rounded-full hover:bg-teal-light transition-colors"
            >
              {t('launch_cta')}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              <div>
                <div className="font-display font-bold text-5xl sm:text-6xl md:text-7xl leading-none tracking-tight">
                  {formatCurrency(totalCents)}
                </div>
                <div className="text-sm opacity-85 mt-2">
                  {t('raised_month', { count: associadosCount })}
                </div>
              </div>
              <div className="self-start md:self-end">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">{t('allocated_80')}</span>
                  <span className="opacity-80">{t('allocated_20')}</span>
                </div>
                <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-4/5 h-full bg-ocre rounded-full" />
                </div>
                <p className="text-sm opacity-80 mt-4 leading-relaxed">
                  {t('dest_desc', { value: formatCurrency(marketingCents) })}<br />
                  {t('ops_desc', { value: formatCurrency(operacaoCents) })}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-10 md:mt-12">
              {[
                { labelKey: 'card_marketing', amount: marketingCents, subKey: 'card_marketing_sub' },
                { labelKey: 'card_operacao',  amount: operacaoCents,  subKey: 'card_operacao_sub' },
                { labelKey: 'card_acumulado', amount: acumuladoCents, subKey: 'card_acumulado_sub' },
              ].map((c, i) => (
                <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
                  <div className="text-xs font-medium tracking-widest uppercase opacity-85">{t(c.labelKey)}</div>
                  <div className="font-display font-bold text-2xl md:text-3xl mt-2">{formatCurrency(c.amount)}</div>
                  <div className="text-xs opacity-75 mt-1">{t(c.subKey)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
