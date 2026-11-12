// KAN-686: guia de IA do Vive Gostoso (site e Super App). So texto e links; a chave do modelo fica
// no servidor (CMD_API_KEY) e o chat so liga com GUIA_ATIVO=1. Regras e barreiras: src/lib/guia/.
import { createClient } from '@supabase/supabase-js'
import { configDoAmbiente } from '@/lib/guia/config'
import { executarFerramenta, type ClienteGuia } from '@/lib/guia/ferramentas'
import { criarGuarda } from '@/lib/guia/guarda'
import { criarHandler } from '@/lib/guia/handler'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const config = configDoAmbiente()
// uma instancia por processo: o contador de limite vive aqui
const guarda = criarGuarda(Date.now, config.tetoDiario)

function clienteAnonimo(): ClienteGuia | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !chave) return null
  return createClient(url, chave, { auth: { persistSession: false } })
}

const handler = criarHandler({
  config,
  guarda,
  executor: (nome, argumentos) => executarFerramenta(nome, argumentos, clienteAnonimo()),
})

export async function POST(req: Request) {
  return handler.post(req)
}

export async function OPTIONS(req: Request) {
  return handler.opcoes(req)
}
