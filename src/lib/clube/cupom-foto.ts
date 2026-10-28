// Foto do estabelecimento para o topo da imagem do cupom. A imagem e montada no servidor
// (satori), que so le JPEG e PNG, entao a foto e baixada, reduzida ao tamanho da faixa e
// entregue como data URI. So se baixa do Storage do projeto ou de um caminho do proprio
// site: a capa vem do banco, mas nao vira busca em endereco arbitrario.
import { PREFIXO } from '@/lib/imagem-otimizada'

/** Tamanho da faixa no bilhete (px): a foto sai ja desse tamanho. */
const LARGURA_FAIXA = 968
const ALTURA_FAIXA = 400
const LIMITE_BYTES = 8_000_000

/** Endereco absoluto de onde baixar, ou null se a capa nao for de um lugar permitido. */
export function enderecoDaFoto(capa: string | null | undefined, origemSite: string): string | null {
  const c = (capa ?? '').trim()
  if (!c) return null
  if (c.startsWith(PREFIXO)) return c
  if (c.startsWith('/') && !c.startsWith('//') && !c.includes('..') && /^\/[A-Za-z0-9._\-/%]+$/.test(c)) {
    return `${origemSite}${c}`
  }
  return null
}

type Buscar = (url: string, init?: RequestInit) => Promise<Response>

async function carregarSharp() {
  try {
    return (await import('sharp')).default
  } catch {
    return null
  }
}

/** A foto como data URI JPEG do tamanho da faixa; null se nao deu (o cupom sai sem foto). */
export async function fotoParaCupom(
  capa: string | null | undefined,
  origemSite: string,
  buscar: Buscar = fetch,
): Promise<string | null> {
  const url = enderecoDaFoto(capa, origemSite)
  if (!url) return null
  try {
    const r = await buscar(url, { signal: AbortSignal.timeout(4000) })
    if (!r.ok) return null
    const tipo = (r.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
    if (tipo && !tipo.startsWith('image/')) return null
    const bruto = Buffer.from(await r.arrayBuffer())
    if (bruto.length === 0 || bruto.length > LIMITE_BYTES) return null
    const sharp = await carregarSharp()
    if (!sharp) {
      // sem o conversor: JPEG e PNG o satori le como vieram; WebP e o resto ficam de fora
      return tipo === 'image/jpeg' || tipo === 'image/png' ? `data:${tipo};base64,${bruto.toString('base64')}` : null
    }
    // arquivo que nao e imagem (ou corrompido) estoura aqui e cai no catch de fora: sem foto
    const jpeg = await sharp(bruto)
      .rotate()
      .resize(LARGURA_FAIXA, ALTURA_FAIXA, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`
  } catch {
    return null
  }
}
