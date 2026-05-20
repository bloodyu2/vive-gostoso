// src/lib/supabase/queries.ts
// Server-side Supabase queries for Next.js SSG/ISR pages
import { createClient } from '@/lib/supabase/server'

// ─── Businesses ──────────────────────────────────────────────────────────────

export async function getBusinessesByVerb(verb: string) {
  const supabase = await createClient()

  const { data: cats } = await supabase
    .from('gostoso_categories')
    .select('id')
    .eq('verb', verb.toLowerCase())

  const catIds = ((cats ?? []) as { id: string }[]).map(c => c.id)
  if (!catIds.length) return []

  const { data } = await supabase
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

  return data ?? []
}

export async function getBusinessSlugs(limit = 50) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gostoso_businesses')
    .select('slug')
    .eq('active', true)
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .limit(limit)
  return data?.map((b) => b.slug) ?? []
}

export async function getBusiness(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gostoso_businesses')
    .select('*, category:gostoso_categories(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single()
  return data
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getEventIds(limit = 100) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gostoso_events')
    .select('id')
    .eq('active', true)
    .limit(limit)
  return data?.map((e) => e.id as string) ?? []
}

export async function getEvent(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gostoso_events')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

// ─── Blog ────────────────────────────────────────────────────────────────────

export async function getBlogPosts(limit = 20) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gostoso_blog_posts')
    .select('id, title, slug, excerpt, cover_url, published_at, tags, author, is_published, faq_jsonld, content, created_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getBlogPost(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gostoso_blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data
}

// ─── Fund entries ─────────────────────────────────────────────────────────────

export async function getFundEntries() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gostoso_fund_entries')
    .select('*')
    .order('entry_date', { ascending: false })
  return data ?? []
}

// ─── Services & Jobs ─────────────────────────────────────────────────────────

export async function getServices() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gostoso_service_listings')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getJobs() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gostoso_job_listings')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return data ?? []
}
