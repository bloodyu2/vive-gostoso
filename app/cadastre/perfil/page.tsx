import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Perfil from '@/pages/cadastre/Perfil'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')

  return <Perfil />
}
