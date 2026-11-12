import type { Metadata } from 'next'
import { SecaoLegal } from '@/components/legal/secao-legal'
import { EXCLUIR, PRIVACIDADE_EMAIL, type Idioma } from '@/data/paginas-legais'
import { routing } from '../../../i18n/routing'

const idioma = (l: string): Idioma => (l === 'en' || l === 'es' ? l : 'pt')

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = EXCLUIR[idioma((await params).lang)]
  return { title: t.titulo, description: t.descricao }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }))
}

export default async function ExcluirContaPage({ params }: { params: Promise<{ lang: string }> }) {
  const t = EXCLUIR[idioma((await params).lang)]
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-20">
      <h1 className="font-display font-bold text-4xl md:text-5xl leading-[1.1] tracking-tight text-fg-1 mb-10">{t.titulo}</h1>
      <div className="max-w-none text-fg-3-texto text-base md:text-lg leading-relaxed space-y-10">
        {t.secoes.map((s) => <SecaoLegal key={s.titulo} secao={s} email={{ endereco: PRIVACIDADE_EMAIL, assunto: t.assuntoEmail, corpo: t.corpoEmail }} />)}
        <p className="text-sm text-fg-3-texto">{t.atualizada}</p>
      </div>
    </div>
  )
}
