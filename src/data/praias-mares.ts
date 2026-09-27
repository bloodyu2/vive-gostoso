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

/* Estacoes da Marinha consideradas. Coordenadas impressas no cabecalho de cada
   PDF (scripts/mares/fontes/). So COM3DN e usada; Guamare fica aqui para a
   comparacao registrada em decisoes.md. */
export const ESTACOES: Record<string, Estacao> = {
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

export type PraiaMare = {
  slug: string
  nome: string
  municipio: string
  lat: number
  lon: number
  estacao: keyof typeof ESTACOES
  /** O que a mare muda ali. Sem fonte, a praia entra sem dica. */
  dica?: PorIdioma
  /** Quando a dica depende de uma mare, a tela calcula a melhor janela do dia. */
  melhorMare?: TipoMare
  rotuloJanela?: PorIdioma
}

/* Nome, lugar e coordenadas conferidos no OpenStreetMap em 27/09/2026 (ids em
   decisoes.md). Dicas: as que o Victor passou na ordem de 27/09/2026. Praia do
   Amor, Ze Martins, Minhoto e Malhada ficaram de fora: sem registro no OSM e,
   no caso do Minhoto, a fonte encontrada a situa em Guamare, nao em Touros. */
export const PRAIAS_MARES: PraiaMare[] = [
  {
    slug: 'cardeiro',
    nome: 'Praia do Cardeiro',
    municipio: 'São Miguel do Gostoso',
    lat: -5.12024,
    lon: -35.62901,
    estacao: 'COM3DN',
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
    estacao: 'COM3DN',
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
    estacao: 'COM3DN',
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
    estacao: 'COM3DN',
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
    estacao: 'COM3DN',
    dica: {
      pt: 'Dunas petrificadas. Na maré alta, a água sobe em jatos entre as pedras.',
      en: 'Petrified dunes. At high tide, water shoots up in jets between the rocks.',
      es: 'Dunas petrificadas. Con la marea alta, el agua sube en chorros entre las piedras.',
    },
    melhorMare: 'alta',
    rotuloJanela: { pt: 'Jatos entre as pedras', en: 'Jets between the rocks', es: 'Chorros entre las piedras' },
  },
  {
    slug: 'marco',
    nome: 'Praia do Marco',
    municipio: 'Pedra Grande',
    lat: -5.07804,
    lon: -35.79131,
    estacao: 'COM3DN',
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
export function distanciaKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}
