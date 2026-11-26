'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { BedDouble, Check, Compass, Palette, Share2, Ticket, UtensilsCrossed, Waves } from 'lucide-react'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { armazemDoNavegador, lerCupons } from '@/lib/clube/cupons-locais'
import { chipsDeCategorias, filtrarPorCategoria } from '@/lib/clube/filtro'
import { juntarRegra, linkAgendamento, linkParaAmigo, textoParaAmigo, type Vantagem } from '@/lib/clube/vantagens'
import { AvisoAgendamento } from './aviso-agendamento'
import { FormResgate, type TextosForm } from './form-resgate'
import { useVistasPorCartao } from './usar-vistas-por-cartao'

/** Textos já no idioma da página (o servidor resolve; este componente não carrega
 *  o i18n do cliente, que só sincroniza o idioma depois da hidratação). */
export interface TextosLista extends TextosForm {
  status_no_ar: string
  status_combinacao: string
  usar: string
  ver_cupom: string
  resgatar_de_novo: string
  amigo: string
  amigo_texto: string
  rodape_vantagens: string
  em_breve: string
  vazio: string
  validade: string
  limite: string
  filtro_rotulo: string
  filtro_todos: string
  filtro_vazio: string
  filtro_ver_todos: string
  /** "Mostrando {n} de {total} parceiros" */
  filtro_resultado: string
  /** "Agende antes com {com}" e o resto do aviso de quem so atende com hora marcada */
  agendar_titulo: string
  agendar_texto: string
  agendar_botao: string
  /** mensagem pronta do WhatsApp, com {beneficio} e {negocio} */
  agendar_msg: string
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
  /** false quando o banco não respondeu: os cartões aparecem, mas sem Resgatar. */
  doBanco: boolean
}

function dataCurta(iso: string, lang: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : lang, { timeZone: 'UTC' }).format(d)
}

/** Um ícone por tipo de negócio, pelo rótulo do card. Cai em bilhete. */
function IconeDoTipo({ tipo, size = 22 }: { tipo: string | null; size?: number }) {
  const t = (tipo ?? '').toLowerCase()
  const props = { size, strokeWidth: 2, 'aria-hidden': true } as const
  if (/passeio|tour|aventura|kite|buggy/.test(t)) return <Compass {...props} />
  if (/hosped|pousada|hotel|stay|lodging/.test(t)) return <BedDouble {...props} />
  if (/artesan|craft|loja|shop/.test(t)) return <Palette {...props} />
  if (/com(er|ida)|restaur|food|bar|caf/.test(t)) return <UtensilsCrossed {...props} />
  if (/praia|beach|esporte|sport/.test(t)) return <Waves {...props} />
  return <Ticket {...props} />
}

export function ListaVantagens({ vantagens, textos, origem, prefixo, linkClube, lang, doBanco }: Props) {
  const [formAberto, setFormAberto] = useState<string | null>(null)
  const [cupons, setCupons] = useState<Record<string, string>>({})
  const [categoria, setCategoria] = useState<string | null>(null)
  const listaRef = useRef<HTMLUListElement>(null)

  /* Filtro de categoria: so no cliente, sem recarregar. Os chips vem das categorias dos
     parceiros no ar; com menos de duas categorias o filtro nao serve e nem aparece. */
  const chips = useMemo(() => chipsDeCategorias(vantagens), [vantagens])
  const visiveis = useMemo(() => filtrarPorCategoria(vantagens, categoria), [vantagens, categoria])
  const mostraFiltro = chips.length >= 2

  function escolher(id: string | null) {
    setCategoria(id)
    setFormAberto(null)
  }

  /* Cupons que esta pessoa ja resgatou neste aparelho: "Ver meu cupom" em vez de pedir tudo
     de novo. So existe no navegador, por isso entra depois da hidratacao. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura do navegador, so existe depois de montar
    setCupons(lerCupons(armazemDoNavegador()))
  }, [])

  /* Vezes que a vantagem foi vista (KAN-998): cada parceiro conta quando o cartao dele fica
     na tela, uma vez por dia por aba. Antes a pagina mandava todos os ids a cada visita e todo
     parceiro ficava com o mesmo numero. A regra mora em usar-vistas-por-cartao.ts e em
     src/lib/clube/vistas.ts. Sem dado pessoal, falha em silencio. */
  useVistasPorCartao(listaRef, doBanco, visiveis.map((v) => v.partnerId).join(','))

  if (vantagens.length === 0) {
    return <p className="clube-aviso">{textos.vazio}</p>
  }

  return (
    <>
      {mostraFiltro ? (
        <div className="clube-filtros-bloco">
          <div className="clube-filtros" role="group" aria-label={textos.filtro_rotulo}>
            <button
              type="button"
              className="clube-chip"
              aria-pressed={categoria === null}
              onClick={() => escolher(null)}
            >
              {categoria === null ? <Check size={16} strokeWidth={3} aria-hidden /> : null}
              <span>{textos.filtro_todos}</span>
              <span className="clube-chip-n">{vantagens.length}</span>
            </button>
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                className="clube-chip"
                aria-pressed={categoria === c.id}
                onClick={() => escolher(c.id)}
              >
                {categoria === c.id ? <Check size={16} strokeWidth={3} aria-hidden /> : null}
                <span>{c.rotulo}</span>
                <span className="clube-chip-n">{c.n}</span>
              </button>
            ))}
          </div>
          <p className="clube-sr" role="status" aria-live="polite">
            {textos.filtro_resultado.replace('{n}', String(visiveis.length)).replace('{total}', String(vantagens.length))}
          </p>
        </div>
      ) : null}

      {visiveis.length === 0 ? (
        <div className="clube-vazio-filtro">
          <p className="clube-aviso">{textos.filtro_vazio}</p>
          <button type="button" className="clube-btn clube-btn--contorno" onClick={() => escolher(null)}>
            {textos.filtro_ver_todos}
          </button>
        </div>
      ) : null}

      <ul ref={listaRef} className="clube-lista">
        {visiveis.map((v, i) => {
          const noAr = v.status === 'no_ar'
          const regra = juntarRegra([
            v.regra,
            v.limiteMensal ? textos.limite.replace('{n}', String(v.limiteMensal)) : null,
            v.validoAte ? textos.validade.replace('{data}', dataCurta(v.validoAte, lang)) : null,
          ])
          const mensagemAmigo = textoParaAmigo(textos.amigo_texto, v, linkClube)
          const tokenDaPessoa = cupons[v.partnerId]
          const formularioAberto = formAberto === v.partnerId

          return (
            <li
              key={v.partnerId}
              data-parceiro={v.partnerId}
              className="clube-card clube-entra"
              style={{ '--i': i } as CSSProperties}
            >
              <div className={`clube-foto ${v.capaUrl ? 'clube-foto--com' : 'clube-foto--vazia'}`}>
                {v.capaUrl ? (
                  <SafeCoverImage
                    src={v.capaUrl}
                    alt=""
                    className="clube-foto-img"
                    sizes="(max-width: 640px) 100vw, 420px"
                    fallback={
                      <span className="clube-foto-marca">
                        <IconeDoTipo tipo={v.tipo} size={64} />
                      </span>
                    }
                  />
                ) : (
                  <span className="clube-foto-marca">
                    <IconeDoTipo tipo={v.tipo} size={64} />
                  </span>
                )}
                {v.tipo ? (
                  <p className="clube-foto-tipo">
                    <IconeDoTipo tipo={v.tipo} size={16} />
                    <span>{v.tipo}</span>
                  </p>
                ) : null}
              </div>

              <div className="clube-card-corpo">
                <h3 className="clube-nome">
                  <a href={`${prefixo}/negocio/${v.slug}`}>{v.nome}</a>
                </h3>
                <span className={`clube-tag ${noAr ? 'clube-tag--no-ar' : 'clube-tag--combinacao'}`}>
                  {noAr ? textos.status_no_ar : textos.status_combinacao}
                </span>

                <p className="clube-beneficio">{v.beneficio}</p>
                {regra ? <p className="clube-regra">{regra}</p> : null}
                {v.requerAgendamento ? (
                  <AvisoAgendamento
                    com={v.agendamentoCom ?? v.nome}
                    contato={v.agendamentoContato}
                    href={v.agendamentoContato ? linkAgendamento(v.agendamentoContato, textos.agendar_msg, v) : null}
                    textos={{ titulo: textos.agendar_titulo, texto: textos.agendar_texto, botao: textos.agendar_botao }}
                  />
                ) : null}
              </div>

              <div className="clube-picote" aria-hidden="true" />

              <div className="clube-canhoto">
                {!noAr ? (
                  <p className="clube-aviso">{textos.em_breve}</p>
                ) : formularioAberto ? (
                  <FormResgate
                    partnerId={v.partnerId}
                    negocio={v.nome}
                    textos={textos}
                    origem={origem}
                    prefixo={prefixo}
                    onCancelar={() => setFormAberto(null)}
                  />
                ) : (
                  <>
                    {tokenDaPessoa ? (
                      <a className="clube-btn clube-btn--verde clube-btn--cheio" href={`${prefixo}/clube/cupom/${tokenDaPessoa}`}>
                        {textos.ver_cupom}
                      </a>
                    ) : null}
                    {v.esgotada ? (
                      <p className="clube-aviso">{textos.esgotada}</p>
                    ) : (
                      <button
                        type="button"
                        className={`clube-btn ${tokenDaPessoa ? 'clube-btn--contorno' : 'clube-btn--verde'} clube-btn--cheio`}
                        onClick={() => setFormAberto(v.partnerId)}
                        disabled={!doBanco}
                      >
                        {tokenDaPessoa ? textos.resgatar_de_novo : textos.usar}
                      </button>
                    )}
                  </>
                )}

                {noAr && doBanco && !formularioAberto ? (
                  <a
                    className="clube-btn clube-btn--fantasma"
                    href={linkParaAmigo(mensagemAmigo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ justifySelf: 'start', color: 'var(--c-verde)' }}
                  >
                    <Share2 size={18} aria-hidden />
                    {textos.amigo}
                  </a>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
      <p className="clube-nota">{textos.rodape_vantagens}</p>
    </>
  )
}
