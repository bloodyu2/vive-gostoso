import { describe, it, expect } from 'vitest'
import {
  aplicarConsentimento,
  aplicarEscolhaSalva,
  CHAVE_CONSENTIMENTO,
  type JanelaDeMedicao,
} from './consentimento'

/** Janela falsa: guarda as chamadas a gtag e a clarity sem carregar nada do
 *  Google nem da Microsoft. `clarityCarregado` simula o script do Clarity ja na
 *  pagina; sem ele, quem cria `window.clarity` e o codigo testado. */
function janela(opcoes: { salvo?: string | null; clarityCarregado?: boolean; semGtag?: boolean } = {}) {
  const gtag: unknown[][] = []
  const clarity: unknown[][] = []
  const w: JanelaDeMedicao = {
    localStorage: {
      getItem: (k: string) => (k === CHAVE_CONSENTIMENTO ? (opcoes.salvo ?? null) : null),
    },
  }
  if (!opcoes.semGtag) w.gtag = (...args: unknown[]) => void gtag.push(args)
  if (opcoes.clarityCarregado) w.clarity = (...args: unknown[]) => void clarity.push(args)
  return { w, gtag, clarity }
}

const CONCEDIDO = { ad_Storage: 'granted', analytics_Storage: 'granted' }
const NEGADO = { ad_Storage: 'denied', analytics_Storage: 'denied' }

describe('consentimento do Clarity (consentv2)', () => {
  it('aceitar avisa o Clarity com granted, alem do gtag', () => {
    const { w, gtag, clarity } = janela({ clarityCarregado: true })
    aplicarConsentimento(true, w)
    expect(clarity).toEqual([['consentv2', CONCEDIDO]])
    expect(gtag).toEqual([
      ['consent', 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      }],
    ])
  })

  it('recusar avisa o Clarity com denied, e o gtag tambem', () => {
    const { w, gtag, clarity } = janela({ clarityCarregado: true })
    aplicarConsentimento(false, w)
    expect(clarity).toEqual([['consentv2', NEGADO]])
    expect(gtag).toEqual([
      ['consent', 'update', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      }],
    ])
  })

  it('Clarity ainda nao carregado: a chamada fica na fila padrao, sem se perder', () => {
    const { w } = janela()
    expect(w.clarity).toBeUndefined()
    aplicarConsentimento(true, w)
    expect(typeof w.clarity).toBe('function')
    const fila = (w.clarity as unknown as { q: IArguments[] }).q
    expect(fila).toHaveLength(1)
    expect(Array.from(fila[0])).toEqual(['consentv2', CONCEDIDO])

    // Uma segunda chamada usa a mesma fila, nao cria outra.
    aplicarConsentimento(false, w)
    expect((w.clarity as unknown as { q: IArguments[] }).q).toBe(fila)
    expect(Array.from(fila[1])).toEqual(['consentv2', NEGADO])
  })

  it('sem gtag na pagina o Clarity e avisado do mesmo jeito', () => {
    const { w, clarity } = janela({ clarityCarregado: true, semGtag: true })
    aplicarConsentimento(true, w)
    expect(clarity).toEqual([['consentv2', CONCEDIDO]])
  })
})

describe('escolha ja salva, aplicada quando a pagina carrega', () => {
  it('quem ja aceitou tem o aceite reaplicado no gtag e no Clarity', () => {
    const { w, gtag, clarity } = janela({ salvo: 'accepted', clarityCarregado: true })
    aplicarEscolhaSalva(w)
    expect(clarity).toEqual([['consentv2', CONCEDIDO]])
    expect(gtag[0][2]).toMatchObject({ analytics_storage: 'granted' })
  })

  it('quem recusou continua negado', () => {
    const { w, clarity } = janela({ salvo: 'declined', clarityCarregado: true })
    aplicarEscolhaSalva(w)
    expect(clarity).toEqual([['consentv2', NEGADO]])
  })

  it('sem resposta, o Clarity recebe denied e o gtag fica no padrao negado', () => {
    const { w, gtag, clarity } = janela({ clarityCarregado: true })
    aplicarEscolhaSalva(w)
    expect(clarity).toEqual([['consentv2', NEGADO]])
    expect(gtag).toEqual([])
  })

  it('localStorage bloqueado conta como sem resposta, nunca como aceite', () => {
    const { w, clarity } = janela({ clarityCarregado: true })
    w.localStorage = { getItem: () => { throw new Error('bloqueado') } }
    aplicarEscolhaSalva(w)
    expect(clarity).toEqual([['consentv2', NEGADO]])
  })
})
