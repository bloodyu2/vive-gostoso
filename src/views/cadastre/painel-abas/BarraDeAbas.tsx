'use client'

import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { abaPorTecla, type AbaId } from '@/lib/clube/painel-abas'
import '@/styles/painel-abas.css'

export interface DefinicaoDeAba {
  id: AbaId
  rotulo: string
}

export const idDaAba = (id: AbaId) => `painel-aba-${id}`
export const idDoPainelDaAba = (id: AbaId) => `painel-aba-painel-${id}`

/** Abas do painel (WAI-ARIA tablist): setas andam entre as abas, Home e End vao as pontas,
 *  so a aba ativa entra na ordem do Tab. No celular a lista rola na horizontal e cada aba
 *  tem 44 px de altura. */
export function BarraDeAbas({
  abas,
  ativa,
  onChange,
  rotuloDoGrupo,
}: {
  abas: readonly DefinicaoDeAba[]
  ativa: AbaId
  onChange: (id: AbaId) => void
  rotuloDoGrupo: string
}) {
  const botoes = useRef<Partial<Record<AbaId, HTMLButtonElement | null>>>({})

  function aoTeclar(e: KeyboardEvent<HTMLButtonElement>) {
    const proxima = abaPorTecla(
      ativa,
      e.key,
      abas.map((a) => a.id),
    )
    if (!proxima) return
    e.preventDefault()
    onChange(proxima)
    const alvo = botoes.current[proxima]
    alvo?.focus()
    alvo?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }

  return (
    <div className="painel-abas-trilho">
      <div role="tablist" aria-label={rotuloDoGrupo} className="painel-abas-lista">
        {abas.map((a) => {
          const selecionada = a.id === ativa
          return (
            <button
              key={a.id}
              ref={(el) => {
                botoes.current[a.id] = el
              }}
              type="button"
              role="tab"
              id={idDaAba(a.id)}
              aria-selected={selecionada}
              aria-controls={idDoPainelDaAba(a.id)}
              tabIndex={selecionada ? 0 : -1}
              className="painel-aba"
              onClick={() => onChange(a.id)}
              onKeyDown={aoTeclar}
            >
              {a.rotulo}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** O conteudo de uma aba. So monta depois da primeira visita e, depois disso, fica na pagina
 *  escondido (hidden) quando outra aba esta aberta: quem estava digitando no perfil nao
 *  perde o que escreveu ao dar uma olhada nos contatos. */
export function PainelDaAba({
  id,
  ativa,
  visitada,
  semAbas = false,
  children,
}: {
  id: AbaId
  ativa: AbaId
  visitada: boolean
  /** sem barra de abas na tela (quem ainda nao tem negocio): so o conteudo, sem papel de aba */
  semAbas?: boolean
  children: ReactNode
}) {
  if (semAbas) return <div>{children}</div>
  if (!visitada && id !== ativa) return null
  return (
    <div
      role="tabpanel"
      id={idDoPainelDaAba(id)}
      aria-labelledby={idDaAba(id)}
      tabIndex={0}
      hidden={id !== ativa}
      className="pt-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      {children}
    </div>
  )
}
