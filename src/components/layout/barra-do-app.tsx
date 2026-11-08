'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, House, MessageCircle, Ticket, Waves } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { pushDataLayer } from '@/lib/analytics'
import { buildWhatsAppLink, OFFICIAL_WHATSAPP } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

/** Rotas (sem prefixo de idioma) onde a barra some: o perfil do negocio tem a
 *  propria barra de acoes, e as areas logadas tem navegacao propria. */
export const SEM_BARRA_DO_APP = ['/negocio', '/cadastre', '/admin']

export function semPrefixoDeIdioma(caminho: string): string {
  const sem = caminho.replace(/^\/(pt|en|es)(?=\/|$)/, '')
  return sem === '' ? '/' : sem
}

/** true quando a barra do app deve aparecer nesta rota. */
export function barraDoAppVisivel(caminho: string): boolean {
  const c = semPrefixoDeIdioma(caminho)
  return !SEM_BARRA_DO_APP.some(r => c === r || c.startsWith(`${r}/`))
}

type Aba = { chave: string; caminho: string; Icone: typeof House; exato?: boolean; destaque?: boolean }

const ABAS: Aba[] = [
  { chave: 'inicio', caminho: '/', Icone: House, exato: true },
  { chave: 'explorar', caminho: '/explore', Icone: Compass },
  { chave: 'passaporte', caminho: '/clube', Icone: Ticket, destaque: true },
  { chave: 'mares', caminho: '/explore/mares', Icone: Waves },
]

/**
 * Barra inferior do celular, no estilo de app: cinco atalhos sempre a um toque.
 * So aparece abaixo de md. Substitui o botao flutuante do WhatsApp no celular
 * (que so aparecia depois de 400 px de rolagem e empilhava com o de compartilhar).
 */
export function BarraDoApp() {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const caminho = semPrefixoDeIdioma(usePathname() ?? '/')

  if (!barraDoAppVisivel(caminho)) return null

  const ativa = (a: Aba) => {
    if (a.exato) return caminho === a.caminho
    /* /explore nao pode acender junto com /explore/mares: a aba mais especifica ganha. */
    if (a.chave === 'explorar') return caminho === '/explore' || (caminho.startsWith('/explore/') && !caminho.startsWith('/explore/mares'))
    return caminho === a.caminho || caminho.startsWith(`${a.caminho}/`)
  }

  const whatsapp = buildWhatsAppLink(OFFICIAL_WHATSAPP, { source: 'official_cta' }, t)
  const item = 'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium leading-none transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal motion-reduce:transition-none'

  return (
    <nav
      aria-label={t('nav.app_label')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-1 bg-elev/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {ABAS.map(a => {
          const on = ativa(a)
          return (
            <li key={a.chave} className="flex flex-1">
              <Link
                href={lp(a.caminho)}
                aria-current={on ? 'page' : undefined}
                onClick={() => pushDataLayer('barra_app_click', { aba: a.chave })}
                className={cn(item, on ? 'text-teal' : 'text-fg-2')}
              >
                {a.destaque ? (
                  <span className={cn('-mt-5 flex size-11 items-center justify-center rounded-full border-4 border-elev shadow-md', on ? 'bg-teal-dark' : 'bg-teal')}>
                    <a.Icone className="size-5 text-white" aria-hidden="true" />
                  </span>
                ) : (
                  <a.Icone className="size-5" aria-hidden="true" />
                )}
                <span>{t(`nav.app_${a.chave}`)}</span>
              </Link>
            </li>
          )
        })}
        <li className="flex flex-1">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => pushDataLayer('whatsapp_click', { origem: 'barra_app' })}
            aria-label={t('nav.falar_aria')}
            className={cn(item, 'text-fg-2')}
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            <span>{t('nav.app_falar')}</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}
