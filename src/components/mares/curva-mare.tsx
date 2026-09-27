'use client'

import { useSyncExternalStore } from 'react'
import type { PontoCurva } from '@/lib/mares/curva'
import type { MareDoDia } from '@/lib/mares/semana'

/* Curva do dia em SVG puro, sem biblioteca de grafico. O marcador de "agora"
   e o unico pedaco que depende do relogio do visitante: vem do
   useSyncExternalStore, que no servidor devolve null (sem marcador no HTML) e
   no navegador devolve o minuto atual, atualizado a cada 60 s. Nenhuma busca
   de dado acontece aqui. */

const L = 360
const A = 168
const MARGEM_TOPO = 26
const MARGEM_BASE = 40
const ALTURA_MIN = -0.2
const ALTURA_MAX = 3

function assinar(aviso: () => void) {
  const id = setInterval(aviso, 60_000)
  return () => clearInterval(id)
}
const minutoAtual = () => Math.floor(Date.now() / 60_000)
const semRelogio = () => null

function x(minuto: number) {
  return (minuto / 1440) * L
}
function y(altura: number) {
  const util = A - MARGEM_TOPO - MARGEM_BASE
  return MARGEM_TOPO + util * (1 - (altura - ALTURA_MIN) / (ALTURA_MAX - ALTURA_MIN))
}
function minutoDe(iso: string, inicioDoDiaMs: number) {
  return (new Date(iso).getTime() - inicioDoDiaMs) / 60_000
}

type Props = {
  data: string
  pontos: PontoCurva[]
  eventos: MareDoDia[]
  janela: { inicioMin: number; fimMin: number } | null
  rotuloAgora: string
  descricao: string
}

export function CurvaMare({ data, pontos, eventos, janela, rotuloAgora, descricao }: Props) {
  const agoraMin = useSyncExternalStore(assinar, minutoAtual, semRelogio)
  const inicioDoDiaMs = new Date(`${data}T00:00:00-03:00`).getTime()

  const validos = pontos.filter((p): p is { minuto: number; altura: number } => p.altura !== null)
  if (validos.length < 2) return null
  const linha = validos.map((p, i) => `${i ? 'L' : 'M'}${x(p.minuto).toFixed(1)} ${y(p.altura).toFixed(1)}`).join(' ')
  const area = `${linha} L${x(validos.at(-1)!.minuto).toFixed(1)} ${A - MARGEM_BASE} L${x(validos[0].minuto).toFixed(1)} ${A - MARGEM_BASE} Z`

  let marcador: { mx: number; my: number } | null = null
  if (agoraMin !== null) {
    const m = agoraMin - inicioDoDiaMs / 60_000
    if (m >= 0 && m <= 1440) {
      // altura no minuto atual, pela curva ja amostrada (interpolacao linear entre pontos de 15 min)
      const i = validos.findIndex((p) => p.minuto >= m)
      if (i > 0) {
        const a = validos[i - 1]
        const b = validos[i]
        const h = a.altura + ((b.altura - a.altura) * (m - a.minuto)) / (b.minuto - a.minuto)
        marcador = { mx: x(m), my: y(h) }
      } else if (i === 0) {
        marcador = { mx: x(m), my: y(validos[0].altura) }
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${L} ${A}`} className="w-full h-auto" role="img" aria-label={descricao}>
      {/* luz do dia, 6h-18h */}
      <rect x={x(360)} y={MARGEM_TOPO - 8} width={x(720)} height={A - MARGEM_TOPO - MARGEM_BASE + 8} className="fill-fg-1/[0.03]" />
      {janela && (
        <rect
          x={x(janela.inicioMin)}
          y={MARGEM_TOPO - 8}
          width={Math.max(0, x(janela.fimMin) - x(janela.inicioMin))}
          height={A - MARGEM_TOPO - MARGEM_BASE + 8}
          className="fill-ocre/20"
        />
      )}
      <path d={area} className="fill-teal/10" />
      <path d={linha} fill="none" className="stroke-teal" strokeWidth={2.5} strokeLinejoin="round" />
      {eventos.map((e) => {
        const m = minutoDe(e.iso, inicioDoDiaMs)
        const ex = x(m)
        const ey = y(e.altura)
        return (
          <g key={e.iso}>
            <circle cx={ex} cy={ey} r={3.5} className={e.tipo === 'alta' ? 'fill-teal' : 'fill-ocre-700 dark:fill-ocre-400'} />
            <text
              x={Math.min(Math.max(ex, 16), L - 16)}
              y={e.tipo === 'alta' ? ey - 9 : ey + 16}
              textAnchor="middle"
              className="fill-fg-1 text-[11px] font-semibold tabular-nums"
            >
              {e.hora}
            </text>
          </g>
        )
      })}
      {[0, 6, 12, 18, 24].map((h) => (
        <text
          key={h}
          x={Math.min(Math.max(x(h * 60), 8), L - 10)}
          y={A - 6}
          textAnchor="middle"
          className="fill-fg-3 text-[10px] tabular-nums"
        >
          {h}h
        </text>
      ))}
      {marcador && (
        <g>
          <line x1={marcador.mx} x2={marcador.mx} y1={MARGEM_TOPO - 8} y2={A - MARGEM_BASE} className="stroke-coral" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={marcador.mx} cy={marcador.my} r={5} className="fill-coral stroke-elev" strokeWidth={2} />
          <text
            x={Math.min(Math.max(marcador.mx, 20), L - 20)}
            y={MARGEM_TOPO - 12}
            textAnchor="middle"
            className="fill-coral-dark text-[11px] font-bold"
          >
            {rotuloAgora}
          </text>
        </g>
      )}
    </svg>
  )
}
