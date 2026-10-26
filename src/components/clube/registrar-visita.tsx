'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

/** Uma linha por visita a /p/NN, sem dado pessoal. Falha em silêncio. */
export function RegistrarVisita({ codigo }: { codigo: string }) {
  const feito = useRef(false)
  useEffect(() => {
    if (feito.current) return
    feito.current = true
    void supabase.rpc('gostoso_club_registrar_visita_plaquinha', { p_codigo: codigo })
  }, [codigo])
  return null
}
