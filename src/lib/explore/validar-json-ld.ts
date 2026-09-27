/** Validador local de JSON-LD, usado nos testes. Nao e o validador do Google:
 *  confere o que da para conferir sem rede. O texto sai por safeJsonLd e volta
 *  por JSON.parse (o mesmo caminho do HTML servido); cada no precisa de @type
 *  conhecido do schema.org e das propriedades que o Google pede para aquele
 *  tipo; listas tem posicao 1..n; URL e absoluta; coordenada e numero no
 *  intervalo. Devolve a lista de problemas (vazia = valido). */
import { safeJsonLd } from '@/lib/json-ld'

const OBRIGATORIAS: Record<string, string[]> = {
  WebSite: ['name', 'url'],
  WebPage: ['name', 'url'],
  CollectionPage: ['name', 'url'],
  ItemList: ['itemListElement'],
  BreadcrumbList: ['itemListElement'],
  ListItem: ['position'],
  Beach: ['name'],
  TouristAttraction: ['name'],
  Place: ['name'],
  TouristDestination: ['name'],
  Dataset: ['name', 'description', 'creator'],
  GeoCoordinates: ['latitude', 'longitude'],
  PostalAddress: ['addressCountry'],
  GovernmentOrganization: ['name'],
  Organization: ['name'],
  CreativeWork: ['name'],
  State: ['name'],
  BlogPosting: ['headline', 'image', 'datePublished', 'author', 'publisher'],
  ImageObject: ['url'],
  Country: ['name'],
}

export function validarJsonLd(dado: unknown): string[] {
  const erros: string[] = []
  let raiz: unknown
  try {
    raiz = JSON.parse(safeJsonLd(dado))
  } catch (e) {
    return [`JSON invalido: ${String(e)}`]
  }
  const r = raiz as Record<string, unknown>
  if (r['@context'] !== 'https://schema.org') erros.push('@context diferente de https://schema.org')
  const nos = Array.isArray(r['@graph']) ? (r['@graph'] as unknown[]) : [r]
  for (const no of nos) visitar(no, '$', erros)
  return erros
}

/** No que so aponta para outro pelo @id (ex.: mainEntityOfPage) nao repete as
 *  propriedades do no apontado; o @id tem que ser URL absoluta. */
function eReferencia(o: Record<string, unknown>): boolean {
  const chaves = Object.keys(o).filter((k) => k !== '@type')
  return chaves.length === 1 && chaves[0] === '@id' && typeof o['@id'] === 'string' && /^https:\/\//.test(o['@id'])
}

function visitar(no: unknown, caminho: string, erros: string[]): void {
  if (Array.isArray(no)) {
    no.forEach((n, i) => visitar(n, `${caminho}[${i}]`, erros))
    return
  }
  if (!no || typeof no !== 'object') return
  const o = no as Record<string, unknown>
  const tipo = o['@type']
  if (tipo !== undefined) {
    if (typeof tipo !== 'string' || !(tipo in OBRIGATORIAS)) erros.push(`${caminho}: @type desconhecido ${String(tipo)}`)
    else if (!eReferencia(o)) for (const p of OBRIGATORIAS[tipo]) if (o[p] === undefined || o[p] === '') erros.push(`${caminho}: ${tipo} sem ${p}`)
    if (tipo === 'ItemList' || tipo === 'BreadcrumbList') {
      const itens = o.itemListElement as Array<Record<string, unknown>>
      if (!Array.isArray(itens) || itens.length === 0) erros.push(`${caminho}: ${tipo} vazio`)
      else
        itens.forEach((it, i) => {
          if (it.position !== i + 1) erros.push(`${caminho}: posicao ${String(it.position)} no lugar de ${i + 1}`)
          if (tipo === 'BreadcrumbList' && (typeof it.item !== 'string' || !/^https:\/\//.test(it.item)))
            erros.push(`${caminho}: item de trilha sem URL absoluta`)
        })
    }
    if (tipo === 'GeoCoordinates') {
      const lat = o.latitude
      const lon = o.longitude
      if (typeof lat !== 'number' || lat < -90 || lat > 90) erros.push(`${caminho}: latitude invalida`)
      if (typeof lon !== 'number' || lon < -180 || lon > 180) erros.push(`${caminho}: longitude invalida`)
    }
    if (tipo === 'Dataset' && typeof o.description === 'string' && o.description.length < 50)
      erros.push(`${caminho}: Dataset com descricao curta`)
  }
  for (const [k, v] of Object.entries(o)) {
    if ((k === 'url' || k === 'item') && typeof v === 'string' && !/^https:\/\//.test(v)) erros.push(`${caminho}.${k}: URL relativa`)
    if (v && typeof v === 'object') visitar(v, `${caminho}.${k}`, erros)
  }
}
