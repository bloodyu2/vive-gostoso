import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
    },
  },
}))

describe('useCheckout com pagamentos pausados (KAN-356)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('startCheckout recusa sem chamar a edge function', async () => {
    vi.stubEnv('NEXT_PUBLIC_PAGAMENTOS_ATIVOS', undefined)
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { startCheckout } = await import('./useCheckout')
    await expect(startCheckout('biz', 'associado')).rejects.toThrow(/temporariamente indispon/i)
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('startDonation recusa sem chamar a edge function', async () => {
    vi.stubEnv('NEXT_PUBLIC_PAGAMENTOS_ATIVOS', undefined)
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { startDonation } = await import('./useCheckout')
    await expect(startDonation(2500)).rejects.toThrow(/temporariamente indispon/i)
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
