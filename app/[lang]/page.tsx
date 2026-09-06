// app/[lang]/page.tsx
import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import { createClient } from '@/lib/supabase/server'
import Home from '@/views/Home'
import { organizationSchema, webSiteSchema } from '@/lib/seo'

export const revalidate = 3600

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('home', lang as Locale)
}

async function getHomeData() {
  const supabase = await createClient()

  const [businessesRes, eventsRes, statsRes] = await Promise.all([
    supabase
      .from('gostoso_businesses')
      .select('id, name, slug, cover_url, category_id, is_featured, is_verified, lat, lng')
      .eq('active', true)
      .eq('is_featured', true)
      .order('display_order', { ascending: true })
      .limit(8),
    supabase
      .from('gostoso_events')
      .select('id, name, starts_at, ends_at, location, cover_url, is_featured')
      .eq('active', true)
      .gte('ends_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(4),
    supabase
      .from('gostoso_businesses')
      .select('id', { count: 'exact', head: true })
      .eq('active', true),
  ])

  return {
    featuredBusinesses: businessesRes.data ?? [],
    upcomingEvents: eventsRes.data ?? [],
    totalBusinesses: statsRes.count ?? 0,
  }
}

export default async function HomePage() {
  const initialData = await getHomeData()
  const jsonLdOrg = organizationSchema()
  const jsonLdWeb = webSiteSchema()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWeb) }}
      />
      <Home initialData={initialData} />
    </>
  )
}
