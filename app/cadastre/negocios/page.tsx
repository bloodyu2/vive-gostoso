import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MeusNegocios from '@/pages/cadastre/MeusNegocios'

export default async function MeusNegociosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')

  return <MeusNegocios />
}
