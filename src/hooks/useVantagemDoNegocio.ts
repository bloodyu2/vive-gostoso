import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { paraVantagem, type LinhaVantagem, type Vantagem } from '@/lib/clube/vantagens'

/** A vantagem do Passaporte de UM negocio, para a faixa do perfil. So consulta
 *  quando o negocio e parceiro (`ativo`): para os outros 180 nao faz nenhuma
 *  chamada. Le pela mesma funcao da /clube (`gostoso_club_vantagens`), que o
 *  anonimo ja pode chamar. Sem resposta, a faixa simplesmente nao aparece. */
export function useVantagemDoNegocio(businessId: string | undefined, ativo: boolean) {
  return useQuery({
    queryKey: ['vantagem-do-negocio', businessId],
    enabled: ativo && !!businessId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Vantagem | null> => {
      const { data, error } = await supabase.rpc('gostoso_club_vantagens', { p_business_ids: [businessId] })
      if (error) throw error
      const linha = ((data ?? []) as LinhaVantagem[])[0]
      return linha ? paraVantagem(linha) : null
    },
  })
}
