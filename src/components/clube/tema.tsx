import { Bricolage_Grotesque, Figtree } from 'next/font/google'
import '@/styles/clube.css'

/* Fontes do desenho do Passaporte Gostoso, servidas pelo proprio site (next/font).
   Valem so dentro de .clube: o resto do site segue com Fraunces e Jakarta. */
const titulo = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-clube-titulo',
})
const corpo = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-clube-corpo',
})

/** `escuroAuto`: a pagina segue o modo escuro do aparelho (hoje so a /p/NN). O resto do
 *  clube segue so no tema claro do passaporte. */
export function TemaClube({ children, escuroAuto = false }: { children: React.ReactNode; escuroAuto?: boolean }) {
  return <div className={`clube ${titulo.variable} ${corpo.variable}${escuroAuto ? ' clube--escuro-auto' : ''}`}>{children}</div>
}
