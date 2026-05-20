import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Preview from '@/views/cadastre/Preview'

export default async function PreviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')

  return <Preview />
}
