// Plaquinhas de avaliacao (QR + NFC) dos estabelecimentos de Sao Miguel do Gostoso.
// O QR e o chip NFC impressos apontam sempre para vivegostoso.com.br/p/<codigo>
// (codigo de 2 digitos, 01 a 10) e este arquivo decide para onde cada um vai.
// Assim a plaquinha se imprime uma vez e o destino se define depois: basta
// preencher a linha do codigo com o link de avaliacao do Google do lugar.
//
// Codigo sem destino cai na home, nunca em 404 (a plaquinha ja esta no balcao).

export const DESTINO_PADRAO = 'https://www.vivegostoso.com.br/'

/** codigo -> link de avaliacao do Google do estabelecimento (https). */
export const PLAQUINHAS: Record<string, string> = {
  // '01': 'https://g.page/r/XXXX/review',
}

const CODIGO = /^\d{2}$/

export function destinoDaPlaquinha(codigo: string): string {
  if (!CODIGO.test(codigo)) return DESTINO_PADRAO
  const url = PLAQUINHAS[codigo]
  if (!url) return DESTINO_PADRAO
  try {
    return new URL(url).protocol === 'https:' ? url : DESTINO_PADRAO
  } catch {
    return DESTINO_PADRAO
  }
}
