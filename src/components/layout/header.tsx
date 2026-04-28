import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Compass } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Quatro verbos no topo — os mais usados pela maioria dos visitantes
const NAV_MAIN = [
  { to: '/come',    label: 'COME',    color: 'text-coral' },
  { to: '/fique',   label: 'FIQUE',   color: 'text-teal' },
  { to: '/passeie', label: 'PASSEIE', color: 'text-[#3D8B5A]' },
  { to: '/apoie',   label: 'APOIE',   color: 'text-ocre' },
]

// Menu de descoberta — aparecem ao clicar em "Explorar"
const NAV_DISCOVER = [
  { to: '/explore',  label: 'EXPLORE',   sub: 'Mapa interativo',     color: 'text-coral' },
  { to: '/participe',label: 'PARTICIPE', sub: 'Eventos e festivais',  color: 'text-teal' },
  { to: '/conheca',  label: 'CONHEÇA',   sub: 'A cidade e as praias', color: 'text-[#3D8B5A]' },
  { to: '/contrate', label: 'CONTRATE',  sub: 'Serviços e empregos',  color: 'text-ocre' },
]

// Menu completo para o drawer mobile
const NAV_ALL = [...NAV_MAIN, ...NAV_DISCOVER]

export function Header() {
  const { pathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [discoverOpen, setDiscoverOpen] = useState(false)
  const discoverRef = useRef<HTMLDivElement>(null)

  // Fecha o popover ao clicar fora
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (discoverRef.current && !discoverRef.current.contains(e.target as Node)) {
        setDiscoverOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Fecha popover e drawer ao navegar
  useEffect(() => { setDiscoverOpen(false); setDrawerOpen(false) }, [pathname])

  const isActive = (to: string) =>
    pathname === to || (to !== '/' && pathname.startsWith(to))

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8E4DF]">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between gap-4 px-8 py-2">
          <Link to="/" className="flex-shrink-0">
            <Logo height={60} />
          </Link>

          {/* Main nav */}
          <nav className="flex gap-0.5 items-center">
            {NAV_MAIN.map(v => (
              <Link
                key={v.to}
                to={v.to}
                className={cn(
                  'px-3.5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-150',
                  isActive(v.to)
                    ? cn('bg-teal-light', v.color)
                    : 'text-[#3D3D3D] hover:bg-areia',
                )}
              >
                {v.label}
              </Link>
            ))}

            {/* Discover popover */}
            <div className="relative ml-1" ref={discoverRef}>
              <button
                onClick={() => setDiscoverOpen(o => !o)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-150',
                  discoverOpen || NAV_DISCOVER.some(v => isActive(v.to))
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#3D3D3D] hover:bg-areia',
                )}
              >
                <Compass className="w-3.5 h-3.5" />
                Explorar
              </button>

              {discoverOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8E4DF] shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-2.5 border-b border-[#F5F2EE]">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#737373]">Explorar a cidade</span>
                  </div>
                  {NAV_DISCOVER.map(v => (
                    <Link
                      key={v.to}
                      to={v.to}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 hover:bg-areia transition-colors',
                        isActive(v.to) && 'bg-areia',
                      )}
                    >
                      <div>
                        <div className={cn('text-sm font-bold', v.color)}>{v.label}</div>
                        <div className="text-xs text-[#737373] mt-0.5">{v.sub}</div>
                      </div>
                      <svg className="w-4 h-4 text-[#C4BFBA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <Link to="/cadastre" className="flex-shrink-0">
            <Button variant="primary">Cadastre seu negócio</Button>
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center justify-between px-5 py-3">
          <div className="w-10" />
          <Link to="/" onClick={() => setDrawerOpen(false)}>
            <Logo height={52} />
          </Link>
          <button
            onClick={() => setDrawerOpen(o => !o)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-areia transition-colors"
            aria-label="Menu"
          >
            {drawerOpen ? <X className="w-5 h-5 text-[#1A1A1A]" /> : <Menu className="w-5 h-5 text-[#1A1A1A]" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-[69px]" onClick={() => setDrawerOpen(false)}>
          <div className="bg-white border-b border-[#E8E4DF] shadow-xl" onClick={e => e.stopPropagation()}>
            <nav className="px-5 py-4 space-y-1">
              {NAV_ALL.map(v => (
                <Link
                  key={v.to}
                  to={v.to}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all',
                    isActive(v.to)
                      ? cn('bg-teal-light', v.color)
                      : 'text-[#3D3D3D] hover:bg-areia',
                  )}
                >
                  {v.label}
                </Link>
              ))}
            </nav>
            <div className="px-5 pb-5">
              <Link to="/cadastre" onClick={() => setDrawerOpen(false)}>
                <Button variant="primary" className="w-full">Cadastre seu negócio</Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 bg-black/20 backdrop-blur-sm h-full" />
        </div>
      )}
    </>
  )
}
