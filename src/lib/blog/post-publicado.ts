import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { fetchComCache } from '@/lib/mares/consulta'
import { slugNoIdioma, urlDoPost, visivelNoIdioma, type IdiomaBlog } from './traducoes'

export type ClienteBlog = Pick<SupabaseClient, 'from'>

/** Slug pt do post da tabua de mares; os outros idiomas saem de slugNoIdioma. */
export const SLUG_GUIA_MARES = 'tabua-de-mares-sao-miguel-do-gostoso'

/** O post existe e esta publicado? Qualquer erro vira false: o link some em vez
 *  de levar a um 404. */
export async function consultarPublicado(cliente: ClienteBlog | null, slug: string): Promise<boolean> {
  if (!cliente) return false
  try {
    const { data, error } = await cliente
      .from('gostoso_blog_posts')
      .select('slug')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
    if (error) return false
    return data !== null && data !== undefined
  } catch {
    return false
  }
}

/** Cliente anonimo sem cookies, com a resposta guardada por 1 h (mesmo padrao
 *  da tabua de mares, tag gostoso_blog_posts). */
function clienteBlog(): ClienteBlog | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !chave) return null
  return createClient(url, chave, { auth: { persistSession: false }, global: { fetch: fetchComCache(fetch, 'gostoso_blog_posts') } })
}

export async function postPublicado(slug: string): Promise<boolean> {
  return consultarPublicado(clienteBlog(), slug)
}

export type UltimoPost = { slug: string; titulo: string; linha: string }

type LinhaDePost = { slug: string; title: string; tags: string[] | null; published_at: string | null }

/** O post publicado mais recente que aparece no idioma (post de grupo so no seu
 *  idioma, post sem grupo em todos, mesma regra da lista do blog). Qualquer erro
 *  vira null: a /bio mostra o cartao comum do blog em vez de um link quebrado. */
export async function consultarUltimoPost(cliente: ClienteBlog | null, lang: IdiomaBlog): Promise<UltimoPost | null> {
  if (!cliente) return null
  try {
    const { data, error } = await cliente
      .from('gostoso_blog_posts')
      .select('slug,title,tags,published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(30)
    if (error || !Array.isArray(data)) return null
    const post = (data as LinhaDePost[]).find((p) => visivelNoIdioma(p.slug, lang))
    if (!post) return null
    return { slug: post.slug, titulo: post.title, linha: (post.tags ?? []).slice(0, 2).join(' · ') }
  } catch {
    return null
  }
}

export async function ultimoPost(lang: IdiomaBlog): Promise<UltimoPost | null> {
  return consultarUltimoPost(clienteBlog(), lang)
}

/** Caminho relativo do guia no idioma (o link fica no mesmo dominio). */
export function caminhoDoGuiaMares(lang: IdiomaBlog): string {
  return new URL(urlDoPost(slugNoIdioma(SLUG_GUIA_MARES, lang), lang)).pathname
}
