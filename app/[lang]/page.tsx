// app/[lang]/page.tsx
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Home from '@/pages/Home'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Vive Gostoso -- São Miguel do Gostoso, RN',
  description: 'A infraestrutura digital de São Miguel do Gostoso. Restaurantes, pousadas, passeios, eventos e mais.',
  openGraph: {
    title: 'Vive Gostoso',
    description: 'O sistema operacional de São Miguel do Gostoso, RN.',
    url: 'https://vivegostoso.com.br',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
  },
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
  return <Home initialData={initialData} />
}
