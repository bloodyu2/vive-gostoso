'use client'

import { useEffect, useRef } from 'react'
import { disparar } from '@/lib/clube/disparar'
import { eventoPlaquinha } from '@/lib/clube/medir-plaquinha'
import { supabase } from '@/lib/supabase'

/** Uma linha por visita a /p/NN, sem dado pessoal. Falha em silêncio. */
export function RegistrarVisita({ codigo }: { codigo: string }) {
  const feito = useRef(false)
  useEffect(() => {
    if (feito.current) return
    feito.current = true
    eventoPlaquinha('plaquinha_visita', { plaquinha_codigo: codigo, origem: 'plaquinha' })
    disparar(supabase.rpc('gostoso_club_registrar_visita_plaquinha', { p_codigo: codigo }))
  }, [codigo])
  return null
}
