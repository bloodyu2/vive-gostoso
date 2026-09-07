import type { Metadata } from 'next'
import Parceiros from '@/views/Parceiros'
import { getParametrosProduto } from '@/lib/supabase/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  /* `absolute` e travessao: o layout raiz define title.template = '%s | Vive
     Gostoso', entao sem `absolute` a marca entrava duas vezes, e o titulo saia
     "Cadastre seu negocio — Vive Gostoso | Vive Gostoso". O travessao longo
     tambem e proibido na marca. */
  title: { absolute: 'Cadastre seu negócio no Vive Gostoso' },
  description: 'Apareça no maior diretório digital de São Miguel do Gostoso. Cadastro gratuito para negócios locais. Pousadas, restaurantes, kitesurf e muito mais.',
  openGraph: {
    title: 'Seu negócio no Vive Gostoso',
    description: 'Cadastre seu negócio grátis e seja encontrado pelos turistas de São Miguel do Gostoso.',
    type: 'website',
  },
}

export default async function ParceirosPage() {
  const parametros = await getParametrosProduto()
  return <Parceiros initialParametros={parametros} />
}
