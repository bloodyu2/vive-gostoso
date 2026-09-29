// src/lib/supabase/revalidar.ts
// KAN-463: logica da rota POST /api/revalidar, separada para teste.
import { TAG_VITRINE } from './publico'

/** A vitrine (paginas publicas) e as contagens da home, que tem tag propria. */
export const TAGS_REVALIDADAS = [TAG_VITRINE, 'gostoso_businesses'] as const

export async function revalidarSeLogado(
  usuario: () => Promise<{ id: string } | null>,
  limpar: (tag: string) => void,
): Promise<Response> {
  const u = await usuario().catch(() => null)
  if (!u) return Response.json({ ok: false }, { status: 401 })
  for (const tag of TAGS_REVALIDADAS) limpar(tag)
  return Response.json({ ok: true })
}
