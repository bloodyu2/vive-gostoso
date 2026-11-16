// app/[lang]/clube/usei/[token]/page.tsx
// "Voce usou o cupom?": a pagina que o e-mail de um dia depois abre (e que o aviso da pagina do
// cupom tambem abre). Dois botoes, Usei e Ainda nao usei. Mostra so o primeiro nome, o negocio e
// a vantagem. A resposta e gravada no toque, nao ao abrir. Noindex, sem cache.
import type { Metadata } from 'next'
import { TemaClube } from '@/components/clube/tema'
import { ResponderUso } from '@/components/clube/responder-uso'
import { VIVE } from '@/lib/bio/contato'
import { dicionario, ehIdioma, prefixo } from '@/lib/bio/dicionario'
import { dadosDaPergunta } from '@/lib/clube/pergunta-servidor'

type Props = { params: Promise<{ lang: string; token: string }> }

/* dado pessoal por token: nunca prerenderizada nem compartilhada em cache */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return {
    title: { absolute: dicionario(lang).usei.page_title },
    robots: { index: false, follow: false, nocache: true },
    referrer: 'no-referrer',
  }
}

function dataLegivel(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : lang, { timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))
}

export default async function UseiPage({ params }: Props) {
  const { lang, token } = await params
  const idioma = ehIdioma(lang) ? lang : 'pt'
  const t = dicionario(idioma).usei
  const pre = prefixo(idioma)
  const d = await dadosDaPergunta(token)
  const invalido = d.status === 'invalido' || !d.negocio

  return (
    <TemaClube>
      <header className="clube-capa-p" style={{ minHeight: '10rem' }}>
        <div className="clube-wrap clube-marca-linha">
          <a className="clube-marca" href={`${pre}/`}>
            {VIVE.nome}
          </a>
        </div>
        <div className="clube-col" style={{ marginInline: 'auto' }}>
          <h1 className="clube-p-titulo clube-entra">{invalido ? t.invalido_titulo : t.titulo}</h1>
        </div>
      </header>

      <main className="clube-col" style={{ paddingBottom: '2.5rem' }}>
        <div className="clube-p-quadro">
          {invalido ? (
            <p style={{ color: 'var(--c-suave)' }}>{d.erro ? t.erro : t.invalido_texto}</p>
          ) : d.status === 'cancelado' ? (
            <p style={{ color: 'var(--c-suave)' }}>{t.cancelado}</p>
          ) : (
            <>
              <p style={{ fontWeight: 600 }}>
                {t.sub.replace('{negocio}', () => d.negocio ?? '').replace('{beneficio}', () => (d.beneficio ?? '').replace(/[.\s]+$/, ''))}
              </p>
              <p style={{ color: 'var(--c-suave)' }}>{t.pergunta}</p>
              <ResponderUso
                token={token}
                respostaInicial={d.resposta ?? null}
                jaUsado={d.status === 'usado'}
                primeiroNome={d.primeiro_nome ?? ''}
                validade={d.expira_em ? dataLegivel(d.expira_em, idioma) : ''}
                textos={{
                  btn_usei: t.btn_usei,
                  btn_nao: t.btn_nao,
                  enviando: t.enviando,
                  obrigado_sim: t.obrigado_sim,
                  obrigado_nao: t.obrigado_nao,
                  ja_usado: t.ja_usado,
                  erro: t.erro,
                }}
              />
              <p className="clube-regra" style={{ marginTop: '1.25rem' }}>
                {t.nota}
              </p>
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
