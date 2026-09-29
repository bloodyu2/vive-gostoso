// src/lib/supabase/publico.ts
// Cliente anonimo, sem cookie, com as respostas guardadas no cache de dados do
// Next (KAN-463). Para as leituras publicas das paginas de servidor.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/** Tag de tudo que as paginas publicas leem por este cliente. Limpa por
 *  `POST /api/revalidar` quando alguem logado grava pelo site. */
export const TAG_VITRINE = 'vitrine'

/** Prazo maximo de dado velho quando a gravacao e feita por fora do site
 *  (SQL direto, painel do Supabase). Gravacao pelo site limpa na hora. */
export const SEGUNDOS_VITRINE = 300

/** O HTML do site e dinamico por causa do nonce de CSP (proxy.ts), entao o que
 *  da para guardar e a resposta do Supabase. Mesmo desenho do `fetchComCache`
 *  das mares, com prazo menor e a tag da vitrine. */
export function fetchDaVitrine(base: typeof fetch = fetch): typeof fetch {
  return ((entrada: RequestInfo | URL, init?: RequestInit) =>
    base(entrada, { ...init, next: { revalidate: SEGUNDOS_VITRINE, tags: [TAG_VITRINE] } } as RequestInit)) as typeof fetch
}

/** Mesma visao do visitante anonimo: chave anon e RLS de leitura publica. Sem
 *  `cookies()`, entao o resultado nao depende de quem esta logado, e pode ser
 *  guardado e servido para todos. */
export function clientePublico(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchDaVitrine() },
  })
}
