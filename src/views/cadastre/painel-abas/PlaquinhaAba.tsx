'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Download, ExternalLink, MessageCircle } from 'lucide-react'
import type { BusinessSummary } from '@/hooks/useMyBusinesses'
import { codigosDaPlaquinha, urlDaPlaquinha } from '@/lib/clube/painel-abas'
import { caminhoDoQr, ladoComMargem, svgDoQr } from '@/lib/clube/qr-svg'
import { OFFICIAL_WHATSAPP, buildWhatsAppLink } from '@/lib/whatsapp'

function baixarSvg(nome: string, conteudo: string) {
  const blob = new Blob([conteudo], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function CartaoDaPlaquinha({ codigo, negocio }: { codigo: string; negocio: BusinessSummary }) {
  const { t } = useTranslation('painel')
  const [copiado, setCopiado] = useState(false)
  const url = urlDaPlaquinha(codigo)
  const { d, modulos } = caminhoDoQr(url)
  const lado = ladoComMargem(modulos)
  const descricao = t('abas.plaquinha_qr_alt', { codigo, negocio: negocio.name })

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* sem permissao de area de transferencia: o endereco continua escrito na tela, e so selecionar */
    }
  }

  return (
    <li className="bg-white border border-[#E8E4DF] rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
      <svg
        viewBox={`0 0 ${lado} ${lado}`}
        role="img"
        aria-label={descricao}
        shapeRendering="crispEdges"
        className="painel-qr flex-shrink-0"
      >
        <rect width={lado} height={lado} fill="#ffffff" />
        <path d={d} fill="#000000" />
      </svg>

      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-semibold text-[#1A1A1A]">
          {t('abas.plaquinha_codigo', { codigo })}
        </h3>
        <p className="text-xs text-fg-3-texto mt-2 font-medium">{t('abas.plaquinha_endereco')}</p>
        <p className="text-sm text-[#1A1A1A] font-mono break-all select-all">{url}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl text-sm font-semibold bg-teal text-white hover:bg-teal/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            {t('abas.plaquinha_abrir')}
          </a>
          <button
            type="button"
            onClick={copiar}
            className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl text-sm font-semibold border border-[#E8E4DF] text-[#1A1A1A] hover:border-teal hover:text-teal transition-colors"
          >
            {copiado ? <Check className="w-4 h-4 text-teal" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            {copiado ? t('abas.plaquinha_copiado') : t('abas.plaquinha_copiar')}
          </button>
          <button
            type="button"
            onClick={() => baixarSvg(`qr-plaquinha-${codigo}.svg`, svgDoQr(url, descricao))}
            className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl text-sm font-semibold border border-[#E8E4DF] text-[#1A1A1A] hover:border-teal hover:text-teal transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            {t('abas.plaquinha_baixar')}
          </button>
        </div>
        <span role="status" className="sr-only">
          {copiado ? t('abas.plaquinha_copiado') : ''}
        </span>
      </div>
    </li>
  )
}

/** Aba Plaquinha QR: a pagina /p/NN do negocio (a que abre quando alguem le o QR do balcao) e o
 *  QR dela. O codigo vem do mapa de src/lib/plaquinhas.ts; negocio sem plaquinha ve como pedir. */
export function PlaquinhaAba({ negocio }: { negocio: BusinessSummary }) {
  const { t } = useTranslation('painel')
  const codigos = codigosDaPlaquinha(negocio.slug)

  return (
    <section aria-labelledby="plaquinha-titulo">
      <h2 id="plaquinha-titulo" className="font-display text-lg font-semibold text-[#1A1A1A]">
        {t('abas.plaquinha_titulo')}
      </h2>
      <p className="text-sm text-fg-3-texto mt-1 mb-5">{t('abas.plaquinha_sub', { negocio: negocio.name })}</p>

      {codigos.length > 0 ? (
        <ul className="space-y-4">
          {codigos.map((c) => (
            <CartaoDaPlaquinha key={c} codigo={c} negocio={negocio} />
          ))}
        </ul>
      ) : (
        <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
          <p className="text-sm text-fg-3-texto">{t('abas.plaquinha_sem')}</p>
          <a
            href={buildWhatsAppLink(OFFICIAL_WHATSAPP, t('abas.plaquinha_msg_whatsapp', { negocio: negocio.name }))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl text-sm font-semibold bg-teal text-white hover:bg-teal/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            {t('abas.plaquinha_falar')}
          </a>
        </div>
      )}
    </section>
  )
}
