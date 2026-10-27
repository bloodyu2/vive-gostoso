import { redirect } from 'next/navigation'
import { TemaClube } from '@/components/clube/tema'
import { createClient } from '@/lib/supabase/server'
import Passaporte from '@/views/cadastre/Passaporte'

/* Area do parceiro do Passaporte Gostoso: minha vantagem, ligar e pausar, usos.
   Mesmo login do painel (/cadastre). Fora do indice: /cadastre/ ja e disallow. */
export default async function PassaportePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')

  return (
    <TemaClube>
      <Passaporte />
    </TemaClube>
  )
}
