import { Link } from 'react-router-dom'
import { Instagram, MapPin } from 'lucide-react'

const LINKS = [
  { to: '/come',      emoji: '🍽️',  label: 'COME.',      sub: 'Restaurantes e gastronomia',   color: 'bg-ocre/10 hover:bg-ocre/20 border-ocre/20' },
  { to: '/fique',     emoji: '🏄',  label: 'FIQUE.',     sub: 'Pousadas e hospedagem',         color: 'bg-teal/10 hover:bg-teal/20 border-teal/20' },
  { to: '/passeie',   emoji: '🪁',  label: 'PASSEIE.',   sub: 'Passeios e esportes náuticos',  color: 'bg-[#3D8B5A]/10 hover:bg-[#3D8B5A]/20 border-[#3D8B5A]/20' },
  { to: '/participe', emoji: '🎉',  label: 'PARTICIPE.', sub: 'Eventos e festivais',           color: 'bg-teal/10 hover:bg-teal/20 border-teal/20' },
  { to: '/explore',   emoji: '🗺️',  label: 'EXPLORE.',   sub: 'Mapa interativo da cidade',     color: 'bg-coral/10 hover:bg-coral/20 border-coral/20' },
  { to: '/contrate',  emoji: '💼',  label: 'CONTRATE.',  sub: 'Serviços locais e vagas',       color: 'bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 border-[#1A1A1A]/10' },
  { to: '/apoie',     emoji: '🤝',  label: 'APOIE.',     sub: 'Fundo público transparente',    color: 'bg-ocre/10 hover:bg-ocre/20 border-ocre/20' },
  { to: '/conheca',   emoji: '🌊',  label: 'CONHEÇA.',   sub: 'São Miguel do Gostoso, RN',     color: 'bg-teal/10 hover:bg-teal/20 border-teal/20' },
]

export default function Bio() {
  return (
    <div className="min-h-screen bg-areia flex flex-col items-center px-5 py-10">

      {/* Avatar + identidade */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center shadow-lg">
          <span className="font-display font-bold text-white text-2xl tracking-tight">VG</span>
        </div>
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl tracking-tight text-[#1A1A1A]">Vive Gostoso</h1>
          <p className="flex items-center justify-center gap-1 text-sm text-[#737373] mt-0.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            São Miguel do Gostoso, RN
          </p>
          <p className="text-sm text-[#3D3D3D] mt-2 max-w-xs leading-snug">
            O guia digital da cidade. Come. Fique. Passeie. <span className="text-teal font-semibold">Vive Gostoso.</span>
          </p>
        </div>
      </div>

      {/* Links principais */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {LINKS.map(({ to, emoji, label, sub, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-150 ${color}`}
          >
            <span className="text-2xl leading-none">{emoji}</span>
            <div className="min-w-0">
              <div className="font-display font-bold text-base tracking-tight text-[#1A1A1A] leading-tight">{label}</div>
              <div className="text-xs text-[#737373] mt-0.5 truncate">{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Instagram */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <a
          href="https://instagram.com/vivegostoso"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] hover:text-teal transition-colors"
        >
          <Instagram className="w-4 h-4" />
          @vivegostoso
        </a>
      </div>

      {/* Rodapé discreto */}
      <p className="mt-10 text-xs text-[#B0A89E]">vivegostoso.com.br</p>
    </div>
  )
}
