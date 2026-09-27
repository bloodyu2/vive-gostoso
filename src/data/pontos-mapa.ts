import { PRAIAS_MARES, type Idioma, type PraiaMare } from './praias-mares'

type PorIdioma = Record<Idioma, string>

/** Filtros do mapa. A ordem e a dos botoes. */
export const CATEGORIAS_PONTO = ['praias', 'hospedagem', 'historicos'] as const
export type CategoriaPonto = (typeof CATEGORIAS_PONTO)[number]

/** Tipo schema.org de cada ponto no JSON-LD. */
export type TipoSchemaPonto = 'Beach' | 'TouristAttraction' | 'Place'

export type PontoMapa = {
  id: string
  nome: string
  categoria: CategoriaPonto
  municipio: string
  lat: number
  lon: number
  descricao: PorIdioma
  /** De onde vieram nome, municipio e coordenada. */
  fonte: { nome: string; url: string }
  tipoSchema: TipoSchemaPonto
  /** Site oficial do lugar, quando a ordem pede o link. */
  site?: string
  /** Praia da tabua: o ponto leva para a mare dela. */
  mareSlug?: string
}

/* Pontos de referencia. Cada coordenada vem da fonte citada em `fonte` e em
   decisoes.md (27/09/2026). Nada foi geocodificado: ponto sem coordenada em
   fonte aberta ou pagina oficial ficou fora (ver RELATORIO-HOME-EXPLORE-MAPA.md). */
const PONTOS_FIXOS: PontoMapa[] = [
  {
    id: 'pitaya',
    nome: 'Pitaya Exclusive Residence',
    categoria: 'hospedagem',
    municipio: 'São Miguel do Gostoso',
    lat: -5.1348262,
    lon: -35.5888442,
    descricao: {
      pt: 'Condomínio de casas na RN-221, a cerca de 500 m da praia.',
      en: 'Gated community of houses on the RN-221 road, about 500 m from the beach.',
      es: 'Condominio de casas en la RN-221, a unos 500 m de la playa.',
    },
    fonte: { nome: 'Página oficial (link do Google Maps no site)', url: 'https://pitayaexclusive.com.br/' },
    tipoSchema: 'Place',
    site: 'https://pitayaexclusive.com.br/',
  },
  {
    id: 'vila-gale-touros',
    nome: 'Vila Galé Touros',
    categoria: 'hospedagem',
    municipio: 'Touros',
    lat: -5.2269785,
    lon: -35.4152524,
    descricao: {
      pt: 'Hotel da rede Vila Galé no litoral de Touros.',
      en: 'Vila Galé chain hotel on the Touros coast.',
      es: 'Hotel de la cadena Vila Galé en la costa de Touros.',
    },
    fonte: { nome: 'OpenStreetMap, way 565827692 (ODbL)', url: 'https://www.openstreetmap.org/way/565827692' },
    tipoSchema: 'Place',
  },
  {
    id: 'farol-do-calcanhar',
    nome: 'Farol do Calcanhar',
    categoria: 'historicos',
    municipio: 'Touros',
    lat: -5.1611122,
    lon: -35.4865404,
    descricao: {
      pt: 'Farol de 62 metros na ponta onde o litoral do Brasil faz a curva. Abre à visita aos domingos, das 14h às 17h.',
      en: 'A 62-metre lighthouse on the point where the Brazilian coast turns. Open to visitors on Sundays, 2 pm to 5 pm.',
      es: 'Faro de 62 metros en la punta donde la costa de Brasil hace la curva. Abre a visitas los domingos, de 14 h a 17 h.',
    },
    fonte: {
      nome: 'OpenStreetMap, node 1181442129 (ODbL), e Wikipédia, "Farol do Calcanhar"',
      url: 'https://www.openstreetmap.org/node/1181442129',
    },
    tipoSchema: 'TouristAttraction',
  },
]

/** Fonte da coordenada de cada praia da tabua (ids conferidos em decisoes.md). */
const FONTE_PRAIA: Record<string, { nome: string; url: string }> = {
  xepa: { nome: 'OpenStreetMap, relation 2115892 (ODbL)', url: 'https://www.openstreetmap.org/relation/2115892' },
  cardeiro: { nome: 'OpenStreetMap, relation 2115893 (ODbL)', url: 'https://www.openstreetmap.org/relation/2115893' },
  maceio: { nome: 'OpenStreetMap, relation 2115894 (ODbL)', url: 'https://www.openstreetmap.org/relation/2115894' },
  'santo-cristo': { nome: 'OpenStreetMap, relation 2115895 (ODbL)', url: 'https://www.openstreetmap.org/relation/2115895' },
  tourinhos: { nome: 'OpenStreetMap, node 11643248075 (ODbL)', url: 'https://www.openstreetmap.org/node/11643248075' },
  marco: { nome: 'OpenStreetMap, node 13535219738 (ODbL)', url: 'https://www.openstreetmap.org/node/13535219738' },
  perobas: { nome: 'OpenStreetMap, node 7008783807 (ODbL)', url: 'https://www.openstreetmap.org/node/7008783807' },
  carnaubinha: { nome: 'OpenStreetMap, node 7008783806 (ODbL)', url: 'https://www.openstreetmap.org/node/7008783806' },
  cajueiro: { nome: 'OpenStreetMap, way 634307639 (ODbL)', url: 'https://www.openstreetmap.org/way/634307639' },
  'farol-do-calcanhar': {
    nome: 'Wikipédia, "Farol do Calcanhar", e OpenStreetMap, node 1181442129 (ODbL)',
    url: 'https://pt.wikipedia.org/wiki/Farol_do_Calcanhar',
  },
}

const SEM_DICA: PorIdioma = {
  pt: 'Veja a maré de hoje e dos próximos dias nesta praia.',
  en: "See today's tide and the next few days on this beach.",
  es: 'Mira la marea de hoy y de los próximos días en esta playa.',
}

function praiaParaPonto(p: PraiaMare & { lat: number; lon: number }): PontoMapa {
  const fonte = FONTE_PRAIA[p.slug]
  if (!fonte) throw new Error(`Praia ${p.slug} tem coordenada, mas a fonte nao esta anotada em pontos-mapa.ts`)
  return {
    id: `praia-${p.slug}`,
    nome: p.nome,
    categoria: 'praias',
    municipio: p.municipio,
    lat: p.lat,
    lon: p.lon,
    descricao: p.dica ?? SEM_DICA,
    fonte,
    tipoSchema: 'Beach',
    mareSlug: p.slug,
  }
}

const temCoordenada = (p: PraiaMare): p is PraiaMare & { lat: number; lon: number } => p.lat !== undefined && p.lon !== undefined

/** Todos os pontos do mapa: os fixos e as praias da tabua que tem coordenada. */
export const PONTOS_MAPA: PontoMapa[] = [...PRAIAS_MARES.filter(temCoordenada).map(praiaParaPonto), ...PONTOS_FIXOS]

/** Praias da tabua sem coordenada em fonte aberta: ficam fora do mapa. */
export const PRAIAS_FORA_DO_MAPA: PraiaMare[] = PRAIAS_MARES.filter((p) => !temCoordenada(p))

/** Rota no Google Maps ate a coordenada (sem busca por nome). */
export function linkComoChegar(p: { lat: number; lon: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`
}
