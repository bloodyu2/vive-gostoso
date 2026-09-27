// app/[lang]/bio/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BedDouble,
  BookOpen,
  CalendarDays,
  Compass,
  Map as MapaIcone,
  MessageCircle,
  Store,
  UserPlus,
  UtensilsCrossed,
} from 'lucide-react'

import { VIVE, linkWhatsAppBio } from '@/lib/bio/contato'
import { dicionario, ehIdioma, prefixo } from '@/lib/bio/dicionario'
import { comUtm, linksDaBio, linksDoRodape, type IdBloco } from '@/lib/bio/links-bio'
import { proximasMares, type ProximaMare } from '@/lib/bio/proximas-mares'
import { SLUG_GUIA_MARES, postPublicado } from '@/lib/blog/post-publicado'
import { slugNoIdioma } from '@/lib/blog/traducoes'
import { carregarSemana } from '@/lib/mares/carregar'
import { formatarAltura } from '@/lib/mares/formato'

/* A PÁGINA DO LINK DA BIO DO INSTAGRAM (ordem do dono, 27/09/2026).
 *
 *  Quem chega aqui já viu o perfil e quer uma coisa só: a maré, um lugar para
 *  comer, um passeio. Por isso a maré de hoje vem primeiro, e o resto é uma lista
 *  de destinos grandes, um por linha, para o polegar.
 *
 *  - Todo link interno leva utm_source=instagram&utm_medium=bio (src/lib/bio/links-bio.ts).
 *  - A etiqueta NFC que já existe aponta para esta mesma URL, então o vCard e o
 *    WhatsApp continuam aqui, numa linha discreta acima do rodapé.
 *  - Sem JavaScript no cliente: dicionário lido no servidor, idioma de params.lang.
 *  - Fora do layout do site (SEM_CROMO em chrome-do-site.tsx), noindex e fora do sitemap.
 *
 *  CACHE: o root layout lê o nonce de CSP por headers(), então esta rota é dinâmica
 *  (ƒ no build, conferido com dynamic = 'error' em 27/09/2026) e o revalidate fica
 *  sem efeito, como nas outras páginas (decisoes.md). Quem guarda por 1 h é o cache
 *  de dados de carregarSemana('cardeiro') e de postPublicado (fetchComCache). "Agora"
 *  e "amanhã" saem a cada visita, no fuso de Gostoso. */

export const revalidate = 3600

type Props = { params: Promise<{ lang: string }> }

export function generateStaticParams() {
  return [{ lang: 'pt' }, { lang: 'en' }, { lang: 'es' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const t = dicionario(lang).bio
  const url = `${VIVE.site}${prefixo(lang)}/bio`

  return {
    title: { absolute: t.page_title },
    description: t.page_description,
    /* Fora da busca: a página existe para quem veio do Instagram, e no índice só
       competiria com a home pelas mesmas palavras. */
    robots: { index: false, follow: false, nocache: true },
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      url,
      siteName: VIVE.nome,
      title: t.page_title,
      description: t.page_description,
    },
    twitter: {
      card: 'summary_large_image',
      title: t.page_title,
      description: t.page_description,
    },
  }
}

const FOCO =
  'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]'
const FOCO_CLARO =
  'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#F5F2EE]'

type IdCartao = Exclude<IdBloco, 'mares'>

const ICONES: Record<IdCartao, LucideIcon> = {
  mapa: MapaIcone,
  come: UtensilsCrossed,
  fique: BedDouble,
  passeie: Compass,
  eventos: CalendarDays,
  blog: BookOpen,
  cadastre: Store,
}

/* Uma cor por destino, só no quadrado do ícone: fundo claro da família e traço no
   tom escuro da mesma família, acima de 4,5:1. */
const TOM: Record<IdCartao, string> = {
  mapa: 'bg-[#0D7C7C]/12 text-[#0A5E5E]',
  come: 'bg-[#E05A3A]/14 text-[#9E3A22]',
  fique: 'bg-[#C97D2A]/16 text-[#7A4A14]',
  passeie: 'bg-[#0D7C7C]/12 text-[#0A5E5E]',
  eventos: 'bg-[#E05A3A]/14 text-[#9E3A22]',
  blog: 'bg-[#C97D2A]/16 text-[#7A4A14]',
  cadastre: 'bg-[#F5F2EE]/15 text-[#F5F2EE]',
}

async function lerMare(agora: Date) {
  try {
    const { semana, vazia } = await carregarSemana('cardeiro')
    if (vazia) return null
    const r = proximasMares(
      semana.flatMap((d) => d.eventos),
      agora,
    )
    return r.baixa || r.alta ? r : null
  } catch {
    return null
  }
}

export default async function BioPage({ params }: Props) {
  const { lang } = await params
  const idioma = ehIdioma(lang) ? lang : 'pt'
  const dic = dicionario(idioma)
  const t = dic.bio

  const slugDoPost = slugNoIdioma(SLUG_GUIA_MARES, idioma)
  const [mare, temPost] = await Promise.all([lerMare(new Date()), postPublicado(slugDoPost)])

  const blocos = linksDaBio(idioma, { postSlug: temPost ? slugDoPost : null })
  const blocoMare = blocos[0]
  const destinos = blocos.filter((b): b is { id: IdCartao; href: string } => b.id !== 'mares')
  const rodape = linksDoRodape(idioma)

  return (
    <div className="min-h-dvh bg-page text-fg-1">
      <header className="bg-[#1A1A1A] px-5 pt-9 pb-16">
        <div className="mx-auto w-full max-w-[28rem]">
          <h1 className="font-display text-[2.25rem] leading-none font-bold tracking-[-0.02em] text-[#F5F2EE]">
            Vive Gostoso<span className="text-[#E05A3A]">.</span>
          </h1>
          <p className="mt-4 max-w-[34ch] text-[1rem] leading-snug text-pretty text-[#D9D4CE]">{t.tagline}</p>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-[28rem] px-5 pb-8">
        {/* MARÉ DE HOJE: o bloco em destaque, subindo por cima da faixa. */}
        <section
          aria-labelledby="mare-titulo"
          className="-mt-10 rounded-2xl bg-[#0D7C7C] p-5 text-white shadow-[0_6px_8px_-4px_rgba(13,124,124,0.4)]"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="mare-titulo" className="font-display text-[1.5rem] leading-tight font-bold">
              {t.mare_titulo}
            </h2>
            <span className="text-[0.8125rem] text-[#E6F4F4]">{t.mare_local}</span>
          </div>

          {mare ? (
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <LinhaMare rotulo={t.mare_baixa} mare={mare.baixa} amanha={t.mare_amanha} idioma={idioma} />
              <LinhaMare rotulo={t.mare_alta} mare={mare.alta} amanha={t.mare_amanha} idioma={idioma} />
            </dl>
          ) : (
            <p className="mt-3 text-[0.9375rem] leading-snug text-[#E6F4F4]">{t.mare_vazio}</p>
          )}

          <Link
            href={blocoMare.href}
            className={`${FOCO_CLARO} mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F5F2EE] px-5 text-[1rem] font-semibold text-[#0A5E5E] transition-transform duration-150 ease-out active:translate-y-[1px] motion-reduce:transition-none`}
          >
            {t.mare_botao}
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </section>

        <nav aria-label={VIVE.nome} className="mt-6">
          <ul className="flex flex-col gap-3">
            {destinos.map(({ id, href }) => {
              const Icone = ICONES[id]
              const c = t.cartoes[id]
              const escuro = id === 'cadastre'
              const destaquePost = id === 'blog' && temPost
              return (
                <li key={id}>
                  <Link
                    href={href}
                    className={`${FOCO} group flex min-h-[4.5rem] items-center gap-4 rounded-2xl px-4 py-3 transition-colors duration-150 ease-out motion-reduce:transition-none ${
                      escuro
                        ? 'bg-[#1A1A1A] text-[#F5F2EE]'
                        : 'border border-[#1A1A1A]/15 bg-white/70 hover:border-[#1A1A1A]/40 dark:bg-white/5'
                    }`}
                  >
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${TOM[id]}`}>
                      <Icone className="size-[1.375rem]" aria-hidden />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      {destaquePost && (
                        <span className="mb-1 w-fit rounded-full bg-[#C94A2C] px-2 py-0.5 text-[0.6875rem] font-semibold text-white">
                          {t.blog_novo}
                        </span>
                      )}
                      <span className="font-display text-[1.1875rem] leading-tight font-bold text-balance">
                        {destaquePost ? dic.guia_mares.titulo : c.titulo}
                      </span>
                      <span className={`mt-0.5 text-[0.8125rem] leading-snug ${escuro ? 'text-[#D9D4CE]' : 'text-fg-2'}`}>
                        {destaquePost ? dic.guia_mares.linha : c.linha}
                      </span>
                    </span>
                    <ArrowRight
                      className="size-5 shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* A etiqueta NFC aponta para esta URL: o contato continua aqui, discreto. */}
        <div className="mt-8 border-t border-[#1A1A1A]/15 pt-4">
          <p className="text-[0.8125rem] text-fg-2">{t.contato_linha}</p>
          <div className="mt-1 flex flex-wrap gap-x-5">
            <a
              href={comUtm(`${prefixo(idioma)}/bio/contato.vcf`)}
              download="vive-gostoso.vcf"
              className={`${FOCO} flex min-h-12 items-center gap-2 text-[0.875rem] font-semibold text-teal-700 underline decoration-1 underline-offset-4`}
            >
              <UserPlus className="size-4 shrink-0" aria-hidden />
              {t.save}
            </a>
            <a
              href={linkWhatsAppBio(t.whatsapp_msg)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${FOCO} flex min-h-12 items-center gap-2 text-[0.875rem] font-semibold text-teal-700 underline decoration-1 underline-offset-4`}
            >
              <MessageCircle className="size-4 shrink-0" aria-hidden />
              {t.whatsapp}
            </a>
          </div>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-[28rem] flex-wrap items-center justify-between gap-x-4 px-5 pb-10 text-[0.8125rem]">
        <nav aria-label={t.idioma} className="flex items-center">
          {rodape.idiomas.map((i) => (
            <a
              key={i.lang}
              href={i.href}
              hrefLang={i.lang === 'pt' ? 'pt-BR' : i.lang}
              lang={i.lang}
              aria-label={i.nome}
              aria-current={i.atual ? 'page' : undefined}
              className={`${FOCO} grid min-h-12 min-w-12 place-items-center font-semibold ${
                i.atual ? 'text-fg-1 underline decoration-2 underline-offset-4' : 'text-fg-2'
              }`}
            >
              {i.rotulo}
            </a>
          ))}
        </nav>
        <Link
          href={rodape.privacidade}
          className={`${FOCO} flex min-h-12 items-center text-fg-2 underline decoration-1 underline-offset-4`}
        >
          {dic.footer.privacidade}
        </Link>
      </footer>
    </div>
  )
}

function LinhaMare({
  rotulo,
  mare,
  amanha,
  idioma,
}: {
  rotulo: string
  mare: ProximaMare | null
  amanha: string
  idioma: 'pt' | 'en' | 'es'
}) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2.5">
      <dt className="text-[0.75rem] text-[#E6F4F4]">{rotulo}</dt>
      <dd className="mt-0.5">
        {mare ? (
          <>
            <span className="font-display text-[1.625rem] leading-none font-bold tabular-nums">{mare.hora}</span>
            <span className="mt-1 block text-[0.75rem] text-[#E6F4F4]">
              {mare.amanha ? `${amanha}, ` : ''}
              {formatarAltura(mare.altura, idioma)}
            </span>
          </>
        ) : (
          <span className="text-[1rem]">-</span>
        )}
      </dd>
    </div>
  )
}
