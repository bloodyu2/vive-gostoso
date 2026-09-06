// app/[lang]/bio/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, AtSign, Mail, MessageCircle, Store, UserPlus } from 'lucide-react'

import { VIVE, linkWhatsAppBio, whatsappFormatado } from '@/lib/bio/contato'
import { dicionario, prefixo } from '@/lib/bio/dicionario'

/* A PÁGINA DA TAG NFC.
 *
 *  Ela não é mais o link da bio do Instagram. É uma etiqueta encostada no celular de
 *  um turista na feira, ou no de um dono de pousada no balcão dele. Três
 *  consequências, e todo o desenho sai delas:
 *
 *  1. QUEM CHEGA NÃO SABE O QUE É ISTO. No Instagram a pessoa já viu o perfil antes
 *     de tocar no link. Aqui ela acabou de encostar um telefone no outro, então a
 *     primeira dobra diz o que o Vive Gostoso é e para que cidade ele serve, sem
 *     rolagem.
 *  2. A AÇÃO PRINCIPAL É GUARDAR O CONTATO, não escolher um link.
 *  3. O CONTEXTO É EM PÉ, NO SOL, COM UMA MÃO SÓ. Daí alvo de toque de 48 a 68px,
 *     contraste de 15,60:1 no corpo e nenhum JavaScript.
 *
 *  A PÁGINA É TRADUZIDA DE VERDADE, e sem JavaScript. O i18n do site roda no
 *  cliente, com o LocaleSync lendo o prefixo da URL depois da hidratação. Aqui o
 *  idioma vem de `params.lang` e o dicionário é lido no servidor, então o HTML já sai
 *  no idioma certo. Ver src/lib/bio/dicionario.ts.
 *
 *  SEM O LAYOUT DO SITE. Cabeçalho, rodapé, botão de compartilhar e banner de
 *  cookies saem pelo ChromeDoSite, por prefixo de rota, sem prefixo de idioma.
 */

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
    /* Fora da busca de propósito: esta página existe para quem já está com o celular
       na mão, e no índice ela só competiria com a home pelas mesmas palavras. O card
       de compartilhamento continua completo, porque o link vai ser colado em
       conversa. */
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

/* O anel de foco acompanha a superfície: carvão sobre a areia dá 15,60, e areia
   sobre o teal da faixa dá 4,49. Um anel só, fixo, sumiria num dos dois. */
const FOCO =
  'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]'

const BLOCO = `flex w-full items-center gap-3 rounded-xl px-5 text-left transition-transform duration-150 ease-out active:translate-y-[2px] motion-reduce:transition-none ${FOCO}`

export default async function BioPage({ params }: Props) {
  const { lang } = await params
  const dic = dicionario(lang)
  const t = dic.bio
  const nav = dic.nav
  const p = prefixo(lang)

  /* O sistema verbal é a identidade da marca, e é ele que faz o índice. As palavras
     vêm do mesmo `nav` que o cabeçalho do site usa, então já chegam traduzidas.

     ELES NÃO SAEM COLORIDOS AQUI, E ISSO É DELIBERADO. As classes .verb-* do site
     pintam cada verbo com a cor dele, e sobre a areia da página o ocre dá 2,92, o
     coral 3,31 e o verde 3,73, todos abaixo do mínimo. Numa etiqueta lida no sol,
     legibilidade ganha de cor: os verbos ficam em carvão (15,60) e a identidade vem
     da Fraunces em caixa alta, que é o que faz o sistema ser reconhecível. */
  const verbos = [
    { href: `${p}/come`, palavra: nav.come, sub: t.come_sub },
    { href: `${p}/fique`, palavra: nav.fique, sub: t.fique_sub },
    { href: `${p}/passeie`, palavra: nav.passeie, sub: t.passeie_sub },
    { href: `${p}/explore`, palavra: nav.explore, sub: t.explore_sub },
    { href: `${p}/participe`, palavra: nav.participe, sub: t.participe_sub },
    { href: `${p}/conheca`, palavra: nav.conheca, sub: t.conheca_sub },
    { href: `${p}/contrate`, palavra: nav.contrate, sub: t.contrate_sub },
    { href: `${p}/apoie`, palavra: nav.apoie, sub: t.apoie_sub },
  ]

  return (
    <div className="min-h-dvh bg-page pb-10 text-fg-1">
      {/* A FAIXA DE IDENTIDADE.
          Carvão nos dois esquemas de cor: a marca é a mesma de dia e de noite, e a
          faixa escura é o que separa "quem é isto" de "o que fazer". */}
      <header className="bg-[#1A1A1A] px-5 pt-9 pb-14 sm:px-6 sm:pt-12">
        <div className="mx-auto w-full max-w-[26rem] sm:max-w-[28rem]">
          <p className="font-display text-[2.25rem] leading-none font-bold tracking-[-0.02em] text-[#F5F2EE] sm:text-[2.5rem]">
            Vive Gostoso<span className="text-[#E05A3A]">.</span>
          </p>

          <h1 className="mt-5 max-w-[30ch] text-[1.0625rem] leading-snug text-balance text-[#F5F2EE]">
            {t.role}
          </h1>

          <p className="mt-3 max-w-[36ch] text-pretty text-[0.9375rem] leading-relaxed text-[#C0BCB8]">
            {t.caption}
          </p>

          {/* O fio coral separa quem somos do que fazer. Sobre o carvão ele dá 4,72,
              e é o único elemento decorativo da página. */}
          <div aria-hidden className="mt-8 h-[3px] w-14 rounded-full bg-[#E05A3A]" />
        </div>
      </header>

      {/* relative: o bloco precisa pintar por cima da faixa, porque o botão principal
          sobe por cima dela. */}
      <div className="relative mx-auto w-full max-w-[26rem] px-5 sm:max-w-[28rem] sm:px-6">
        <a
          href={`${p}/bio/contato.vcf`}
          download="vive-gostoso.vcf"
          className={`${BLOCO} -mt-9 min-h-[4.25rem] bg-teal text-white shadow-[0_10px_28px_rgba(13,124,124,0.28)]`}
        >
          <UserPlus className="size-6 shrink-0" aria-hidden />
          <span className="flex flex-col py-3">
            <span className="text-[1.0625rem] leading-tight font-semibold">{t.save}</span>
            <span className="text-[0.6875rem] tracking-[0.14em] text-teal-50 uppercase">
              {t.save_hint}
            </span>
          </span>
        </a>

        <a
          href={linkWhatsAppBio(t.whatsapp_msg)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BLOCO} mt-4 min-h-14 border-2 border-[#1A1A1A] bg-transparent text-fg-1`}
        >
          <MessageCircle className="size-5 shrink-0" aria-hidden />
          <span className="py-3 text-[1.0625rem] leading-tight font-semibold">{t.whatsapp}</span>
        </a>

        {/* Sem WhatsApp instalado não pode ser beco sem saída: o mesmo número atende
            ligação, e o link tel: abre o discador de qualquer aparelho. */}
        <a
          href={`tel:+${VIVE.whatsapp}`}
          className={`${FOCO} mt-3 flex min-h-12 items-center justify-center text-sm font-semibold text-teal-700 underline decoration-2 underline-offset-4`}
        >
          {t.call} {whatsappFormatado()}
        </a>

        {/* O índice da cidade. Duas colunas com fio, que é o que faz oito palavras
            lerem como um cardápio e não como oito pílulas empilhadas. */}
        <nav aria-label={VIVE.nome} className="mt-8">
          <ul className="grid grid-cols-2 border-t border-[#1A1A1A]/15">
            {verbos.map(({ href, palavra, sub }) => (
              <li key={href} className="border-b border-[#1A1A1A]/15 odd:border-r">
                <Link
                  href={href}
                  className={`${FOCO} flex min-h-[3.75rem] flex-col justify-center py-2 pr-3 odd:pl-0 even:pl-3`}
                >
                  <span className="font-display text-[1.0625rem] leading-none font-bold tracking-[-0.01em]">
                    {palavra}
                    <span className="text-[#E05A3A]">.</span>
                  </span>
                  <span className="mt-1 text-[0.75rem] leading-snug text-fg-2">{sub}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quem encosta o celular aqui pode ser turista ou dono de negócio. Os dois
            não competem: o turista já foi atendido pelo índice acima, e esta linha
            existe para o segundo, sem roubar espaço do primeiro. */}
        <Link
          href={`${p}/parceiros`}
          className={`${FOCO} mt-6 flex min-h-14 items-center gap-3 rounded-xl bg-teal-50 px-4 py-3`}
        >
          <Store className="size-5 shrink-0 text-teal-700" aria-hidden />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm leading-tight font-semibold text-teal-700">
              {t.business_link}
            </span>
            <span className="text-[0.75rem] leading-snug text-fg-2">
              {t.business_sub}
            </span>
          </span>
          <ArrowUpRight className="size-4 shrink-0 text-teal-700" aria-hidden />
        </Link>

        <div className="mt-6 flex flex-col text-[0.8125rem]">
          <a
            href={`mailto:${VIVE.email}`}
            className={`${FOCO} flex min-h-12 items-center gap-2 font-semibold break-all text-teal-700 underline decoration-1 underline-offset-4`}
          >
            <Mail className="size-4 shrink-0" aria-hidden />
            {VIVE.email}
          </a>
          <a
            href={VIVE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={`${FOCO} flex min-h-12 items-center gap-2 font-semibold text-teal-700 underline decoration-1 underline-offset-4`}
          >
            <AtSign className="size-4 shrink-0" aria-hidden />
            {VIVE.instagramRotulo}
          </a>
          <Link
            href={p === '' ? '/' : p}
            className={`${FOCO} flex min-h-12 items-center gap-2 font-semibold text-teal-700 underline decoration-1 underline-offset-4`}
          >
            {VIVE.siteRotulo}
          </Link>
        </div>
      </div>
    </div>
  )
}
