// app/[lang]/clube/page.tsx
// Passaporte Gostoso: a pagina do clube de vantagens. Escondida ate o lancamento
// (ordem do Victor, 26/10/2026): noindex, nofollow, fora do sitemap, sem link em
// nenhuma pagina publica. Quem chega aqui recebeu o link direto.
// Para lancar, ver src/lib/clube/config.ts.
import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { CalendarDays } from 'lucide-react'
import { Carimbo } from '@/components/clube/carimbo'
import { ListaVantagens } from '@/components/clube/lista-vantagens'
import { TemaClube } from '@/components/clube/tema'
import { dicionario, ehIdioma, prefixo } from '@/lib/bio/dicionario'
import { VIVE } from '@/lib/bio/contato'
import { carregarVantagens } from '@/lib/clube/carregar'
import { LANCAMENTO_PREVISTO } from '@/lib/clube/config'
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

/** A primeira frase do texto do fundo vira o destaque da seção; o resto fica embaixo. */
function separarPrimeiraFrase(texto: string): [string, string] {
  const i = texto.indexOf('. ')
  return i === -1 ? [texto, ''] : [texto.slice(0, i + 1), texto.slice(i + 2)]
}

export default async function ClubePage({ params, searchParams }: Props) {
  const { lang } = await params
  const idioma = ehIdioma(lang) ? lang : 'pt'
  const t = dicionario(idioma).clube
  const { n } = await searchParams
  const origem = origemValida(n)
  const pre = prefixo(idioma)
  const { vantagens, doBanco } = await carregarVantagens()
  const [fundoFrase, fundoResto] = separarPrimeiraFrase(t.fundo_texto)
  const dataDoLancamento = new Intl.DateTimeFormat(idioma === 'pt' ? 'pt-BR' : idioma, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${LANCAMENTO_PREVISTO}T12:00:00Z`))

  const passos = [
    { t: t.passo1_t, d: t.passo1_d },
    { t: t.passo2_t, d: t.passo2_d },
    { t: t.passo3_t, d: t.passo3_d },
  ]

  return (
    <TemaClube>
      <header className="clube-hero">
        <Image
          className="clube-hero-img"
          src="/negocios/biscoitos-damy/por-do-sol.jpg"
          alt={t.foto_alt}
          fill
          priority
          sizes="100vw"
        />
        <div className="clube-wrap">
          <div className="clube-topo-linha">
            <a className="clube-marca" href={`${pre}/`}>
              {t.marca}
            </a>
            <Carimbo centro={t.selo} anel={t.selo_anel} />
          </div>
        </div>
        <div className="clube-wrap">
          <div className="clube-hero-corpo">
            <h1 className="clube-h1 clube-entra" style={{ '--i': 1 } as CSSProperties}>
              {t.h1}
            </h1>
            <p className="clube-intro clube-entra" style={{ '--i': 2 } as CSSProperties}>
              {t.intro}
            </p>
            <div className="clube-hero-acoes clube-entra" style={{ '--i': 3 } as CSSProperties}>
              <a className="clube-btn clube-btn--mostarda" href="#vantagens">
                {t.ver_vantagens}
              </a>
              <a className="clube-btn clube-btn--fantasma" href="#como">
                {t.como_titulo}
              </a>
            </div>
            <p className="clube-lancamento clube-entra" style={{ '--i': 4 } as CSSProperties}>
              <CalendarDays size={20} aria-hidden />
              <span>{t.lancamento.replace('{data}', dataDoLancamento)}</span>
            </p>
          </div>
        </div>
      </header>

      <main className="clube-secao-clara">
        <section id="como" className="clube-secao" aria-labelledby="como-titulo">
          <div className="clube-wrap">
            <h2 id="como-titulo" className="clube-h2">
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

        <section id="vantagens" className="clube-secao" style={{ paddingTop: 0 }} aria-labelledby="vantagens-titulo">
          <div className="clube-wrap">
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
                ver_cupom: t.ver_cupom,
                resgatar_de_novo: t.resgatar_de_novo,
                amigo: t.amigo,
                amigo_texto: t.amigo_texto,
                rodape_vantagens: t.rodape_vantagens,
                em_breve: t.em_breve,
                vazio: t.vazio,
                validade: t.validade,
                limite: t.limite,
                form_titulo: t.form_titulo,
                campo_nome: t.campo_nome,
                campo_email: t.campo_email,
                campo_telefone: t.campo_telefone,
                nota_dados: t.nota_dados,
                consentimento: t.consentimento,
                politica_link: t.politica_link,
                gerar_cupom: t.gerar_cupom,
                gerando: t.gerando,
                cancelar: t.cancelar,
                erro_nome: t.erro_nome,
                erro_email: t.erro_email,
                erro_telefone: t.erro_telefone,
                erro_consentimento: t.erro_consentimento,
                erro_ja_tem: t.erro_ja_tem,
                erro_resgate: t.erro_resgate,
                erro_muitos: t.erro_muitos,
                erro_indisponivel: t.erro_indisponivel,
                esgotada: t.esgotada,
              }}
            />
          </div>
        </section>

        <section className="clube-faixa" aria-labelledby="negocio">
          <span className="clube-sol" aria-hidden="true" />
          <div className="clube-wrap">
            <h2 id="negocio" className="clube-h2">
              {t.negocio_titulo}
            </h2>
            <p>{t.negocio_texto}</p>
            <div className="clube-faixa-acoes">
              <a
                className="clube-btn clube-btn--creme"
                href={buildWhatsAppLink(VIVE.whatsapp, t.quero_msg)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.quero}
              </a>
            </div>
          </div>
        </section>

        <section className="clube-secao" aria-labelledby="fundo">
          <div className="clube-wrap clube-fundo">
            <div>
              <h2 id="fundo" className="clube-tipo" style={{ fontFamily: 'var(--font-clube-corpo)', fontSize: '0.8125rem' }}>
                {t.fundo_titulo}
              </h2>
              <p className="clube-fundo-frase" style={{ marginTop: '0.75rem' }}>
                {fundoFrase}
              </p>
            </div>
            <div>
              <p className="clube-fundo-texto">{fundoResto}</p>
              <div className="clube-faixa-acoes" style={{ marginTop: '1.25rem' }}>
                <a
                  className="clube-btn clube-btn--verde"
                  href={buildWhatsAppLink(VIVE.whatsapp, t.patrocinar_msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.patrocinar}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="clube-rodape">
        <div className="clube-wrap">{t.assinatura}</div>
      </footer>
    </TemaClube>
  )
}
