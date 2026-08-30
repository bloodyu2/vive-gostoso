import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        // /cadastre/** e area logada, nao conteudo publico: todas as rotas
        // sob /cadastre/admin/** (profissionais, businesses, claims, reviews,
        // ...) exigem sessao + requireAdmin e redirecionam quem nao e admin.
        // Por isso ficam fora do sitemap e sem tag de analytics de propósito --
        // medir navegacao de painel interno so sujaria os dados do GA4.
        disallow: ['/cadastre/', '/api/'],
      },
    ],
    sitemap: 'https://www.vivegostoso.com.br/sitemap.xml',
  }
}
