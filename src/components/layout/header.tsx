import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/',          label: 'INÍCIO',    color: 'text-[#1A1A1A]' },
  { to: '/come',      label: 'COME',      color: 'text-coral' },
  { to: '/fique',     label: 'FIQUE',     color: 'text-teal' },
  { to: '/passeie',   label: 'PASSEIE',   color: 'text-ocre' },
  { to: '/explore',   label: 'EXPLORE',   color: 'text-[#1A1A1A]' },
  { to: '/participe', label: 'PARTICIPE', color: 'text-[#3D8B5A]' },
  { to: '/apoie',     label: 'APOIE',     color: 'text-teal' },
]

export function Header() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8E4DF]">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between gap-6 px-8 py-3">
          <Link to="/"><Logo height={48} /></Link>
          <nav className="flex gap-0.5 items-center">
            {NAV.map(v => {
              const active = pathname === v.to || (v.to !== '/' && pathname.startsWith(v.to))
              return (
                <Link key={v.to} to={v.to} className={cn(
                  'px-3 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-150',
                  active ? cn('bg-teal-light font-semibold', v.color) : 'text-[#3D3D3D] hover:bg-areia',
                )}>{v.label}</Link>
              )
            })}
          </nav>
          <Link to="/cadastre" className="flex-shrink-0">
            <Button variant="primary">Cadastre seu negócio</Button>
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center justify-between px-5 py-3">
          <div className="w-10" />
          <Link to="/" onClick={() => setOpen(false)}><Logo height={44} /></Link>
          <button
            onClick={() => setOpen(o => !o)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-areia transition-colors"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5 text-[#1A1A1A]" /> : <Menu className="w-5 h-5 text-[#1A1A1A]" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 pt-[69px]" onClick={() => setOpen(false)}>
          <div className="bg-white border-b border-[#E8E4DF] shadow-xl" onClick={e => e.stopPropagation()}>
            <nav className="px-5 py-4 space-y-1">
              {NAV.map(v => {
                const active = pathname === v.to || (v.to !== '/' && pathname.startsWith(v.to))
                return (
                  <Link
                    key={v.to} to={v.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all',
                      active ? cn('bg-teal-light font-semibold', v.color) : 'text-[#3D3D3D] hover:bg-areia',
                    )}
                  >{v.label}</Link>
                )
              })}
            </nav>
            <div className="px-5 pb-5">
              <Link to="/cadastre" onClick={() => setOpen(false)}>
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
