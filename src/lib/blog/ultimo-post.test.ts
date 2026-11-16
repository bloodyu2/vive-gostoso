import { describe, expect, it } from 'vitest'
import { consultarUltimoPost, type ClienteBlog } from './post-publicado'

type Chamada = { tabela?: string; select?: string; filtros: Array<[string, unknown]>; ordem?: [string, unknown]; limite?: number }

function cliente(resultado: { data: unknown; error: { message: string } | null } | 'lanca', chamada: Chamada = { filtros: [] }): ClienteBlog {
  const consulta = {
    select: (s: string) => ((chamada.select = s), consulta),
    eq: (c: string, v: unknown) => (chamada.filtros.push([c, v]), consulta),
    order: (c: string, o: unknown) => ((chamada.ordem = [c, o]), consulta),
    limit: (n: number) => (
      (chamada.limite = n),
      resultado === 'lanca' ? Promise.reject(new Error('rede')) : Promise.resolve(resultado)
    ),
  }
  return { from: (t: string) => ((chamada.tabela = t), consulta) } as unknown as ClienteBlog
}

// Slugs reais de um grupo de traducao (src/data/blog-traducoes.json) e um post sem grupo.
const PT = 'tabua-de-mares-sao-miguel-do-gostoso'
const EN = 'tide-table-sao-miguel-do-gostoso'
const SEM_GRUPO = 'post-sem-grupo-de-teste'
const linha = (slug: string, title: string, tags: string[] | null = ['kitesurf', 'wingfoil', 'vento']) => ({
  slug,
  title,
  tags,
  published_at: '2026-11-13T12:00:00Z',
})

describe('ultimo post da /bio', () => {
  it('consulta so os publicados, do mais novo para o mais antigo', async () => {
    const c: Chamada = { filtros: [] }
    await consultarUltimoPost(cliente({ data: [linha(SEM_GRUPO, 'Novo')], error: null }, c), 'pt')
    expect(c.tabela).toBe('gostoso_blog_posts')
    expect(c.filtros).toEqual([['is_published', true]])
    expect(c.ordem?.[0]).toBe('published_at')
    expect(c.ordem?.[1]).toMatchObject({ ascending: false })
  })

  it('devolve o primeiro da lista: titulo do post e duas tags na linha', async () => {
    const r = await consultarUltimoPost(cliente({ data: [linha(SEM_GRUPO, 'Copa dos Ventos'), linha(PT, 'Antigo')], error: null }), 'pt')
    expect(r).toEqual({ slug: SEM_GRUPO, titulo: 'Copa dos Ventos', linha: 'kitesurf · wingfoil' })
  })

  it('pula o post do outro idioma (o grupo de traducao so aparece no seu idioma)', async () => {
    const dados = [linha(EN, 'Tide table'), linha(PT, 'Guia das mares')]
    expect((await consultarUltimoPost(cliente({ data: dados, error: null }), 'pt'))?.slug).toBe(PT)
    expect((await consultarUltimoPost(cliente({ data: dados, error: null }), 'en'))?.slug).toBe(EN)
  })

  it('post sem tags: linha vazia (a pagina usa o texto padrao do cartao)', async () => {
    const r = await consultarUltimoPost(cliente({ data: [linha(SEM_GRUPO, 'X', null)], error: null }), 'pt')
    expect(r?.linha).toBe('')
  })

  it('sem linha, com erro, com excecao ou sem cliente: null', async () => {
    expect(await consultarUltimoPost(cliente({ data: [], error: null }), 'pt')).toBeNull()
    expect(await consultarUltimoPost(cliente({ data: null, error: { message: 'permission denied' } }), 'pt')).toBeNull()
    expect(await consultarUltimoPost(cliente('lanca'), 'pt')).toBeNull()
    expect(await consultarUltimoPost(null, 'pt')).toBeNull()
  })
})
