'use client'

// Dados do painel de pedidos do dono (KAN-907): loja, pedidos com atualizacao a cada 5 s,
// fase do despacho dos pedidos prontos e cardapio. Escrita sempre pelas funcoes de
// src/lib/pedidos/api.ts; depois de cada uma a lista certa e lida de novo do servidor.

import { useCallback, useMemo } from 'react'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import {
  avancarPedido,
  criarItem,
  definirAberto,
  definirAtivo,
  faseDoDespacho,
  lerLoja,
  listarCardapio,
  listarPedidos,
  mudarPreco,
  recusarPedido,
  removerItem,
  salvarHorarioETempo,
} from '@/lib/pedidos/api'
import { lojaRecebePedidos, type ItemDoCardapio, type LojaDoDono, type PedidoDoDono } from '@/lib/pedidos/painel'

export const INTERVALO_PEDIDOS_MS = 5_000
const INTERVALO_FASES_MS = 10_000

export interface PedidosDoDono {
  loja: LojaDoDono | null
  carregandoLoja: boolean
  /** a leitura da loja falhou (rede, sessao): nao e o mesmo que "a Vive ainda nao liberou" */
  erroLoja: boolean
  recebePedidos: boolean
  pedidos: PedidoDoDono[]
  /** ainda nao veio a primeira leitura */
  carregandoPedidos: boolean
  erroAoLer: boolean
  /** fase do despacho por pedido; ausente = ainda nao lida, null = a leitura falhou */
  fases: Record<string, string | null>
  cardapio: ItemDoCardapio[]
  carregandoCardapio: boolean
  erroCardapio: boolean
  avancar: (pedidoId: string, para: 'aceito' | 'preparo' | 'pronto' | 'entregue') => Promise<void>
  recusar: (pedidoId: string) => Promise<void>
  abrirFechar: (aberto: boolean) => Promise<void>
  salvarLoja: (v: { horario: string | null; tempoMin: number; tempoMax: number }) => Promise<void>
  mudarPreco: (itemId: string, preco: number) => Promise<void>
  pausar: (itemId: string, ativo: boolean) => Promise<void>
  novoItem: (i: { secao: string; nome: string; preco: number }) => Promise<void>
  removerItem: (itemId: string) => Promise<void>
  /** le pedidos de novo agora (depois de um erro, por exemplo) */
  recarregarPedidos: () => Promise<unknown>
}

export function usePedidosDoDono(negocioId: string): PedidosDoDono {
  const qc = useQueryClient()
  const chave = useMemo(() => ['pedidos-dono', negocioId] as const, [negocioId])

  const loja = useQuery({
    queryKey: [...chave, 'loja'],
    queryFn: () => lerLoja(supabase, negocioId),
    staleTime: 30_000,
    // a tela promete "tenta de novo sozinha": depois que as tentativas do TanStack acabam, volta a ler a cada 10 s
    refetchInterval: (q) => (q.state.status === 'error' ? 10_000 : false),
  })
  const recebePedidos = lojaRecebePedidos(loja.data ?? null)

  const pedidos = useQuery({
    queryKey: [...chave, 'pedidos'],
    queryFn: () => listarPedidos(supabase, negocioId),
    enabled: recebePedidos,
    refetchInterval: INTERVALO_PEDIDOS_MS,
    // Aba em segundo plano continua lendo: o alarme depende disso. O navegador limita o
    // intervalo de abas escondidas, mas a leitura segue.
    refetchIntervalInBackground: true,
    staleTime: 0,
  })

  const prontosDeEntrega = useMemo(
    () => (pedidos.data ?? []).filter((p) => p.status === 'pronto' && !p.mesa).map((p) => p.id),
    [pedidos.data],
  )
  const fases = useQuery({
    queryKey: [...chave, 'fases', prontosDeEntrega.join(',')],
    queryFn: async () => {
      const r: Record<string, string | null> = {}
      await Promise.all(
        prontosDeEntrega.map(async (id) => {
          try {
            r[id] = await faseDoDespacho(supabase, id)
          } catch {
            r[id] = null
          }
        }),
      )
      return r
    },
    enabled: prontosDeEntrega.length > 0,
    refetchInterval: INTERVALO_FASES_MS,
    staleTime: 0,
    // quando um pedido entra ou sai de "pronto" a chave muda; sem isto todos os cartoes piscariam sem fase
    placeholderData: keepPreviousData,
  })

  const cardapio = useQuery({
    queryKey: [...chave, 'cardapio'],
    queryFn: () => listarCardapio(supabase, negocioId),
    staleTime: 15_000,
  })

  const invalidar = useCallback((parte: 'pedidos' | 'loja' | 'cardapio') => qc.invalidateQueries({ queryKey: [...chave, parte] }), [qc, chave])

  // Depois de qualquer tentativa (certa ou negada) le de novo: a tela mostra o que o servidor diz.
  const comRelida = useCallback(
    async (parte: 'pedidos' | 'loja' | 'cardapio', fazer: () => Promise<void>) => {
      try {
        await fazer()
      } finally {
        await invalidar(parte)
      }
    },
    [invalidar],
  )

  return {
    loja: loja.data ?? null,
    carregandoLoja: loja.isLoading,
    erroLoja: loja.isError,
    recebePedidos,
    pedidos: pedidos.data ?? [],
    carregandoPedidos: recebePedidos && pedidos.isLoading,
    erroAoLer: pedidos.isError,
    fases: fases.data ?? {},
    cardapio: cardapio.data ?? [],
    carregandoCardapio: cardapio.isLoading,
    erroCardapio: cardapio.isError,
    avancar: (id, para) => comRelida('pedidos', () => avancarPedido(supabase, id, para)),
    recusar: (id) => comRelida('pedidos', () => recusarPedido(supabase, id)),
    abrirFechar: (aberto) => comRelida('loja', () => definirAberto(supabase, negocioId, aberto)),
    salvarLoja: (v) => comRelida('loja', () => salvarHorarioETempo(supabase, negocioId, v)),
    mudarPreco: (id, preco) => comRelida('cardapio', () => mudarPreco(supabase, id, preco)),
    pausar: (id, ativo) => comRelida('cardapio', () => definirAtivo(supabase, id, ativo)),
    novoItem: (i) => {
      const ordem = (cardapio.data ?? []).reduce((m, x) => Math.max(m, x.ordem), 0) + 1
      return comRelida('cardapio', () => criarItem(supabase, negocioId, { ...i, ordem }))
    },
    removerItem: (id) => comRelida('cardapio', () => removerItem(supabase, id)),
    recarregarPedidos: () => invalidar('pedidos'),
  }
}
