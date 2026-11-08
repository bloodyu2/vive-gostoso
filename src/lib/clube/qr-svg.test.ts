import { describe, expect, it } from 'vitest'
import { MARGEM_QR, caminhoDoQr, ladoComMargem, svgDoQr } from './qr-svg'

const URL_P07 = 'https://www.vivegostoso.com.br/p/07'

describe('QR da plaquinha em SVG', () => {
  it('o tamanho do QR segue a norma (21 + 4 por versao) e o caminho nao vem vazio', () => {
    const { d, modulos } = caminhoDoQr(URL_P07)
    expect(modulos).toBeGreaterThanOrEqual(21)
    expect((modulos - 17) % 4).toBe(0)
    expect(d.length).toBeGreaterThan(100)
    expect(d.startsWith('M')).toBe(true)
  })

  it('nenhum modulo escuro cai dentro da margem de silencio', () => {
    const { d, modulos } = caminhoDoQr(URL_P07)
    const tracos = [...d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)].map((m) => ({
      x: Number(m[1]),
      y: Number(m[2]),
      w: Number(m[3]),
    }))
    expect(tracos.length).toBeGreaterThan(10)
    for (const t of tracos) {
      expect(t.x).toBeGreaterThanOrEqual(MARGEM_QR)
      expect(t.y).toBeGreaterThanOrEqual(MARGEM_QR)
      expect(t.x + t.w).toBeLessThanOrEqual(MARGEM_QR + modulos)
      expect(t.y + 1).toBeLessThanOrEqual(MARGEM_QR + modulos)
    }
  })

  it('o arquivo SVG tem fundo branco, o viewBox com margem e o titulo escapado', () => {
    const svg = svgDoQr(URL_P07, 'Plaquinha 07 <Casa & "Mar">')
    const { modulos } = caminhoDoQr(URL_P07)
    const lado = ladoComMargem(modulos)
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
    expect(svg).toContain(`viewBox="0 0 ${lado} ${lado}"`)
    expect(svg).toContain('fill="#ffffff"')
    expect(svg).toContain('<title>Plaquinha 07 &lt;Casa &amp; &quot;Mar&quot;&gt;</title>')
    expect(svg.endsWith('</svg>')).toBe(true)
  })

  it('o mesmo endereco gera sempre o mesmo desenho; enderecos diferentes, desenhos diferentes', () => {
    expect(svgDoQr(URL_P07)).toBe(svgDoQr(URL_P07))
    expect(svgDoQr(URL_P07)).not.toBe(svgDoQr('https://www.vivegostoso.com.br/p/08'))
  })

  it('sem titulo nao escreve <title>', () => {
    expect(svgDoQr(URL_P07)).not.toContain('<title>')
  })
})
