import { PRAIAS_MARES, type PraiaMare } from '@/data/praias-mares'

/* Nome curto aceito sozinho, alem do nome inteiro ("Praia do Cardeiro").
   So entram nomes que nao sao palavra comum nem outro lugar conhecido: "marco",
   "amor", "maceio" (a capital de Alagoas), "malhada" e "cajueiro" (a vila)
   precisam do nome inteiro. */
const NOME_CURTO: Record<string, string> = {
  cardeiro: 'cardeiro',
  xepa: 'xepa',
  'santo-cristo': 'santo cristo',
  tourinhos: 'tourinhos',
  minhoto: 'minhoto',
  'ze-martins': 'ze martins',
  perobas: 'perobas',
  carnaubinha: 'carnaubinha',
}

function normalizar(texto: string): string {
  return texto
    .replace(/<[^>]*>/g, ' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
}

/** Praias da tabua citadas num texto (HTML ou texto puro), na ordem da lista.
 *  Usado no post do blog para ligar cada praia citada a maré dela, sem mexer
 *  no conteúdo gravado no banco. */
export function praiasCitadas(texto: string): PraiaMare[] {
  const t = ` ${normalizar(texto)} `
  return PRAIAS_MARES.filter((p) => {
    const nomes = [normalizar(p.nome).trim(), NOME_CURTO[p.slug]].filter(Boolean) as string[]
    return nomes.some((n) => t.includes(` ${n} `))
  })
}
