'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { interpretarUso, linkParaAmigo, textoParaAmigo, type ResultadoUso, type Vantagem } from '@/lib/clube/vantagens'

/** Textos já no idioma da página (o servidor resolve; este componente não carrega
 *  o i18n do cliente, que só sincroniza o idioma depois da hidratação). */
export interface TextosLista {
  status_no_ar: string
  status_combinacao: string
  usar: string
  fechar: string
  carregando: string
  codigo_legenda: string
  amigo: string
  amigo_texto: string
  rodape_vantagens: string
  em_breve: string
  esgotada: string
  erro_usar: string
  erro_indisponivel: string
  erro_muitos: string
  vazio: string
  validade: string
  limite: string
}

interface Props {
  vantagens: Vantagem[]
  textos: TextosLista
  /** Código da plaquinha de onde a pessoa veio (dois dígitos), ou null. */
  origem: string | null
  /** Prefixo de idioma para o perfil do negócio ('' no pt). */
  prefixo: string
  /** Link absoluto da /clube no idioma da página, para o "Mandar para um amigo". */
  linkClube: string
  /** Idioma, para formatar a data de validade. */
  lang: string
  /** false quando o banco não respondeu: os cartões aparecem, mas sem Usar. */
  doBanco: boolean
}

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'codigo'; codigo: string }
  | { tipo: 'erro'; mensagem: string }

/** Id aleatório do aparelho, guardado no navegador. Não é dado pessoal: serve só para
 *  o mesmo aparelho receber o mesmo código no mesmo dia, sem contar duas vezes. */
function idDoAparelho(): string | null {
  try {
    let id = localStorage.getItem('vg-clube-aparelho')
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
      id = crypto.randomUUID()
      localStorage.setItem('vg-clube-aparelho', id)
    }
    return id
  } catch {
    return null
  }
}

/** Dia no fuso de Gostoso (o mesmo que o banco usa para virar o código). */
function diaDeGostoso(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(new Date())
}

function dataCurta(iso: string, lang: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : lang, { timeZone: 'UTC' }).format(d)
}

export function ListaVantagens({ vantagens, textos, origem, prefixo, linkClube, lang, doBanco }: Props) {
  const [estados, setEstados] = useState<Record<string, Estado | undefined>>({})
  const contou = useRef(false)

  /* Vezes que a vantagem foi vista: uma chamada por visita, uma vez por dia por
     aparelho (sessionStorage). Sem dado pessoal, falha em silêncio. */
  useEffect(() => {
    if (!doBanco || contou.current) return
    contou.current = true
    const ids = vantagens.map((v) => v.partnerId)
    if (ids.length === 0) return
    try {
      const chave = `vg-clube-vistas-${diaDeGostoso()}`
      if (sessionStorage.getItem(chave)) return
      sessionStorage.setItem(chave, '1')
    } catch {
      /* sem sessionStorage: conta mesmo assim */
    }
    void supabase.rpc('gostoso_club_registrar_vistas', { p_partner_ids: ids })
  }, [doBanco, vantagens])

  async function usar(v: Vantagem) {
    setEstados((e) => ({ ...e, [v.partnerId]: { tipo: 'carregando' } }))
    let resultado: ResultadoUso
    try {
      const { data, error } = await supabase.rpc('gostoso_club_usar', {
        p_partner: v.partnerId,
        p_origem: origem,
        p_aparelho: idDoAparelho(),
      })
      resultado = interpretarUso(data, error)
    } catch {
      resultado = { tipo: 'erro', motivo: 'erro' }
    }
    if (resultado.tipo === 'codigo') {
      setEstados((e) => ({ ...e, [v.partnerId]: { tipo: 'codigo', codigo: resultado.codigo } }))
      return
    }
    const mensagem =
      resultado.motivo === 'esgotada'
        ? textos.esgotada
        : resultado.motivo === 'muitos'
          ? textos.erro_muitos
          : resultado.motivo === 'indisponivel'
            ? textos.erro_indisponivel
            : textos.erro_usar
    setEstados((e) => ({ ...e, [v.partnerId]: { tipo: 'erro', mensagem } }))
  }

  function fechar(id: string) {
    setEstados((e) => ({ ...e, [id]: undefined }))
  }

  if (vantagens.length === 0) {
    return <p className="clube-aviso">{textos.vazio}</p>
  }

  return (
    <>
      <ul className="clube-lista">
        {vantagens.map((v) => {
          const estado = estados[v.partnerId]
          const noAr = v.status === 'no_ar'
          const meta = [
            v.limiteMensal ? textos.limite.replace('{n}', String(v.limiteMensal)) : null,
            v.validoAte ? textos.validade.replace('{data}', dataCurta(v.validoAte, lang)) : null,
          ].filter(Boolean)
          const regra = [v.regra, ...meta].filter(Boolean).join(' ')
          const aberto = estado?.tipo === 'codigo'
          const mensagemAmigo = textoParaAmigo(textos.amigo_texto, v, linkClube)

          return (
            <li key={v.partnerId} className="clube-card">
              <div className="clube-card-topo">
                <div>
                  {v.tipo ? <p className="clube-tipo">{v.tipo}</p> : null}
                  <h3 className="clube-nome">
                    <a href={`${prefixo}/negocio/${v.slug}`}>{v.nome}</a>
                  </h3>
                </div>
                <span className={`clube-tag ${noAr ? 'clube-tag--no-ar' : 'clube-tag--combinacao'}`}>
                  {noAr ? textos.status_no_ar : textos.status_combinacao}
                </span>
              </div>

              <p className="clube-beneficio">{v.beneficio}</p>
              {regra ? <p className="clube-regra">{regra}</p> : null}

              {!noAr ? (
                <p className="clube-aviso">{textos.em_breve}</p>
              ) : v.esgotada ? (
                <p className="clube-aviso">{textos.esgotada}</p>
              ) : (
                <div className="clube-acoes">
                  {aberto ? (
                    <button type="button" className="clube-btn clube-btn--contorno" onClick={() => fechar(v.partnerId)}>
                      {textos.fechar}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="clube-btn clube-btn--verde"
                      onClick={() => usar(v)}
                      disabled={!doBanco || estado?.tipo === 'carregando'}
                    >
                      {estado?.tipo === 'carregando' ? textos.carregando : textos.usar}
                    </button>
                  )}
                </div>
              )}

              {aberto ? (
                <div className="clube-codigo-caixa" role="status">
                  <p className="clube-codigo-legenda">{textos.codigo_legenda}</p>
                  <p className="clube-codigo">{estado.codigo}</p>
                </div>
              ) : null}

              {estado?.tipo === 'erro' ? (
                <p className="clube-erro" role="alert">
                  {estado.mensagem}
                </p>
              ) : null}

              {noAr && doBanco ? (
                <div className="clube-acoes">
                  <a
                    className="clube-btn clube-btn--contorno"
                    href={linkParaAmigo(mensagemAmigo)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {textos.amigo}
                  </a>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
      <p className="clube-nota">{textos.rodape_vantagens}</p>
    </>
  )
}
