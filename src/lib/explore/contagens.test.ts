import { describe, expect, it } from 'vitest'
import { contarEventosFuturos, contarPorVerbo, lerContagens, type ClienteContagens } from './contagens'

type Resposta = { data?: unknown; count?: number | null; error?: { message: string } | null }

/** Cliente falso: cada tabela devolve a resposta dada, e o encadeamento
 *  (select/eq/in/gte) so registra os filtros. */
function clienteFalso(respostas: Record<string, Resposta | (() => never)>, filtros: string[] = []): ClienteContagens {
  return {
    from(tabela: string) {
      const r = respostas[tabela]
      const q: Record<string, unknown> = {}
      for (const m of ['select', 'eq', 'in', 'gte']) {
        q[m] = (...args: unknown[]) => {
          filtros.push(`${tabela}.${m}(${JSON.stringify(args)})`)
          return q
        }
      }
      q.then = (ok: (v: Resposta) => unknown, falha: (e: unknown) => unknown) => {
        try {
          const v = typeof r === 'function' ? r() : r
          return Promise.resolve({ error: null, ...v }).then(ok, falha)
        } catch (e) {
          return Promise.reject(e).then(ok, falha)
        }
      }
      return q
    },
  } as unknown as ClienteContagens
}

describe('contagens da vitrine', () => {
  it('conta negocios ativos e publicados das categorias do verbo', async () => {
    const filtros: string[] = []
    const c = clienteFalso(
      { gostoso_categories: { data: [{ id: 'a' }, { id: 'b' }] }, gostoso_businesses: { count: 23 } },
      filtros,
    )
    expect(await contarPorVerbo(c, 'come')).toBe(23)
    expect(filtros).toContain('gostoso_categories.eq(["verb","come"])')
    expect(filtros).toContain('gostoso_businesses.eq(["active",true])')
    expect(filtros).toContain('gostoso_businesses.eq(["is_published",true])')
    expect(filtros).toContain('gostoso_businesses.in(["category_id",["a","b"]])')
  })

  it('verbo sem categoria da zero sem consultar negocios', async () => {
    const filtros: string[] = []
    const c = clienteFalso({ gostoso_categories: { data: [] } }, filtros)
    expect(await contarPorVerbo(c, 'fique')).toBe(0)
    expect(filtros.some((f) => f.startsWith('gostoso_businesses'))).toBe(false)
  })

  it('erro do banco, excecao ou cliente ausente viram null', async () => {
    expect(await contarPorVerbo(null, 'come')).toBeNull()
    expect(await contarPorVerbo(clienteFalso({ gostoso_categories: { error: { message: 'x' } } }), 'come')).toBeNull()
    expect(
      await contarPorVerbo(clienteFalso({ gostoso_categories: { data: [{ id: 'a' }] }, gostoso_businesses: { error: { message: 'x' } } }), 'come'),
    ).toBeNull()
    expect(
      await contarPorVerbo(clienteFalso({ gostoso_categories: () => { throw new Error('rede') } }), 'come'),
    ).toBeNull()
    expect(await contarEventosFuturos(clienteFalso({ gostoso_events: { error: { message: 'x' } } }), new Date())).toBeNull()
  })

  it('eventos: ativos que ainda nao terminaram', async () => {
    const filtros: string[] = []
    const agora = new Date('2026-09-27T12:00:00Z')
    const c = clienteFalso({ gostoso_events: { count: 5 } }, filtros)
    expect(await contarEventosFuturos(c, agora)).toBe(5)
    expect(filtros).toContain('gostoso_events.eq(["active",true])')
    expect(filtros).toContain(`gostoso_events.gte(["ends_at","${agora.toISOString()}"])`)
  })

  it('lerContagens junta tudo', async () => {
    const c = clienteFalso({
      gostoso_categories: { data: [{ id: 'a' }] },
      gostoso_businesses: { count: 7 },
      gostoso_events: { count: 3 },
    })
    expect(await lerContagens(c, new Date())).toEqual({ come: 7, fique: 7, passeie: 7, participe: 3 })
  })
})
