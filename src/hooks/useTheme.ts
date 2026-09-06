import { useCallback, useEffect, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const CHAVE = 'vg-theme'
/** Evento próprio para avisar todas as instâncias do hook quando alguém alterna
 *  o tema. O `storage` do navegador só dispara em OUTRAS abas, então ele não
 *  serve para sincronizar dois botões na mesma página. */
const EVENTO = 'vg-theme-change'

/** O tema que o servidor sempre renderiza. Precisa ser constante: o servidor não
 *  tem localStorage nem matchMedia. */
const TEMA_DO_SERVIDOR: Theme = 'light'

function lerPreferencia(): Theme {
  const guardado = localStorage.getItem(CHAVE) as Theme | null
  if (guardado === 'light' || guardado === 'dark') return guardado
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function aplicarTema(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/* O snapshot precisa ser estável entre chamadas consecutivas, senão o React
   entra em laço de renderização. Por isso o valor fica memorizado aqui e só
   muda quando algo de fato muda. */
let temaAtual: Theme | null = null

function getSnapshot(): Theme {
  if (temaAtual === null) temaAtual = lerPreferencia()
  return temaAtual
}

function getServerSnapshot(): Theme {
  return TEMA_DO_SERVIDOR
}

function subscribe(aoMudar: () => void): () => void {
  const consulta = window.matchMedia('(prefers-color-scheme: dark)')

  /* Preferência do sistema só manda enquanto a pessoa não escolheu nada no
     site. Depois de uma escolha explícita, ela vence. */
  const aoMudarSistema = () => {
    if (localStorage.getItem(CHAVE)) return
    temaAtual = lerPreferencia()
    aoMudar()
  }

  consulta.addEventListener('change', aoMudarSistema)
  window.addEventListener(EVENTO, aoMudar)
  return () => {
    consulta.removeEventListener('change', aoMudarSistema)
    window.removeEventListener(EVENTO, aoMudar)
  }
}

/** Tema claro/escuro.
 *
 *  POR QUE `useSyncExternalStore` E NÃO `useState(lerPreferencia)`:
 *
 *  A preferência mora fora do React, no localStorage e no matchMedia. Lendo-a no
 *  inicializador do useState, a primeira renderização do cliente já saía com o
 *  tema real enquanto o HTML do servidor viera com o tema padrão. Para quem usa
 *  tema escuro, o ícone e o aria-label do botão divergiam, e o React derrubava a
 *  árvore inteira com "Hydration failed because the server rendered HTML didn't
 *  match the client". Não era aviso cosmético: a página toda era descartada e
 *  renderizada de novo no cliente.
 *
 *  `getServerSnapshot` existe exatamente para isso: o React usa esse valor na
 *  hidratação, servidor e cliente concordam, e só depois o valor real entra.
 *  Quem consome pode usar `theme` direto, sem bandeira de montagem.
 *
 *  O padrão alternativo, um `mounted` ligado dentro de um `useEffect`, esbarra
 *  na regra `react-hooks/set-state-in-effect` que este projeto tem ligada. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  /* Sincronizar a classe do documento é atualizar um sistema externo com o
     estado do React, que é o uso legítimo de efeito. Não chama setState. */
  useEffect(() => {
    aplicarTema(theme)
  }, [theme])

  const toggle = useCallback(() => {
    temaAtual = getSnapshot() === 'dark' ? 'light' : 'dark'
    localStorage.setItem(CHAVE, temaAtual)
    window.dispatchEvent(new Event(EVENTO))
  }, [])

  return { theme, toggle }
}
