import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { PREFIXO } from '@/lib/imagem-otimizada'
import { enderecoDaFoto, fotoParaCupom } from './cupom-foto'

const SITE = 'https://www.vivegostoso.com.br'

async function imagem(formato: 'jpeg' | 'png' | 'webp', w = 1600, h = 1000) {
  const base = sharp({ create: { width: w, height: h, channels: 3, background: { r: 200, g: 120, b: 40 } } })
  return formato === 'jpeg' ? base.jpeg().toBuffer() : formato === 'png' ? base.png().toBuffer() : base.webp().toBuffer()
}
const resposta = (corpo: Buffer | string, tipo: string, status = 200) =>
  new Response(corpo as BodyInit, { status, headers: { 'content-type': tipo } })

describe('enderecoDaFoto', () => {
  it('aceita o Storage do projeto e caminho do próprio site', () => {
    expect(enderecoDaFoto(`${PREFIXO}business-photos/x/a.jpg`, SITE)).toBe(`${PREFIXO}business-photos/x/a.jpg`)
    expect(enderecoDaFoto('/negocios/biscoitos-damy/ambiente.jpg', SITE)).toBe(`${SITE}/negocios/biscoitos-damy/ambiente.jpg`)
  })
  it('recusa qualquer outro endereço', () => {
    for (const c of [
      'https://evil.test/a.jpg',
      'http://169.254.169.254/latest/meta-data',
      'http://localhost:3000/x.jpg',
      '//evil.test/a.jpg',
      '/../etc/passwd',
      '/negocios/../../x.jpg',
      'data:image/png;base64,AAAA',
      'file:///c:/x.jpg',
      '/negocios/a b.jpg',
      '',
      null,
      undefined,
    ]) {
      expect(enderecoDaFoto(c, SITE), String(c)).toBeNull()
    }
  })
})

describe('fotoParaCupom', () => {
  it('JPEG, PNG e WebP viram JPEG do tamanho da faixa', async () => {
    for (const f of ['jpeg', 'png', 'webp'] as const) {
      const buscar = async () => resposta(await imagem(f), `image/${f}`)
      const uri = await fotoParaCupom(`${PREFIXO}b/a.${f}`, SITE, buscar)
      expect(uri, f).toMatch(/^data:image\/jpeg;base64,/)
      const meta = await sharp(Buffer.from(uri!.split(',')[1], 'base64')).metadata()
      expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', 968, 400])
    }
  })
  it('endereço não permitido nem chega a baixar', async () => {
    let chamadas = 0
    const buscar = async () => {
      chamadas++
      return resposta(await imagem('jpeg'), 'image/jpeg')
    }
    expect(await fotoParaCupom('https://evil.test/a.jpg', SITE, buscar)).toBeNull()
    expect(chamadas).toBe(0)
  })
  it('falha de rede, 404, tipo errado, vazio e arquivo que não é imagem dão null, sem estourar', async () => {
    const url = `${PREFIXO}b/a.jpg`
    expect(await fotoParaCupom(url, SITE, async () => resposta('x', 'image/jpeg', 404))).toBeNull()
    expect(await fotoParaCupom(url, SITE, async () => resposta('<html>', 'text/html'))).toBeNull()
    expect(await fotoParaCupom(url, SITE, async () => resposta(Buffer.alloc(0), 'image/jpeg'))).toBeNull()
    expect(await fotoParaCupom(url, SITE, async () => resposta('isto nao e imagem', 'image/jpeg'))).toBeNull()
    expect(await fotoParaCupom(url, SITE, async () => { throw new Error('rede') })).toBeNull()
  })
})
