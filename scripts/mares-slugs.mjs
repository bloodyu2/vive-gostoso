// Slugs das praias da tabua de mares, lidos de src/data/praias-mares.ts (a
// lista unica). O gerador de sitemap roda em Node puro, sem TypeScript, entao
// le o arquivo como texto. Teste: src/lib/mares/sitemap-mares.test.ts.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function slugsDasPraias(raiz) {
  const fonte = readFileSync(resolve(raiz, 'src/data/praias-mares.ts'), 'utf-8')
  const lista = fonte.slice(fonte.indexOf('export const PRAIAS_MARES'))
  return [...lista.matchAll(/^\s{4}slug: '([a-z0-9-]+)',\r?$/gm)].map((m) => m[1])
}

/** Mesma regra de praiaSemDadoProprio (src/data/praias-mares.ts): so entra no sitemap
 *  a praia com coordenada ou dica; sem nenhum dos dois a pagina fica noindex e fora
 *  daqui. Le cada bloco da lista como texto. */
export function slugsIndexaveis(raiz) {
  const fonte = readFileSync(resolve(raiz, 'src/data/praias-mares.ts'), 'utf-8')
  const ini = fonte.indexOf('export const PRAIAS_MARES')
  const lista = fonte.slice(ini, fonte.indexOf('\n]', ini))
  return lista
    .split(/^ {2}\{\r?$/m)
    .map((bloco) => ({
      slug: bloco.match(/^\s{4}slug: '([a-z0-9-]+)',/m)?.[1],
      proprio: /^\s{4}(lat|dica):/m.test(bloco),
    }))
    .filter((b) => b.slug && b.proprio)
    .map((b) => b.slug)
}

export function rotasMares(raiz) {
  return [
    // Prioridade acima de todas as paginas fixas, menos a home (ordem de 27/09/2026).
    { path: '/explore/mares', freq: 'daily', priority: '0.95' },
    ...slugsIndexaveis(raiz).map((slug) => ({ path: `/explore/mares/${slug}`, freq: 'daily', priority: '0.6' })),
  ]
}
