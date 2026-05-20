// src/lib/supabase/queries.ts
// Server-side Supabase queries for Next.js SSG/ISR pages
import { createClient } from '@/lib/supabase/server'
import type { Business, GostosoEvent, FundEntry, ServiceListing, JobListing, BlogPost } from '@/types/database'

// ─── Businesses ──────────────────────────────────────────────────────────────

export async function getBusinessesByVerb(verb: string): Promise<Business[]> {
  const supabase = await createClient()

  const { data: cats, error: catError } = await supabase
    .from('gostoso_categories')
    .select('id')
    .eq('verb', verb.toLowerCase())

  if (catError) { console.error('[getBusinessesByVerb] categories', catError.message); return [] }

  const catIds = ((cats ?? []) as { id: string }[]).map(c => c.id)
  if (!catIds.length) return []

  const { data, error } = await supabase
    .from('gostoso_businesses')
    .select(`
      id, name, slug, description, cover_url, photos,
      is_featured, is_verified, plan, price_range,
      phone, whatsapp, instagram, opening_hours,
      lat, lng, address, display_order, active, is_published,
      category_id, profile_id, website, menu_url, amenities,
      services, created_at, updated_at,
      stripe_customer_id, stripe_subscription_id
    `)
    .eq('active', true)
    .eq('is_published', true)
    .in('category_id', catIds)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })

  if (error) { console.error('[getBusinessesByVerb] businesses', error.message); return [] }
  return (data ?? []) as Business[]
}

export async function getBusinessSlugs(limit = 50): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gostoso_businesses')
    .select('slug')
    .eq('active', true)
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .limit(limit)
  if (error) { console.error('[getBusinessSlugs]', error.message); return [] }
  return data?.map((b) => b.slug) ?? []
}

export async function getBusiness(slug: string): Promise<Business | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gostoso_businesses')
    .select('*, category:gostoso_categories(*)')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()
  if (error) { console.error('[getBusiness]', error.message); return null }
  return data as Business | null
}

export async function getBusinessesForMap(): Promise<Array<Pick<Business, 'id' | 'name' | 'slug' | 'lat' | 'lng' | 'cover_url' | 'category_id' | 'is_featured' | 'active' | 'is_published'> & { category: Business['category'] }>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gostoso_businesses')
    .select('id, name, slug, lat, lng, cover_url, category_id, is_featured, active, is_published, category:gostoso_categories(*)')
    .eq('active', true)
    .eq('is_published', true)
    .not('lat', 'is', null)
    .not('lng', 'is', null)
  if (error) { console.error('[getBusinessesForMap]', error.message); return [] }
  return (data ?? []) as unknown as Array<Pick<Business, 'id' | 'name' | 'slug' | 'lat' | 'lng' | 'cover_url' | 'category_id' | 'is_featured' | 'active' | 'is_published'> & { category: Business['category'] }>
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getEventIds(limit = 100): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gostoso_events')
    .select('id')
    .eq('active', true)
    .limit(limit)
  if (error) { console.error('[getEventIds]', error.message); return [] }
  return data?.map((e) => e.id as string) ?? []
}

export async function getEvent(id: string): Promise<GostosoEvent | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gostoso_events')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) { console.error('[getEvent]', error.message); return null }
  return data as GostosoEvent | null
}

// ─── Blog ────────────────────────────────────────────────────────────────────

export async function getBlogPosts(limit = 20): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gostoso_blog_posts')
    .select('id, title, slug, excerpt, cover_url, published_at, tags, author, is_published, faq_jsonld, content, created_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('[getBlogPosts]', error.message); return [] }
  return (data ?? []) as BlogPost[]
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gostoso_blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  if (error) { console.error('[getBlogPost]', error.message); return null }
  return data as BlogPost | null
}

// ─── Fund entries ─────────────────────────────────────────────────────────────

export async function getFundEntries(): Promise<FundEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gostoso_fund_entries')
    .select('*')
    .order('entry_date', { ascending: false })
  if (error) { console.error('[getFundEntries]', error.message); return [] }
  return (data ?? []) as FundEntry[]
}

// ─── Services & Jobs ─────────────────────────────────────────────────────────

export async function getServices(): Promise<ServiceListing[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gostoso_service_listings')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) { console.error('[getServices]', error.message); return [] }
  return (data ?? []) as ServiceListing[]
}

export async function getJobs(): Promise<JobListing[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gostoso_job_listings')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) { console.error('[getJobs]', error.message); return [] }
  return (data ?? []) as JobListing[]
}
