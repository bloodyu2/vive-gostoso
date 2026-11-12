// Substituto, nos testes, do supabase-js das Edge Functions: um banco em
// memoria com o suficiente do encadeamento (select/eq/maybeSingle/update/insert).
type Linha = Record<string, unknown>

export type EstadoBanco = {
  tabelas: Record<string, Linha[]>
  /** token -> usuario devolvido por auth.getUser */
  usuarios: Record<string, { id: string; email: string }>
  escritas: Array<{ tabela: string; operacao: 'update' | 'insert'; valores: Linha }>
  /** tabela -> erro devolvido nas escritas dela */
  falhaDeEscrita: Record<string, { message: string }>
}

export function estadoBanco(): EstadoBanco {
  const g = globalThis as { __bancoEstado?: EstadoBanco }
  if (!g.__bancoEstado) g.__bancoEstado = { tabelas: {}, usuarios: {}, escritas: [], falhaDeEscrita: {} }
  return g.__bancoEstado
}

function consulta(tabela: string) {
  const filtros: Array<[string, unknown]> = []
  let escrita: { operacao: 'update' | 'insert'; valores: Linha } | null = null

  const executar = () => {
    const banco = estadoBanco()
    if (escrita) {
      banco.escritas.push({ tabela, operacao: escrita.operacao, valores: escrita.valores })
      const erro = banco.falhaDeEscrita[tabela]
      return { data: null, error: erro ?? null }
    }
    const linhas = (banco.tabelas[tabela] ?? []).filter((l) => filtros.every(([c, v]) => l[c] === v))
    return { data: linhas, error: null }
  }

  const api = {
    select: () => api,
    eq: (coluna: string, valor: unknown) => {
      filtros.push([coluna, valor])
      return api
    },
    update: (valores: Linha) => {
      escrita = { operacao: 'update', valores }
      return api
    },
    insert: (valores: Linha) => {
      escrita = { operacao: 'insert', valores }
      return api
    },
    maybeSingle: async () => {
      const r = executar()
      return { data: Array.isArray(r.data) ? (r.data[0] ?? null) : null, error: r.error }
    },
    then: (resolve: (v: unknown) => unknown) => resolve(executar()),
  }
  return api
}

export function createClient() {
  return {
    auth: {
      getUser: async (token: string) => {
        const u = estadoBanco().usuarios[token]
        return u ? { data: { user: u }, error: null } : { data: { user: null }, error: { message: 'invalid' } }
      },
    },
    from: consulta,
  }
}
