import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { entradaSitemapDoPost } from '../../../scripts/blog-traducoes.mjs'

const grupos = JSON.parse(readFileSync(resolve(process.cwd(), 'src/data/blog-traducoes.json'), 'utf-8'))
const B = 'https://www.vivegostoso.com.br'

describe('sitemap do blog com traducoes', () => {
  it('post sem grupo devolve null (segue urlGroup)', () => {
    expect(entradaSitemapDoPost('sao-miguel-gostoso-ou-pipa', grupos, B)).toBeNull()
  })

  it('post de grupo emite so a URL do proprio idioma, com hreflang do grupo', () => {
    const e = entradaSitemapDoPost('tide-table-sao-miguel-do-gostoso', grupos, B)!
    expect(e.loc).toBe(`${B}/en/blog/tide-table-sao-miguel-do-gostoso`)
    expect(e.alternates).toEqual([
      { hreflang: 'pt-BR', href: `${B}/blog/tabua-de-mares-sao-miguel-do-gostoso` },
      { hreflang: 'en', href: `${B}/en/blog/tide-table-sao-miguel-do-gostoso` },
      { hreflang: 'es', href: `${B}/es/blog/tabla-de-mareas-sao-miguel-do-gostoso` },
      { hreflang: 'x-default', href: `${B}/blog/tabua-de-mares-sao-miguel-do-gostoso` },
    ])
  })

  it('post pt de grupo nao tem prefixo', () => {
    expect(entradaSitemapDoPost('tabua-de-mares-sao-miguel-do-gostoso', grupos, B)!.loc).toBe(
      `${B}/blog/tabua-de-mares-sao-miguel-do-gostoso`,
    )
  })
})
