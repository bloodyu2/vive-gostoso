import { describe, expect, it } from 'vitest'
import { estadoDePublicacaoDoAdmin } from '@/lib/negocio-visibilidade'

describe('estadoDePublicacaoDoAdmin', () => {
  it('publicar liga as duas colunas', () => {
    expect(estadoDePublicacaoDoAdmin(true)).toEqual({ is_published: true, active: true })
  })

  it('despublicar desliga as duas colunas, para a decisao do admin valer sobre a do dono', () => {
    expect(estadoDePublicacaoDoAdmin(false)).toEqual({ is_published: false, active: false })
  })
})
