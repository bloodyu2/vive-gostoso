import { describe, expect, it } from 'vitest'
import { prefixarLinksInternos } from './links-do-idioma'

const em = (prefixo: string) => (c: string) => (prefixo ? `${prefixo}${c === '/' ? '' : c}` : c)

describe('prefixarLinksInternos', () => {
  const html = '<p><a href="/fique">stay</a> <a href="/blog/outro-post#x">post</a> <a href="https://balaio.net">fora</a> <a href="/en/come">ja</a> <a href="//cdn.x/y">proto</a> <a href="mailto:a@b.c">m</a></p>'

  it('em ingles poe /en nos links internos sem prefixo', () => {
    const r = prefixarLinksInternos(html, em('/en'))
    expect(r).toContain('href="/en/fique"')
    expect(r).toContain('href="/en/blog/outro-post#x"')
  })

  it('nao mexe em link externo, ja prefixado, protocolo relativo nem mailto', () => {
    const r = prefixarLinksInternos(html, em('/es'))
    expect(r).toContain('href="https://balaio.net"')
    expect(r).toContain('href="/en/come"')
    expect(r).toContain('href="//cdn.x/y"')
    expect(r).toContain('href="mailto:a@b.c"')
  })

  it('em portugues devolve o html igual', () => {
    expect(prefixarLinksInternos(html, em(''))).toBe(html)
  })

  it('nao prefixa api nem imagens', () => {
    const r = prefixarLinksInternos('<a href="/api/x">a</a><a href="/images/a.jpg">b</a>', em('/en'))
    expect(r).toBe('<a href="/api/x">a</a><a href="/images/a.jpg">b</a>')
  })
})
