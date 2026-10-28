// Os cupons que a pessoa resgatou neste aparelho, guardados no navegador (um token por
// parceiro), para a /clube mostrar "Ver meu cupom" sem pedir tudo de novo. O token e o
// segredo do cupom: fica so no aparelho de quem resgatou.
const CHAVE = 'vg-clube-cupons'

type Armazem = Pick<Storage, 'getItem' | 'setItem'>

const TOKEN = /^[0-9a-f]{64}$/

export function lerCupons(armazem: Armazem | null): Record<string, string> {
  if (!armazem) return {}
  try {
    const bruto = armazem.getItem(CHAVE)
    if (!bruto) return {}
    const dados: unknown = JSON.parse(bruto)
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return {}
    const saida: Record<string, string> = {}
    for (const [parceiro, token] of Object.entries(dados as Record<string, unknown>)) {
      if (typeof token === 'string' && TOKEN.test(token)) saida[parceiro] = token
    }
    return saida
  } catch {
    return {}
  }
}

export function guardarCupom(armazem: Armazem | null, parceiro: string, token: string): void {
  if (!armazem || !TOKEN.test(token)) return
  try {
    armazem.setItem(CHAVE, JSON.stringify({ ...lerCupons(armazem), [parceiro]: token }))
  } catch {
    /* modo privado ou cota cheia: a pessoa ainda tem a imagem baixada */
  }
}

/** O localStorage do navegador, ou null quando nao ha (servidor) ou o acesso e bloqueado. */
export function armazemDoNavegador(): Armazem | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}
