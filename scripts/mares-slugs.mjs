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

export function rotasMares(raiz) {
  return [
    // Prioridade acima de todas as paginas fixas, menos a home (ordem de 27/09/2026).
    { path: '/explore/mares', freq: 'daily', priority: '0.95' },
    ...slugsDasPraias(raiz).map((slug) => ({ path: `/explore/mares/${slug}`, freq: 'daily', priority: '0.6' })),
  ]
}
