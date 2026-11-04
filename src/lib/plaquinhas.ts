// Plaquinhas dos estabelecimentos de Sao Miguel do Gostoso.
// O QR impresso aponta sempre para vivegostoso.com.br/p/<codigo> (codigo de 2 digitos,
// 01 a 10) e este arquivo decide de qual negocio e cada um. Assim a plaquinha se
// imprime uma vez e o negocio se define depois: basta preencher a linha do codigo.
//
// A pagina /p/<codigo> mostra o lugar, leva para a avaliacao do Google e para o
// Instagram dele, mostra a vantagem do Passaporte Gostoso (com o resgate do cupom) e
// aponta o resto do guia. Codigo reservado abre uma pagina do proprio Vive Gostoso;
// codigo sem nada cai na home, nunca em 404 (a plaquinha ja esta no balcao).

export const DESTINO_PADRAO = 'https://www.vivegostoso.com.br/'

export interface Plaquinha {
  /** slug do negocio em gostoso_businesses */
  slug: string
  /** link de avaliacao do Google ja pronto (https, dominio do Google) */
  avaliar?: string
  /** place_id do Google; com ele o link de avaliacao e montado aqui */
  placeId?: string
  /** @ do Instagram do negocio quando o banco nao tem (o do banco vale primeiro) */
  instagram?: string
  /** nome a mostrar na pagina quando o do banco nao e o nome certo do negocio */
  nome?: string
  /** altura do foco da foto no topo da pagina (0% = topo da foto, 100% = base); padrao 62% */
  foco?: string
  /** true: nao usa a capa do banco na pagina (ela nao e foto real do lugar) */
  fotoGenerica?: boolean
}

/** codigo -> negocio onde a plaquinha esta. Uma linha por codigo:
 *  '01': { slug: 'nome-do-negocio', placeId: 'ChIJ...' }
 *  Sem placeId nem avaliar, a pagina nao mostra o botao do Google.
 *
 *  Mapa de 04/11/2026 (Victor). Cada codigo vale para DUAS plaquinhas, uma horizontal e
 *  uma vertical, que vao para o mesmo lugar. Os place_id foram montados a partir do id da
 *  ficha de cada lugar no Google Maps e conferidos abrindo o link de avaliacao: o Google
 *  abre a avaliacao do lugar certo em todos. */
export const PLAQUINHAS: Record<string, Plaquinha> = {
  '01': { slug: 'gostoso-expedicoes', placeId: 'ChIJldqjdTYNtAcRdymDC3gymGM', instagram: 'gostosoexpedicoes' },
  '02': { slug: 'pousada-parcel-do-gostoso', placeId: 'ChIJuaTOKpUNtAcRa1AsybalEM0' },
  '03': { slug: 'casa-reduto-artesanato', placeId: 'ChIJ_cvxpfEPtAcRUb4jnsKYVsM' },
  // O nome certo e "O Jardim do Seridó" (Victor, 04/11/2026); a linha do banco ainda se chama "Seridó Praia".
  '04': {
    slug: 'serido-praia',
    nome: 'O Jardim do Seridó',
    placeId: 'ChIJXz2VsTkMtAcRT7gQp1I82Xw',
    instagram: 'ojardimdoserido',
  },
  '05': { slug: 'casa-gostoso-mar', placeId: 'ChIJJ8_sBNUNtAcRKxU6do-yUDE' },
  '06': { slug: 'cafe-com-biscoitos-damy', placeId: 'ChIJMwadNvVztAcRtw5vrUFQSCA' },
  '07': { slug: 'pousada-oasis-dos-ventos', placeId: 'ChIJPXYOaA8NtAcRYaUEuanrZEQ' },
  '08': { slug: 'o-pico-surf-skate-shop', placeId: 'ChIJNX4GT5ENtAcRRdiaaTZ4u64', foco: '5%' },
}

/** Codigos impressos que ainda nao tem negocio: abrem uma pagina do proprio Vive Gostoso
 *  (nunca a home crua, nunca 404). Ao dar um negocio a um deles, mover para PLAQUINHAS. */
export const RESERVADAS: readonly string[] = ['09', '10']

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

export function plaquinhaReservada(codigo: string): boolean {
  return codigoValido(codigo) && RESERVADAS.includes(codigo)
}

const HANDLE_INSTAGRAM = /^[A-Za-z0-9._]{1,30}$/

/** O link do perfil de Instagram a partir do @ (com ou sem arroba), ou null. So monta o
 *  link com caracteres que um @ do Instagram pode ter; o resto some o botao. */
export function linkDoInstagram(handle: string | null | undefined): string | null {
  const h = (handle ?? '').trim().replace(/^@/, '')
  return HANDLE_INSTAGRAM.test(h) ? `https://www.instagram.com/${h}/` : null
}
