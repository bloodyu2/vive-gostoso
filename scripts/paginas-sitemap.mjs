// Paginas fixas do sitemap, fora do gerador para o teste poder importar sem
// rodar a geracao (src/lib/explore/sitemap-paginas.test.ts).
//
// ATENCAO: esta lista e escrita a mao, e a mao erra nos dois sentidos. Rota
// nova em app/[lang]/ NAO entra no sitemap sozinha: precisa ser adicionada
// aqui. E rota removida nao sai sozinha: precisa ser tirada daqui.
// A antiga /resolva passou pelos dois lados. Ficou listada por meses sem que a
// rota existisse, servindo 404 para o Google em tres idiomas; depois a rota
// foi criada e passou a servir uma pagina vazia, porque os negocios que
// pertenceriam a ela estavam todos sob o verbo `contrate`. Em 2026-09-07 o
// verbo inteiro saiu do produto.
import { rotasMares } from './mares-slugs.mjs'

export function paginasEstaticas(raiz) {
  return [
    { path: '/',          freq: 'daily',   priority: '1.0' },
    { path: '/come',      freq: 'weekly',  priority: '0.9' },
    { path: '/fique',     freq: 'weekly',  priority: '0.9' },
    { path: '/passeie',   freq: 'weekly',  priority: '0.8' },
    { path: '/explore',   freq: 'weekly',  priority: '0.8' },
    { path: '/explore/mapa', freq: 'weekly', priority: '0.7' },
    { path: '/participe', freq: 'daily',   priority: '0.8' },
    { path: '/conheca',   freq: 'monthly', priority: '0.7' },
    { path: '/apoie',     freq: 'monthly', priority: '0.6' },
    { path: '/contrate',  freq: 'weekly',  priority: '0.7' },
    { path: '/sobre', freq: 'monthly', priority: '0.6' },
    { path: '/blog', freq: 'weekly', priority: '0.6' },
    { path: '/transfer', freq: 'weekly', priority: '0.7' },
    { path: '/transparencia', freq: 'monthly', priority: '0.6' },
    // Tabua de mares: indice e uma pagina por praia, lidos da lista unica em
    // src/data/praias-mares.ts (scripts/mares-slugs.mjs).
    ...rotasMares(raiz),
  ]
}
