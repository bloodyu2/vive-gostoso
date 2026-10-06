import { describe, it, expect } from 'vitest'
import { montarCsp } from './csp'

/** O Clarity entra pelo GTM e precisa destes hosts na CSP, senao o navegador
 *  bloqueia o script e a coleta em silencio. Fonte: documentacao da Microsoft,
 *  https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/set-up-clarity */
function diretiva(csp: string, nome: string): string[] {
  const linha = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${nome} `))
  if (!linha) throw new Error(`diretiva ${nome} ausente`)
  return linha.split(/\s+/).slice(1)
}

describe('CSP libera o Microsoft Clarity', () => {
  const csp = montarCsp('teste')

  it('script-src', () => {
    expect(diretiva(csp, 'script-src')).toEqual(
      expect.arrayContaining(['https://www.clarity.ms', 'https://*.clarity.ms']),
    )
  })

  it('connect-src', () => {
    expect(diretiva(csp, 'connect-src')).toEqual(
      expect.arrayContaining(['https://*.clarity.ms', 'https://c.bing.com']),
    )
  })

  it('img-src', () => {
    expect(diretiva(csp, 'img-src')).toEqual(
      expect.arrayContaining(['https://*.clarity.ms', 'https://c.bing.com']),
    )
  })

  it('child-src, que ja existia, ganha o www.clarity.ms', () => {
    expect(diretiva(csp, 'child-src')).toEqual(
      expect.arrayContaining(["'self'", 'blob:', 'https://www.clarity.ms']),
    )
  })

  it('nada do que ja existia saiu', () => {
    expect(diretiva(csp, 'script-src')).toEqual(
      expect.arrayContaining(["'self'", "'nonce-teste'", "'strict-dynamic'", 'https://www.googletagmanager.com']),
    )
    expect(diretiva(csp, 'frame-src')).toEqual(["'none'"])
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain('report-uri /api/csp-report')
  })
})
