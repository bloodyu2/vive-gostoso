import { afterEach, describe, expect, it, vi } from 'vitest'
import { pagamentosAtivos } from './pagamentos'

describe('pagamentosAtivos', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('fica desligado sem variável (padrão seguro para produção)', () => {
    vi.stubEnv('NEXT_PUBLIC_PAGAMENTOS_ATIVOS', undefined)
    expect(pagamentosAtivos()).toBe(false)
  })

  it('fica desligado com string vazia ou valores que não sejam true', () => {
    for (const v of ['', 'false', '0', 'True', 'TRUE', 'yes', 'on']) {
      vi.stubEnv('NEXT_PUBLIC_PAGAMENTOS_ATIVOS', v)
      expect(pagamentosAtivos(), v).toBe(false)
    }
  })

  it('liga só com o literal true', () => {
    vi.stubEnv('NEXT_PUBLIC_PAGAMENTOS_ATIVOS', 'true')
    expect(pagamentosAtivos()).toBe(true)
  })
})
