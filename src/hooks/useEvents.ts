import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { GostosoEvent } from '@/types/database'

export function useEvents(featured?: boolean) {
  return useQuery({
    queryKey: ['events', featured],
    queryFn: async (): Promise<GostosoEvent[]> => {
      let q = supabase
        .from('gostoso_events')
        .select('*')
        .eq('active', true)
        .order('starts_at')
      if (featured) q = q.eq('is_featured', true)
      const { data, error } = await q
      if (error) throw error

      // Nada na query filtrava por data: um evento ficava na lista para sempre,
      // a nao ser que alguem desativasse `active` na mao depois que ele acabava.
      // Filtramos em JS porque a condicao "usa ends_at se existir, senao
      // starts_at" exigiria um .or() dificil de revisar, e a lista de eventos
      // da cidade e sempre pequena.
      const agora = Date.now()
      return (data ?? []).filter(e => {
        // Sem ends_at, o evento vale ate o fim do dia em que comeca -- usar o
        // proprio starts_at faria um evento de hoje sumir no meio do dia dele.
        if (e.ends_at) return new Date(e.ends_at).getTime() >= agora
        const fimDoDia = new Date(e.starts_at)
        fimDoDia.setHours(23, 59, 59, 999)
        return fimDoDia.getTime() >= agora
      })
    },
  })
}

export function useEvent(
  id: string,
  options?: Pick<UseQueryOptions<GostosoEvent | null>, 'initialData'>,
) {
  return useQuery({
    queryKey: ['event', id],
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_events')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data as GostosoEvent | null
    },
    ...options,
  })
}
