// src/lib/supabase/prazo.ts
// Leitura de servidor com prazo e uma segunda tentativa. Sem isto, uma conexao
// parada com o Supabase (ETIMEDOUT, "other side closed") segura a pagina ate o
// limite da rede, perto de 20 s. Foi o que se viu em /explore em 28/10/2026, e
// o log de erros da Vercel tem 7 casos do mesmo tipo desde 30/09.

/** Quanto esperar por uma resposta antes de desistir e tentar de novo. */
export const MS_DE_PRAZO = 6000

/** Embrulha um fetch: GET e HEAD ganham prazo e uma nova tentativa quando a
 *  primeira falha na rede. Gravacao (POST, PATCH, DELETE) passa direto, porque
 *  repetir uma escrita poderia gravar duas vezes. */
export function fetchComPrazo(base: typeof fetch = fetch, ms: number = MS_DE_PRAZO): typeof fetch {
  return (async (entrada: RequestInfo | URL, init?: RequestInit) => {
    const metodo = (init?.method ?? (entrada instanceof Request ? entrada.method : 'GET')).toUpperCase()
    if (metodo !== 'GET' && metodo !== 'HEAD') return base(entrada, init)
    const tentar = () => base(entrada, { ...init, signal: init?.signal ?? AbortSignal.timeout(ms) })
    try {
      return await tentar()
    } catch (erro) {
      if (init?.signal?.aborted) throw erro
      return tentar()
    }
  }) as typeof fetch
}
