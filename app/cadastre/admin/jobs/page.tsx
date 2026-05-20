import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/queries'
import AdminJobs from '@/pages/cadastre/AdminJobs'

export default async function AdminJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')
  await requireAdmin(supabase, user.id)

  return <AdminJobs />
}
