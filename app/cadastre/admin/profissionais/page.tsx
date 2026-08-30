// app/cadastre/admin/profissionais/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/queries'
import AdminProfessionals from '@/views/cadastre/AdminProfessionals'

export default async function AdminProfessionalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')
  await requireAdmin(supabase, user.id)

  return <AdminProfessionals />
}
