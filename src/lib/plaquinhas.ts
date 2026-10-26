// Plaquinhas de avaliacao (QR + NFC) dos estabelecimentos de Sao Miguel do Gostoso.
// O QR e o chip NFC impressos apontam sempre para vivegostoso.com.br/p/<codigo>
// (codigo de 2 digitos, 01 a 10) e este arquivo decide de qual negocio e cada um.
// Assim a plaquinha se imprime uma vez e o negocio se define depois: basta
// preencher a linha do codigo.
//
// A pagina /p/<codigo> agradece a visita ao negocio, leva para a avaliacao do Google,
// para o perfil dele no Vive Gostoso e (depois do lancamento, CLUBE_PUBLICO) para o
// Passaporte Gostoso.
//
// Codigo sem negocio cai na home, nunca em 404 (a plaquinha ja esta no balcao).

export const DESTINO_PADRAO = 'https://www.vivegostoso.com.br/'

export interface Plaquinha {
  /** slug do negocio em gostoso_businesses */
  slug: string
  /** link de avaliacao do Google ja pronto (https, dominio do Google) */
  avaliar?: string
  /** place_id do Google; com ele o link de avaliacao e montado aqui */
  placeId?: string
}

/** codigo -> negocio onde a plaquinha esta. Preencher uma linha por plaquinha:
 *  '01': { slug: 'nome-do-negocio', placeId: 'ChIJ...' }
 *  Sem placeId nem avaliar, a pagina nao mostra o botao do Google. */
export const PLAQUINHAS: Record<string, Plaquinha> = {}

const CODIGO = /^\d{2}$/
const PLACE_ID = /^[A-Za-z0-9_-]{10,}$/
const DOMINIOS_GOOGLE = new Set(['g.page', 'search.google.com', 'www.google.com', 'maps.app.goo.gl', 'g.co'])

export function codigoValido(codigo: string): boolean {
  return CODIGO.test(codigo)
}

export function plaquinhaDoCodigo(codigo: string): Plaquinha | null {
  if (!codigoValido(codigo)) return null
  return PLAQUINHAS[codigo] ?? null
}

/** O link de avaliacao do Google, ou null (e o botao some). Link pronto so vale em
 *  https e em dominio do Google; place_id so com caracteres de place_id. */
export function linkDeAvaliacao(p: Plaquinha): string | null {
  if (p.avaliar) {
    try {
      const u = new URL(p.avaliar)
      if (u.protocol === 'https:' && DOMINIOS_GOOGLE.has(u.hostname)) return u.toString()
    } catch {
      /* link invalido: tenta o place_id */
    }
  }
  if (p.placeId && PLACE_ID.test(p.placeId)) {
    return `https://search.google.com/local/writereview?placeid=${p.placeId}`
  }
  return null
}
