// app/[lang]/clube/page.tsx
// Passaporte Gostoso: a pagina do clube de vantagens. Escondida ate o lancamento
// (ordem do Victor, 26/10/2026): noindex, nofollow, fora do sitemap, sem link em
// nenhuma pagina publica. Quem chega aqui recebeu o link direto.
// Para lancar, ver src/lib/clube/config.ts.
import type { Metadata } from 'next'
import { ListaVantagens } from '@/components/clube/lista-vantagens'
import { TemaClube } from '@/components/clube/tema'
import { dicionario, ehIdioma, prefixo } from '@/lib/bio/dicionario'
import { VIVE } from '@/lib/bio/contato'
import { carregarVantagens } from '@/lib/clube/carregar'
import { origemValida } from '@/lib/clube/vantagens'
import { buildWhatsAppLink } from '@/lib/whatsapp'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ n?: string | string[] }>
}

export function generateStaticParams() {
  return [{ lang: 'pt' }, { lang: 'en' }, { lang: 'es' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const t = dicionario(lang).clube
  return {
    title: { absolute: t.page_title },
    description: t.page_description,
    robots: { index: false, follow: false, nocache: true },
    openGraph: { title: t.page_title, description: t.page_description, siteName: VIVE.nome },
  }
}

export default async function ClubePage({ params, searchParams }: Props) {
  const { lang } = await params
  const idioma = ehIdioma(lang) ? lang : 'pt'
  const t = dicionario(idioma).clube
  const { n } = await searchParams
  const origem = origemValida(n)
  const pre = prefixo(idioma)
  const { vantagens, doBanco } = await carregarVantagens()

  const passos = [
    { t: t.passo1_t, d: t.passo1_d },
    { t: t.passo2_t, d: t.passo2_d },
    { t: t.passo3_t, d: t.passo3_d },
  ]

  return (
    <TemaClube>
      <header className="clube-topo">
        <div className="clube-col">
          <div className="clube-marca-linha">
            <a className="clube-marca" href={`${pre}/`}>
              {t.marca}
            </a>
            <span className="clube-selo">{t.selo}</span>
          </div>
          <h1 className="clube-h1">{t.h1}</h1>
          <p className="clube-intro">{t.intro}</p>
          <a className="clube-btn clube-btn--mostarda" href="#vantagens" style={{ marginTop: '1.5rem' }}>
            {t.ver_vantagens}
          </a>
        </div>
      </header>

      <main>
        <section className="clube-secao" aria-labelledby="como">
          <div className="clube-col">
            <h2 id="como" className="clube-h2">
              {t.como_titulo}
            </h2>
            <ol className="clube-passos">
              {passos.map((p, i) => (
                <li key={p.t} className="clube-passo">
                  <span className="clube-passo-num" aria-hidden>
                    {i + 1}
                  </span>
                  <div>
                    <p className="clube-passo-t">{p.t}</p>
                    <p className="clube-passo-d">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="vantagens" className="clube-secao" aria-labelledby="vantagens-titulo">
          <div className="clube-col">
            <h2 id="vantagens-titulo" className="clube-h2">
              {t.vantagens_titulo}
            </h2>
            <ListaVantagens
              vantagens={vantagens}
              origem={origem}
              prefixo={pre}
              linkClube={`${VIVE.site}${pre}/clube`}
              lang={idioma}
              doBanco={doBanco}
              textos={{
                status_no_ar: t.status_no_ar,
                status_combinacao: t.status_combinacao,
                usar: t.usar,
                fechar: t.fechar,
                carregando: t.carregando,
                codigo_legenda: t.codigo_legenda,
                amigo: t.amigo,
                amigo_texto: t.amigo_texto,
                rodape_vantagens: t.rodape_vantagens,
                em_breve: t.em_breve,
                esgotada: t.esgotada,
                erro_usar: t.erro_usar,
                erro_indisponivel: t.erro_indisponivel,
                erro_muitos: t.erro_muitos,
                vazio: t.vazio,
                validade: t.validade,
                limite: t.limite,
              }}
            />
          </div>
        </section>

        <section className="clube-laranja" aria-labelledby="negocio">
          <div className="clube-col">
            <h2 id="negocio" className="clube-h2">
              {t.negocio_titulo}
            </h2>
            <p>{t.negocio_texto}</p>
            <a
              className="clube-btn clube-btn--creme"
              href={buildWhatsAppLink(VIVE.whatsapp, t.quero_msg)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.quero}
            </a>
          </div>
        </section>

        <section className="clube-secao clube-fundo" aria-labelledby="fundo">
          <div className="clube-col">
            <h2 id="fundo" className="clube-h2">
              {t.fundo_titulo}
            </h2>
            <p>{t.fundo_texto}</p>
          </div>
        </section>
      </main>

      <footer className="clube-rodape">
        <div className="clube-col">{t.assinatura}</div>
      </footer>
    </TemaClube>
  )
}
