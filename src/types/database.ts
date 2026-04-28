export interface Category {
  id: string
  name: string
  slug: string
  verb: 'come' | 'fique' | 'passeie'
  icon: string | null
  color: string | null
  display_order: number
  active: boolean
}

export interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  profile_id: string | null
  address: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  whatsapp: string | null
  website: string | null
  instagram: string | null
  cover_url: string | null
  photos: string[]
  opening_hours: Record<string, { open: string; close: string; closed: boolean }> | null
  is_verified: boolean
  is_featured: boolean
  plan: 'free' | 'associado'
  active: boolean
  display_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface GostosoEvent {
  id: string
  name: string
  description: string | null
  starts_at: string
  ends_at: string | null
  location: string | null
  cover_url: string | null
  event_type: 'festival' | 'esporte' | 'cultural' | 'gastronomia' | null
  is_featured: boolean
  source_url: string | null
  active: boolean
  created_at: string
}

export interface FundEntry {
  id: string
  description: string
  amount_cents: number
  entry_date: string
  status: 'realizado' | 'programado'
  category: 'marketing' | 'operacao' | 'acumulado'
  notes: string | null
  created_at: string
}

export interface Profile {
  id: string
  auth_user_id: string
  business_id: string | null
  role: 'prestador' | 'admin'
  full_name: string | null
  email: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export type ServiceCategory =
  | 'transporte'
  | 'guia'
  | 'domestico'
  | 'construcao'
  | 'gastronomia'
  | 'midia'
  | 'outro'

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  transporte:  'Transporte',
  guia:        'Guia / Turismo',
  domestico:   'Serviços domésticos',
  construcao:  'Construção / Reparos',
  gastronomia: 'Gastronomia',
  midia:       'Foto / Vídeo / Design',
  outro:       'Outro',
}

export type ContractType = 'clt' | 'freelance' | 'temporario' | 'estagio'

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  clt:       'CLT',
  freelance: 'Freelance / Autônomo',
  temporario:'Temporário',
  estagio:   'Estágio',
}

export interface ServiceListing {
  id: string
  name: string
  headline: string
  description: string | null
  service_category: ServiceCategory
  photo_url: string | null
  whatsapp: string
  is_active: boolean
  is_featured: boolean
  created_at: string
}

export interface JobListing {
  id: string
  business_id: string | null
  business_name: string
  title: string
  description: string | null
  contract_type: ContractType
  whatsapp: string
  is_active: boolean
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      gostoso_businesses:       { Row: Business; Insert: Omit<Business, 'id' | 'created_at' | 'updated_at' | 'category'>; Update: Partial<Omit<Business, 'category'>> }
      gostoso_categories:       { Row: Category; Insert: Omit<Category, 'id'>; Update: Partial<Category> }
      gostoso_events:           { Row: GostosoEvent; Insert: Omit<GostosoEvent, 'id' | 'created_at'>; Update: Partial<GostosoEvent> }
      gostoso_fund_entries:     { Row: FundEntry; Insert: Omit<FundEntry, 'id' | 'created_at'>; Update: Partial<FundEntry> }
      gostoso_profiles:         { Row: Profile; Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Profile> }
      gostoso_service_listings: { Row: ServiceListing; Insert: Omit<ServiceListing, 'id' | 'created_at'>; Update: Partial<ServiceListing> }
      gostoso_job_listings:     { Row: JobListing; Insert: Omit<JobListing, 'id' | 'created_at'>; Update: Partial<JobListing> }
    }
  }
}
