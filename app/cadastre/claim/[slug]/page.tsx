import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Claim from '@/pages/cadastre/Claim'

type Props = { params: Promise<{ slug: string }> }

export default async function ClaimPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')

  const { data: business } = await supabase
    .from('gostoso_businesses')
    .select('id, name, slug, is_verified')
    .eq('slug', slug)
    .maybeSingle()

  if (!business) notFound()

  return <Claim slug={slug} user={user} />
}
