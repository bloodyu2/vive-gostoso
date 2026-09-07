import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import { getFundEntries, getParametrosProduto } from '@/lib/supabase/queries'
import Apoie from '@/views/Apoie'

export const revalidate = 3600

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('apoie', lang as Locale)
}

export default async function ApoiePage() {
  const [entries, parametros] = await Promise.all([getFundEntries(), getParametrosProduto()])
  return <Apoie initialEntries={entries} initialParametros={parametros} />
}
