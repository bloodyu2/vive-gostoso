import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Painel from '@/views/cadastre/Painel'

export default async function PainelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')

  return <Painel />
}
