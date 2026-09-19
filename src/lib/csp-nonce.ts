import { headers } from 'next/headers'

/** Le o nonce da requisicao, gerado pelo proxy (KAN-347).
 *
 *  O proxy gera um nonce por requisicao e o publica no cabecalho `x-nonce`. Os
 *  scripts inline deste projeto (o anti-FOUC do tema e o bootstrap do GTM) e os
 *  blocos `application/ld+json` precisam carregar o mesmo valor para o navegador
 *  executa-los sob `script-src 'nonce-...'`.
 *
 *  O Next marca sozinho os scripts internos dele (o bootstrap `self.__next_f`),
 *  porque le o nonce do cabecalho `Content-Security-Policy` da requisicao. Este
 *  helper existe para o NOSSO codigo fazer o mesmo.
 *
 *  Devolve `undefined` quando o cabecalho nao existe (ambiente de teste, ou
 *  requisicao que nao passou pelo proxy). Devolver undefined e seguro: o script
 *  sai sem nonce e, fora do proxy, tambem nao ha CSP com nonce para bloquear.
 */
export async function getNonce(): Promise<string | undefined> {
  return (await headers()).get('x-nonce') ?? undefined
}
