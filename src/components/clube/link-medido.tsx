'use client'

import type { AnchorHTMLAttributes } from 'react'
import { disparar } from '@/lib/clube/disparar'
import { eventoPlaquinha, parametrosDoClique, type AcaoPlaquinha } from '@/lib/clube/medir-plaquinha'
import { supabase } from '@/lib/supabase'

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> {
  codigo: string
  acao: AcaoPlaquinha
  negocio: string
}

/** Link da pagina da plaquinha que conta o clique: no banco (sempre) e no GA4 (quem aceitou).
 *  O destino abre normalmente; a contagem so acompanha o toque e nunca o atrasa. */
export function LinkMedido({ codigo, acao, negocio, children, ...resto }: Props) {
  function aoClicar() {
    eventoPlaquinha('plaquinha_clique', parametrosDoClique(codigo, acao, negocio))
    disparar(supabase.rpc('gostoso_club_registrar_clique_plaquinha', { p_codigo: codigo, p_acao: acao }))
  }

  return (
    <a {...resto} onClick={aoClicar}>
      {children}
    </a>
  )
}
