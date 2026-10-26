/** Dispara uma chamada do supabase-js e esquece o resultado.
 *
 *  O builder (`supabase.rpc(...)`, `.from(...).select()`) é preguiçoso: a requisição só
 *  sai quando alguém chama `.then()` ou usa `await`. `void supabase.rpc(...)` parece
 *  disparar e não dispara nada. Vale para contador de vista e de visita, onde ninguém
 *  espera a resposta, e a falha não pode derrubar a página. */
export function disparar(consulta: PromiseLike<unknown>): void {
  consulta.then(undefined, () => undefined)
}
