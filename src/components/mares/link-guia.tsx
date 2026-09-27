import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import { SLUG_GUIA_MARES, caminhoDoGuiaMares, postPublicado } from '@/lib/blog/post-publicado'
import { slugNoIdioma, type IdiomaBlog } from '@/lib/blog/traducoes'

const DICIONARIOS = { pt, en, es } as const

export function textosGuiaMares(lang: IdiomaBlog) {
  return DICIONARIOS[lang].guia_mares
}

/** O guia (post do blog) esta publicado no idioma? Sem isso o link nao aparece. */
export function guiaMaresPublicado(lang: IdiomaBlog): Promise<boolean> {
  return postPublicado(slugNoIdioma(SLUG_GUIA_MARES, lang))
}

/** Link discreto para o post da tabua, so quando ele esta publicado. */
export async function LinkGuiaMares({ lang, className = '' }: { lang: IdiomaBlog; className?: string }) {
  if (!(await guiaMaresPublicado(lang))) return null
  return (
    <p className={className}>
      <Link
        href={caminhoDoGuiaMares(lang)}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
      >
        {textosGuiaMares(lang).leia}
        <ArrowRight aria-hidden="true" className="w-4 h-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    </p>
  )
}
