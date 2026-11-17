'use client'

// Aba Pedidos do painel do parceiro (/cadastre/painel?aba=pedidos, KAN-907): o dono do negocio
// ve os pedidos que chegam pelo Super App, aceita, prepara, marca pronto ou recusa, mexe no
// cardapio e no horario. Roda no computador ou no tablet do balcao. Nada de regra de negocio
// aqui: preco, estado e permissao sao do banco (src/lib/pedidos/api.ts); a tela so mostra e pede.

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { BusinessSummary } from '@/hooks/useMyBusinesses'
import { usePedidosDoDono, type PedidosDoDono } from '@/hooks/usePedidosDoDono'
import { ErroPainel } from '@/lib/pedidos/api'
import { criarAlarme, type Alarme } from '@/lib/pedidos/alerta'
import {
  agrupar,
  brl,
  cardapioPorSecao,
  idsNovos,
  idsRecebidos,
  lerPreco,
  minutosDesde,
  passoSeguinte,
  podeRecusar,
  resumoDeHoje,
  tituloDaAba,
  validarItemNovo,
  validarLoja,
  type ItemDoCardapio,
  type PedidoDoDono,
} from '@/lib/pedidos/painel'

type Sub = 'pedidos' | 'cardapio' | 'loja'
type Aviso = { tipo: 'ok' | 'erro'; texto: string } | null

const BTN = 'inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-50'
const BTN_PRIMARIO = `${BTN} bg-teal text-white hover:opacity-90`
const BTN_SECUNDARIO = `${BTN} border border-[#E8E4DF] bg-white text-[#1A1A1A] hover:border-[#C4BFBA]`
const BTN_PERIGO = `${BTN} border border-[#E05A3A] bg-white text-[#B9391B] hover:bg-[#E05A3A]/10`
const CAMPO = 'min-h-11 w-full rounded-xl border border-[#B8B2ab] bg-white px-3 text-sm text-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal'
const CARTAO = 'rounded-2xl border border-[#E8E4DF] bg-white p-4'

export function PedidosAba({ negocio }: { negocio: BusinessSummary }) {
  const { t } = useTranslation('painel')
  const d = usePedidosDoDono(negocio.id)
  const [sub, setSub] = useState<Sub>('pedidos')
  const [aviso, setAviso] = useState<Aviso>(null)
  const [agora, setAgora] = useState(() => new Date())

  // relogio da tela: "ha 12 min" anda sem recarregar
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const mensagemDoErro = (e: unknown): string => {
    if (e instanceof ErroPainel) {
      if (e.motivo === 'sem_acesso') return t('abas.pedidos_erro_sem_acesso')
      if (e.motivo === 'passo_invalido') return t('abas.pedidos_erro_passo_invalido')
    }
    return t('abas.pedidos_erro_falha')
  }
  const comAviso = async (fazer: () => Promise<void>, textoOk?: string): Promise<boolean> => {
    try {
      await fazer()
      setAviso(textoOk ? { tipo: 'ok', texto: textoOk } : null)
      return true
    } catch (e) {
      setAviso({ tipo: 'erro', texto: mensagemDoErro(e) })
      return false
    }
  }

  const grupos = useMemo(() => agrupar(d.pedidos, agora), [d.pedidos, agora])
  const novosNaFila = grupos.novos.length
  const alerta = useAlertaDePedidos(d, novosNaFila)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {d.loja ? (
          <LojaAbertaFechada aberto={d.loja.aberto} onMudar={(v) => comAviso(() => d.abrirFechar(v))} />
        ) : null}
        {d.recebePedidos ? (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button type="button" className={alerta.ligado ? BTN_SECUNDARIO : BTN_PRIMARIO} onClick={alerta.alternar} disabled={alerta.mudando} aria-pressed={alerta.ligado}>
              {alerta.ligado ? t('abas.pedidos_alerta_desligar') : t('abas.pedidos_alerta_ligar')}
            </button>
          </div>
        ) : null}
      </div>
      {d.recebePedidos ? (
        <p className="text-xs text-fg-3-texto" id="pedidos-alerta-dica">
          {alerta.ligado ? t('abas.pedidos_alerta_ligado') : t('abas.pedidos_alerta_dica')}
          {alerta.semSom ? ' ' + t('abas.pedidos_alerta_sem_som') : ''}
        </p>
      ) : null}

      <div role="status" aria-live="polite" className="min-h-0">
        {alerta.chegou > 0 && novosNaFila > 0 ? (
          <p className="rounded-xl bg-[#C97D2A]/15 px-4 py-3 text-sm font-semibold text-[#7A4A0F]">
            {alerta.chegou === 1 ? t('abas.pedidos_novo_um') : t('abas.pedidos_novo_varios', { count: alerta.chegou })}
          </p>
        ) : null}
      </div>

      <div role="group" aria-label={t('abas.pedidos_nav_label')} className="flex flex-wrap gap-2">
        {(['pedidos', 'cardapio', 'loja'] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={sub === s}
            onClick={() => setSub(s)}
            className={`${BTN} border ${sub === s ? 'border-teal bg-teal/10 text-teal' : 'border-[#E8E4DF] bg-white text-[#3D3D3D] hover:border-[#C4BFBA]'}`}
          >
            {t(`abas.pedidos_sub_${s}`)}
            {s === 'pedidos' && novosNaFila > 0 ? (
              <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-[#E05A3A] px-2 text-xs font-bold text-white">{novosNaFila}</span>
            ) : null}
          </button>
        ))}
      </div>

      {aviso ? (
        <p
          role={aviso.tipo === 'erro' ? 'alert' : 'status'}
          className={`rounded-xl px-4 py-3 text-sm ${aviso.tipo === 'erro' ? 'bg-[#E05A3A]/10 text-[#B9391B]' : 'bg-teal/10 text-teal'}`}
        >
          {aviso.texto}
        </p>
      ) : null}

      {sub === 'pedidos' ? <SecaoPedidos d={d} grupos={grupos} agora={agora} comAviso={comAviso} /> : null}
      {sub === 'cardapio' ? <SecaoCardapio d={d} comAviso={comAviso} /> : null}
      {sub === 'loja' ? <SecaoLoja d={d} comAviso={comAviso} /> : null}
    </div>
  )
}

/* ---------- alerta: som, tela acesa e titulo da aba ---------- */

const REPIQUE_MS = 60_000

function useAlertaDePedidos(d: PedidosDoDono, novosNaFila: number) {
  const alarme = useRef<Alarme | null>(null)
  const vistos = useRef<ReadonlySet<string> | null>(null)
  const [ligado, setLigado] = useState(false)
  const [semSom, setSemSom] = useState(false)
  const [chegou, setChegou] = useState(0)
  const [mudando, setMudando] = useState(false)
  const pendente = useRef(false) // trava na hora, antes de a tela atualizar: dois toques no mesmo instante contam como um

  // Pedido que chegou desde a ultima leitura: toca o alarme e acumula o aviso. Na primeira
  // leitura nada toca (idsNovos), senao abrir o painel com pedido parado gritaria. O aviso nunca
  // passa do que ainda esta esperando: aceitou ou recusou, a conta desce.
  useEffect(() => {
    if (!d.recebePedidos || d.carregandoPedidos || d.erroAoLer) return
    const esperando = idsRecebidos(d.pedidos).size
    const novos = idsNovos(vistos.current, d.pedidos)
    vistos.current = idsRecebidos(d.pedidos)
    setChegou((c) => Math.min(c + novos.length, esperando))
    if (novos.length > 0) alarme.current?.tocar()
  }, [d.pedidos, d.recebePedidos, d.carregandoPedidos, d.erroAoLer])

  // Pedido esperando e ninguem mexeu: repete o aviso a cada minuto, para a cozinha que nao ouviu.
  useEffect(() => {
    if (!ligado || novosNaFila === 0) return
    const id = setInterval(() => alarme.current?.tocar(), REPIQUE_MS)
    return () => clearInterval(id)
  }, [ligado, novosNaFila])

  // titulo da aba do navegador: "(2) Vive Gostoso"
  const original = useRef<string | null>(null)
  useEffect(() => {
    if (original.current === null) original.current = document.title
    document.title = tituloDaAba(original.current, d.recebePedidos ? novosNaFila : 0)
  }, [novosNaFila, d.recebePedidos])
  useEffect(
    () => () => {
      if (original.current !== null) document.title = original.current
      alarme.current?.desligar()
    },
    [],
  )

  const alternar = async () => {
    if (pendente.current) return // o navegador ainda esta liberando som e tela: outro toque aqui desencontraria o estado
    pendente.current = true
    try {
      if (alarme.current?.ligado) {
        alarme.current.desligar()
        setLigado(false)
        setSemSom(false)
        return
      }
      setMudando(true)
      alarme.current = alarme.current ?? criarAlarme()
      const r = await alarme.current.ligar()
      const segue = alarme.current.ligado
      setLigado(segue)
      setSemSom(segue && !r.som)
      if (segue && r.som) alarme.current.tocar() // um toque de teste, para a pessoa ouvir como e
    } finally {
      pendente.current = false
      setMudando(false)
    }
  }

  return { ligado, semSom, chegou, mudando, alternar: () => void alternar() }
}

/* ---------- loja aberta ou fechada ---------- */

function LojaAbertaFechada({ aberto, onMudar }: { aberto: boolean; onMudar: (v: boolean) => Promise<boolean> }) {
  const { t } = useTranslation('painel')
  const [ocupado, setOcupado] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <span className={`inline-flex items-center gap-2 text-sm font-semibold ${aberto ? 'text-teal' : 'text-[#B9391B]'}`}>
        <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${aberto ? 'bg-teal' : 'bg-[#E05A3A]'}`} />
        {aberto ? t('abas.pedidos_loja_aberta') : t('abas.pedidos_loja_fechada')}
      </span>
      <button
        type="button"
        className={BTN_SECUNDARIO}
        disabled={ocupado}
        onClick={async () => {
          setOcupado(true)
          await onMudar(!aberto)
          setOcupado(false)
        }}
      >
        {aberto ? t('abas.pedidos_fechar') : t('abas.pedidos_abrir')}
      </button>
    </div>
  )
}

/* ---------- pedidos ---------- */

type ComAviso = (fazer: () => Promise<void>, textoOk?: string) => Promise<boolean>

function SecaoPedidos({ d, grupos, agora, comAviso }: { d: PedidosDoDono; grupos: ReturnType<typeof agrupar>; agora: Date; comAviso: ComAviso }) {
  const { t } = useTranslation('painel')
  const hoje = useMemo(() => resumoDeHoje(d.pedidos, agora), [d.pedidos, agora])

  if (d.carregandoLoja) return <p className="text-sm text-fg-3-texto">{t('abas.carregando')}</p>

  if (d.erroLoja && !d.loja) {
    return (
      <p role="alert" className="rounded-xl bg-[#E05A3A]/10 px-4 py-3 text-sm text-[#B9391B]">
        {t('abas.pedidos_erro_carregar')}
      </p>
    )
  }

  if (!d.recebePedidos) {
    return (
      <section className={`${CARTAO} bg-[#C97D2A]/10`}>
        <h2 className="font-display text-lg font-semibold text-[#1A1A1A]">{t('abas.pedidos_nao_liberada_titulo')}</h2>
        <p className="mt-1 text-sm text-[#3D3D3D]">{t('abas.pedidos_nao_liberada_texto')}</p>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      {d.erroAoLer ? (
        <p role="alert" className="rounded-xl bg-[#E05A3A]/10 px-4 py-3 text-sm text-[#B9391B]">
          {t('abas.pedidos_erro_carregar')}
        </p>
      ) : null}

      <section className={`${CARTAO} grid grid-cols-3 gap-3 text-center`} aria-label={t('abas.pedidos_hoje_titulo')}>
        <Numero rotulo={t('abas.pedidos_hoje_entregues')} valor={String(hoje.entregues)} />
        <Numero rotulo={t('abas.pedidos_hoje_vendido')} valor={brl(hoje.receita)} />
        <Numero rotulo={t('abas.pedidos_hoje_cancelados')} valor={String(hoje.cancelados)} />
      </section>

      {d.carregandoPedidos ? <p className="text-sm text-fg-3-texto">{t('abas.carregando')}</p> : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <ColunaDePedidos titulo={t('abas.pedidos_g_novos')} vazio={t('abas.pedidos_v_novos')} destaque pedidos={grupos.novos} d={d} agora={agora} comAviso={comAviso} />
        <ColunaDePedidos titulo={t('abas.pedidos_g_preparo')} vazio={t('abas.pedidos_v_preparo')} pedidos={grupos.preparo} d={d} agora={agora} comAviso={comAviso} />
        <ColunaDePedidos titulo={t('abas.pedidos_g_prontos')} vazio={t('abas.pedidos_v_prontos')} pedidos={grupos.prontos} d={d} agora={agora} comAviso={comAviso} />
      </div>

      <details className={CARTAO}>
        <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-[#1A1A1A]">
          {t('abas.pedidos_g_encerrados')} ({grupos.encerrados.length})
        </summary>
        <div className="mt-3 space-y-3">
          {grupos.encerrados.length === 0 ? <p className="text-sm text-fg-3-texto">{t('abas.pedidos_v_encerrados')}</p> : null}
          {grupos.encerrados.map((p) => (
            <CartaoDePedido key={p.id} p={p} d={d} agora={agora} comAviso={comAviso} />
          ))}
        </div>
      </details>
      <p className="text-xs text-fg-3-texto">{t('abas.pedidos_atualiza')}</p>
    </div>
  )
}

function Numero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="font-display text-xl font-semibold text-[#1A1A1A]">{valor}</p>
      <p className="text-xs text-fg-3-texto">{rotulo}</p>
    </div>
  )
}

function ColunaDePedidos({ titulo, vazio, pedidos, d, agora, comAviso, destaque = false }: { titulo: string; vazio: string; pedidos: PedidoDoDono[]; d: PedidosDoDono; agora: Date; comAviso: ComAviso; destaque?: boolean }) {
  return (
    <section aria-label={titulo} className="space-y-3">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-[#1A1A1A]">
        {titulo}
        <span className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${destaque && pedidos.length > 0 ? 'bg-[#E05A3A] text-white' : 'bg-[#F5F2EE] text-[#3D3D3D]'}`}>{pedidos.length}</span>
      </h2>
      {pedidos.length === 0 ? <p className="rounded-2xl border border-dashed border-[#E8E4DF] p-4 text-sm text-fg-3-texto">{vazio}</p> : null}
      {pedidos.map((p) => (
        <CartaoDePedido key={p.id} p={p} d={d} agora={agora} comAviso={comAviso} />
      ))}
    </section>
  )
}

function idadeTexto(t: (k: string, o?: Record<string, unknown>) => string, min: number): string {
  if (min < 1) return t('abas.pedidos_idade_agora')
  if (min < 60) return t('abas.pedidos_idade_min', { n: min })
  return t('abas.pedidos_idade_hora', { h: Math.floor(min / 60), m: min % 60 })
}

function CartaoDePedido({ p, d, agora, comAviso }: { p: PedidoDoDono; d: PedidosDoDono; agora: Date; comAviso: ComAviso }) {
  const { t } = useTranslation('painel')
  const [ocupado, setOcupado] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const passo = passoSeguinte(p)
  const min = minutosDesde(p.criadoEm, agora)
  const fase = d.fases[p.id]

  const rodar = async (fazer: () => Promise<void>) => {
    setOcupado(true)
    await comAviso(fazer)
    setOcupado(false)
    setConfirmando(false)
  }

  return (
    <article className={`${CARTAO} space-y-3`} aria-label={t('abas.pedidos_numero', { codigo: p.id.slice(0, 4).toUpperCase() })}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">{t('abas.pedidos_numero', { codigo: p.id.slice(0, 4).toUpperCase() })}</h3>
        <span className="text-xs text-fg-3-texto">{idadeTexto(t, min)}</span>
      </header>
      <p className="text-xs font-semibold text-[#7A4A0F]">{t(`abas.pedidos_status_${p.status}`)}</p>
      <ul className="space-y-1 text-sm text-[#1A1A1A]">
        {p.itens.map((i, k) => (
          <li key={k}>
            <span className="font-semibold">{i.qtd}x</span> {i.nome}
            {i.opcao ? <span className="text-fg-3-texto"> ({i.opcao})</span> : null}
          </li>
        ))}
      </ul>
      <p className="text-xs text-[#3D3D3D]">{p.mesa ? t('abas.pedidos_mesa', { mesa: p.mesa }) : t('abas.pedidos_entrega_em', { endereco: p.endereco })}</p>
      <p className="text-xs text-[#3D3D3D]">
        {t(`abas.pedidos_pagto_${p.formaPagto}`)}
        {p.formaPagto === 'dinheiro' && p.trocoPara ? ` · ${t('abas.pedidos_troco', { valor: brl(p.trocoPara) })}` : ''}
        {!p.mesa && p.taxaEntrega > 0 ? ` · ${t('abas.pedidos_taxa', { valor: brl(p.taxaEntrega) })}` : ''}
      </p>
      <p className="text-base font-semibold text-[#1A1A1A]">
        {t('abas.pedidos_total')}: {brl(p.total)}
      </p>

      {p.status === 'pronto' && !p.mesa && fase !== undefined ? (
        <p className="text-sm font-semibold text-teal">{t(`abas.pedidos_fase_${fase ?? 'desconhecida'}`, { defaultValue: t('abas.pedidos_fase_desconhecida') })}</p>
      ) : null}
      {p.status === 'a_caminho' ? <p className="text-sm font-semibold text-teal">{t('abas.pedidos_fase_atribuido')}</p> : null}

      {passo || podeRecusar(p) ? (
        confirmando ? (
          <div className="space-y-2">
            <p className="text-sm text-[#1A1A1A]">{t('abas.pedidos_recusar_confirma')}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={BTN_PERIGO} disabled={ocupado} onClick={() => void rodar(() => d.recusar(p.id))}>
                {t('abas.pedidos_recusar_sim')}
              </button>
              <button type="button" className={BTN_SECUNDARIO} disabled={ocupado} onClick={() => setConfirmando(false)}>
                {t('abas.pedidos_voltar')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {passo ? (
              <button type="button" className={BTN_PRIMARIO} disabled={ocupado} onClick={() => void rodar(() => d.avancar(p.id, passo.para))}>
                {t(`abas.pedidos_acao_${passo.chave}`)}
              </button>
            ) : null}
            {podeRecusar(p) ? (
              <button type="button" className={BTN_PERIGO} disabled={ocupado} onClick={() => setConfirmando(true)}>
                {t('abas.pedidos_recusar')}
              </button>
            ) : null}
          </div>
        )
      ) : null}
    </article>
  )
}

/* ---------- cardapio ---------- */

const SECOES_SUGERIDAS = ['Pizzas', 'Massas', 'Lanches', 'Bebidas', 'Sobremesas']

function SecaoCardapio({ d, comAviso }: { d: PedidosDoDono; comAviso: ComAviso }) {
  const { t } = useTranslation('painel')
  const grupos = useMemo(() => cardapioPorSecao(d.cardapio), [d.cardapio])
  const sugestoes = useMemo(() => [...new Set([...grupos.map((g) => g.secao), ...SECOES_SUGERIDAS])], [grupos])

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-semibold text-[#1A1A1A]">{t('abas.cardapio_titulo')}</h2>
      {d.carregandoCardapio ? <p className="text-sm text-fg-3-texto">{t('abas.carregando')}</p> : null}
      {d.erroCardapio ? (
        <p role="alert" className="rounded-xl bg-[#E05A3A]/10 px-4 py-3 text-sm text-[#B9391B]">
          {t('abas.pedidos_erro_carregar')}
        </p>
      ) : null}
      {!d.carregandoCardapio && !d.erroCardapio && d.cardapio.length === 0 ? <p className="text-sm text-fg-3-texto">{t('abas.cardapio_vazio')}</p> : null}
      {grupos.map((g) => (
        <section key={g.secao} className="space-y-2" aria-label={g.secao}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-3-texto">{g.secao}</h3>
          {g.itens.map((i) => (
            <LinhaDoCardapio key={i.id} item={i} d={d} comAviso={comAviso} />
          ))}
        </section>
      ))}
      <NovoItem d={d} comAviso={comAviso} sugestoes={sugestoes} />
    </div>
  )
}

function LinhaDoCardapio({ item, d, comAviso }: { item: ItemDoCardapio; d: PedidosDoDono; comAviso: ComAviso }) {
  const { t } = useTranslation('painel')
  const [preco, setPreco] = useState(() => item.preco.toFixed(2).replace('.', ','))
  const [ocupado, setOcupado] = useState(false)
  const [removendo, setRemovendo] = useState(false)
  const novo = lerPreco(preco)
  const mudou = novo !== null && novo !== item.preco

  const rodar = async (fazer: () => Promise<void>, ok?: string) => {
    setOcupado(true)
    await comAviso(fazer, ok)
    setOcupado(false)
  }

  return (
    <div className={`${CARTAO} space-y-3 ${item.ativo ? '' : 'bg-[#F5F2EE]'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#1A1A1A]">{item.nome}</p>
        {!item.ativo ? <span className="text-xs font-semibold text-[#7A4A0F]">{t('abas.cardapio_pausado')}</span> : null}
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-32 flex-1">
          <label htmlFor={`preco-${item.id}`} className="mb-1 block text-xs font-semibold text-fg-3-texto">
            {t('abas.cardapio_preco', { nome: item.nome })}
          </label>
          <input id={`preco-${item.id}`} className={CAMPO} inputMode="decimal" autoComplete="off" value={preco} onChange={(e) => setPreco(e.target.value)} aria-invalid={novo === null} aria-describedby={novo === null ? `erro-preco-${item.id}` : undefined} />
        </div>
        {novo === null ? (
          <p id={`erro-preco-${item.id}`} role="alert" className="w-full text-sm text-[#B9391B]">
            {t('abas.cardapio_erro_preco')}
          </p>
        ) : null}
        <button type="button" className={BTN_PRIMARIO} disabled={ocupado || !mudou} onClick={() => novo !== null && void rodar(() => d.mudarPreco(item.id, novo), t('abas.cardapio_salvo'))}>
          {t('abas.cardapio_salvar_preco')}
        </button>
        <button type="button" className={BTN_SECUNDARIO} disabled={ocupado} onClick={() => void rodar(() => d.pausar(item.id, !item.ativo))}>
          {item.ativo ? t('abas.cardapio_pausar') : t('abas.cardapio_ativar')}
        </button>
        {removendo ? null : (
          <button type="button" className={BTN_PERIGO} disabled={ocupado} onClick={() => setRemovendo(true)}>
            {t('abas.cardapio_remover')}
          </button>
        )}
      </div>
      {removendo ? (
        <div className="space-y-2">
          <p className="text-sm text-[#1A1A1A]">{t('abas.cardapio_remover_confirma', { nome: item.nome })}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={BTN_PERIGO} disabled={ocupado} onClick={() => void rodar(() => d.removerItem(item.id))}>
              {t('abas.cardapio_remover_sim')}
            </button>
            <button type="button" className={BTN_SECUNDARIO} disabled={ocupado} onClick={() => setRemovendo(false)}>
              {t('abas.pedidos_voltar')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function NovoItem({ d, comAviso, sugestoes }: { d: PedidosDoDono; comAviso: ComAviso; sugestoes: string[] }) {
  const { t } = useTranslation('painel')
  const [nome, setNome] = useState('')
  const [secao, setSecao] = useState(SECOES_SUGERIDAS[0])
  const [preco, setPreco] = useState('')
  const [erro, setErro] = useState<'nome' | 'secao' | 'preco' | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const v = validarItemNovo({ nome, secao, preco })
    if (!v.ok) {
      setErro(v.motivo)
      return
    }
    setErro(null)
    setOcupado(true)
    const feito = await comAviso(() => d.novoItem({ secao: v.secao, nome: v.nome, preco: v.preco }), t('abas.cardapio_salvo'))
    setOcupado(false)
    if (feito) {
      setNome('')
      setPreco('')
    }
  }

  return (
    <form onSubmit={enviar} className={`${CARTAO} space-y-3`} noValidate>
      <h3 className="font-display text-lg font-semibold text-[#1A1A1A]">{t('abas.cardapio_novo_titulo')}</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label htmlFor="novo-nome" className="mb-1 block text-xs font-semibold text-fg-3-texto">{t('abas.cardapio_novo_nome')}</label>
          <input id="novo-nome" className={CAMPO} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} autoComplete="off" aria-invalid={erro === 'nome'} aria-describedby={erro === 'nome' ? 'novo-erro' : undefined} />
        </div>
        <div>
          <label htmlFor="novo-secao" className="mb-1 block text-xs font-semibold text-fg-3-texto">{t('abas.cardapio_novo_secao')}</label>
          <input id="novo-secao" className={CAMPO} list="novo-secoes" value={secao} onChange={(e) => setSecao(e.target.value)} maxLength={40} autoComplete="off" aria-invalid={erro === 'secao'} aria-describedby={erro === 'secao' ? 'novo-erro' : undefined} />
          <datalist id="novo-secoes">
            {sugestoes.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="novo-preco" className="mb-1 block text-xs font-semibold text-fg-3-texto">{t('abas.cardapio_novo_preco')}</label>
          <input id="novo-preco" className={CAMPO} inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value)} autoComplete="off" aria-invalid={erro === 'preco'} aria-describedby={erro === 'preco' ? 'novo-erro' : undefined} />
        </div>
        <div className="flex items-end">
          <button type="submit" className={`${BTN_PRIMARIO} w-full`} disabled={ocupado}>
            {t('abas.cardapio_adicionar')}
          </button>
        </div>
      </div>
      {erro ? (
        <p id="novo-erro" role="alert" className="text-sm text-[#B9391B]">
          {t(`abas.cardapio_erro_${erro}`)}
        </p>
      ) : null}
    </form>
  )
}

/* ---------- horario e tempo ---------- */

function SecaoLoja({ d, comAviso }: { d: PedidosDoDono; comAviso: ComAviso }) {
  const { t } = useTranslation('painel')
  if (d.carregandoLoja) return <p className="text-sm text-fg-3-texto">{t('abas.carregando')}</p>
  if (!d.loja) return <p className={`${CARTAO} text-sm text-[#3D3D3D]`}>{t('abas.loja_sem_linha')}</p>
  // key: se a loja mudar no servidor (outra aba, outro aparelho), o formulario recomeca do valor novo
  return <FormularioDaLoja key={`${d.loja.horario ?? ''}|${d.loja.tempoMin}|${d.loja.tempoMax}`} d={d} comAviso={comAviso} />
}

function FormularioDaLoja({ d, comAviso }: { d: PedidosDoDono; comAviso: ComAviso }) {
  const { t } = useTranslation('painel')
  const loja = d.loja!
  const [horario, setHorario] = useState(loja.horario ?? '')
  const [min, setMin] = useState(String(loja.tempoMin))
  const [max, setMax] = useState(String(loja.tempoMax))
  const [erro, setErro] = useState<'horario' | 'tempo' | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const v = validarLoja({ horario, tempoMin: min, tempoMax: max })
    if (!v.ok) {
      setErro(v.motivo)
      return
    }
    setErro(null)
    setOcupado(true)
    await comAviso(() => d.salvarLoja({ horario: v.horario, tempoMin: v.tempoMin, tempoMax: v.tempoMax }), t('abas.loja_salvo'))
    setOcupado(false)
  }

  return (
    <form onSubmit={enviar} className={`${CARTAO} space-y-3`} noValidate>
      <h2 className="font-display text-xl font-semibold text-[#1A1A1A]">{t('abas.loja_titulo')}</h2>
      <div>
        <label htmlFor="loja-horario" className="mb-1 block text-xs font-semibold text-fg-3-texto">{t('abas.loja_horario')}</label>
        <input id="loja-horario" className={CAMPO} value={horario} onChange={(e) => setHorario(e.target.value)} maxLength={60} placeholder={t('abas.loja_horario_dica')} autoComplete="off" aria-invalid={erro === 'horario'} aria-describedby={erro ? 'loja-erro' : undefined} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="loja-min" className="mb-1 block text-xs font-semibold text-fg-3-texto">{t('abas.loja_tempo_min')}</label>
          <input id="loja-min" className={CAMPO} inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} autoComplete="off" aria-invalid={erro === 'tempo'} aria-describedby={erro ? 'loja-erro' : undefined} />
        </div>
        <div>
          <label htmlFor="loja-max" className="mb-1 block text-xs font-semibold text-fg-3-texto">{t('abas.loja_tempo_max')}</label>
          <input id="loja-max" className={CAMPO} inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} autoComplete="off" aria-invalid={erro === 'tempo'} aria-describedby={erro ? 'loja-erro' : undefined} />
        </div>
      </div>
      {erro ? (
        <p id="loja-erro" role="alert" className="text-sm text-[#B9391B]">
          {t(`abas.loja_erro_${erro}`)}
        </p>
      ) : null}
      <button type="submit" className={BTN_PRIMARIO} disabled={ocupado}>
        {t('abas.loja_salvar')}
      </button>
    </form>
  )
}
