// Regra de quais selos um negocio mostra. Um lugar so: cartao, pagina do negocio
// e carrossel da home leem daqui (pelo componente em components/business/selo.tsx).
//
// Um negocio ACUMULA selos: pode ser verificado e parceiro do Passaporte ao mesmo
// tempo. A ordem de exibicao e a ordem do REGISTRO abaixo. Selo novo = uma linha no
// registro, uma entrada em METAL/miolo no componente e uma chave em `selo.*` nos
// tres idiomas; nada mais muda.
import { CLUBE_PUBLICO } from '@/lib/clube/config'

export type TipoSelo = 'prata' | 'ouro' | 'clube'

/** O que a regra le do negocio. */
export interface FatosDoNegocio {
  is_verified?: boolean | null
  plan?: string | null
}

/** O que a regra sabe de fora do cadastro do negocio. */
export interface ContextoDeSelos {
  /** O negocio tem vantagem do Passaporte no ar e dentro da validade (vem do servidor). */
  noClube?: boolean
  /** A flag de lancamento. Ausente = a flag de verdade (CLUBE_PUBLICO). So os testes passam. */
  clubePublico?: boolean
}

const REGISTRO: ReadonlyArray<{
  tipo: TipoSelo
  vale: (b: FatosDoNegocio, ctx: ContextoDeSelos) => boolean
}> = [
  // prata: verificado pelo Vive Gostoso
  { tipo: 'prata', vale: (b) => !!b.is_verified },
  // ouro: assinante (plano associado ou destaque)
  { tipo: 'ouro', vale: (b) => b.plan === 'associado' || b.plan === 'destaque' },
  // clube: vantagem do Passaporte no ar. So existe depois do lancamento publico:
  // antes de 05/11/2026 a vitrine nao pode entregar o clube.
  { tipo: 'clube', vale: (_b, ctx) => (ctx.clubePublico ?? CLUBE_PUBLICO) && !!ctx.noClube },
]

export function selosDoNegocio(b: FatosDoNegocio, ctx: ContextoDeSelos = {}): TipoSelo[] {
  return REGISTRO.filter((s) => s.vale(b, ctx)).map((s) => s.tipo)
}
