import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const LINKS = [
  { to: '/come',      label: 'COME',      sub: 'Restaurantes' },
  { to: '/fique',     label: 'FIQUE',     sub: 'Hospedagem' },
  { to: '/passeie',   label: 'PASSEIE',   sub: 'Passeios' },
  { to: '/participe', label: 'PARTICIPE', sub: 'Eventos' },
]

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <main className="max-w-2xl mx-auto px-5 py-20 text-center">
      <div className="font-display font-bold text-[120px] sm:text-[160px] leading-none text-[#E8E4DF] select-none">
        404
      </div>
      <h1 className="font-display font-bold text-2xl md:text-3xl text-[#1A1A1A] -mt-4 mb-3">
        {t('not_found.titulo')}
      </h1>
      <p className="text-[#737373] text-base leading-relaxed mb-10">
        {t('not_found.desc')}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {LINKS.map(l => (
          <Link key={l.to} to={l.to}
            className="bg-white rounded-2xl border border-[#E8E4DF] p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="font-display font-bold text-xl text-teal">{l.label}</div>
            <div className="text-xs text-[#737373] mt-1">{l.sub}</div>
          </Link>
        ))}
      </div>

      <Link to="/" className="inline-flex items-center gap-2 text-teal font-semibold text-sm hover:underline">
        ← {t('not_found.voltar_inicio')}
      </Link>
    </main>
  )
}
