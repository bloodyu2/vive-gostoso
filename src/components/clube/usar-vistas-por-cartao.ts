'use client'

import { useEffect, type RefObject } from 'react'
import { supabase } from '@/lib/supabase'
import { disparar } from '@/lib/clube/disparar'
import {
  VISTA_PERMANENCIA_MS,
  cartaoVisivel,
  criarRegistradorDeVistas,
  type ArmazemDeVistas,
} from '@/lib/clube/vistas'

/** Dia no fuso de Gostoso (o mesmo que o banco usa). */
function diaDeGostoso(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(new Date())
}

function armazemDaAba(): ArmazemDeVistas | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

/** Conta a vista de cada parceiro quando o cartao dele fica na tela (KAN-998).
 *
 *  Os cartoes sao os `<li data-parceiro="id">` dentro de `lista`. Um cartao vale uma vista
 *  quando metade dele fica visivel por 1 s com a aba aberta; cada parceiro conta uma vez por
 *  dia por aba. Cartao que o filtro de categoria esconde nao existe na lista e nao conta.
 *  Sem IntersectionObserver nao se conta nada: melhor faltar vista do que inventar vista.
 *  `chave` muda quando os cartoes da lista mudam (filtro), para observar os novos. */
export function useVistasPorCartao(lista: RefObject<HTMLElement | null>, ativo: boolean, chave: string): void {
  useEffect(() => {
    const raiz = lista.current
    if (!ativo || !raiz || typeof IntersectionObserver === 'undefined') return

    const registrador = criarRegistradorDeVistas({
      dia: diaDeGostoso,
      armazem: armazemDaAba(),
      memoria: memoriaDaPagina,
      enviar: (ids) => disparar(supabase.rpc('gostoso_club_registrar_vistas', { p_partner_ids: ids })),
      agendar: (fn, ms) => setTimeout(fn, ms),
      cancelar: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
    })

    const esperando = new Map<Element, ReturnType<typeof setTimeout>>()

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          const id = (e.target as HTMLElement).dataset.parceiro
          if (!id) continue
          const visto =
            e.isIntersecting &&
            cartaoVisivel({
              ratio: e.intersectionRatio,
              alturaVisivel: e.intersectionRect.height,
              alturaDaTela: e.rootBounds?.height ?? window.innerHeight,
            })
          const timer = esperando.get(e.target)
          if (visto && timer === undefined) {
            esperando.set(
              e.target,
              setTimeout(() => {
                esperando.delete(e.target)
                if (document.visibilityState === 'visible') registrador.vi(id)
              }, VISTA_PERMANENCIA_MS),
            )
          } else if (!visto && timer !== undefined) {
            clearTimeout(timer)
            esperando.delete(e.target)
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    raiz.querySelectorAll<HTMLElement>('[data-parceiro]').forEach((el) => observador.observe(el))

    const aoSair = () => {
      if (document.visibilityState === 'hidden') registrador.esvaziar()
    }
    document.addEventListener('visibilitychange', aoSair)
    window.addEventListener('pagehide', registrador.esvaziar)

    return () => {
      document.removeEventListener('visibilitychange', aoSair)
      window.removeEventListener('pagehide', registrador.esvaziar)
      observador.disconnect()
      esperando.forEach((t) => clearTimeout(t))
      esperando.clear()
      registrador.esvaziar()
    }
  }, [lista, ativo, chave])
}

/** Lembrete em memoria entre uma montagem da lista e outra (o filtro remonta o efeito). */
const memoriaDaPagina = new Set<string>()
