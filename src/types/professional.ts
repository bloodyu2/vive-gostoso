// src/types/professional.ts

/** Taxonomia de cidade de praia (~10 mil habitantes), nao de consultoria
 *  urbana. Os dois grupos refletem o que se procura em Sao Miguel do
 *  Gostoso: manutencao da casa e servicos para quem mora ou visita. */
export const GRUPOS_DE_CATEGORIA = {
  casa: [
    'pedreiro-reforma', 'eletrica', 'hidraulica', 'pintura', 'marcenaria',
    'piscina', 'ar-condicionado', 'jardinagem', 'caseiro',
    'diarista-limpeza', 'dedetizacao',
  ],
  servicos: [
    'transfer-motorista', 'cozinheira-chef', 'baba', 'massagem-bem-estar',
    'professor-esportes', 'fotografo', 'audiovisual', 'marketing-design',
    'contabilidade-juridico', 'aulas-particulares',
  ],
} as const

export type ProfessionalCategory =
  | (typeof GRUPOS_DE_CATEGORIA)['casa'][number]
  | (typeof GRUPOS_DE_CATEGORIA)['servicos'][number]
  | 'outro'

export const PROFESSIONAL_CATEGORIES: ProfessionalCategory[] = [
  ...GRUPOS_DE_CATEGORIA.casa,
  ...GRUPOS_DE_CATEGORIA.servicos,
  'outro',
]

/** De onde vem cada cadastro da taxonomia antiga (coach/mentor/consultor/...).
 *  Fica no codigo para a origem de um dado migrado ser rastreavel depois. */
export const CATEGORIA_LEGADA: Record<string, ProfessionalCategory> = {
  coach: 'outro', mentor: 'outro', consultor: 'outro',
  designer: 'marketing-design', fotografo: 'fotografo',
  juridico: 'contabilidade-juridico', educacao: 'aulas-particulares',
  outro: 'outro',
}

export interface PortfolioItem {
  id: string
  title: string
  description?: string
  image_url?: string
  url?: string
}

export interface Professional {
  id: string
  profile_id: string
  display_name: string
  headline: string
  bio: string | null
  photo_url: string | null
  category: ProfessionalCategory
  specialties: string[]
  portfolio_items: PortfolioItem[]
  whatsapp: string | null
  instagram: string | null
  website: string | null
  hourly_rate: number | null   // em centavos
  is_published: boolean
  rating_avg: number
  review_count: number
  slug: string
  created_at: string
  updated_at: string
}

/** Validate and format a WhatsApp number: strip non-digits, prefix 55 if needed.
 *  Returns null if fewer than 10 digits after stripping. */
export function validateWhatsApp(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 10) return null
  return digits.startsWith('55') ? digits : `55${digits}`
}

/** Generate a URL-safe slug from a display name. */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
