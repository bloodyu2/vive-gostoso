'use client'

import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useNoClube } from '@/components/clube/contexto-clube'
import { selosDoNegocio, type FatosDoNegocio, type TipoSelo } from '@/lib/selos'
import { cn } from '@/lib/utils'

/**
 * Selos do Vive Gostoso.
 *
 * - prata: negocio verificado pelo Vive Gostoso (campo `is_verified`).
 * - ouro: assinante (plano `associado` ou `destaque`). Hoje nenhum negocio
 *   paga, entao o ouro existe no codigo mas nao aparece em lugar nenhum.
 * - clube: parceiro do Passaporte Gostoso (vantagem no ar). Metal verde.
 *
 * A forma e a mesma, so muda o metal e o miolo: o prata leva um visto, o ouro
 * leva uma estrela, o clube leva um bilhete com picote. Quem nao distingue cor
 * ainda distingue pelo desenho. A REGRA de qual selo aparece mora em
 * `src/lib/selos.ts`; aqui so o desenho.
 */
export type { TipoSelo }

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

/** Bilhete com dois recortes laterais (o cupom do Passaporte). */
const BILHETE = 'M8.2 10H19.8V12.4A1.6 1.6 0 0 0 19.8 15.6V18H8.2V15.6A1.6 1.6 0 0 0 8.2 12.4Z'

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
  // verde esmeralda (cor do Passaporte); miolo creme
  clube: {
    de: '#D3EFE2',
    meio: '#2F8F6C',
    ate: '#1B6A50',
    aro: '#12503B',
    miolo: '#FFF6DF',
  },
} as const

const ROTULO: Record<TipoSelo, string> = {
  prata: 'selo.prata',
  ouro: 'selo.ouro',
  clube: 'selo.clube',
}

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
  const rotulo = t(ROTULO[tipo])

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
      ) : tipo === 'ouro' ? (
        <path d={ESTRELA} fill={m.miolo} stroke={m.miolo} strokeWidth="0.8" strokeLinejoin="round" />
      ) : (
        <>
          <path d={BILHETE} fill={m.miolo} stroke={m.miolo} strokeWidth="0.6" strokeLinejoin="round" />
          <path d="M16.6 11.3V16.7" stroke={m.meio} strokeWidth="0.9" strokeDasharray="1.1 1.1" fill="none" />
        </>
      )}
    </svg>
  )
}

interface SelosProps {
  negocio: FatosDoNegocio & { id?: string | null }
  size?: TamanhoSelo
  className?: string
  /** Selos que o lugar ja diz por outro meio (ex.: o slide "Verificado" do carrossel). */
  omitir?: TipoSelo[]
}

/** Os selos do negocio, na ordem da regra. O selo do clube vem do contexto que o
 *  layout alimenta (vazio enquanto o lancamento publico nao acontece). */
export function useSelosDoNegocio(negocio: FatosDoNegocio & { id?: string | null }): TipoSelo[] {
  const noClube = useNoClube(negocio.id)
  return selosDoNegocio(negocio, { noClube })
}

export function SelosDoNegocio({ negocio, size = 'md', className, omitir }: SelosProps) {
  const selos = useSelosDoNegocio(negocio).filter(tipo => !omitir?.includes(tipo))
  if (selos.length === 0) return null
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {selos.map(tipo => <Selo key={tipo} tipo={tipo} size={size} />)}
    </span>
  )
}
