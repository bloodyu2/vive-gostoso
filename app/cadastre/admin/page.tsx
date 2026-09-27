import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/queries'
import Admin from '@/views/cadastre/Admin'
import { diasSemPrevisao } from '@/lib/mares/carregar'
import { preencher, textosMares } from '@/lib/mares/seo-mares'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')
  await requireAdmin(supabase, user.id)

  /* Tabua de mares: a Marinha publica uma edicao por ano. Se faltar previsao
     em qualquer dia dos proximos 30, o admin ve o aviso para rodar o
     importador (scripts/mares/importar-tabua-marinha.ts). */
  const faltando = await diasSemPrevisao(30)

  return (
    <>
      {faltando.length > 0 && (
        <div role="status" className="mx-auto max-w-5xl px-5 md:px-8 pt-6">
          <p className="rounded-xl border border-ocre bg-ocre/10 p-4 text-sm font-medium text-fg-1">
            {preencher(textosMares('pt').admin_aviso, { n: faltando.length })}
          </p>
        </div>
      )}
      <Admin />
    </>
  )
}
