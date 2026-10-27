import { describe, expect, it } from 'vitest'
import { estadoDePublicacaoDoAdmin } from '@/lib/negocio-visibilidade'

describe('estadoDePublicacaoDoAdmin', () => {
  it('publicar liga as duas colunas e ja verifica o negocio', () => {
    expect(estadoDePublicacaoDoAdmin(true)).toEqual({ is_published: true, active: true, is_verified: true })
  })

  it('despublicar desliga as duas colunas, para a decisao do admin valer sobre a do dono', () => {
    expect(estadoDePublicacaoDoAdmin(false)).toEqual({ is_published: false, active: false })
    expect(estadoDePublicacaoDoAdmin(false)).not.toHaveProperty('is_verified')
  })
})
