import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { destinoDaRotaAntiga } from '@/lib/clube/painel-abas'
import Perfil from '@/views/cadastre/Perfil'

/* Editar um negocio (?bizId=...) agora e a aba Perfil e fotos do painel. Sem bizId esta e a
   tela de CRIAR um negocio novo e continua aqui, inteira. */
export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')

  const destino = destinoDaRotaAntiga('perfil', await searchParams)
  if (destino) redirect(destino)

  return <Perfil />
}
