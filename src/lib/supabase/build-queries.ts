// src/lib/supabase/build-queries.ts
// Supabase client for build-time use (generateStaticParams + page rendering).
// Does NOT use cookies() — safe to call during next build AND at ISR render time.
import { createClient } from '@supabase/supabase-js'
import type { Business, GostosoEvent, BlogPost } from '@/types/database'

function getBuildClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function getBusinessSlugsForBuild(limit = 200): Promise<string[]> {
  try {
    const client = getBuildClient()
    const { data, error } = await client
      .from('gostoso_businesses')
      .select('slug')
      .eq('active', true)
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .limit(limit)
    if (error) { console.error('[build] getBusinessSlugs:', error.message); return [] }
    return (data ?? []).map((b: { slug: string }) => b.slug)
  } catch (e) {
    console.error('[build] getBusinessSlugs exception:', e)
    return []
  }
}

export async function getBlogSlugsForBuild(): Promise<string[]> {
  try {
    const client = getBuildClient()
    const { data, error } = await client
      .from('gostoso_blog_posts')
      .select('slug')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
    if (error) { console.error('[build] getBlogSlugs:', error.message); return [] }
    return (data ?? []).map((p: { slug: string }) => p.slug)
  } catch (e) {
    console.error('[build] getBlogSlugs exception:', e)
    return []
  }
}

export async function getEventIdsForBuild(): Promise<string[]> {
  try {
    const client = getBuildClient()
    const { data, error } = await client
      .from('gostoso_events')
      .select('id')
      .eq('active', true)
      .order('starts_at', { ascending: false })
    if (error) { console.error('[build] getEventIds:', error.message); return [] }
    return (data ?? []).map((e: { id: string }) => e.id)
  } catch (e) {
    console.error('[build] getEventIds exception:', e)
    return []
  }
}

// ─── Page-level data fetching (no cookies, safe for SSG/ISR) ─────────────────

export async function getBusinessForPage(slug: string): Promise<Business | null> {
  try {
    const client = getBuildClient()
    const { data, error } = await client
      .from('gostoso_businesses')
      .select('*, category:gostoso_categories(*)')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle()
    if (error) { console.error('[build] getBusiness:', error.message); return null }
    return data as Business | null
  } catch (e) {
    console.error('[build] getBusiness exception:', e)
    return null
  }
}

export async function getBlogPostForPage(slug: string): Promise<BlogPost | null> {
  try {
    const client = getBuildClient()
    const { data, error } = await client
      .from('gostoso_blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
    if (error) { console.error('[build] getBlogPost:', error.message); return null }
    return data as BlogPost | null
  } catch (e) {
    console.error('[build] getBlogPost exception:', e)
    return null
  }
}

export async function getEventForPage(id: string): Promise<GostosoEvent | null> {
  try {
    const client = getBuildClient()
    const { data, error } = await client
      .from('gostoso_events')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) { console.error('[build] getEvent:', error.message); return null }
    return data as GostosoEvent | null
  } catch (e) {
    console.error('[build] getEvent exception:', e)
    return null
  }
}
