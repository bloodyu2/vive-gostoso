import { describe, it, expect } from 'vitest'
import { versaoOtimizada, LARGURAS_OTIMIZADAS } from './imagem-otimizada'

// KAN-463: foto do Storage do Supabase passa pelo otimizador do Next (WebP/AVIF no
// tamanho da tela). Medido em 29/09/2026: uma capa de 919 KB na home.
const STORAGE = 'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/9d/1790438310073-IMG_8080.jpg'

describe('versaoOtimizada', () => {
  it('foto do Storage publico vira /_next/image com srcSet nas larguras permitidas', () => {
    const v = versaoOtimizada(STORAGE)!
    expect(v.src).toBe(`/_next/image?url=${encodeURIComponent(STORAGE)}&w=1080&q=75`)
    expect(v.srcSet).toBe(LARGURAS_OTIMIZADAS.map((w) => `/_next/image?url=${encodeURIComponent(STORAGE)}&w=${w}&q=75 ${w}w`).join(', '))
    expect(LARGURAS_OTIMIZADAS).toEqual([640, 1080])
  })
  it('fora do Storage do projeto (Unsplash, /images, outro Supabase, bucket privado) fica como esta', () => {
    expect(versaoOtimizada('https://images.unsplash.com/photo-1?w=800')).toBeNull()
    expect(versaoOtimizada('/images/blog/kitesurf.jpg')).toBeNull()
    expect(versaoOtimizada('https://outro.supabase.co/storage/v1/object/public/a.jpg')).toBeNull()
    expect(versaoOtimizada('https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/sign/a.jpg')).toBeNull()
    expect(versaoOtimizada('')).toBeNull()
    expect(versaoOtimizada('nao e url')).toBeNull()
  })
  it('SVG nao passa pelo otimizador (o Next recusa SVG sem dangerouslyAllowSVG)', () => {
    expect(versaoOtimizada('https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/gostoso/logo.svg')).toBeNull()
  })
})
