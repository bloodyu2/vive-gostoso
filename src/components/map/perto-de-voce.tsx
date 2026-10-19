'use client'
import { useMemo, useState } from 'react'
import { Navigation, Utensils, BedDouble, Compass, Waves, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Business } from '@/types/database'
import type { PontoMapa } from '@/data/pontos-mapa'
import type { Idioma } from '@/data/praias-mares'
import { formatarDistancia, ordenarPorDistancia, type Coord } from '@/lib/perto'
import { PIN_COLORS } from '@/lib/mapbox'
import { StatusAberturaSelo, useStatusAbertura } from '@/components/business/status-abertura'
import type { Horarios } from '@/lib/status-abertura'
import type { TextosMapa } from './explore-map'

type Filtro = 'todos' | 'come' | 'fique' | 'passeie' | 'pontos'
const FILTROS: Filtro[] = ['todos', 'come', 'fique', 'passeie', 'pontos']
const LIMITE = 12

const ICONE: Record<string, LucideIcon> = { come: Utensils, fique: BedDouble, passeie: Compass, pontos: Waves }
const COR: Record<string, string> = { ...PIN_COLORS, pontos: '#0D7C7C' }

type ItemPerto =
  | { tipo: 'negocio'; id: string; negocio: Business; lat: number; lng: number }
  | { tipo: 'ponto'; id: string; ponto: PontoMapa; lat: number; lng: number }

function Status({ horarios }: { horarios: Horarios | null | undefined }) {
  const status = useStatusAbertura(horarios)
  const temHorarios = !!horarios && Object.keys(horarios).length > 0
  return <StatusAberturaSelo status={status} temHorarios={temHorarios} />
}

interface Props {
  origem: Coord
  businesses: Business[]
  pontos: PontoMapa[]
  textos: TextosMapa
  lang: Idioma
  /** Avisos de distancia ou de precisao, ja montados. */
  avisos: string[]
  onAbrirNegocio: (b: Business) => void
  onAbrirPonto: (p: PontoMapa) => void
  onSair: () => void
}

/** "Perto de voce": lista ordenada pela distancia real da pessoa. Fica no topo
 *  da barra lateral, que no celular e a area logo abaixo do mapa. */
export function PertoDeVoce({ origem, businesses, pontos, textos, lang, avisos, onAbrirNegocio, onAbrirPonto, onSair }: Props) {
  const t = textos.perto
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const ordenados = useMemo(() => {
    const itens: ItemPerto[] = []
    for (const b of businesses) {
      if (b.lat != null && b.lng != null) itens.push({ tipo: 'negocio', id: b.id, negocio: b, lat: b.lat, lng: b.lng })
    }
    for (const p of pontos) itens.push({ tipo: 'ponto', id: p.id, ponto: p, lat: p.lat, lng: p.lon })
    return ordenarPorDistancia(origem, itens, (i) => ({ lat: i.lat, lng: i.lng }))
  }, [origem, businesses, pontos])

  const visiveis = ordenados
    .filter(({ item }) => {
      if (filtro === 'todos') return true
      if (filtro === 'pontos') return item.tipo === 'ponto'
      return item.tipo === 'negocio' && (item.negocio.category?.verb ?? 'come') === filtro
    })
    .slice(0, LIMITE)

  return (
    <section aria-labelledby="perto-titulo" className="border-b border-[#E8E4DF] bg-white">
      <div className="px-5 pt-4 pb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="perto-titulo" className="font-display font-semibold text-base text-[#1A1A1A]">{t.titulo}</h2>
          <p className="text-xs text-fg-3-texto mt-0.5">{t.sub}</p>
        </div>
        <button
          type="button"
          onClick={onSair}
          aria-label={t.sair}
          title={t.sair}
          className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 -mt-2 -mr-3 text-fg-3-texto hover:text-[#1A1A1A]"
        >
          <X aria-hidden="true" className="w-4 h-4" />
        </button>
      </div>

      {avisos.length > 0 && (
        <div role="status" className="mx-5 mb-2 rounded-xl bg-[#F5F2EE] px-3 py-2 text-xs text-[#3D3D3D] leading-snug space-y-1">
          {avisos.map(a => <p key={a}>{a}</p>)}
        </div>
      )}

      <div role="group" aria-label={t.filtro} className="flex gap-2 px-5 pb-3 overflow-x-auto scrollbar-none">
        {FILTROS.map(f => {
          const ativo = filtro === f
          return (
            <button
              key={f}
              type="button"
              aria-pressed={ativo}
              onClick={() => setFiltro(f)}
              className={`flex-shrink-0 min-h-11 text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors motion-reduce:transition-none ${ativo ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-[#1A1A1A] border-[#E8E4DF] hover:border-teal'}`}
            >
              {t.filtros[f]}
            </button>
          )
        })}
      </div>

      {visiveis.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-fg-3-texto">{t.vazio}</p>
      ) : (
        <ul className="divide-y divide-[#F5F2EE] border-t border-[#F5F2EE]">
          {visiveis.map(({ item, metros }) => {
            const chave = item.tipo === 'negocio' ? (item.negocio.category?.verb ?? 'come') : 'pontos'
            const Icone = ICONE[chave] ?? Compass
            const cor = COR[chave] ?? '#0D7C7C'
            const nome = item.tipo === 'negocio' ? item.negocio.name : item.ponto.nome
            const tipoTexto = item.tipo === 'negocio' ? (item.negocio.category?.name ?? '') : textos.categorias[item.ponto.categoria]
            const rota = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}&travelmode=walking`
            return (
              <li key={item.tipo + item.id} className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => (item.tipo === 'negocio' ? onAbrirNegocio(item.negocio) : onAbrirPonto(item.ponto))}
                  className="flex-1 min-w-0 flex items-center gap-3 pl-5 pr-2 py-3 text-left hover:bg-[#F5F2EE] transition-colors motion-reduce:transition-none"
                >
                  <span aria-hidden="true" className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: cor + '18', color: cor }}>
                    <Icone className="w-[18px] h-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[#1A1A1A] truncate">{nome}</span>
                    <span className="block text-xs text-fg-3-texto truncate">
                      <span className="font-semibold text-[#1A1A1A]">{formatarDistancia(metros, lang)}</span>
                      {tipoTexto && <> · {tipoTexto}</>}
                    </span>
                    {item.tipo === 'negocio' && <span className="block mt-0.5 empty:hidden"><Status horarios={item.negocio.opening_hours} /></span>}
                    {item.tipo === 'ponto' && <span className="block text-xs text-[#3D3D3D] mt-0.5 line-clamp-2">{item.ponto.descricao[lang]}</span>}
                  </span>
                </button>
                <a
                  href={rota}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t.ir_a_pe}: ${nome}`}
                  className="flex-shrink-0 w-14 flex flex-col items-center justify-center gap-0.5 text-teal text-[11px] font-semibold hover:bg-teal/10 transition-colors motion-reduce:transition-none"
                >
                  <Navigation aria-hidden="true" className="w-4 h-4" />
                  {t.ir_a_pe}
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
