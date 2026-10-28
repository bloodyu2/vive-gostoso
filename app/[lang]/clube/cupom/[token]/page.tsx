// app/[lang]/clube/cupom/[token]/page.tsx
// A pagina do titular do cupom: mostra a imagem do bilhete e deixa baixar e compartilhar.
// Escondida como o resto da /clube (noindex, sem link publico). Quem tem o token e o titular.
import type { Metadata } from 'next'
import Image from 'next/image'
import { TemaClube } from '@/components/clube/tema'
import { AcoesCupom } from '@/components/clube/acoes-cupom'
import { VIVE } from '@/lib/bio/contato'
import { dicionario, ehIdioma, prefixo } from '@/lib/bio/dicionario'
import { cupomDoTitular } from '@/lib/clube/cupom'

type Props = { params: Promise<{ lang: string; token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return {
    title: { absolute: dicionario(lang).cupom.page_title },
    robots: { index: false, follow: false, nocache: true },
    referrer: 'no-referrer',
  }
}

function dataLegivel(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : lang, { timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))
}

export default async function CupomPage({ params }: Props) {
  const { lang, token } = await params
  const idioma = ehIdioma(lang) ? lang : 'pt'
  const t = dicionario(idioma).cupom
  const pre = prefixo(idioma)
  const cupom = await cupomDoTitular(token)
  const invalido = cupom.status === 'invalido' || !cupom.negocio || !cupom.codigo

  const urlImagem = `${pre}/clube/cupom/${token}/imagem`
  const banner =
    cupom.status === 'usado'
      ? t.banner_usado
      : cupom.status === 'expirado'
        ? t.banner_expirado.replace('{data}', cupom.expira_em ? dataLegivel(cupom.expira_em, idioma) : '')
        : cupom.status === 'cancelado'
          ? t.banner_cancelado
          : null

  return (
    <TemaClube>
      <header className="clube-capa-p" style={{ minHeight: '15rem' }}>
        <Image className="clube-hero-img" src="/negocios/biscoitos-damy/por-do-sol.jpg" alt="" fill priority sizes="100vw" />
        <div className="clube-wrap clube-marca-linha">
          <a className="clube-marca" href={`${pre}/`}>
            {VIVE.nome}
          </a>
        </div>
        <div className="clube-col" style={{ marginInline: 'auto' }}>
          <h1 className="clube-p-titulo clube-entra">{invalido ? t.invalido_titulo : t.pronto}</h1>
        </div>
      </header>

      <main className="clube-col" style={{ paddingBottom: '2.5rem' }}>
        <div className="clube-p-quadro">
          {invalido ? (
            <p style={{ color: 'var(--c-suave)' }}>{cupom.erro ? t.erro_carregar : t.invalido_texto}</p>
          ) : (
            <>
              <p style={{ color: 'var(--c-suave)' }}>{t.sub}</p>
              {banner ? (
                <p className="clube-erro" role="status" style={{ marginTop: '0.75rem' }}>
                  {banner}
                </p>
              ) : null}
              <img
                src={urlImagem}
                alt={t.alt_imagem.replace('{negocio}', cupom.negocio ?? '')}
                width={1080}
                height={1560}
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  marginTop: '1rem',
                  borderRadius: 12,
                  boxShadow: '0 12px 28px -14px rgba(27, 42, 42, 0.5)',
                }}
              />
              <AcoesCupom
                urlImagem={urlImagem}
                urlDownload={`${urlImagem}?baixar=1`}
                nomeArquivo={`${t.arquivo}-${cupom.slug ?? 'cupom'}.png`}
                textos={{
                  baixar: t.baixar,
                  compartilhar: t.compartilhar,
                  link_copiado: t.link_copiado,
                  compartilhar_texto: t.compartilhar_texto.replace('{negocio}', cupom.negocio ?? ''),
                }}
              />
              <p className="clube-regra">{t.ajuda_salvar}</p>
            </>
          )}
        </div>
        <div className="clube-acoes" style={{ marginTop: '1.5rem' }}>
          <a className="clube-btn clube-btn--contorno" href={`${pre}/clube`}>
            {t.voltar}
          </a>
        </div>
      </main>
    </TemaClube>
  )
}
