import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAprovador } from '@/lib/supabase/queries'
import AdminClube from '@/views/cadastre/AdminClube'

export default async function AdminClubePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')
  await requireAprovador(supabase)

  return <AdminClube />
}
