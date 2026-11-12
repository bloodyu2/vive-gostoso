// Substituto, nos testes, de https://deno.land/std/http/server.ts: guarda o
// handler que a Edge Function registra para o teste chamar direto.
export type Handler = (req: Request) => Response | Promise<Response>

export function serve(handler: Handler): void {
  ;(globalThis as { __edgeHandler?: Handler }).__edgeHandler = handler
}
