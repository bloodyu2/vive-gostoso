import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { destinoDaRotaAntiga } from '@/lib/clube/painel-abas'

/* A pre-visualizacao agora e a vista "Como aparece" da aba Perfil e fotos do painel. */
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')

  redirect(destinoDaRotaAntiga('preview', await searchParams) ?? '/cadastre/painel')
}
