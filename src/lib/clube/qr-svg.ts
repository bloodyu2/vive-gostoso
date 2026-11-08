// QR em SVG para o navegador (aba "Plaquinha QR" do painel). O de src/lib/clube/cupom-imagem.ts
// vive num arquivo que importa node:fs e next/og, entao nao pode ir para o cliente; este so
// depende do qrcode-generator.

import qrcode from 'qrcode-generator'

/** Margem de silencio em modulos: o minimo que a norma do QR pede para qualquer leitor achar o desenho. */
export const MARGEM_QR = 4

/** O QR como um caminho SVG unico (uma forma so, em modulos), sem a margem. */
export function caminhoDoQr(url: string): { d: string; modulos: number } {
  const qr = qrcode(0, 'M')
  qr.addData(url)
  qr.make()
  const n = qr.getModuleCount()
  let d = ''
  for (let r = 0; r < n; r++) {
    let c = 0
    while (c < n) {
      if (qr.isDark(r, c)) {
        const ini = c
        while (c < n && qr.isDark(r, c)) c++
        d += `M${ini + MARGEM_QR} ${r + MARGEM_QR}h${c - ini}v1h-${c - ini}z`
      } else {
        c++
      }
    }
  }
  return { d, modulos: n }
}

function escaparXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** O arquivo .svg do QR: fundo branco, modulos pretos e a margem de silencio. `titulo` vira o
 *  <title> do arquivo (o que leitor de tela le). */
export function svgDoQr(url: string, titulo = ''): string {
  const { d, modulos } = caminhoDoQr(url)
  const lado = modulos + MARGEM_QR * 2
  const t = titulo ? `<title>${escaparXml(titulo)}</title>` : ''
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}" width="${lado * 12}" height="${lado * 12}" shape-rendering="crispEdges">` +
    `${t}<rect width="${lado}" height="${lado}" fill="#ffffff"/><path d="${d}" fill="#000000"/></svg>`
  )
}

/** Lado do desenho em modulos, com margem (o viewBox do <svg> que a tela monta). */
export function ladoComMargem(modulos: number): number {
  return modulos + MARGEM_QR * 2
}
