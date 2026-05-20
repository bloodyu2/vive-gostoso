import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Preview from '@/pages/cadastre/Preview'

export default async function PreviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')

  return <Preview />
}
