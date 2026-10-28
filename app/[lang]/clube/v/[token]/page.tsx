// app/[lang]/clube/v/[token]/page.tsx
// Verificacao do cupom: e o que o QR da imagem abre. Mostra o status, o primeiro nome e os
// dados do cupom, e nada mais (nunca e-mail, telefone nem o nome inteiro). Quem confere
// marca o cupom como usado no painel do parceiro, logado. Noindex.
import type { Metadata } from 'next'
import { Check, Clock, X } from 'lucide-react'
import { TemaClube } from '@/components/clube/tema'
import { VIVE } from '@/lib/bio/contato'
import { dicionario, ehIdioma, prefixo } from '@/lib/bio/dicionario'
import { verificarCupom } from '@/lib/clube/cupom'
import { formatarCodigo } from '@/lib/clube/resgate'

type Props = { params: Promise<{ lang: string; token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return {
    title: { absolute: dicionario(lang).cupom.verificar_page_title },
    robots: { index: false, follow: false, nocache: true },
    referrer: 'no-referrer',
  }
}

function dataLegivel(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : lang, { timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))
}

function dataHora(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : lang, {
    timeZone: 'America/Fortaleza',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export default async function VerificarPage({ params }: Props) {
  const { lang, token } = await params
  const idioma = ehIdioma(lang) ? lang : 'pt'
  const t = dicionario(idioma).cupom
  const pre = prefixo(idioma)
  const v = await verificarCupom(token)

  const rotuloStatus =
    v.status === 'valido'
      ? t.status_valido
      : v.status === 'usado'
        ? t.status_usado
        : v.status === 'expirado'
          ? t.status_expirado
          : v.status === 'cancelado'
            ? t.status_cancelado
            : t.status_invalido
  const nota =
    v.status === 'valido'
      ? t.verificar_nota_valido
      : v.status === 'usado'
        ? t.verificar_nota_usado
        : v.status === 'expirado'
          ? t.verificar_nota_expirado
          : v.status === 'cancelado'
            ? t.verificar_nota_cancelado
            : v.erro
              ? t.erro_carregar
              : t.invalido_texto
  const Icone = v.status === 'valido' ? Check : v.status === 'expirado' ? Clock : X
  const cor = v.status === 'valido' ? '#14633a' : v.status === 'expirado' ? '#8a5a00' : '#8a2410'

  return (
    <TemaClube>
      <header className="clube-topo-painel">
        <div className="clube-col">
          <div className="clube-marca-linha">
            <a className="clube-marca" href={`${pre}/`}>
              {VIVE.nome}
            </a>
            <span className="clube-selo">{t.verificar_titulo}</span>
          </div>
        </div>
      </header>

      <main className="clube-col" style={{ paddingBlock: '1.75rem 2.5rem' }}>
        <div className="clube-card">
          <div className="clube-card-corpo">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: cor }}>
              <span
                aria-hidden="true"
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: '50%',
                  border: '2px solid currentColor',
                  boxShadow: 'inset 0 0 0 3px var(--c-papel), inset 0 0 0 4.5px currentColor',
                }}
              >
                <Icone size={26} strokeWidth={2.5} />
              </span>
              <p
                role="status"
                style={{
                  fontFamily: 'var(--font-clube-titulo), system-ui, sans-serif',
                  fontWeight: 800,
                  fontSize: '1.875rem',
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                }}
              >
                {rotuloStatus}
              </p>
            </div>

            {v.status !== 'invalido' ? (
              <>
                <h1 className="clube-nome" style={{ marginTop: '1.25rem', fontSize: '1.625rem' }}>
                  {v.negocio}
                </h1>
                <p className="clube-beneficio" style={{ marginTop: '0.5rem' }}>
                  {v.beneficio}
                </p>
                <p className="clube-regra" style={{ marginTop: '1rem' }}>
                  {t.verificar_de.replace('{nome}', v.primeiro_nome ?? '')}
                </p>
              </>
            ) : null}
          </div>

          {v.status !== 'invalido' && v.codigo ? (
            <>
              <div className="clube-picote" aria-hidden="true" />
              <div className="clube-canhoto" style={{ paddingTop: '1.25rem' }}>
                <div>
                  <p className="clube-tipo">{t.codigo}</p>
                  <p
                    style={{
                      fontFamily: 'var(--font-clube-titulo), system-ui, sans-serif',
                      fontWeight: 800,
                      fontSize: '2rem',
                      letterSpacing: '0.02em',
                      color: 'var(--c-verde)',
                    }}
                  >
                    {formatarCodigo(v.codigo)}
                  </p>
                </div>
                <p className="clube-aviso">
                  {v.status === 'usado' && v.usado_em
                    ? t.verificar_usado_em.replace('{data}', dataHora(v.usado_em, idioma))
                    : v.expira_em
                      ? t.verificar_validade.replace('{data}', dataLegivel(v.expira_em, idioma))
                      : null}
                </p>
              </div>
            </>
          ) : null}
        </div>

        <p className="clube-nota">{nota}</p>
        <div className="clube-acoes" style={{ marginTop: '1.25rem' }}>
          <a className="clube-btn clube-btn--verde" href="/cadastre/passaporte">
            {t.sou_estabelecimento}
          </a>
        </div>
      </main>
    </TemaClube>
  )
}
