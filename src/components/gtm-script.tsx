'use client'

export function GTMScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  if (!gtmId) return null

  return (
    <>
      <script
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
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gtmId}`}
      />
      <script
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
