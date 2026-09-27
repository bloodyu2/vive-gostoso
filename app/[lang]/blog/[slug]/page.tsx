import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getBlogSlugsForBuild, getBlogPostForPage } from '@/lib/supabase/build-queries'
import BlogPostPage from '@/views/BlogPost'
import { articleSchema, breadcrumbSchema } from '@/lib/seo'
import { safeJsonLd } from '@/lib/json-ld'
import {
  alternatesDoPost,
  idiomaDoSlug,
  inLanguageDoPost,
  slugNoIdioma,
  urlDoPost,
  visivelNoIdioma,
  type IdiomaBlog,
} from '@/lib/blog/traducoes'

export const revalidate = 86400

const ROTULO_INICIO: Record<IdiomaBlog, string> = { pt: 'Início', en: 'Home', es: 'Inicio' }

function normalizarLang(lang: string): IdiomaBlog {
  return lang === 'en' || lang === 'es' ? lang : 'pt'
}

type Props = { params: Promise<{ lang: string; slug: string }> }

export async function generateStaticParams() {
  const slugs = await getBlogSlugsForBuild()
  const langs: IdiomaBlog[] = ['pt', 'en', 'es']
  return langs.flatMap((lang) =>
    slugs.filter((slug) => visivelNoIdioma(slug, lang)).map((slug) => ({ lang, slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params
  const post = await getBlogPostForPage(slug)
  if (!post) return { title: 'Post nao encontrado' }

  const baseUrl = 'https://www.vivegostoso.com.br'
  const idioma = normalizarLang(lang)
  const canonical = urlDoPost(slugNoIdioma(slug, idioma), idioma)
  const description = post.excerpt ?? `${post.title} no blog do Vive Gostoso.`
  const image = post.cover_url ?? `${baseUrl}/og-image.png`

  return {
    /* `absolute` porque o title do post JA e um titulo de SEO completo, escrito
       para a busca. O layout raiz define title.template = '%s | Vive Gostoso',
       e sem isto o Next reanexa a marca, gastando 15 caracteres do limite de
       ~65 que o Google mostra. Nas rotas de negocio e evento o template
       continua valendo, porque la o title e so o nome do lugar e a marca ajuda. */
    title: { absolute: post.title },
    description,
    alternates: {
      canonical,
      languages: alternatesDoPost(slug),
    },
    openGraph: {
      title: post.title,
      description,
      url: canonical,
      siteName: 'Vive Gostoso',
      locale: lang === 'pt' ? 'pt_BR' : lang === 'en' ? 'en_US' : 'es_ES',
      type: 'article',
      images: post.cover_url ? [{ url: post.cover_url, width: 1200, height: 630 }] : [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [image],
    },
  }
}

export default async function BlogPostRoute({ params }: Props) {
  const { slug, lang } = await params
  const idioma = normalizarLang(lang)
  const idiomaDoPost = idiomaDoSlug(slug)
  if (idiomaDoPost !== null && idiomaDoPost !== idioma) {
    const destino = slugNoIdioma(slug, idioma)
    permanentRedirect(`${idioma === 'pt' ? '' : '/' + idioma}/blog/${destino}`)
  }
  const post = await getBlogPostForPage(slug)
  if (!post) notFound()

  const baseUrl = 'https://www.vivegostoso.com.br'
  const langPrefix = idioma === 'pt' ? '' : idioma + '/'
  const postUrl = urlDoPost(slug, idioma)

  const jsonLd = articleSchema({
    title: post.title,
    description: post.excerpt ?? `${post.title} no blog do Vive Gostoso.`,
    url: postUrl,
    image: post.cover_url ?? undefined,
    publishedTime: post.published_at ?? undefined,
    modifiedTime: post.created_at ?? undefined,
    tags: post.tags ?? undefined,
    author: post.author ?? 'Vive Gostoso',
    inLanguage: inLanguageDoPost(slug, idioma),
  })

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: ROTULO_INICIO[idioma], url: `${baseUrl}/${langPrefix}` },
    { name: 'Blog', url: `${baseUrl}/${langPrefix}blog` },
    { name: post.title, url: postUrl },
  ])

  let faqJsonLd: Record<string, unknown> | null = null
  if (post.faq_jsonld) {
    try {
      const parsed = JSON.parse(post.faq_jsonld)
      if (parsed && typeof parsed === 'object') {
        faqJsonLd = parsed as Record<string, unknown>
      }
    } catch {
      // ignora JSON-LD malformado
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
        />
      )}
      <BlogPostPage initialPost={post} slug={slug} />
    </>
  )
}
