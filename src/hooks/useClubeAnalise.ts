import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { lerDecisao, lerFila, type ResultadoDecisao, type VantagemEmAnalise } from '@/lib/clube/analise'

const CHAVE = ['clube-analise-fila']

/** Vantagens do Passaporte esperando a equipe. So o admin recebe linhas; para os outros o banco recusa (42501). */
export function useClubeAnaliseFila() {
  return useQuery<VantagemEmAnalise[]>({
    queryKey: CHAVE,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('gostoso_club_analise_fila')
      if (error) throw error
      return lerFila(data)
    },
  })
}

/** Admin ou aprovador. O banco e quem decide; isto so escolhe entre mostrar a tela ou mandar de volta ao painel. */
export function usePodeAprovar(enabled: boolean) {
  return useQuery<boolean>({
    queryKey: ['clube-pode-aprovar'],
    enabled,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('gostoso_pode_aprovar')
      if (error) throw error
      return data === true
    },
  })
}

export function useClubeDecidir() {
  const qc = useQueryClient()
  return useMutation<ResultadoDecisao, Error, { partnerId: string; aprovar: boolean; motivo?: string }>({
    mutationFn: async ({ partnerId, aprovar, motivo }) => {
      const { data, error } = await supabase.rpc('gostoso_club_analise_decidir', {
        p_partner: partnerId,
        p_aprovar: aprovar,
        p_motivo: aprovar ? null : (motivo ?? '').trim(),
      })
      if (error) throw error
      return lerDecisao(data)
    },
    // Decidida ou ja decidida por outra pessoa: de qualquer jeito a fila muda.
    onSettled: () => qc.invalidateQueries({ queryKey: CHAVE }),
  })
}
