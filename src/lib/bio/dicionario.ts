import en from '@/locales/en.json'
import es from '@/locales/es.json'
import pt from '@/locales/pt.json'

/** O dicionário da /bio, lido NO SERVIDOR.
 *
 *  POR QUE NÃO O react-i18next. O i18n do site roda no cliente: o LocaleSync lê o
 *  prefixo da URL depois da hidratação e chama changeLanguage. Isso é certo para o
 *  site, e errado para uma etiqueta NFC, onde a página tem que sair pronta do
 *  servidor com o botão de WhatsApp dentro. Aqui os três JSON são importados
 *  direto e o idioma sai de `params.lang`, sem JavaScript nenhum no navegador.
 *
 *  As chaves são as mesmas dos locales do site, então tradução nova entra pelo
 *  mesmo lugar de sempre. */

const LOCALES = { pt, en, es } as const

export type Idioma = keyof typeof LOCALES

export function ehIdioma(valor: string): valor is Idioma {
  return valor === 'pt' || valor === 'en' || valor === 'es'
}

/** O locale inteiro, tipado pelo pt, que é o mais completo. */
export function dicionario(lang: string) {
  const idioma: Idioma = ehIdioma(lang) ? lang : 'pt'
  return LOCALES[idioma] as typeof pt
}

/** O prefixo de URL do idioma. O projeto usa localePrefix "as-needed", então o
 *  português vive na raiz e só en e es carregam prefixo. Um link montado com
 *  "/pt/come" funcionaria, mas geraria um redirecionamento a cada toque. */
export function prefixo(lang: string): string {
  return lang === 'pt' ? '' : `/${ehIdioma(lang) ? lang : 'pt'}`
}
