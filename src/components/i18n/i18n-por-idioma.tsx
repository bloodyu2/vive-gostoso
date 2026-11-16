'use client'
import { useMemo, type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'

const IDIOMAS = ['pt', 'en', 'es'] as const

/**
 * Dá a cada página o idioma da URL ja na renderizacao do servidor.
 *
 * O `i18n` global nasce em pt e so troca de idioma no navegador (LocaleSync, num
 * useEffect). Sem este provider, /en/sobre e /es/sobre saiam do servidor em
 * portugues e so viravam ingles depois do JavaScript: o Google lia o HTML em
 * portugues sob a URL em ingles (medido em 16/11/2026, 16 de 19 paginas).
 *
 * `cloneInstance` reaproveita os recursos ja carregados e devolve uma instancia
 * propria com o idioma pedido, sem mexer no global (que e compartilhado entre
 * requisicoes no servidor). O LocaleSync segue trocando o global para o codigo
 * que o usa direto, fora do provider.
 */
export function I18nPorIdioma({ lang, children }: { lang: string; children: ReactNode }) {
  const instancia = useMemo(() => {
    const idioma = (IDIOMAS as readonly string[]).includes(lang) ? lang : 'pt'
    return i18n.cloneInstance({ lng: idioma })
  }, [lang])

  return <I18nextProvider i18n={instancia}>{children}</I18nextProvider>
}
