// KAN-686: limites e configuracao do guia de IA. Tudo que e numero de seguranca mora aqui,
// para o teste conferir e para ninguem espalhar um numero diferente pelo codigo.

export const GUIA = {
  maxCharsMensagem: 500,
  maxTurnos: 6,
  maxBytesCorpo: 6000,
  limiteHora: 8,
  limiteDia: 25,
  /** Abusos (pedido recusado pelo filtro) tolerados por hora antes de bloquear o visitante. */
  limiteAbusos: 3,
  bloqueioMs: 60 * 60 * 1000,
  maxTokensSaida: 600,
  rodadasDeFerramenta: 3,
  prazoDoModeloMs: 20_000,
  maxCharsResposta: 1400,
} as const

export type ConfigDoGuia = {
  ativo: boolean
  chave: string | null
  base: string
  modelo: string
  /** Teto de mensagens por dia para o site inteiro. Passou disso, o chat se desliga ate o dia seguinte. */
  tetoDiario: number
  sal: string
  origensPermitidas: string[]
}

const ORIGENS_PADRAO = [
  'https://www.vivegostoso.com.br',
  'https://vivegostoso.com.br',
  'http://localhost:3000',
  'http://localhost:5173',
]

/**
 * O Command Code so aceita o id com o fabricante na frente (deepseek/deepseek-v4-flash); sem ele responde 400 unsupported_model.
 * Se GUIA_MODELO vier so com o nome do deepseek, o prefixo e posto aqui. A lista viva fica em /provider/v1/models.
 */
export function modeloDoProvedor(bruto?: string): string {
  const m = (bruto ?? '').trim() || 'deepseek/deepseek-v4-flash'
  return /^deepseek-/.test(m) ? `deepseek/${m}` : m
}

/** A chave (CMD_API_KEY) so existe no servidor; sem ela ou sem GUIA_ATIVO=1 o chat fica desligado. */
export function configDoAmbiente(env: Record<string, string | undefined> = process.env): ConfigDoGuia {
  const chave = env.CMD_API_KEY && env.CMD_API_KEY.trim() ? env.CMD_API_KEY.trim() : null
  const teto = Number(env.GUIA_TETO_DIARIO)
  return {
    ativo: env.GUIA_ATIVO === '1' && chave !== null,
    chave,
    base: (env.GUIA_API_BASE || 'https://api.commandcode.ai/provider/v1').replace(/\/+$/, ''),
    modelo: modeloDoProvedor(env.GUIA_MODELO),
    tetoDiario: Number.isFinite(teto) && teto > 0 ? Math.floor(teto) : 600,
    sal: env.GUIA_SAL || 'vg-guia-v1',
    origensPermitidas: env.GUIA_ORIGENS ? env.GUIA_ORIGENS.split(',').map((o) => o.trim()).filter(Boolean) : ORIGENS_PADRAO,
  }
}
