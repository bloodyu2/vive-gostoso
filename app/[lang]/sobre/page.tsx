// app/[lang]/sobre/page.tsx
import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import Sobre from '@/views/Sobre'
import { getParametrosProduto } from '@/lib/supabase/queries'

export const revalidate = 3600

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('sobre', lang as Locale)
}

export default async function SobrePage() {
  /* Preco e percentual vem do servidor para sair ja no HTML. Sem isso a pagina
     institucional aparece sem numero ate a hidratacao. */
  const parametros = await getParametrosProduto()
  return <Sobre initialParametros={parametros} />
}
