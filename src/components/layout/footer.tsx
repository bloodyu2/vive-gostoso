import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/logo'

const MODULOS = [
  { to: '/come',    label: 'COME' },
  { to: '/fique',   label: 'FIQUE' },
  { to: '/passeie', label: 'PASSEIE' },
  { to: '/explore', label: 'EXPLORE' },
]
const CIDADE = [
  { to: '/sobre',    label: 'Sobre o projeto' },
  { to: '/blog',     label: 'Blog' },
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
            Gostoso na palma da mão.<br />A plataforma é da cidade.
          </p>
          <a
            href="https://instagram.com/vivegostoso"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-white/70 hover:text-white transition-colors group"
          >
            <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </span>
            @vivegostoso
          </a>
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
        <span className="opacity-50">
          vivegostoso.com.br · São Miguel do Gostoso, RN ·{' '}
          <a href="mailto:contato@vivegostoso.com.br" className="hover:opacity-100 transition-opacity">
            contato@vivegostoso.com.br
          </a>
        </span>
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
