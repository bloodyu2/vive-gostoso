// src/lib/imagem-otimizada.ts
// KAN-463: foto do Storage publico do Supabase servida pelo otimizador do Next
// (/_next/image), no formato moderno e na largura da tela, sem trocar o <img>
// nem o layout. So o que `images.remotePatterns` do next.config ja libera.

const PREFIXO = 'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/'

/** Duas larguras de `deviceSizes` padrao do Next: celular e tela grande. Poucas
 *  de proposito, porque cada combinacao conta como uma transformacao na Vercel. */
export const LARGURAS_OTIMIZADAS = [640, 1080] as const

function url(src: string, w: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`
}

export function versaoOtimizada(src: string): { src: string; srcSet: string } | null {
  if (!src || !src.startsWith(PREFIXO)) return null
  if (/\.svg($|\?)/i.test(src)) return null
  return {
    src: url(src, LARGURAS_OTIMIZADAS[LARGURAS_OTIMIZADAS.length - 1]),
    srcSet: LARGURAS_OTIMIZADAS.map((w) => `${url(src, w)} ${w}w`).join(', '),
  }
}
