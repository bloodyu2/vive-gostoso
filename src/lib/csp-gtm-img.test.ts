import { describe, expect, it } from 'vitest'
import { montarCsp } from './csp'

/* QA de 08/11/2026: o GTM pede um pixel em googletagmanager.com a cada pagina e o img-src
   nao listava o host, entao o console da home enchia de erros de CSP. */
describe('CSP libera o pixel do GTM', () => {
  const linha = montarCsp('teste').split(';').map(d => d.trim()).find(d => d.startsWith('img-src '))

  it('img-src lista o googletagmanager.com', () => {
    expect(linha).toContain('https://www.googletagmanager.com')
  })

  it('e nao afrouxa o resto (continua sem curinga)', () => {
    const fontes = (linha ?? '').split(/\s+/)
    expect(fontes).not.toContain('*')
    expect(fontes).not.toContain('https:')
  })
})
