// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://vivegostoso.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [businessesRes, blogRes, eventsRes] = await Promise.all([
    supabase
      .from('gostoso_businesses')
      .select('slug, updated_at')
      .eq('active', true)
      .eq('is_published', true),
    supabase
      .from('gostoso_blog_posts')
      .select('slug, published_at, created_at')
      .eq('is_published', true),
    supabase
      .from('gostoso_events')
      .select('id, created_at')
      .eq('active', true),
  ])

  const staticPages = [
    '', '/come', '/fique', '/passeie', '/explore', '/participe',
    '/conheca', '/apoie', '/contrate', '/sobre', '/blog', '/transfer', '/bio',
  ]

  return [
    ...staticPages.map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    ...(businessesRes.data ?? []).map((b) => ({
      url: `${BASE_URL}/negocio/${b.slug}`,
      lastModified: new Date(b.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...(blogRes.data ?? []).map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.published_at ?? p.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...(eventsRes.data ?? []).map((e) => ({
      url: `${BASE_URL}/evento/${e.id}`,
      lastModified: new Date(e.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
