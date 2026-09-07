import { useCallback, useEffect, useSyncExternalStore } from 'react'

import {
  CHAVE_TEMA,
  CONSULTA_ESCURO,
  TEMA_DO_SERVIDOR,
  aplicarTema,
  lerPreferencia,
  type Theme,
} from '@/lib/tema'

/** Evento próprio para avisar todas as instâncias do hook quando alguém alterna
 *  o tema. O `storage` do navegador só dispara em OUTRAS abas, então ele não
 *  serve para sincronizar dois botões na mesma página. */
const EVENTO = 'vg-theme-change'

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
  const consulta = window.matchMedia(CONSULTA_ESCURO)

  /* Preferência do sistema só manda enquanto a pessoa não escolheu nada no
     site. Depois de uma escolha explícita, ela vence. */
  const aoMudarSistema = () => {
    if (localStorage.getItem(CHAVE_TEMA)) return
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
 *  A chave, a regra de decisão e o script que roda antes do primeiro paint
 *  moram todos em `src/lib/tema.ts`, de propósito: se o script inline e este
 *  hook lessem a preferência de formas diferentes, a página pintaria um tema e
 *  o React desenharia o outro. Há teste comparando os dois nos quatro cenários.
 *
 *  POR QUE `useSyncExternalStore` E NÃO `useState(lerPreferencia)`:
 *
 *  A preferência mora fora do React, no localStorage e no matchMedia. Lendo-a no
 *  inicializador do useState, a primeira renderização do cliente já saía com o
 *  tema real enquanto o HTML do servidor viera com o padrão. Para quem usa tema
 *  escuro, o ícone e o aria-label do botão divergiam, e o React derrubava a
 *  árvore inteira com "Hydration failed because the server rendered HTML didn't
 *  match the client". Não era aviso cosmético: a página toda era descartada e
 *  renderizada de novo no cliente.
 *
 *  `getServerSnapshot` existe exatamente para isso: o React usa esse valor na
 *  hidratação, servidor e cliente concordam, e só depois o valor real entra.
 *
 *  O padrão alternativo, um `mounted` ligado dentro de um `useEffect`, esbarra
 *  na regra `react-hooks/set-state-in-effect` que este projeto tem ligada. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  /* Sincronizar a classe do documento é atualizar um sistema externo com o
     estado do React, que é o uso legítimo de efeito. Não chama setState.
     O script inline já aplicou a classe antes do paint; isto mantém em dia
     depois de cada alternância. */
  useEffect(() => {
    aplicarTema(theme)
  }, [theme])

  const toggle = useCallback(() => {
    temaAtual = getSnapshot() === 'dark' ? 'light' : 'dark'
    localStorage.setItem(CHAVE_TEMA, temaAtual)
    window.dispatchEvent(new Event(EVENTO))
  }, [])

  return { theme, toggle }
}
