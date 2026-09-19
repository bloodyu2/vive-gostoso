// next.config.ts
import type { NextConfig } from 'next'
import withPWA from '@ducanh2912/next-pwa'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

// Content-Security-Policy -- ver docs/security-audit/relatorio-auditoria-seguranca.pdf (F5).
//
// A CSP NAO mora mais aqui. Ela saiu para o `proxy.ts` (era middleware.ts) em 2026-09-19,
// para o KAN-347: `script-src` tinha `'unsafe-inline'`, e nonce so pode ser gerado por
// requisicao, o que um cabecalho estatico do next.config nao faz. Lá ela sai com
// `'nonce-<por requisicao>'` e `'strict-dynamic'`, que e o que tira o `unsafe-inline` do
// caminho. Os demais cabecalhos de seguranca continuam estaticos aqui, logo abaixo.
// Se alguem um dia reclamar de script bloqueado, o lugar de olhar e o `montarCsp` do
// proxy.ts, nao este arquivo. Nao readicione Content-Security-Policy aqui: dois cabecalhos
// com o mesmo nome se sobrescrevem e o nonce desaparece sem aviso.

const config: NextConfig = {
  /* Os recortes de fonte do card de compartilhamento da /bio sao lidos do disco em
     tempo de execucao, e o rastreador de arquivos do Next nao enxerga um readFile
     montado com process.cwd(). Sem esta linha os .ttf ficam de fora do pacote e a
     imagem quebra so em producao, que e o pior lugar para descobrir. */
  outputFileTracingIncludes: {
    '/[lang]/bio/opengraph-image': ['./app/[lang]/bio/*.ttf'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wppsmvgbagalczoardfl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  /* Duplicatas de negocio: dois registros para a mesma casa, os dois indexados
     pelo Google, que reportou "copia sem pagina canonica selecionada pelo
     usuario". A duplicata e desativada no banco, mas desativar sozinho faz a
     URL virar 404 e joga fora a autoridade que ela ja acumulou. O 301 manda
     essa autoridade para o registro que fica.

     O prefixo de idioma e preservado: /es/negocio/duplicata vai para
     /es/negocio/mantido, nunca para a versao pt, senao o redirect contradiz o
     hreflang e reintroduz o problema por outra porta.

     Vitor B ficou de fora de proposito: os dois registros dividem telefone mas
     tem nome e endereco diferentes, e a decisao de qual manter depende de
     confirmacao do dono do projeto. */
  async redirects() {
    const duplicatas: Array<[string, string]> = [
      ['flor-de-caju-cafe-livros', 'flor-de-caju'],
      ['positano', 'positano-restaurante'],
    ]
    /* A rota /resolva saiu do produto em 2026-09-07. Ela esteve no sitemap nos
       tres idiomas, entao existe URL indexada e existe quem tenha guardado o
       link. O conteudo que ela prometia (mercado, farmacia, lavanderia,
       barbearia) nunca esteve la: sempre esteve em /contrate, que e o sucessor
       de verdade. Por isso 301 em vez de deixar dar 404. */
    const rotasRemovidas: Array<[string, string]> = [['/resolva', '/contrate']]

    return [
      ...duplicatas.flatMap(([de, para]) => [
        { source: `/negocio/${de}`, destination: `/negocio/${para}`, permanent: true },
        {
          source: `/:lang(en|es)/negocio/${de}`,
          destination: `/:lang/negocio/${para}`,
          permanent: true,
        },
      ]),
      ...rotasRemovidas.flatMap(([de, para]) => [
        { source: de, destination: para, permanent: true },
        { source: `/:lang(en|es)${de}`, destination: `/:lang${para}`, permanent: true },
      ]),
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
        ],
      },
    ]
  },
}

export default withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
})(withNextIntl(config))
