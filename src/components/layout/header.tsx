import { Link, useLocation } from 'react-router-dom'
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
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E8E4DF] px-8 py-3 flex items-center justify-between gap-6">
      <Link to="/"><Logo height={40} /></Link>
      <nav className="flex gap-1 items-center">
        {NAV.map(v => {
          const active = pathname === v.to || (v.to !== '/' && pathname.startsWith(v.to))
          return (
            <Link key={v.to} to={v.to} className={cn(
              'px-3.5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-150',
              active
                ? cn('bg-teal-light font-semibold', v.color)
                : 'text-[#3D3D3D] hover:bg-areia',
            )}>{v.label}</Link>
          )
        })}
      </nav>
      <Link to="/cadastre">
        <Button variant="primary">Cadastre seu negócio</Button>
      </Link>
    </header>
  )
}
