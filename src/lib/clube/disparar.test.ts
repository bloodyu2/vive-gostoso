import { describe, expect, it } from 'vitest'
import { disparar } from './disparar'

/** O builder do supabase-js é "preguiçoso": a requisição só sai quando alguém chama
 *  .then(). `void builder` não dispara nada. Foi o que deixou vistas e visitas em zero
 *  na primeira conferência em produção. */
function preguicoso() {
  const estado = { enviado: 0 }
  const builder: PromiseLike<unknown> = {
    then(ok, falha) {
      estado.enviado++
      return Promise.resolve({ error: null }).then(ok, falha)
    },
  }
  return { builder, estado }
}

describe('disparar', () => {
  it('manda a requisição de um builder preguiçoso', () => {
    const { builder, estado } = preguicoso()
    disparar(builder)
    expect(estado.enviado).toBe(1)
  })

  it('engole a falha: o contador nunca derruba a página', async () => {
    const falho: PromiseLike<unknown> = {
      then(_ok, falha) {
        return Promise.reject(new Error('rede')).then(undefined, falha)
      },
    }
    expect(() => disparar(falho)).not.toThrow()
    await new Promise((r) => setTimeout(r, 0))
  })
})
