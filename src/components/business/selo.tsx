'use client'

import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/**
 * Selos do Vive Gostoso.
 *
 * - prata: negocio verificado pelo Vive Gostoso (campo `is_verified`).
 * - ouro: assinante (plano `associado` ou `destaque`). Hoje nenhum negocio
 *   paga, entao o ouro existe no codigo mas nao aparece em lugar nenhum.
 *
 * A forma e a mesma, so muda o metal e o miolo: o prata leva um visto, o ouro
 * leva uma estrela. Quem nao distingue cor ainda distingue pelo desenho.
 */
export type TipoSelo = 'prata' | 'ouro'

const TAMANHOS = { sm: 16, md: 20, lg: 28 } as const
export type TamanhoSelo = keyof typeof TAMANHOS

/** Rosetta de 12 ondas, calculada uma vez. Raio 12 numa caixa 28x28. */
const ROSETA = (() => {
  const pontos: string[] = []
  const passos = 120
  for (let i = 0; i <= passos; i++) {
    const a = (i / passos) * Math.PI * 2
    const r = 12.4 + 0.9 * Math.cos(a * 12)
    pontos.push(`${(14 + r * Math.sin(a)).toFixed(2)} ${(14 - r * Math.cos(a)).toFixed(2)}`)
  }
  return `M${pontos.join('L')}Z`
})()

const ESTRELA = (() => {
  const pontos: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 5.4 : 2.3
    const a = (i / 10) * Math.PI * 2
    pontos.push(`${(14 + r * Math.sin(a)).toFixed(2)} ${(14.4 - r * Math.cos(a)).toFixed(2)}`)
  }
  return `M${pontos.join('L')}Z`
})()

const METAL = {
  prata: {
    de: '#F4F6F7',
    meio: '#C3CCD0',
    ate: '#8E9CA2',
    aro: '#6F7F86',
    miolo: '#0B5F5F',
  },
  ouro: {
    de: '#FBE6A8',
    meio: '#E2B04F',
    ate: '#B8741E',
    aro: '#8F5417',
    miolo: '#5A3208',
  },
} as const

interface SeloProps {
  tipo: TipoSelo
  size?: TamanhoSelo
  className?: string
}

export function Selo({ tipo, size = 'md', className }: SeloProps) {
  const { t } = useTranslation()
  const id = useId().replace(/:/g, '')
  const m = METAL[tipo]
  const px = TAMANHOS[size]
  const rotulo = tipo === 'prata' ? t('selo.prata') : t('selo.ouro')

  return (
    <svg
      role="img"
      aria-label={rotulo}
      viewBox="0 0 28 28"
      width={px}
      height={px}
      className={cn('inline-block shrink-0 align-middle drop-shadow-[0_1px_1px_rgba(26,26,26,0.25)]', className)}
    >
      <title>{rotulo}</title>
      <defs>
        <linearGradient id={`${id}-m`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={m.de} />
          <stop offset="0.5" stopColor={m.meio} />
          <stop offset="1" stopColor={m.ate} />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={ROSETA} fill={`url(#${id}-m)`} stroke={m.aro} strokeWidth="0.7" strokeLinejoin="round" />
      <circle cx="14" cy="14" r="8.6" fill="none" stroke={m.aro} strokeOpacity="0.55" strokeWidth="0.7" />
      <path d={ROSETA} fill={`url(#${id}-b)`} />
      {tipo === 'prata' ? (
        <path
          d="M9.4 14.3l3.1 3.1 6.2-6.7"
          fill="none"
          stroke={m.miolo}
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path d={ESTRELA} fill={m.miolo} stroke={m.miolo} strokeWidth="0.8" strokeLinejoin="round" />
      )}
    </svg>
  )
}

/** Regra de qual selo cada negocio mostra. Um lugar so, para cartao, pagina e home. */
export function selosDoNegocio(b: { is_verified?: boolean | null; plan?: string | null }): TipoSelo[] {
  const selos: TipoSelo[] = []
  if (b.is_verified) selos.push('prata')
  if (b.plan === 'associado' || b.plan === 'destaque') selos.push('ouro')
  return selos
}

interface SelosProps {
  negocio: { is_verified?: boolean | null; plan?: string | null }
  size?: TamanhoSelo
  className?: string
}

export function SelosDoNegocio({ negocio, size = 'md', className }: SelosProps) {
  const selos = selosDoNegocio(negocio)
  if (selos.length === 0) return null
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {selos.map(tipo => <Selo key={tipo} tipo={tipo} size={size} />)}
    </span>
  )
}
