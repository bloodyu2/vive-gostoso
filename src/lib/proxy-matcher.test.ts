import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/* QA de 08/11/2026: /swe-worker-*.js (listado no precache do sw.js) e o arquivo de
   verificacao do Google davam 404 em producao porque o proxy de i18n os reescrevia
   para /pt/<arquivo>. Este teste le o matcher do proxy.ts e confere que os arquivos
   estaticos de public/ ficam de fora dele e que as paginas continuam dentro. */
const fonte = readFileSync(resolve(process.cwd(), 'proxy.ts'), 'utf8')
const bruto = /matcher:\s*\[\s*'([^\n]+)',\s*\]/.exec(fonte)?.[1]
// No arquivo o literal tem barras duplas ('\\.'); em tempo de execucao vira '\.'.
const padrao = (bruto ?? '').split('\\\\').join('\\')
const pega = (caminho: string) => new RegExp(`^${padrao}$`).test(caminho)

describe('matcher do proxy (i18n)', () => {
  it('achou o matcher', () => {
    expect(bruto).toBeTruthy()
  })

  it.each([
    '/sw.js',
    '/swe-worker-5c72df51bb1f6ee0.js',
    '/workbox-79213d1a.js',
    '/google342626b66cf2cdc9.html',
    '/manifest.json',
    '/favicon.ico',
    '/images/vitrine/mares.jpg',
    '/_next/static/chunks/main.js',
  ])('%s fica fora do proxy', caminho => {
    expect(pega(caminho)).toBe(false)
  })

  it.each(['/', '/clube', '/en/explore', '/es/blog/algum-post', '/negocio/ore', '/p/03'])('%s passa pelo proxy', caminho => {
    expect(pega(caminho)).toBe(true)
  })
})
