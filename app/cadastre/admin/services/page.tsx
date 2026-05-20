import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/queries'
import AdminServices from '@/views/cadastre/AdminServices'

export default async function AdminServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')
  await requireAdmin(supabase, user.id)

  return <AdminServices />
}
