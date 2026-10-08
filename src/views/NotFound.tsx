'use client'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import Link from 'next/link'
import { MagicCard } from '@/components/magicui/magic-card'

export default function NotFound() {
  const { t } = useTranslation()
  const lp = useLocalePath()

  const LINKS = [
    { to: lp('/come'),      label: 'COME',      sub: t('nav.come') },
    { to: lp('/fique'),     label: 'FIQUE',     sub: t('nav.fique') },
    { to: lp('/passeie'),   label: 'PASSEIE',   sub: t('nav.passeie') },
    { to: lp('/participe'), label: 'PARTICIPE', sub: t('nav.participe') },
  ]

  return (
    <main className="max-w-2xl mx-auto px-5 py-20 text-center">
      <div className="font-display font-bold text-[120px] sm:text-[160px] leading-none text-[#E8E4DF] dark:text-white/10 select-none">
        404
      </div>
      <h1 className="font-display font-bold text-2xl md:text-3xl text-fg-1 -mt-4 mb-3">
        {t('not_found.titulo')}
      </h1>
      <p className="text-fg-3-texto text-base leading-relaxed mb-10">
        {t('not_found.desc')}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {LINKS.map(l => (
          <Link key={l.to} href={l.to} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal">
            <MagicCard className="bg-white dark:bg-card rounded-2xl border border-[#E8E4DF] dark:border-border-1 p-4 min-h-11 hover:shadow-md transition-shadow">
              <div className="font-display font-bold text-xl text-teal">{l.label}</div>
              <div className="text-xs text-fg-3-texto mt-1">{l.sub}</div>
            </MagicCard>
          </Link>
        ))}
      </div>

      <Link href={lp('/')} className="inline-flex items-center gap-2 text-teal font-semibold text-sm hover:underline">
        &larr; {t('not_found.voltar_inicio')}
      </Link>
    </main>
  )
}
