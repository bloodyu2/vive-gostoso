import type { TipoMare } from '@/lib/mares/extrair-tabua'

export type Idioma = 'pt' | 'en' | 'es'
type PorIdioma = Record<Idioma, string>

export type Estacao = {
  codigo: string
  nome: string
  lat: number
  lon: number
  fonteUrl: string
}

/* Estacoes da Marinha. Coordenadas impressas no cabecalho de cada PDF
   (scripts/mares/fontes/). O PDF de Guamare nao traz codigo de estacao (o de
   Natal traz COM3DN); GUAMARE e o codigo gravado em gostoso_mares.estacao. */
export type CodigoEstacao = 'COM3DN' | 'GUAMARE'

export const ESTACOES: Record<CodigoEstacao, Estacao> = {
  COM3DN: {
    codigo: 'COM3DN',
    nome: 'Porto de Natal',
    lat: -(5 + 46 / 60),
    lon: -(35 + 12.1 / 60),
    fonteUrl: 'https://www.marinha.mil.br/chm/tabuas-de-mare-6',
  },
  GUAMARE: {
    codigo: 'GUAMARE',
    nome: 'Porto de Guamaré',
    lat: -(5 + 6.4 / 60),
    lon: -(36 + 19 / 60),
    fonteUrl: 'https://www.marinha.mil.br/chm/tabuas-de-mare-6',
  },
}

/** Ordem dos grupos no seletor. */
export const MUNICIPIOS = ['São Miguel do Gostoso', 'Touros', 'Pedra Grande'] as const
export type Municipio = (typeof MUNICIPIOS)[number]

export type PraiaMare = {
  slug: string
  nome: string
  municipio: Municipio
  /** Sem coordenada de fonte aberta, a praia fica sem distancia e sem geo no JSON-LD. */
  lat?: number
  lon?: number
  /** Estacao usada na tela. Se faltar dado dela num dia, usa a reserva e avisa. */
  estacaoPrincipal: CodigoEstacao
  estacaoReserva: CodigoEstacao
  /** O que a mare muda ali. Sem fonte, a praia entra sem dica. */
  dica?: PorIdioma
  /** Quando a dica depende de uma mare, a tela calcula a melhor janela do dia. */
  melhorMare?: TipoMare
  rotuloJanela?: PorIdioma
}

/* Rodada 1 (27/09/2026): nome, lugar e coordenadas conferidos no OpenStreetMap
   (ids em decisoes.md); dicas da ordem do Victor.
   Rodada 2 (27/09/2026): Minhoto, Praia do Amor, Ze Martins e Malhada ficam em
   Sao Miguel do Gostoso por decisao do Victor. Nenhuma fonte aberta da a
   coordenada delas (nem o OSM nem o conteudo do site), entao entram sem lat/lon
   e sem dica. Touros: coordenadas anotadas a mao do OpenStreetMap (ODbL, ids
   em decisoes.md) e da Wikipedia (Farol do Calcanhar). Carnauba e Garcas
   ficaram de fora (sem coordenada em fonte aberta).
   Estacao: Guamare e a principal onde ela e a mais perto (Gostoso e Pedra
   Grande, 58 a 77 km). Nas praias de Touros, Natal fica mais perto (61 a
   76 km, contra 90 a 103 km de Guamare) e passa a ser a principal; ver
   decisoes.md. */
export const PRAIAS_MARES: PraiaMare[] = [
  {
    slug: 'cardeiro',
    nome: 'Praia do Cardeiro',
    municipio: 'São Miguel do Gostoso',
    lat: -5.12024,
    lon: -35.62901,
    estacaoPrincipal: 'GUAMARE',
    estacaoReserva: 'COM3DN',
    dica: {
      pt: 'Na maré baixa, formam-se piscinas naturais entre as pedras.',
      en: 'At low tide, natural pools form between the rocks.',
      es: 'Con la marea baja se forman piscinas naturales entre las piedras.',
    },
    melhorMare: 'baixa',
    rotuloJanela: { pt: 'Piscinas', en: 'Pools', es: 'Piscinas' },
  },
  {
    slug: 'xepa',
    nome: 'Praia da Xêpa',
    municipio: 'São Miguel do Gostoso',
    lat: -5.12073,
    lon: -35.63432,
    estacaoPrincipal: 'GUAMARE',
    estacaoReserva: 'COM3DN',
    dica: {
      pt: 'Praia central. Na maré alta, a faixa de areia fica bem menor.',
      en: 'The central beach. At high tide the strip of sand gets much narrower.',
      es: 'La playa central. Con la marea alta la franja de arena se reduce mucho.',
    },
    melhorMare: 'baixa',
    rotuloJanela: { pt: 'Mais areia', en: 'More sand', es: 'Más arena' },
  },
  {
    slug: 'maceio',
    nome: 'Praia do Maceió',
    municipio: 'São Miguel do Gostoso',
    lat: -5.11948,
    lon: -35.64056,
    estacaoPrincipal: 'GUAMARE',
    estacaoReserva: 'COM3DN',
    dica: {
      pt: 'Na maré baixa, a água fica calma, parecendo lagoa. Boa para criança.',
      en: 'At low tide the water turns calm, like a lagoon. Good for children.',
      es: 'Con la marea baja el agua queda tranquila, como una laguna. Buena para niños.',
    },
    melhorMare: 'baixa',
    rotuloJanela: { pt: 'Água calma', en: 'Calm water', es: 'Agua tranquila' },
  },
  {
    slug: 'santo-cristo',
    nome: 'Praia do Santo Cristo',
    municipio: 'São Miguel do Gostoso',
    lat: -5.11808,
    lon: -35.62036,
    estacaoPrincipal: 'GUAMARE',
    estacaoReserva: 'COM3DN',
    dica: {
      pt: 'Ponto de kite e windsurf. A maré muda a lâmina d’água do spot.',
      en: 'Kite and windsurf spot. The tide changes the water depth over the spot.',
      es: 'Punto de kite y windsurf. La marea cambia la lámina de agua del spot.',
    },
  },
  {
    slug: 'tourinhos',
    nome: 'Praia de Tourinhos',
    municipio: 'São Miguel do Gostoso',
    lat: -5.10328,
    lon: -35.6986,
    estacaoPrincipal: 'GUAMARE',
    estacaoReserva: 'COM3DN',
    dica: {
      pt: 'Dunas petrificadas. Na maré alta, a água sobe em jatos entre as pedras.',
      en: 'Petrified dunes. At high tide, water shoots up in jets between the rocks.',
      es: 'Dunas petrificadas. Con la marea alta, el agua sube en chorros entre las piedras.',
    },
    melhorMare: 'alta',
    rotuloJanela: { pt: 'Jatos entre as pedras', en: 'Jets between the rocks', es: 'Chorros entre las piedras' },
  },
  {
    slug: 'minhoto',
    nome: 'Praia do Minhoto',
    municipio: 'São Miguel do Gostoso',
    estacaoPrincipal: 'GUAMARE',
    estacaoReserva: 'COM3DN',
  },
  {
    slug: 'praia-do-amor',
    nome: 'Praia do Amor',
    municipio: 'São Miguel do Gostoso',
    estacaoPrincipal: 'GUAMARE',
    estacaoReserva: 'COM3DN',
  },
  {
    slug: 'ze-martins',
    nome: 'Praia de Zé Martins',
    municipio: 'São Miguel do Gostoso',
    estacaoPrincipal: 'GUAMARE',
    estacaoReserva: 'COM3DN',
  },
  {
    slug: 'malhada',
    nome: 'Praia da Malhada',
    municipio: 'São Miguel do Gostoso',
    estacaoPrincipal: 'GUAMARE',
    estacaoReserva: 'COM3DN',
  },
  {
    slug: 'perobas',
    nome: 'Praia de Perobas',
    municipio: 'Touros',
    lat: -5.25216,
    lon: -35.3949,
    estacaoPrincipal: 'COM3DN',
    estacaoReserva: 'GUAMARE',
    dica: {
      pt: 'Os parrachos, recifes na frente da praia, só aparecem na maré baixa. O passeio de barco sai conforme a tábua de marés.',
      en: 'The parrachos, reefs off the beach, only show at low tide. Boat trips leave according to the tide table.',
      es: 'Los parrachos, arrecifes frente a la playa, solo aparecen con la marea baja. El paseo en barco sale según la tabla de mareas.',
    },
    melhorMare: 'baixa',
    rotuloJanela: { pt: 'Parrachos', en: 'Parrachos', es: 'Parrachos' },
  },
  {
    slug: 'carnaubinha',
    nome: 'Praia de Carnaubinha',
    municipio: 'Touros',
    lat: -5.21472,
    lon: -35.43533,
    estacaoPrincipal: 'COM3DN',
    estacaoReserva: 'GUAMARE',
  },
  {
    slug: 'farol-do-calcanhar',
    nome: 'Praia do Farol do Calcanhar',
    municipio: 'Touros',
    lat: -5.16113,
    lon: -35.48646,
    estacaoPrincipal: 'COM3DN',
    estacaoReserva: 'GUAMARE',
  },
  {
    slug: 'cajueiro',
    nome: 'Praia do Cajueiro',
    municipio: 'Touros',
    lat: -5.15449,
    lon: -35.50297,
    estacaoPrincipal: 'COM3DN',
    estacaoReserva: 'GUAMARE',
  },
  {
    slug: 'marco',
    nome: 'Praia do Marco',
    municipio: 'Pedra Grande',
    lat: -5.07804,
    lon: -35.79131,
    estacaoPrincipal: 'GUAMARE',
    estacaoReserva: 'COM3DN',
    dica: {
      pt: 'Praia do marco histórico. O acesso pela areia depende da maré.',
      en: 'Home of the historic landmark. Access along the sand depends on the tide.',
      es: 'Playa del hito histórico. El acceso por la arena depende de la marea.',
    },
  },
]

export function praiaPorSlug(slug: string): PraiaMare | undefined {
  return PRAIAS_MARES.find((p) => p.slug === slug)
}

/** Distancia em linha reta (haversine), em km. */
export function distanciaKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number;
export function distanciaKm(a: { lat?: number; lon?: number }, b: { lat: number; lon: number }): number | undefined;
export function distanciaKm(a: { lat?: number; lon?: number }, b: { lat: number; lon: number }): number | undefined {
  if (a.lat === undefined || a.lon === undefined) return undefined
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/** Praias na ordem do seletor: por municipio (MUNICIPIOS), mantendo a ordem da lista. */
export function praiasPorMunicipio(): Array<{ municipio: Municipio; praias: PraiaMare[] }> {
  return MUNICIPIOS.map((municipio) => ({ municipio, praias: PRAIAS_MARES.filter((p) => p.municipio === municipio) })).filter(
    (g) => g.praias.length > 0,
  )
}
