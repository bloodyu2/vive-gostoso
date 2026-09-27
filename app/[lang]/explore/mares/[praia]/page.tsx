import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/page-metadata'
import { ESTACOES, PRAIAS_MARES, distanciaKm, praiaPorSlug } from '@/data/praias-mares'
import { carregarSemana } from '@/lib/mares/carregar'
import { jsonLdMares, metadadosDaPraia, textosMares } from '@/lib/mares/seo-mares'
import { resumoDoDia, rotuloDoDia } from '@/lib/mares/formato'
import { safeJsonLd } from '@/lib/json-ld'
import { CartaoDoDia, EstadoVazio, RodapeFonte, SeletorPraias, TabelaSemana, caminhoLocal } from '@/components/mares/partes'
import { PainelDias } from '@/components/mares/painel-dias'

export const revalidate = 3600
export const dynamicParams = false

type Params = { params: Promise<{ lang: string; praia: string }> }

export function generateStaticParams() {
  return PRAIAS_MARES.map((p) => ({ praia: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, praia: slug } = await params
  const praia = praiaPorSlug(slug)
  if (!isLocale(lang) || !praia) notFound()
  const { semana } = await carregarSemana(slug)
  return metadadosDaPraia(praia, lang, resumoDoDia(semana[0].eventos, lang))
}

export default async function PraiaMaresPage({ params }: Params) {
  const { lang, praia: slug } = await params
  const praia = praiaPorSlug(slug)
  if (!isLocale(lang) || !praia) notFound()
  const t = textosMares(lang)
  const { hoje, semana, vazia } = await carregarSemana(slug)
  const km = Math.round(distanciaKm(praia, ESTACOES[praia.estacao]))

  return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLdMares(lang, praia)) }} />
      <p className="text-sm">
        <Link href={caminhoLocal(lang)} className="font-semibold text-teal hover:underline underline-offset-2">
          {t.titulo}
        </Link>
      </p>
      <h1 className="mt-2 font-display font-bold text-4xl md:text-6xl leading-[1.05] text-fg-1 [text-wrap:balance]">{praia.nome}</h1>
      <p className="mt-2 text-fg-2">{praia.municipio}, RN</p>

      <div className="mt-6">
        <SeletorPraias lang={lang} atual={praia.slug} />
      </div>

      <div className="mt-4">
        {vazia ? (
          <>
            <EstadoVazio lang={lang} />
            {praia.dica && (
              <div className="mt-5 rounded-xl bg-teal/10 p-4">
                <h2 className="text-sm font-semibold text-fg-1">{t.o_que_muda}</h2>
                <p className="mt-1 text-fg-2 leading-relaxed">{praia.dica[lang]}</p>
              </div>
            )}
          </>
        ) : (
          <PainelDias
            rotulo={t.dias}
            hojeDoServidor={hoje}
            dias={semana.map((d) => {
              const r = rotuloDoDia(d.data, hoje, lang)
              return { data: d.data, nome: r.nome, curta: r.data }
            })}
          >
            {semana.map((d) => (
              <CartaoDoDia key={d.data} dia={d} hoje={hoje} lang={lang} praia={praia} />
            ))}
          </PainelDias>
        )}
      </div>

      {!vazia && <TabelaSemana semana={semana} hoje={hoje} lang={lang} />}

      <RodapeFonte lang={lang} distanciaKm={km} />
    </main>
  )
}
