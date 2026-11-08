import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { destinoDaRotaAntiga } from '@/lib/clube/painel-abas'

/* Endereco antigo da area do parceiro do Passaporte (o QR do cupom e e-mails ja apontam para
   ele). Agora e a aba Passaporte do painel: /cadastre/painel?aba=passaporte. Quem nao esta
   logado vai para o login, como antes. */
export default async function PassaportePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')

  redirect(destinoDaRotaAntiga('passaporte', await searchParams) ?? '/cadastre/painel')
}
