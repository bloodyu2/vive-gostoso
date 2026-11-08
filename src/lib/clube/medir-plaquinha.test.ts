import { afterEach, describe, expect, it, vi } from 'vitest'
import { eventoPlaquinha, parametrosDoClique } from './medir-plaquinha'

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
