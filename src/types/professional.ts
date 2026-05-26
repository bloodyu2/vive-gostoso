// src/types/professional.ts

export type ProfessionalCategory =
  | 'coach'
  | 'mentor'
  | 'consultor'
  | 'designer'
  | 'fotografo'
  | 'juridico'
  | 'educacao'
  | 'outro'

export const PROFESSIONAL_CATEGORY_LABELS: Record<ProfessionalCategory, string> = {
  coach:     'Coach',
  mentor:    'Mentor',
  consultor: 'Consultor',
  designer:  'Designer',
  fotografo: 'Fotógrafo',
  juridico:  'Jurídico / Advogado',
  educacao:  'Educação',
  outro:     'Outro',
}

export const PROFESSIONAL_CATEGORIES = Object.keys(
  PROFESSIONAL_CATEGORY_LABELS
) as ProfessionalCategory[]

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
