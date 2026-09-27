import { describe, expect, it } from 'vitest'
import { consultarPublicado, caminhoDoGuiaMares, SLUG_GUIA_MARES, type ClienteBlog } from './post-publicado'

type Chamada = { tabela?: string; select?: string; filtros: Array<[string, unknown]> }

function cliente(resultado: { data: unknown; error: { message: string } | null } | 'lanca', chamada: Chamada = { filtros: [] }): ClienteBlog {
  const consulta = {
    select: (s: string) => ((chamada.select = s), consulta),
    eq: (c: string, v: unknown) => (chamada.filtros.push([c, v]), consulta),
    maybeSingle: () => (resultado === 'lanca' ? Promise.reject(new Error('rede')) : Promise.resolve(resultado)),
  }
  return { from: (t: string) => ((chamada.tabela = t), consulta) } as unknown as ClienteBlog
}

describe('post publicado', () => {
  it('consulta o slug publicado em gostoso_blog_posts', async () => {
    const c: Chamada = { filtros: [] }
    expect(await consultarPublicado(cliente({ data: { slug: 'x' }, error: null }, c), 'x')).toBe(true)
    expect(c.tabela).toBe('gostoso_blog_posts')
    expect(c.select).toBe('slug')
    expect(c.filtros).toEqual([
      ['slug', 'x'],
      ['is_published', true],
    ])
  })

  it('sem linha, com erro, com excecao ou sem cliente: false', async () => {
    expect(await consultarPublicado(cliente({ data: null, error: null }), 'x')).toBe(false)
    expect(await consultarPublicado(cliente({ data: null, error: { message: 'permission denied' } }), 'x')).toBe(false)
    expect(await consultarPublicado(cliente('lanca'), 'x')).toBe(false)
    expect(await consultarPublicado(null, 'x')).toBe(false)
  })

  it('caminho do guia no idioma, relativo', () => {
    expect(SLUG_GUIA_MARES).toBe('tabua-de-mares-sao-miguel-do-gostoso')
    expect(caminhoDoGuiaMares('pt')).toBe('/blog/tabua-de-mares-sao-miguel-do-gostoso')
    expect(caminhoDoGuiaMares('es')).toBe('/es/blog/tabla-de-mareas-sao-miguel-do-gostoso')
    expect(caminhoDoGuiaMares('en')).toBe('/en/blog/tide-table-sao-miguel-do-gostoso')
  })
})
