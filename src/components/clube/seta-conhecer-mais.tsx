'use client'

import type { MouseEvent } from 'react'
import { ChevronsDown } from 'lucide-react'
import { disparar } from '@/lib/clube/disparar'
import { eventoPlaquinha, parametrosDoClique } from '@/lib/clube/medir-plaquinha'
import { supabase } from '@/lib/supabase'

interface Props {
  codigo: string
  negocio: string
  /** id da seção para onde a seta leva */
  alvo: string
  rotulo: string
  aria: string
}

/** Setinha que pisca abaixo dos botões da plaquinha, chamando a pessoa a rolar.
 *
 *  É um link de âncora de verdade (#alvo): sem JavaScript ele ainda leva à seção. Com JavaScript
 *  a rolagem é suave, e instantânea para quem pediu menos movimento no sistema. O clique é
 *  contado no banco (sempre) e no GA4 (quem aceitou), como os botões da página. */
export function SetaConhecerMais({ codigo, negocio, alvo, rotulo, aria }: Props) {
  function aoClicar(e: MouseEvent<HTMLAnchorElement>) {
    eventoPlaquinha('plaquinha_clique', parametrosDoClique(codigo, 'conhecer_mais', negocio))
    disparar(supabase.rpc('gostoso_club_registrar_clique_plaquinha', { p_codigo: codigo, p_acao: 'conhecer_mais' }))
    const el = document.getElementById(alvo)
    if (!el) return
    e.preventDefault()
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <a className="clube-seta" href={`#${alvo}`} onClick={aoClicar} aria-label={aria}>
      <span>{rotulo}</span>
      <ChevronsDown size={26} aria-hidden className="clube-seta-icone" />
    </a>
  )
}
