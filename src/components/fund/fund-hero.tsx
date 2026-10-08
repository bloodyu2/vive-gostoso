import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { formatCurrency } from '@/lib/utils'
import { CHAVES, parametro, type Parametros } from '@/lib/parametros'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import Link from 'next/link'

interface FundHeroProps {
  parametros?: Parametros
  totalCents: number
  marketingCents: number
  operacaoCents: number
  acumuladoCents: number
  temArrecadacao: boolean
}

/** Valor em reais. O contador so entra quando ha dinheiro (> 0); zero e escrito, nao contado.
 *  O NumberTicker nao agrupa milhares, entao de R$ 1.000 para cima o valor sai fixo e formatado. */
function Valor({ cents, className }: { cents: number; className?: string }) {
  const reais = cents / 100
  if (cents > 0 && reais < 1000) {
    return (
      <span className={className}>
        R$ <NumberTicker value={reais} decimais={2} />
      </span>
    )
  }
  return <span className={className}>{formatCurrency(cents)}</span>
}

export function FundHero({
  parametros, totalCents, marketingCents, operacaoCents, acumuladoCents,
  temArrecadacao,
}: FundHeroProps) {
  const { t } = useTranslation('fund')
  /* O rateio vem da mesma tabela que a /sobre e a /transparencia leem. A barra
     tambem: antes ela era `w-4/5`, oitenta por cento desenhados em pixel fixo
     que nao mudariam se o rateio mudasse. */
  const cidade = parametro(parametros, CHAVES.rateioCidade)
  const operacao = parametro(parametros, CHAVES.rateioOperacao)
  const lp = useLocalePath()
  const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <section className="bg-teal-dark text-white px-5 md:px-8 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-medium opacity-85 mb-3 capitalize">
          {t('section_label', { month })}
        </p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-8xl leading-none tracking-tight mb-6">
          <span className="sr-only">{t('apoie.h1', { ns: 'translation' })}</span>
          {t('title')}
        </h1>

        {!temArrecadacao ? (
          <div className="mt-8 md:mt-10 grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-end">
            <div>
              <p className="font-display font-semibold text-3xl md:text-5xl leading-tight tracking-tight mb-5">
                {t('launch_title')}
              </p>
              <p className="text-lg opacity-90 leading-relaxed max-w-xl mb-8">
                {t('launch_desc')}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <ShimmerButton
                  href="#doe"
                  className="bg-coral-texto hover:bg-coral-texto/90 min-h-12 px-8 rounded-full text-base"
                >
                  {t('apoie.doe_titulo', { ns: 'translation' })}
                </ShimmerButton>
                <Link
                  href={lp('/cadastre')}
                  className="inline-flex items-center min-h-11 text-white font-semibold underline underline-offset-4 decoration-white/50 hover:decoration-white"
                >
                  {t('launch_cta')}
                </Link>
              </div>
            </div>

            {/* Entrou, saiu e saldo, e nada de custo aqui. Os R$59,80 de dominio
                e e-mail sairam da Balaio, nao do fundo: mostra-los como saida
                diria que o fundo pagou. Tres zeros e o estado verdadeiro, e a
                estrutura ja fica certa para quando o dinheiro existir. Zero nao
                e contador: e o valor escrito, sem animacao. */}
            <dl className="grid grid-cols-3 lg:grid-cols-1 gap-x-4 gap-y-5 lg:border-l lg:border-white/25 lg:pl-10">
              {([
                ['entrou', totalCents],
                ['saiu', 0],
                ['saldo', totalCents],
              ] as const).map(([chave, valor]) => (
                <div key={chave} className="flex flex-col-reverse justify-end">
                  <dt className="text-sm opacity-80 mt-1">{t(`launch_${chave}`)}</dt>
                  <dd className="font-display font-bold text-xl sm:text-3xl md:text-4xl tabular-nums">{formatCurrency(valor)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <>
            <p className="text-lg opacity-90 max-w-lg leading-relaxed mb-8">{t('desc')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              <div className="font-display font-bold text-5xl sm:text-6xl md:text-7xl leading-none tracking-tight">
                <Valor cents={totalCents} />
              </div>
              <div className="self-start md:self-end">
                {cidade !== undefined && operacao !== undefined && (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">{t('allocated_cidade', { pct: cidade })}</span>
                      <span className="opacity-85">{t('allocated_operacao', { pct: operacao })}</span>
                    </div>
                    <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-ocre rounded-full" style={{ width: `${cidade}%` }} />
                    </div>
                  </>
                )}
                <p className="text-sm opacity-85 mt-4 leading-relaxed">
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
                <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-5">
                  <div className="text-sm font-medium opacity-90">{t(c.labelKey)}</div>
                  <div className="font-display font-bold text-2xl md:text-3xl mt-2 tabular-nums"><Valor cents={c.amount} /></div>
                  <div className="text-xs opacity-80 mt-1">{t(c.subKey)}</div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <ShimmerButton
                href="#doe"
                className="bg-coral-texto hover:bg-coral-texto/90 min-h-12 px-8 rounded-full text-base"
              >
                {t('apoie.doe_titulo', { ns: 'translation' })}
              </ShimmerButton>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
