/** Consentimento de cookies de analise: Google (Consent Mode) e Microsoft Clarity.
 *
 *  O Clarity entra pelo GTM (projeto ytow9qex3f) e le o consentimento pela API
 *  `consentv2`, separada do Consent Mode do Google. Sem esta chamada ele nao sabe
 *  o que o visitante respondeu no banner.
 *  Assinatura oficial: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2
 *  As chaves sao sensiveis a maiuscula (`ad_Storage`, `analytics_Storage`) e os
 *  valores vao em minuscula.
 *
 *  O banner tem uma categoria so (analise), entao `ad_Storage` segue a mesma
 *  escolha de `analytics_Storage`, como o `gtag` ja fazia com `ad_storage`.
 *
 *  Padrao continua negado: o `consent default` do GTM (em `gtm-script.tsx`) nega
 *  tudo, e aqui nada e concedido sem o aceite gravado. */

export const CHAVE_CONSENTIMENTO = 'vg_cookie_consent'

type Comando = (...args: unknown[]) => void

export type JanelaDeMedicao = {
  gtag?: Comando
  clarity?: Comando & { q?: IArguments[] }
  localStorage?: { getItem(chave: string): string | null }
}

type Estado = 'granted' | 'denied'

/** Garante que exista `window.clarity`. Se o script do Clarity ainda nao
 *  carregou, cria a fila padrao dele (o mesmo stub do snippet oficial): as
 *  chamadas ficam em `clarity.q` e o script as processa quando chegar. */
function clarityOuFila(w: JanelaDeMedicao): Comando {
  if (typeof w.clarity !== 'function') {
    const fila = function (this: unknown) {
      // eslint-disable-next-line prefer-rest-params
      ;(fila.q = fila.q || []).push(arguments)
    } as Comando & { q?: IArguments[] }
    w.clarity = fila
  }
  return w.clarity as Comando
}

export function avisarClarity(concedido: boolean, w: JanelaDeMedicao): void {
  const estado: Estado = concedido ? 'granted' : 'denied'
  clarityOuFila(w)('consentv2', { ad_Storage: estado, analytics_Storage: estado })
}

function avisarGoogle(concedido: boolean, w: JanelaDeMedicao): void {
  if (typeof w.gtag !== 'function') return
  const estado: Estado = concedido ? 'granted' : 'denied'
  w.gtag('consent', 'update', {
    ad_storage: estado,
    analytics_storage: estado,
    ad_user_data: estado,
    ad_personalization: estado,
  })
}

/** Aceite ou recusa no banner: avisa o Google e o Clarity. */
export function aplicarConsentimento(concedido: boolean, w: JanelaDeMedicao): void {
  avisarGoogle(concedido, w)
  avisarClarity(concedido, w)
}

/** O localStorage falha em aba anonima de alguns navegadores e quando o
 *  visitante bloqueia dado de site. Nesses casos vale "ninguem respondeu",
 *  nunca "aceitou". */
function lerEscolhaSalva(w: JanelaDeMedicao): 'accepted' | 'declined' | null {
  try {
    const salvo = w.localStorage?.getItem(CHAVE_CONSENTIMENTO) ?? null
    return salvo === 'accepted' || salvo === 'declined' ? salvo : null
  } catch {
    return null
  }
}

/** Ao carregar a pagina, reaplica a escolha que ja estava gravada.
 *
 *  Sem resposta, o Google fica no `consent default` negado e o Clarity recebe
 *  `denied` explicito, para nao depender do padrao do projeto dele. */
export function aplicarEscolhaSalva(w: JanelaDeMedicao): void {
  const escolha = lerEscolhaSalva(w)
  if (escolha === null) {
    avisarClarity(false, w)
    return
  }
  aplicarConsentimento(escolha === 'accepted', w)
}
