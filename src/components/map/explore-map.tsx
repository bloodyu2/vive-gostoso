'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MapPin, X, Utensils, BedDouble, Compass, Navigation, Waves, ExternalLink, LocateFixed, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
// mapbox-gl is loaded dynamically on component mount to keep it out of the
// initial bundle entry graph (prevents Vite from adding a modulepreload for it)
import { useLocalePath } from '@/hooks/useLocalePath'
import type { Business } from '@/types/database'
import { MAPBOX_TOKEN, MAP_STYLE, GOSTOSO_CENTER, GOSTOSO_ZOOM, PIN_COLORS } from '@/lib/mapbox'
import { BusinessCover } from '@/components/business/business-cover'
import { StatusAberturaSelo, useStatusAbertura } from '@/components/business/status-abertura'
import type { Horarios } from '@/lib/status-abertura'
import { CATEGORIAS_PONTO, linkComoChegar, type CategoriaPonto, type PontoMapa } from '@/data/pontos-mapa'
import type { Idioma } from '@/data/praias-mares'
import { CENTRO_DA_VILA, LONGE_DA_VILA_M, distanciaMetros, type Coord } from '@/lib/perto'
import { PertoDeVoce } from './perto-de-voce'
import type pt from '@/locales/pt.json'

export type TextosMapa = typeof pt.mapa

/** Cor de cada categoria de ponto, do design system. */
const COR_CATEGORIA: Record<CategoriaPonto, string> = {
  praias: '#0D7C7C',
  hospedagem: '#C97D2A',
  historicos: '#E05A3A',
}

// Lazy type reference only — no static import of mapbox-gl
type MapboxGLModule = typeof import('mapbox-gl')

const VERB_COLOR: Record<string, string> = PIN_COLORS

const VERB_ICON: Record<string, LucideIcon> = {
  come:    Utensils,
  fique:   BedDouble,
  passeie: Compass,
}

/** Selo aberto/fechado no fuso de Gostoso. Sem horarios cadastrados, nao mostra nada. */
function StatusDoPonto({ horarios }: { horarios: Horarios | null | undefined }) {
  const status = useStatusAbertura(horarios)
  const temHorarios = !!horarios && Object.keys(horarios).length > 0
  return <StatusAberturaSelo status={status} temHorarios={temHorarios} />
}

interface PopupBusiness {
  name: string
  slug: string
  cover_url: string | null
  category: Business['category']
  address: string | null
  opening_hours?: Horarios | null
}

interface ExploreMapProps {
  businesses: Business[]
  /** Pontos de referencia da regiao (src/data/pontos-mapa.ts). */
  pontos?: PontoMapa[]
  textos?: TextosMapa
  lang?: Idioma
}

export function ExploreMap({ businesses, pontos = [], textos, lang = 'pt' }: ExploreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  // Store mapbox module and map instance separately to allow dynamic import
  const mapboxRef = useRef<MapboxGLModule | null>(null)
  const map = useRef<InstanceType<MapboxGLModule['Map']> | null>(null)
  const markers = useRef<InstanceType<MapboxGLModule['Marker']>[]>([])
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const sidebarRef = useRef<HTMLDivElement>(null)
  const sidebarHeaderRef = useRef<HTMLDivElement>(null)
  const [popup, setPopup] = useState<PopupBusiness | null>(null)
  const [pontoAberto, setPontoAberto] = useState<PontoMapa | null>(null)
  const [filtro, setFiltro] = useState<CategoriaPonto | 'todos'>('todos')
  const marcadoresPontos = useRef<Array<{ categoria: CategoriaPonto; el: HTMLElement; marker: InstanceType<MapboxGLModule['Marker']> }>>([])
  const [mapReady, setMapReady] = useState(false)
  // "Onde estou": a posicao so existe aqui, no navegador, e nunca e enviada.
  const [minhaPosicao, setMinhaPosicao] = useState<(Coord & { precisao: number }) | null>(null)
  const [localizacao, setLocalizacao] = useState<'ocioso' | 'buscando' | 'erro'>('ocioso')
  const [erroLocalizacao, setErroLocalizacao] = useState<string | null>(null)
  const marcadorMinhaPosicao = useRef<InstanceType<MapboxGLModule['Marker']> | null>(null)
  const lp = useLocalePath()

  const geo = businesses.filter(b => b.lat != null && b.lng != null)
  const noGeo = businesses.filter(b => b.lat == null || b.lng == null)

  // Group by verb for sidebar
  const byVerb = businesses.reduce<Record<string, Business[]>>((acc, b) => {
    const verb = b.category?.verb ?? 'come'
    acc[verb] = acc[verb] ?? []
    acc[verb].push(b)
    return acc
  }, {})

  // Init map — dynamic import keeps vendor-mapbox out of the entry modulepreload list
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    // Inject mapbox CSS dynamically — avoids render-blocking on non-map pages
    if (!document.getElementById('mapbox-gl-css')) {
      const link = document.createElement('link')
      link.id = 'mapbox-gl-css'
      link.rel = 'stylesheet'
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css'
      document.head.appendChild(link)
    }

    import('mapbox-gl').then((mapboxgl) => {
      if (map.current || !mapContainer.current) return
      mapboxRef.current = mapboxgl as MapboxGLModule
      mapboxgl.default.accessToken = MAPBOX_TOKEN

      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: MAP_STYLE,
        center: GOSTOSO_CENTER,
        zoom: GOSTOSO_ZOOM,
        attributionControl: false,
      })

      map.current.addControl(new mapboxgl.default.AttributionControl({ compact: true }), 'bottom-left')
      map.current.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), 'top-left')

      // Close popup on map click
      map.current.on('click', () => { setPopup(null); setPontoAberto(null) })

      // Signal that map is ready for markers
      map.current.on('load', () => setMapReady(true))

      // Fallback: if map loads very fast, markers fire before the load
      // event. Set ready after a short delay as a safety net.
      setTimeout(() => setMapReady(true), 3000)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Add markers when map is ready and businesses have loaded
  useEffect(() => {
    if (!map.current || !mapboxRef.current || !mapReady) return

    const mapboxgl = mapboxRef.current

    // Clear old markers
    markers.current.forEach(m => m.remove())
    markers.current = []

    geo.forEach(b => {
      const verb = b.category?.verb ?? 'come'
      const color = VERB_COLOR[verb] ?? '#0D7C7C'

      const el = document.createElement('div')
      el.style.cssText = `
        width: 14px; height: 14px;
        border-radius: 50%;
        background: ${color};
        border: 2.5px solid white;
        box-shadow: 0 1px 6px rgba(0,0,0,0.30);
        cursor: pointer;
        transition: width 0.12s, height 0.12s;
        box-sizing: border-box;
      `
      el.addEventListener('mouseenter', () => {
        el.style.width = '18px'
        el.style.height = '18px'
      })
      el.addEventListener('mouseleave', () => {
        el.style.width = '14px'
        el.style.height = '14px'
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([b.lng!, b.lat!])
        .addTo(map.current!)

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setPontoAberto(null)
        setPopup({ name: b.name, slug: b.slug, cover_url: b.cover_url, category: b.category, address: b.address, opening_hours: b.opening_hours })
        map.current?.flyTo({ center: [b.lng!, b.lat!], zoom: Math.max(map.current.getZoom(), 15), duration: 600 })
      })

      markers.current.push(marker)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- geo.length e proposital: recriar os marcadores do Mapbox a cada nova referencia do array (mesmo com o mesmo conteudo) e caro e causa flicker.
  }, [geo.length, mapReady])

  // Pontos de referencia: losango com a cor da categoria, para nao confundir
  // com o circulo dos negocios. Ao abrir, o mapa enquadra todos os pontos.
  useEffect(() => {
    if (!map.current || !mapboxRef.current || !mapReady || pontos.length === 0) return
    const mapboxgl = mapboxRef.current
    marcadoresPontos.current.forEach(m => m.marker.remove())
    marcadoresPontos.current = []
    const limites = new mapboxgl.LngLatBounds()
    pontos.forEach(p => {
      const el = document.createElement('button')
      el.type = 'button'
      el.setAttribute('aria-label', p.nome)
      el.style.cssText = `
        width: 16px; height: 16px; padding: 0;
        border-radius: 3px;
        rotate: 45deg;
        background: ${COR_CATEGORIA[p.categoria]};
        border: 2.5px solid white;
        box-shadow: 0 1px 6px rgba(0,0,0,0.30);
        cursor: pointer;
        box-sizing: border-box;
      `
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setPopup(null)
        setPontoAberto(p)
        map.current?.flyTo({ center: [p.lon, p.lat], zoom: Math.max(map.current.getZoom(), 12), duration: 600 })
      })
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([p.lon, p.lat]).addTo(map.current!)
      marcadoresPontos.current.push({ categoria: p.categoria, el, marker })
      limites.extend([p.lon, p.lat])
    })
    map.current.fitBounds(limites, { padding: 48, duration: 0, maxZoom: 13 })
  }, [pontos, mapReady])

  // Filtro por categoria: esconde os losangos das outras categorias.
  useEffect(() => {
    marcadoresPontos.current.forEach(m => {
      m.el.style.display = filtro === 'todos' || filtro === m.categoria ? '' : 'none'
    })
  }, [filtro, mapReady])

  function abrirNegocio(b: Business) {
    if (b.lat == null || b.lng == null) return
    setPontoAberto(null)
    setPopup({ name: b.name, slug: b.slug, cover_url: b.cover_url, category: b.category, address: b.address, opening_hours: b.opening_hours })
    map.current?.flyTo({ center: [b.lng, b.lat], zoom: 17, duration: 800 })
  }

  function abrirPonto(p: PontoMapa) {
    setPopup(null)
    setPontoAberto(p)
    map.current?.flyTo({ center: [p.lon, p.lat], zoom: 14, duration: 800 })
  }

  function pedirLocalizacao() {
    const t = textos?.perto
    if (!t) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocalizacao('erro')
      setErroLocalizacao(t.erro_sem_suporte)
      return
    }
    setLocalizacao('buscando')
    setErroLocalizacao(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const eu = { lat: pos.coords.latitude, lng: pos.coords.longitude, precisao: pos.coords.accuracy }
        setMinhaPosicao(eu)
        setLocalizacao('ocioso')
        setPopup(null)
        setPontoAberto(null)
        const distVila = distanciaMetros(eu, CENTRO_DA_VILA)
        if (distVila > LONGE_DA_VILA_M) {
          // Longe de Gostoso: enquadra a pessoa e a vila em vez de dar zoom no vazio.
          const b = new mapboxRef.current!.LngLatBounds([eu.lng, eu.lat], [eu.lng, eu.lat])
          b.extend([CENTRO_DA_VILA.lng, CENTRO_DA_VILA.lat])
          map.current?.fitBounds(b, { padding: 64, maxZoom: 11, duration: 900 })
        } else {
          map.current?.flyTo({ center: [eu.lng, eu.lat], zoom: 15.5, duration: 900 })
        }
        sidebarRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      },
      (err) => {
        setLocalizacao('erro')
        setErroLocalizacao(err.code === 1 ? t.erro_negado : t.erro_indisponivel)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    )
  }

  function sairDaMinhaPosicao() {
    setMinhaPosicao(null)
    setLocalizacao('ocioso')
    setErroLocalizacao(null)
  }

  // Ponto azul da pessoa: cor fora da paleta das categorias, para nao confundir.
  useEffect(() => {
    marcadorMinhaPosicao.current?.remove()
    marcadorMinhaPosicao.current = null
    if (!minhaPosicao || !map.current || !mapboxRef.current || !mapReady) return
    const el = document.createElement('div')
    el.setAttribute('role', 'img')
    el.setAttribute('aria-label', textos?.perto.aqui ?? '')
    el.className = 'minha-posicao'
    marcadorMinhaPosicao.current = new mapboxRef.current.Marker({ element: el, anchor: 'center' })
      .setLngLat([minhaPosicao.lng, minhaPosicao.lat])
      .addTo(map.current)
    return () => {
      marcadorMinhaPosicao.current?.remove()
      marcadorMinhaPosicao.current = null
    }
  }, [minhaPosicao, mapReady, textos])

  const VERB_LABEL: Record<string, string> = { come: 'Restaurantes', fique: 'Hospedagem', passeie: 'Passeios' }
  const VERB_TO: Record<string, string>    = { come: '/come', fique: '/fique', passeie: '/passeie' }
  const SIDEBAR_VERBS = ['come', 'fique', 'passeie']

  const activeVerbs = SIDEBAR_VERBS.filter(v => byVerb[v]?.length)

  function jumpToSection(verb: string) {
    const el = sectionRefs.current[verb]
    const sidebar = sidebarRef.current
    if (!el || !sidebar) return
    // Measure the sticky header's actual rendered height so the scroll lands
    // just below it regardless of whether the pills row is showing.
    const headerHeight = sidebarHeaderRef.current?.offsetHeight ?? 90
    // Use getBoundingClientRect to find the section's current viewport position,
    // then convert to an absolute scroll offset within the sidebar container.
    const elRect = el.getBoundingClientRect()
    const sidebarRect = sidebar.getBoundingClientRect()
    const target = sidebar.scrollTop + elRect.top - sidebarRect.top - headerHeight
    sidebar.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">

      {/* Mapa */}
      <div className="h-[42vh] flex-shrink-0 md:flex-1 md:h-full relative min-h-[240px]">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Onde estou */}
        {textos && (
          <div className="absolute bottom-9 left-3 z-10 max-w-[calc(100%-6.5rem)] flex flex-col items-start gap-2">
            {erroLocalizacao && (
              <p role="alert" className="rounded-xl bg-white/95 border border-[#E8E4DF] shadow-sm px-3 py-2 text-xs text-[#1A1A1A] leading-snug">
                {erroLocalizacao}
              </p>
            )}
            <button
              type="button"
              onClick={pedirLocalizacao}
              disabled={localizacao === 'buscando'}
              className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full bg-teal text-white text-sm font-semibold shadow-lg hover:bg-teal-dark disabled:opacity-80 transition-colors motion-reduce:transition-none"
            >
              {localizacao === 'buscando'
                ? <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin motion-reduce:animate-none" />
                : <LocateFixed aria-hidden="true" className="w-4 h-4" />}
              {localizacao === 'buscando' ? textos.perto.buscando : minhaPosicao ? textos.perto.botao_de_novo : textos.perto.botao}
            </button>
          </div>
        )}

        {/* Stats chip */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur border border-[#E8E4DF] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] shadow-sm pointer-events-none">
          <span className="font-semibold text-teal">{geo.length}</span> no mapa
          {noGeo.length > 0 && <span className="text-fg-3-texto ml-1.5">· {noGeo.length} sem localização</span>}
        </div>

        {/* Filtro dos pontos da regiao */}
        {textos && pontos.length > 0 && (
          <div role="group" aria-label={textos.filtro_titulo} className="absolute top-3 left-14 right-3 flex gap-2 overflow-x-auto pb-1">
            {(['todos', ...CATEGORIAS_PONTO] as const).map(c => {
              const ativo = filtro === c
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => { setFiltro(c); setPontoAberto(null) }}
                  className={`flex-shrink-0 flex items-center gap-1.5 min-h-11 text-xs font-semibold px-4 py-1.5 rounded-full border shadow-sm transition-colors motion-reduce:transition-none ${ativo ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white/95 text-[#1A1A1A] border-[#E8E4DF] hover:border-teal'}`}
                >
                  {c !== 'todos' && <span aria-hidden="true" className="w-2.5 h-2.5 rotate-45 rounded-[2px]" style={{ background: COR_CATEGORIA[c] }} />}
                  {c === 'todos' ? textos.todos : textos.categorias[c]}
                </button>
              )
            })}
          </div>
        )}

        {/* Cartao do ponto de referencia */}
        {pontoAberto && textos && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 max-w-[calc(100%-2rem)] bg-white rounded-2xl shadow-xl border border-[#E8E4DF] p-4 z-10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div
                  className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1"
                  style={{ background: COR_CATEGORIA[pontoAberto.categoria] + '18', color: COR_CATEGORIA[pontoAberto.categoria] }}
                >
                  {textos.categorias[pontoAberto.categoria]}
                </div>
                <div className="font-semibold text-[#1A1A1A] leading-tight">{pontoAberto.nome}</div>
                <div className="text-xs text-fg-3-texto mt-0.5">{pontoAberto.municipio}</div>
                <p className="text-sm text-[#3D3D3D] mt-2 leading-snug">{pontoAberto.descricao[lang]}</p>
              </div>
              <button type="button" onClick={() => setPontoAberto(null)} aria-label={textos.fechar} className="p-1.5 -m-1.5 text-fg-3-texto hover:text-[#1A1A1A] flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={linkComoChegar(pontoAberto)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold bg-teal text-white rounded-xl px-3 py-2 hover:bg-teal-dark transition-colors"
              >
                <Navigation aria-hidden="true" className="w-3.5 h-3.5" />{textos.como_chegar}
              </a>
              {pontoAberto.mareSlug && (
                <Link href={lp(`/explore/mares/${pontoAberto.mareSlug}`)} className="inline-flex items-center gap-1.5 text-sm font-semibold border border-teal text-teal rounded-xl px-3 py-2 hover:bg-teal/10 transition-colors">
                  <Waves aria-hidden="true" className="w-3.5 h-3.5" />{textos.ver_mare}
                </Link>
              )}
              {pontoAberto.site && (
                <a href={pontoAberto.site} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold border border-[#E8E4DF] text-[#1A1A1A] rounded-xl px-3 py-2 hover:border-teal transition-colors">
                  <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />{textos.site}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Popup card */}
        {popup && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-72 max-w-[calc(100%-2rem)] bg-white rounded-2xl shadow-xl border border-[#E8E4DF] overflow-hidden z-10">
            <div className="h-32 overflow-hidden">
              <BusinessCover
                coverUrl={popup.cover_url}
                alt={popup.name}
                nome={popup.name}
                slug={popup.slug}
                categoria={popup.category?.name}
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {popup.category && (
                    <div
                      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1"
                      style={{ background: (VERB_COLOR[popup.category.verb] ?? '#0D7C7C') + '18', color: VERB_COLOR[popup.category.verb] ?? '#0D7C7C' }}
                    >
                      {popup.category.name}
                    </div>
                  )}
                  <div className="font-semibold text-[#1A1A1A] leading-tight">{popup.name}</div>
                  <div className="mt-1.5"><StatusDoPonto horarios={popup.opening_hours} /></div>
                  {popup.address && (
                    <div className="text-xs text-fg-3-texto flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />{popup.address}
                    </div>
                  )}
                </div>
                <button onClick={() => setPopup(null)} className="p-1.5 -m-1.5 text-fg-3-texto hover:text-[#1A1A1A] flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Link
                href={lp(`/negocio/${popup.slug}`)}
                className="mt-3 block text-center text-sm font-semibold bg-teal text-white rounded-xl px-4 py-2 hover:bg-teal-dark transition-colors"
              >
                Ver perfil
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div ref={sidebarRef} className="flex-1 min-h-0 w-full md:flex-none md:w-80 md:h-full bg-white border-t md:border-t-0 md:border-l border-[#E8E4DF] overflow-y-auto">
        {minhaPosicao && textos && (
          <PertoDeVoce
            origem={minhaPosicao}
            businesses={geo}
            pontos={pontos}
            textos={textos}
            lang={lang}
            avisos={avisosDaPosicao(minhaPosicao, textos, lang)}
            onAbrirNegocio={abrirNegocio}
            onAbrirPonto={abrirPonto}
            onSair={sairDaMinhaPosicao}
          />
        )}
        {/* Sticky header: count + category jump pills */}
        <div ref={sidebarHeaderRef} className="sticky top-0 bg-white z-10 border-b border-[#E8E4DF]">
          <div className="px-5 pt-4 pb-2">
            <div className="font-semibold text-sm text-[#1A1A1A]">{businesses.length} negócios cadastrados</div>
            <div className="text-xs text-fg-3-texto mt-0.5">São Miguel do Gostoso, RN</div>
          </div>
          {/* Jump pills — only shown when 2+ categories have businesses */}
          {activeVerbs.length > 1 && (
            <div className="flex gap-2 px-5 pb-3 overflow-x-auto scrollbar-none">
              {activeVerbs.map(verb => {
                const VerbIcon = VERB_ICON[verb]
                return (
                  <button
                    key={verb}
                    onClick={() => jumpToSection(verb)}
                    className="flex-shrink-0 flex items-center gap-1 min-h-11 text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors hover:opacity-80"
                    style={{
                      borderColor: VERB_COLOR[verb] + '55',
                      color: VERB_COLOR[verb],
                      background: VERB_COLOR[verb] + '10',
                    }}
                  >
                    {VerbIcon && <VerbIcon className="w-3.5 h-3.5" />}
                    {VERB_LABEL[verb]}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {SIDEBAR_VERBS.map(verb => {
          const list = byVerb[verb]
          if (!list?.length) return null
          return (
            <div key={verb} ref={el => { sectionRefs.current[verb] = el }}>
              <div className="flex items-center justify-between px-5 py-3 bg-[#F5F2EE]">
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{ background: (VERB_COLOR[verb]) + '18', color: VERB_COLOR[verb], borderColor: VERB_COLOR[verb] + '33' }}
                >
                  {VERB_LABEL[verb]}
                </span>
                <Link href={lp(VERB_TO[verb])} className="text-xs text-teal font-medium hover:underline">
                  Ver todos →
                </Link>
              </div>
              <div className="divide-y divide-[#F5F2EE]">
                {list.slice(0, 5).map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      if (b.lat && b.lng) {
                        map.current?.flyTo({ center: [b.lng, b.lat], zoom: 16, duration: 800 })
                        setPopup({ name: b.name, slug: b.slug, cover_url: b.cover_url, category: b.category, address: b.address, opening_hours: b.opening_hours })
                      }
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#F5F2EE] transition-colors group text-left"
                  >
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden">
                      <BusinessCover
                        coverUrl={b.cover_url}
                        alt=""
                        nome={b.name}
                        slug={b.slug}
                        categoria={b.category?.name}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#1A1A1A] truncate group-hover:text-teal transition-colors">{b.name}</div>
                      <div className="mt-0.5 empty:hidden"><StatusDoPonto horarios={b.opening_hours} /></div>
                      {b.address && (
                        <div className="text-xs text-fg-3-texto truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />{b.address}
                        </div>
                      )}
                    </div>
                    {b.lat != null
                      ? <div className="w-2 h-2 rounded-full bg-teal flex-shrink-0" title="No mapa" />
                      : <div className="w-2 h-2 rounded-full bg-[#D4CFCA] flex-shrink-0" title="Sem localização" />
                    }
                  </button>
                ))}
                {list.length > 5 && (
                  <Link href={lp(VERB_TO[verb])} className="block px-5 py-3 text-xs text-teal font-medium hover:bg-[#F5F2EE] transition-colors">
                    +{list.length - 5} mais em {VERB_LABEL[verb].toLowerCase()} →
                  </Link>
                )}
              </div>
            </div>
          )
        })}

        {businesses.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-fg-3-texto">
            Nenhum negócio cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  )
}

/** Frases de contexto da posicao: longe de Gostoso e GPS pouco preciso. */
function avisosDaPosicao(eu: Coord & { precisao: number }, textos: TextosMapa, lang: Idioma): string[] {
  const avisos: string[] = []
  const distVila = distanciaMetros(eu, CENTRO_DA_VILA)
  if (distVila > LONGE_DA_VILA_M) {
    const km = new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(distVila / 1000)
    avisos.push(textos.perto.longe.replace('{km}', km))
  }
  if (eu.precisao > 200) {
    avisos.push(textos.perto.precisao.replace('{m}', String(Math.round(eu.precisao / 50) * 50)))
  }
  return avisos
}
