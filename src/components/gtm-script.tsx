'use client'

/** Bootstrap do GTM/GA4.
 *
 *  KAN-347: os dois scripts inline daqui carregam o `nonce` da requisicao, que
 *  chega como prop do layout de servidor. Sem ele, a CSP do site (que agora usa
 *  `script-src 'nonce-...'` em vez de `'unsafe-inline'`) bloqueia estes scripts e
 *  o consentimento e o `gtag('config')` nao rodam.
 *
 *  Este componente e cliente e por isso NAO pode ler o cabecalho sozinho: o
 *  nonce vem de `getNonce()` no `app/layout.tsx`, que e servidor. */
export function GTMScript({ nonce }: { nonce?: string }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  if (!gtmId) return null

  return (
    <>
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted'
});`,
        }}
      />
      <script
        nonce={nonce}
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gtmId}`}
      />
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
// send_page_view ficava false e NADA no projeto enviava page_view manualmente,
// entao o GA4 nunca recebia hit de pagina nenhuma -- por isso a cobertura de
// tag aparecia zerada. As navegacoes seguintes (client-side) sao enviadas pelo
// PageViewTracker, que ignora a primeira para nao duplicar esta.
gtag('config', '${gtmId}');`,
        }}
      />
    </>
  )
}
