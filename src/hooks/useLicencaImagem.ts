import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { VERSAO_LICENCA_IMAGEM } from '@/lib/licenca-imagem'

type Aceite = { id: string; aceito_em: string; imagens: string[] }

/**
 * O aceite da cláusula de licença de imagem deste negócio, na versão em vigor.
 *
 * Fica num `useQuery`, e não num `useEffect` que chama `setState`, porque o
 * projeto tem `react-hooks/set-state-in-effect` ligada e porque assim o painel
 * inteiro compartilha o mesmo resultado sem buscar duas vezes.
 */
export function useLicencaImagem(businessId: string | undefined) {
  return useQuery({
    queryKey: ['licenca-imagem', businessId, VERSAO_LICENCA_IMAGEM],
    enabled: !!businessId,
    queryFn: async (): Promise<Aceite | null> => {
      const { data, error } = await supabase
        .from('gostoso_aceites_licenca_imagem')
        .select('id, aceito_em, imagens')
        .eq('business_id', businessId!)
        .eq('versao', VERSAO_LICENCA_IMAGEM)
        .order('aceito_em', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return (data as Aceite | null) ?? null
    },
  })
}

/** Registra o aceite: data e usuário vêm do banco e da sessão, a versão vem do
 *  código. Nunca um booleano solto. */
export function useRegistrarAceite(businessId: string | undefined, profileId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (origem: 'cadastro' | 'envio_de_fotos') => {
      if (!businessId || !profileId) throw new Error('sem negocio ou perfil')
      const { error } = await supabase.from('gostoso_aceites_licenca_imagem').insert([{
        business_id: businessId,
        profile_id: profileId,
        versao: VERSAO_LICENCA_IMAGEM,
        origem,
        imagens: [],
      }])
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['licenca-imagem', businessId, VERSAO_LICENCA_IMAGEM] })
    },
  })
}

/**
 * Anexa ao aceite as URLs que ele passa a cobrir.
 *
 * O rótulo "foto do próprio negócio" olha esta lista, imagem por imagem. Se
 * fosse por negócio, bastaria um aceite para trinta fotos de terceiro herdarem
 * a marca.
 */
export async function cobrirImagensPeloAceite(
  aceite: Aceite,
  novasUrls: string[]
): Promise<void> {
  const juntas = Array.from(new Set([...aceite.imagens, ...novasUrls]))
  const { error } = await supabase
    .from('gostoso_aceites_licenca_imagem')
    .update({ imagens: juntas })
    .eq('id', aceite.id)
  if (error) throw error
}
