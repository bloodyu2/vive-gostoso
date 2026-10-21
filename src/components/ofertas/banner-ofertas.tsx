'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { linkOfertas, linkOfertasWhatsapp, textosOfertas } from '@/lib/ofertas'

const CHAVE = 'vg-banner-ofertas-fechado'

/** Aviso curto do canal de ofertas, dentro da página (sem pop-up, sem faixa fixa).
 *  Some sozinho enquanto a flag ou a URL do canal não existirem, e o visitante
 *  pode dispensá-lo; a escolha fica só no navegador dele. */
export function BannerOfertas() {
  const { i18n } = useTranslation()
  const [fechado, setFechado] = useState(true)
  const href = linkOfertas('site')
  const hrefWhatsapp = linkOfertasWhatsapp('site')

  useEffect(() => {
    let salvo: string | null = null
    try {
      salvo = localStorage.getItem(CHAVE)
    } catch {
      // Armazenamento bloqueado: o aviso aparece e vale só para esta visita.
    }
    queueMicrotask(() => setFechado(salvo === '1'))
  }, [])

  if (!href || fechado) return null
  const t = textosOfertas(i18n.language)

  function fechar() {
    try {
      localStorage.setItem(CHAVE, '1')
    } catch {
      // Sem armazenamento a escolha vale só para esta página.
    }
    setFechado(true)
  }

  return (
    <aside
      aria-label={t.titulo}
      className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-[#C97D2A]/40 bg-[#C97D2A]/10 px-4 py-3"
    >
      <div className="min-w-[14rem] flex-1">
        <p className="font-display text-[1rem] leading-tight font-bold text-[#1A1A1A]">{t.titulo}</p>
        <p className="mt-0.5 text-[0.875rem] leading-snug text-[#3D3D3D]">{t.linha}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#1A1A1A] px-4 text-[0.875rem] font-semibold text-[#F5F2EE] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"
        >
          Telegram
          <ArrowRight className="size-4" aria-hidden />
        </a>
        {hrefWhatsapp && (
          <a
            href={hrefWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#1A1A1A] px-4 text-[0.875rem] font-semibold text-[#1A1A1A] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"
          >
            WhatsApp
            <ArrowRight className="size-4" aria-hidden />
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={fechar}
        aria-label={t.fechar}
        className="grid size-11 shrink-0 place-items-center rounded-xl text-[#3D3D3D] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"
      >
        <X className="size-5" aria-hidden />
      </button>
    </aside>
  )
}
