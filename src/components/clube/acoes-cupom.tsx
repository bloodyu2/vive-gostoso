'use client'

import { useState } from 'react'
import { Download, Share2 } from 'lucide-react'

interface Props {
  /** endereco da imagem para mostrar e compartilhar */
  urlImagem: string
  /** o mesmo endereco com ?baixar=1: o servidor manda salvar em vez de abrir */
  urlDownload: string
  nomeArquivo: string
  textos: {
    baixar: string
    compartilhar: string
    link_copiado: string
    compartilhar_texto: string
  }
}

/** Baixar e compartilhar o cupom. O download e um link de verdade (cabecalho
 *  Content-Disposition), que funciona em qualquer celular. Compartilhar usa o menu do
 *  aparelho com o arquivo da imagem quando ele deixa, e cai no endereco ou na copia
 *  do endereco quando nao. */
export function AcoesCupom({ urlImagem, urlDownload, nomeArquivo, textos }: Props) {
  const [aviso, setAviso] = useState<string | null>(null)

  async function compartilhar() {
    setAviso(null)
    try {
      const resposta = await fetch(urlImagem)
      const blob = await resposta.blob()
      const arquivo = new File([blob], nomeArquivo, { type: 'image/png' })
      if (navigator.canShare?.({ files: [arquivo] })) {
        await navigator.share({ files: [arquivo], text: textos.compartilhar_texto })
        return
      }
      if (navigator.share) {
        await navigator.share({ text: textos.compartilhar_texto, url: window.location.href })
        return
      }
      await navigator.clipboard.writeText(window.location.href)
      setAviso(textos.link_copiado)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return // a pessoa fechou o menu
      try {
        await navigator.clipboard.writeText(window.location.href)
        setAviso(textos.link_copiado)
      } catch {
        /* sem area de transferencia: nada a fazer */
      }
    }
  }

  return (
    <div className="clube-pilha">
      <a className="clube-btn clube-btn--mostarda clube-btn--cheio" href={urlDownload} download={nomeArquivo}>
        <Download size={18} aria-hidden />
        {textos.baixar}
      </a>
      <button type="button" className="clube-btn clube-btn--contorno clube-btn--cheio" onClick={compartilhar}>
        <Share2 size={18} aria-hidden />
        {textos.compartilhar}
      </button>
      <p className="clube-regra" role="status" style={{ minHeight: '1.25rem', margin: 0 }}>
        {aviso}
      </p>
    </div>
  )
}
