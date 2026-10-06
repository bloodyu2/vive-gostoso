/** CSP do site, montada por requisicao no `proxy.ts` (KAN-347 / VGO-09).
 *
 *  Fica fora do `proxy.ts` para poder ser testada: o proxy importa o middleware
 *  do next-intl, que nao carrega no Vitest. */

const SUPABASE_ORIGIN = 'https://wppsmvgbagalczoardfl.supabase.co'
// Varias capas de negocio ainda apontam para o Unsplash (fotos de exemplo
// cadastradas no banco). A CSP precisa listar esses hosts, senao o navegador
// bloqueia as imagens em silencio: 5 das 8 <img> da home ficavam com
// naturalWidth 0 mesmo com as URLs respondendo 200 e JPEG valido.
const UNSPLASH_ORIGINS = 'https://images.unsplash.com https://plus.unsplash.com'
const SUPABASE_WS_ORIGIN = 'wss://wppsmvgbagalczoardfl.supabase.co'
// Microsoft Clarity (projeto ytow9qex3f), carregado pelo GTM desde 06/10/2026.
// Hosts conferidos em 06/10/2026 na documentacao da Microsoft:
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/set-up-clarity
// O script vem de www.clarity.ms e de um subdominio (scripts.clarity.ms); a coleta
// vai para um subdominio (ex.: k.clarity.ms/collect) e para c.bing.com.
const CLARITY_SCRIPT = 'https://www.clarity.ms https://*.clarity.ms'
const CLARITY_COLETA = 'https://*.clarity.ms https://c.bing.com'

/** Nonce por requisicao, para a CSP (KAN-347 / VGO-09).
 *
 *  Antes, o `script-src` tinha `'unsafe-inline'`, que e exatamente o que permite
 *  injecao de script inline. Com nonce, o navegador so executa script inline que
 *  carregue o valor sorteado nesta requisicao.
 *
 *  Medido em 2026-09-19, antes de escrever isto:
 *  - o site inteiro ja renderiza por requisicao (todas as paginas usam `cookies()`
 *    via `createClient`, e as respostas vinham com `x-vercel-cache: MISS` e
 *    `cache-control: private, no-store`). Nonce nao invalida cache estatico
 *    nenhum, porque nao ha cache estatico a perder.
 *  - o HTML servido tem 3 scripts inline executaveis (anti-FOUC do tema,
 *    `consent default` do GTM e `gtag('config')`) mais os blocos
 *    `application/ld+json`, que nao executam mas levam nonce por consistencia.
 *
 *  `'strict-dynamic'` entra junto. Ele faz o navegador confiar em quem foi
 *  carregado por script ja confiavel, o que e o que permite o Next carregar os
 *  chunks dele e o GTM injetar as tags em tempo de execucao. Sem ele, esses
 *  scripts seriam bloqueados. O host do googletagmanager fica na lista como
 *  fallback para navegador antigo, que ignora nonce e strict-dynamic: e o desenho
 *  em camadas recomendado.
 *
 *  `style-src` mantem `'unsafe-inline'` de proposito: o projeto usa muitos
 *  `style={{...}}` inline e nonce de estilo exigiria tocar dezenas de componentes
 *  sem reduzir risco na mesma proporcao. O achado VGO-09 e sobre execucao de
 *  script, e esse esta coberto.
 */
export function montarCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com ${CLARITY_SCRIPT}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: blob: ${SUPABASE_ORIGIN} ${UNSPLASH_ORIGINS} https://api.mapbox.com https://*.tiles.mapbox.com ${CLARITY_COLETA}`,
    `connect-src 'self' ${SUPABASE_ORIGIN} ${SUPABASE_WS_ORIGIN} https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com ${CLARITY_COLETA}`,
    "worker-src 'self' blob:",
    "child-src 'self' blob: https://www.clarity.ms",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
    'report-uri /api/csp-report',
  ].join('; ')
}
