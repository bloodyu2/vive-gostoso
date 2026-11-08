import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { destinoDaRotaAntiga } from '@/lib/clube/painel-abas'

/* "Meus negocios" agora e o Resumo do painel em abas. O ?new=1 (aviso de negocio criado) segue junto. */
export default async function MeusNegociosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')

  redirect(destinoDaRotaAntiga('negocios', await searchParams) ?? '/cadastre/painel')
}
