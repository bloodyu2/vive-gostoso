import { afterEach, describe, expect, it, vi } from 'vitest'
import { ACOES_PLAQUINHA, eventoPlaquinha, parametrosDoClique } from './medir-plaquinha'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('medir-plaquinha', () => {
  it('manda o evento ao gtag com o codigo da plaquinha', () => {
    const gtag = vi.fn()
    vi.stubGlobal('window', { gtag })
    eventoPlaquinha('plaquinha_clique', parametrosDoClique('03', 'avaliar', 'Casa Reduto'))
    expect(gtag).toHaveBeenCalledWith('event', 'plaquinha_clique', {
      plaquinha_codigo: '03',
      plaquinha_acao: 'avaliar',
      plaquinha_negocio: 'Casa Reduto',
      origem: 'plaquinha',
      send_to: 'G-Z915DS14EM',
    })
  })

  it('mede a setinha e o convite para seguir o @vivegostoso', () => {
    const gtag = vi.fn()
    vi.stubGlobal('window', { gtag })
    eventoPlaquinha('plaquinha_clique', parametrosDoClique('04', 'conhecer_mais', 'O Jardim do Serido'))
    eventoPlaquinha('plaquinha_clique', parametrosDoClique('04', 'seguir_vive', 'O Jardim do Serido'))
    expect(gtag).toHaveBeenNthCalledWith(1, 'event', 'plaquinha_clique', expect.objectContaining({ plaquinha_acao: 'conhecer_mais', plaquinha_codigo: '04' }))
    expect(gtag).toHaveBeenNthCalledWith(2, 'event', 'plaquinha_clique', expect.objectContaining({ plaquinha_acao: 'seguir_vive' }))
  })

  it('as acoes novas entram junto das antigas, sem repetir', () => {
    expect(ACOES_PLAQUINHA).toEqual(expect.arrayContaining(['avaliar', 'instagram', 'perfil', 'passaporte', 'conhecer_mais', 'seguir_vive']))
    expect(new Set(ACOES_PLAQUINHA).size).toBe(ACOES_PLAQUINHA.length)
  })

  it('sem gtag na pagina nao faz nada e nao quebra', () => {
    vi.stubGlobal('window', {})
    expect(() => eventoPlaquinha('plaquinha_visita', { plaquinha_codigo: '01' })).not.toThrow()
  })

  it('gtag que lanca erro nao derruba a pagina', () => {
    vi.stubGlobal('window', {
      gtag: () => {
        throw new Error('boom')
      },
    })
    expect(() => eventoPlaquinha('plaquinha_visita', { plaquinha_codigo: '01' })).not.toThrow()
  })
})
