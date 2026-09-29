// app/api/revalidar/route.ts
// KAN-463: limpa o cache de dados das paginas publicas depois de uma gravacao
// feita pelo site. Exige sessao do Supabase: anonimo recebe 401. Quem chama e o
// fetch do cliente do navegador (src/lib/supabase/avisar-gravacao.ts).
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { revalidarSeLogado } from '@/lib/supabase/revalidar'

export async function POST() {
  return revalidarSeLogado(
    async () => {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      return data.user ? { id: data.user.id } : null
    },
    // expire 0: a proxima visita ja le o banco, sem servir o dado velho.
    (tag) => revalidateTag(tag, { expire: 0 }),
  )
}
