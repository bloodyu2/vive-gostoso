import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata, isLocale } from '@/lib/page-metadata'
import { notFound } from 'next/navigation'
import { praiasPorMunicipio } from '@/data/praias-mares'
import { carregarSemana, lerEventos } from '@/lib/mares/carregar'
import { jsonLdMares, preencher, textosMares, tituloDoIndice } from '@/lib/mares/seo-mares'
import { safeJsonLd } from '@/lib/json-ld'
import { melhorJanela } from '@/lib/mares/melhor-janela'
import { formatarHora } from '@/lib/mares/tempo'
import { CartaoDoDia, EstadoVazio, RodapeFonte, SeletorPraias, caminhoLocal } from '@/components/mares/partes'

/* Tabua de mares, pagina indice. Renderizada no servidor; o navegador nao
   busca nada. `revalidate` fica declarado, mas hoje o HTML de todo o site e
   dinamico por causa do nonce de CSP (proxy.ts); quem segura a leitura por
   1 h e o cache de dados em src/lib/mares/consulta.ts. */
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('mares', lang)
}

export default async function MaresPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = textosMares(lang)
  const { hoje, semana, vazia, principal, reserva } = await carregarSemana()
  const grupos = await Promise.all(
    praiasPorMunicipio().map(async (g) => ({
      municipio: g.municipio,
      praias: await Promise.all(
        g.praias.map(async (p) => {
          if (vazia || !p.melhorMare) return { p, janela: null }
          const { eventos } = await lerEventos(hoje, p)
          return { p, janela: melhorJanela(eventos, hoje, p.melhorMare) }
        }),
      ),
    })),
  )
  const diaDeHoje = semana[0]

  return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLdMares(lang)) }} />
      <h1 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] text-fg-1 [text-wrap:balance]">{tituloDoIndice(lang)}</h1>
      <p className="mt-4 text-lg text-fg-2 leading-relaxed max-w-[60ch]">{t.intro}</p>

      <div className="mt-8">
        <SeletorPraias lang={lang} />
      </div>

      <div className="mt-6">
        {vazia ? <EstadoVazio lang={lang} /> : <CartaoDoDia dia={diaDeHoje} hoje={hoje} lang={lang} reserva={reserva} />}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-fg-1">{t.hoje_em}</h2>
        {grupos.map((g) => (
          <div key={g.municipio} className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-3">{g.municipio}</h3>
            <ul className="mt-2 divide-y divide-border-1 border-y border-border-1">
              {g.praias.map(({ p, janela }) => (
                <li key={p.slug}>
                  <Link
                    href={caminhoLocal(lang, p.slug)}
                    className="group block py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                  >
                    <span className="font-display text-xl font-semibold text-fg-1 group-hover:text-teal transition-colors motion-reduce:transition-none">
                      {p.nome}
                    </span>
                    {p.dica && <span className="mt-1 block text-fg-2 leading-relaxed">{p.dica[lang]}</span>}
                    {janela && p.rotuloJanela && (
                      <span className="mt-1 block font-semibold text-fg-1">
                        {preencher(t.melhor_entre, {
                          rotulo: p.rotuloJanela[lang],
                          inicio: formatarHora(janela.inicio),
                          fim: formatarHora(janela.fim),
                        })}
                      </span>
                    )}
                    <span className="sr-only">{preencher(t.ver_praia, { praia: p.nome })}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <RodapeFonte lang={lang} principal={principal} reserva={reserva} />
    </main>
  )
}
