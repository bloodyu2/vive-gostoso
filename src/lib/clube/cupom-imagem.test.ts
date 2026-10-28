import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { ALTURA, ALTURA_COM_FOTO, LARGURA, caminhoDoQr, encurtar, imagemDoCupom, type DadosCupom, type RotulosCupom } from './cupom-imagem'

const dados: DadosCupom = {
  negocio: 'Gostoso Expedições',
  beneficio: '5% de desconto no Pix ou em espécie, em qualquer passeio.',
  nome: 'Ana Maria Souza',
  codigo: '7K4Q9XMB',
  expiraEm: '2026-12-05',
  urlVerificacao: 'https://www.vivegostoso.com.br/clube/v/' + 'a1'.repeat(32),
}
const rotulos: RotulosCupom = {
  marca: 'Vive Gostoso',
  titulo: 'Passaporte Gostoso',
  para: 'Para',
  codigo: 'Código',
  validoAte: 'Válido até',
  umaCompra: 'Válido para uma compra',
  mostre: 'Mostre este cupom no estabelecimento.',
  locale: 'pt-BR',
}

describe('caminhoDoQr', () => {
  it('gera um quadrado de módulos e um caminho com traços', () => {
    const { d, modulos } = caminhoDoQr(dados.urlVerificacao)
    expect(modulos).toBeGreaterThanOrEqual(25)
    expect(modulos).toBeLessThanOrEqual(61)
    expect(d.startsWith('M')).toBe(true)
    expect(d.length).toBeGreaterThan(500)
  })
  it('o mesmo endereço dá sempre o mesmo desenho; outro endereço, outro', () => {
    expect(caminhoDoQr('https://a.test/x').d).toBe(caminhoDoQr('https://a.test/x').d)
    expect(caminhoDoQr('https://a.test/x').d).not.toBe(caminhoDoQr('https://a.test/y').d)
  })
})

describe('encurtar', () => {
  it('não mexe no que cabe e corta o resto com reticências, de preferência numa palavra inteira', () => {
    expect(encurtar('curto', 10)).toBe('curto')
    const cortado = encurtar('uma frase bem comprida para cortar no meio de uma palavra qualquer', 30)
    expect(cortado.length).toBeLessThanOrEqual(30)
    expect(cortado.endsWith('…')).toBe(true)
    expect(cortado).not.toMatch(/\s…$/)
  })
  it('espaços repetidos viram um só', () => {
    expect(encurtar('a   b\n c', 20)).toBe('a b c')
  })
})

describe('imagemDoCupom', () => {
  it('devolve um PNG do tamanho do bilhete, do tipo image/png', async () => {
    const res = await imagemDoCupom(dados, rotulos)
    expect(res.headers.get('content-type')).toBe('image/png')
    const bytes = new Uint8Array(await res.arrayBuffer())
    expect(Array.from(bytes.slice(0, 8))).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    const dv = new DataView(bytes.buffer, bytes.byteOffset)
    expect(dv.getUint32(16)).toBe(LARGURA)
    expect(dv.getUint32(20)).toBe(ALTURA)
    expect(bytes.length).toBeGreaterThan(20_000)
  }, 60_000)

  it('com foto o bilhete cresce para a altura com foto; sem foto fica como sempre', async () => {
    const foto = `data:image/jpeg;base64,${(
      await sharp({ create: { width: 968, height: 400, channels: 3, background: { r: 30, g: 120, b: 160 } } }).jpeg().toBuffer()
    ).toString('base64')}`
    const res = await imagemDoCupom({ ...dados, foto }, rotulos)
    const bytes = new Uint8Array(await res.arrayBuffer())
    const dv = new DataView(bytes.buffer, bytes.byteOffset)
    expect(dv.getUint32(16)).toBe(LARGURA)
    expect(dv.getUint32(20)).toBe(ALTURA_COM_FOTO)
    const sem = await imagemDoCupom({ ...dados, foto: null }, rotulos)
    const bs = new Uint8Array(await sem.arrayBuffer())
    expect(new DataView(bs.buffer, bs.byteOffset).getUint32(20)).toBe(ALTURA)
  }, 60_000)

  it('nome de negócio e vantagem enormes ainda geram a imagem', async () => {
    const res = await imagemDoCupom(
      { ...dados, negocio: 'Pousada e Restaurante '.repeat(6), beneficio: 'texto '.repeat(60), nome: 'Maria '.repeat(30) },
      rotulos,
    )
    const bytes = new Uint8Array(await res.arrayBuffer())
    expect(bytes.length).toBeGreaterThan(20_000)
  }, 60_000)
})
