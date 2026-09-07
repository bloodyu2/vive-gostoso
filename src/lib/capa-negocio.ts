/**
 * Capa tipográfica de negócio: as decisões, sem React.
 *
 * O catálogo tem 182 negócios ativos e só 3 fotos nossas. O resto caía em doze
 * arquivos genéricos por categoria, e o mesmo `pousada.jpg` aparecia 42 vezes.
 * Em vez de inventar 91 fotos, a capa passa a ser desenhada em código a partir
 * do que existe de verdade: o nome do negócio e a categoria dele.
 *
 * Tudo aqui é determinístico a partir do slug. A capa de um negócio precisa
 * sair igual em toda renderização, no servidor e no cliente, hoje e no ano que
 * vem: um `Math.random()` faria a mesma listagem trocar de cor a cada visita e
 * quebraria a hidratação.
 */

/** Cores de acento, do design system, na variante escura o bastante para o
 *  texto branco por cima passar em 4.5:1 (medido: 5.03, 4.85 e 6.26). */
export const CORES_DE_CAPA = ['#0D7C7C', '#A05E1A', '#A83D22'] as const
export type CorDeCapa = (typeof CORES_DE_CAPA)[number]

/** Prefixo das doze imagens genéricas por categoria que existiam em
 *  `public/images/businesses/`. Um `cover_url` assim não é foto do negócio, é
 *  enfeite de categoria, e deve dar lugar à capa tipográfica. */
const PREFIXO_GENERICO = '/images/businesses/'

/** `true` quando a capa gravada no banco é um dos genéricos por categoria. */
export function ehCapaGenerica(url: string | null | undefined): boolean {
  return typeof url === 'string' && url.startsWith(PREFIXO_GENERICO)
}

/** `true` quando o negócio não tem foto de capa própria e a capa vai ser
 *  desenhada em código: sem capa nenhuma, ou capa genérica por categoria.
 *  Quem desenha o card usa isto para não jogar o véu escuro do rodapé por cima
 *  de uma capa que não é foto. */
export function usaCapaTipografica(url: string | null | undefined): boolean {
  return !url || ehCapaGenerica(url)
}

/** FNV-1a de 32 bits. Escolhido por ser curto, estável e sem dependência: o
 *  requisito não é resistência a colisão, é dar sempre o mesmo número para a
 *  mesma string. `>>> 0` mantém o resultado sem sinal. */
function hash(texto: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/** A cor de acento do negócio, sempre a mesma para o mesmo slug. */
export function corDaCapa(slug: string): CorDeCapa {
  return CORES_DE_CAPA[hash(slug) % CORES_DE_CAPA.length]
}

/**
 * Tamanho do nome, em `cqi` (por cento da largura do contêiner), para a capa
 * funcionar igual na miniatura de 144px da lista e no topo de 1200px do perfil.
 *
 * Nome curto ocupa a capa inteira, nome longo recua. É o que dá silhueta
 * diferente a cada card sem nenhum enfeite: "Balaio" e "Casa Reduto Artesanato
 * Colaborativo" não podem ser desenhados no mesmo corpo.
 */
export function escalaDoNome(nome: string): number {
  const n = nome.trim().length
  if (n <= 10) return 17
  if (n <= 18) return 14
  if (n <= 28) return 11
  return 9
}

/** Iniciais para as miniaturas pequenas demais para caber um nome (as listas de
 *  36 e 40 pixels do mapa, da busca e do "aberto agora"). Duas letras quando o
 *  nome tem duas palavras de conteúdo, uma quando não tem. */
export function iniciaisDoNome(nome: string): string {
  const palavras = nome
    .trim()
    .split(/\s+/)
    .filter((p) => /\p{L}/u.test(p[0] ?? ''))
    .filter((p) => !['de', 'da', 'do', 'dos', 'das', 'e', '&'].includes(p.toLowerCase()))
  if (palavras.length === 0) return '?'
  if (palavras.length === 1) return palavras[0][0].toUpperCase()
  return (palavras[0][0] + palavras[1][0]).toUpperCase()
}
