// src/lib/supabase/avisar-gravacao.ts
// KAN-463: quando alguem logado grava pelo site (painel, perfil, admin), o
// navegador avisa o servidor para limpar o cache das paginas publicas.
// Fica no fetch do cliente do navegador para pegar toda gravacao, inclusive as
// que nascerem depois, sem depender de lembrar de chamar em cada tela.

const METODOS_DE_ESCRITA = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

/** So grava quem passou pelo REST do Supabase, deu certo e esta logado. */
export function deveAvisar(url: string, metodo: string, ok: boolean, logado: boolean): boolean {
  if (!ok || !logado) return false
  if (!METODOS_DE_ESCRITA.has(metodo.toUpperCase())) return false
  return url.includes('/rest/v1/')
}

/** Ha cookie de sessao do Supabase (sb-<ref>-auth-token, lido pelo @supabase/ssr). */
export function temSessaoNoCookie(): boolean {
  if (typeof document === 'undefined') return false
  return /(?:^|;\s*)sb-[^=]*-auth-token/.test(document.cookie)
}

let agendado: ReturnType<typeof setTimeout> | null = null

/** Uma chamada so para varias gravacoes seguidas (salvar perfil grava em mais de uma tabela). */
export function avisarServidor(): void {
  if (typeof window === 'undefined') return
  if (agendado) clearTimeout(agendado)
  agendado = setTimeout(() => {
    agendado = null
    fetch('/api/revalidar', { method: 'POST', keepalive: true, credentials: 'same-origin' }).catch(() => null)
  }, 400)
}

export function fetchQueAvisa(
  base: typeof fetch = fetch,
  avisar: () => void = avisarServidor,
  logado: () => boolean = temSessaoNoCookie,
): typeof fetch {
  return (async (entrada: RequestInfo | URL, init?: RequestInit) => {
    const resposta = await base(entrada, init)
    try {
      const url = typeof entrada === 'string' ? entrada : entrada instanceof URL ? entrada.href : entrada.url
      const metodo = init?.method ?? (typeof entrada === 'object' && 'method' in entrada ? entrada.method : 'GET')
      if (deveAvisar(url, metodo, resposta.ok, logado())) avisar()
    } catch {
      // Aviso e acessorio: nunca derruba a gravacao.
    }
    return resposta
  }) as typeof fetch
}
