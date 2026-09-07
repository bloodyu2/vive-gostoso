/**
 * Fonte única da preferência de tema.
 *
 * Duas coisas leem essa preferência em momentos diferentes: o script inline que
 * roda antes do primeiro paint (para não haver flash de tema claro) e o hook
 * `useTheme`, que roda depois da hidratação. Se as duas leituras divergirem, a
 * página pinta um tema e o React desenha o outro, que é o mesmo defeito de
 * hidratação que o `useSyncExternalStore` acabou de resolver.
 *
 * Por isso a chave, a classe e a regra de decisão moram aqui, e só aqui. O
 * script inline é gerado a partir das mesmas constantes, e há teste que roda os
 * dois lado a lado nos quatro cenários possíveis para provar que concordam.
 */

export type Theme = 'light' | 'dark'

export const CHAVE_TEMA = 'vg-theme'
export const CLASSE_ESCURO = 'dark'

/** O tema que o servidor sempre renderiza. Constante porque o servidor não tem
 *  localStorage nem matchMedia. */
export const TEMA_DO_SERVIDOR: Theme = 'light'

export const CONSULTA_ESCURO = '(prefers-color-scheme: dark)'

/**
 * A regra: escolha explícita da pessoa vence; sem escolha, vale o sistema.
 * O script inline abaixo repete esta mesma regra em JavaScript solto, porque
 * ele roda antes de qualquer módulo carregar. O teste em `tema.test.ts` compara
 * os dois.
 */
export function decidirTema(guardado: string | null, sistemaPrefereEscuro: boolean): Theme {
  if (guardado === 'dark') return 'dark'
  if (guardado === 'light') return 'light'
  return sistemaPrefereEscuro ? 'dark' : 'light'
}

/** Leitura no navegador, usada pelo hook. */
export function lerPreferencia(): Theme {
  if (typeof window === 'undefined') return TEMA_DO_SERVIDOR
  return decidirTema(
    localStorage.getItem(CHAVE_TEMA),
    window.matchMedia(CONSULTA_ESCURO).matches
  )
}

export function aplicarTema(theme: Theme): void {
  document.documentElement.classList.toggle(CLASSE_ESCURO, theme === 'dark')
}

/**
 * Script que roda antes do primeiro paint, aplicando a classe do tema escuro no
 * <html> para não haver flash de tema claro em quem usa escuro.
 *
 * Precisa ser síncrono e no <head>: qualquer coisa assíncrona já perdeu o paint.
 * O `try/catch` é obrigatório porque localStorage lança em navegador com dados
 * de site bloqueados, e uma exceção aqui derrubaria a página inteira antes do
 * React subir.
 *
 * O `<html>` já tem `suppressHydrationWarning` no layout raiz, que é o uso
 * legítimo dele: o atributo é mutado de propósito antes da hidratação.
 */
export const SCRIPT_ANTI_FOUC = `try{
var g=localStorage.getItem(${JSON.stringify(CHAVE_TEMA)});
var e=g===${JSON.stringify('dark')}||(g!==${JSON.stringify('light')}&&matchMedia(${JSON.stringify(CONSULTA_ESCURO)}).matches);
document.documentElement.classList.toggle(${JSON.stringify(CLASSE_ESCURO)},e);
}catch(_){}`
