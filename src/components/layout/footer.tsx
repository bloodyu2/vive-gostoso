import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/logo'

const MODULOS = [
  { to: '/come',    label: 'COME' },
  { to: '/fique',   label: 'FIQUE' },
  { to: '/passeie', label: 'PASSEIE' },
  { to: '/explore', label: 'EXPLORE' },
]
const CIDADE = [
  { to: '/conheca',  label: 'CONHEÇA' },
  { to: '/participe',label: 'PARTICIPE' },
  { to: '/apoie',    label: 'APOIE' },
  { to: '/contrate', label: 'CONTRATE' },
]
const NEGOCIOS = [
  { to: '/cadastre',        label: 'Cadastrar' },
  { to: '/cadastre/painel', label: 'Painel' },
  { to: '/apoie',           label: 'Selo verificado' },
]

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-[#E6F5F5] px-5 md:px-8 pt-12 pb-8 mt-16">
      <div className="max-w-6xl mx-auto flex justify-between items-start flex-wrap gap-8">

        {/* Brand */}
        <div className="max-w-xs">
          <Logo height={32} dark />
          <p className="text-sm opacity-70 mt-3 leading-relaxed">
            A infraestrutura digital de São Miguel do Gostoso.<br />A plataforma é da cidade.
          </p>
        </div>

        {/* Nav columns */}
        <div className="flex flex-wrap gap-8 sm:gap-12 text-sm">
          <div>
            <div className="font-semibold mb-3 text-white">Módulos</div>
            <nav className="flex flex-col gap-1.5">
              {MODULOS.map(v => (
                <Link key={v.to} to={v.to} className="opacity-70 hover:opacity-100 hover:text-teal-light transition-opacity leading-loose">
                  {v.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <div className="font-semibold mb-3 text-white">Cidade</div>
            <nav className="flex flex-col gap-1.5">
              {CIDADE.map(v => (
                <Link key={v.to} to={v.to} className="opacity-70 hover:opacity-100 hover:text-teal-light transition-opacity leading-loose">
                  {v.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <div className="font-semibold mb-3 text-white">Negócios</div>
            <nav className="flex flex-col gap-1.5">
              {NEGOCIOS.map(v => (
                <Link key={v.to} to={v.to} className="opacity-70 hover:opacity-100 hover:text-teal-light transition-opacity leading-loose">
                  {v.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="border-t border-[#3D3D3D] mt-10 pt-5 text-xs max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="opacity-50">vivegostoso.com.br · São Miguel do Gostoso, RN</span>
        <a
          href="https://balaio.net"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 26 C6 26 4 16 16 10 C28 4 28 14 22 18 C16 22 14 18 16 14 C18 10 22 12 20 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="20" cy="16" r="2" fill="currentColor"/>
          </svg>
          <span className="font-medium">Feito pela Balaio</span>
        </a>
      </div>
    </footer>
  )
}
