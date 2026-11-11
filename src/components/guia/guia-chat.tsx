'use client'

// KAN-687: widget do guia de IA. So aparece em portugues e so com NEXT_PUBLIC_GUIA_ATIVO=1.
// Nada fica guardado no aparelho: a conversa vive so na memoria da aba. A chave nunca passa por aqui.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { pushDataLayer } from '@/lib/analytics'

type Fala = { role: 'user' | 'assistant'; content: string; links?: { slug: string }[] }

const MAX_CHARS = 500
const MAX_TURNOS = 6

const PERFIS: [string, string][] = [['casal', 'Casal'], ['familia', 'Familia'], ['amigos', 'Amigos'], ['sozinho', 'Sozinho']]
const INTERESSES: [string, string][] = [
  ['praias', 'Praias'], ['kitesurf', 'Kitesurf'], ['passeios', 'Passeios'], ['gastronomia', 'Gastronomia'],
  ['calmaria', 'Calmaria'], ['festas', 'Festas'], ['cultura', 'Cultura'],
]
const ORCAMENTOS: [string, string][] = [['economico', 'Economico'], ['medio', 'Medio'], ['sem_limite', 'Sem limite']]

const SUGESTOES = ['Onde comer peixe fresco?', 'Qual a maré de amanhã?', 'Quais eventos vão ter?']

function nomeDoSlug(slug: string): string {
  const s = slug.replace(/-/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function GuiaChat() {
  const caminho = usePathname() ?? '/'
  const emIdiomaDeOutroPais = /^\/(en|es)(\/|$)/.test(caminho)
  const [aberto, setAberto] = useState(false)
  const [aba, setAba] = useState<'conversa' | 'roteiro'>('conversa')
  const [falas, setFalas] = useState<Fala[]>([])
  const [texto, setTexto] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const fim = useRef<HTMLDivElement>(null)

  const [dias, setDias] = useState(3)
  const [perfil, setPerfil] = useState('casal')
  const [interesses, setInteresses] = useState<string[]>(['praias'])
  const [orcamento, setOrcamento] = useState('medio')

  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'end' })
  }, [falas, carregando])

  useEffect(() => {
    if (!aberto) return
    const aoTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false)
    }
    window.addEventListener('keydown', aoTecla)
    return () => window.removeEventListener('keydown', aoTecla)
  }, [aberto])

  if (process.env.NEXT_PUBLIC_GUIA_ATIVO !== '1' || emIdiomaDeOutroPais) return null

  async function enviar(corpo: unknown, novas: Fala[]) {
    setCarregando(true)
    setAviso(null)
    try {
      const r = await fetch('/api/guia', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) })
      const dados = (await r.json().catch(() => ({}))) as { texto?: string; links?: { slug: string }[]; mensagem?: string }
      if (!r.ok || !dados.texto) {
        setAviso(dados.mensagem ?? 'Nao consegui responder agora. Tente de novo em instantes.')
        setFalas(novas)
        return
      }
      setFalas([...novas, { role: 'assistant', content: dados.texto, links: dados.links ?? [] }])
    } catch {
      setAviso('Sem conexao. Tente de novo em instantes.')
      setFalas(novas)
    } finally {
      setCarregando(false)
    }
  }

  async function perguntar(pergunta: string) {
    const limpa = pergunta.trim()
    if (!limpa || carregando) return
    const doUsuario = falas.filter((f) => f.role === 'user').length
    if (doUsuario >= MAX_TURNOS) {
      setAviso('A conversa chegou ao limite. Comece uma nova para continuar.')
      return
    }
    const novas: Fala[] = [...falas, { role: 'user', content: limpa }]
    setFalas(novas)
    setTexto('')
    setAba('conversa')
    pushDataLayer('guia_pergunta', { origem: 'chat' })
    await enviar({ mensagens: novas.map((f) => ({ role: f.role, content: f.content })) }, novas)
  }

  async function montarRoteiro(e: React.FormEvent) {
    e.preventDefault()
    if (carregando || interesses.length === 0) return
    const resumo = `Roteiro de ${dias} dia${dias > 1 ? 's' : ''}: ${PERFIS.find((p) => p[0] === perfil)?.[1].toLowerCase()}, ${interesses.join(', ')}.`
    const novas: Fala[] = [{ role: 'user', content: resumo }]
    setFalas(novas)
    setAba('conversa')
    pushDataLayer('guia_roteiro', { dias })
    await enviar({ tipo: 'roteiro', dias, perfil, interesses, orcamento }, novas)
  }

  function alternarInteresse(i: string) {
    setInteresses((atual) => (atual.includes(i) ? atual.filter((x) => x !== i) : [...atual, i]))
  }

  return (
    <>
      {!aberto && (
        <button
          type="button"
          onClick={() => { setAberto(true); pushDataLayer('guia_aberto', { origem: 'botao' }) }}
          aria-label="Abrir o guia do Vive Gostoso"
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 md:bottom-6 z-[45] [html[data-cookie-aberto]_&]:hidden flex items-center gap-2 rounded-full bg-teal px-4 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Guia
        </button>
      )}

      {aberto && (
        <section
          role="dialog"
          aria-label="Guia do Vive Gostoso"
          className="fixed bottom-0 left-0 right-0 z-[60] flex max-h-[85vh] flex-col overflow-hidden rounded-t-2xl border border-[#E8E4DF] bg-white shadow-2xl dark:border-[#2D2D2D] dark:bg-[#1A1A1A] md:bottom-6 md:left-4 md:right-auto md:w-[380px] md:rounded-2xl"
        >
          <header className="flex items-center justify-between border-b border-[#E8E4DF] px-4 py-3 dark:border-[#2D2D2D]">
            <div>
              <p className="text-sm font-semibold">Guia Vive Gostoso</p>
              <p className="text-xs opacity-70">Assistente de IA. Nao envie dados pessoais.</p>
            </div>
            <button type="button" onClick={() => setAberto(false)} aria-label="Fechar o guia" className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div className="flex gap-2 px-4 pt-3" role="tablist">
            {(['conversa', 'roteiro'] as const).map((a) => (
              <button
                key={a}
                type="button"
                role="tab"
                aria-selected={aba === a}
                onClick={() => setAba(a)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${aba === a ? 'bg-teal text-white' : 'border border-[#E8E4DF] dark:border-[#2D2D2D]'}`}
              >
                {a === 'conversa' ? 'Conversar' : 'Montar roteiro'}
              </button>
            ))}
            {falas.length > 0 && (
              <button type="button" onClick={() => { setFalas([]); setAviso(null) }} className="ml-auto text-xs underline opacity-70">
                Nova conversa
              </button>
            )}
          </div>

          {aba === 'conversa' ? (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
                {falas.length === 0 && (
                  <div className="space-y-2 text-sm">
                    <p>Pergunte sobre praias, passeios, onde comer, onde ficar, eventos e marés de São Miguel do Gostoso.</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGESTOES.map((s) => (
                        <button key={s} type="button" onClick={() => perguntar(s)} className="rounded-full border border-[#E8E4DF] px-3 py-1 text-xs hover:border-teal dark:border-[#2D2D2D]">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {falas.map((f, i) => (
                  <div key={i} className={f.role === 'user' ? 'text-right' : ''}>
                    <p className={`inline-block max-w-[90%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${f.role === 'user' ? 'bg-teal text-white' : 'bg-[#F5F2EE] dark:bg-[#262626]'}`}>
                      {f.content}
                    </p>
                    {f.links && f.links.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {f.links.map((l) => (
                          <Link key={l.slug} href={`/negocio/${l.slug}`} className="rounded-full border border-teal px-3 py-1 text-xs text-teal">
                            {nomeDoSlug(l.slug)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {carregando && <p className="text-sm opacity-70">Pensando...</p>}
                {aviso && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{aviso}</p>}
                <div ref={fim} />
              </div>
              <form onSubmit={(e) => { e.preventDefault(); void perguntar(texto) }} className="flex items-end gap-2 border-t border-[#E8E4DF] p-3 dark:border-[#2D2D2D]">
                <label className="sr-only" htmlFor="guia-texto">Sua pergunta</label>
                <textarea
                  id="guia-texto"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void perguntar(texto) } }}
                  rows={2}
                  maxLength={MAX_CHARS}
                  placeholder="Escreva sua pergunta"
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-[#E8E4DF] bg-transparent px-3 py-2 text-sm dark:border-[#2D2D2D]"
                />
                <button type="submit" disabled={carregando || texto.trim().length === 0} aria-label="Enviar" className="rounded-full bg-teal p-3 text-white disabled:opacity-40">
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={montarRoteiro} className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
              <label className="block">
                Quantos dias: <b>{dias}</b>
                <input type="range" min={1} max={10} value={dias} onChange={(e) => setDias(Number(e.target.value))} className="mt-1 w-full" />
              </label>
              <fieldset>
                <legend className="mb-1 font-semibold">Quem viaja</legend>
                <div className="flex flex-wrap gap-2">
                  {PERFIS.map(([v, r]) => (
                    <label key={v} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${perfil === v ? 'border-teal bg-teal text-white' : 'border-[#E8E4DF] dark:border-[#2D2D2D]'}`}>
                      <input type="radio" name="perfil" value={v} checked={perfil === v} onChange={() => setPerfil(v)} className="sr-only" />
                      {r}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-1 font-semibold">O que interessa</legend>
                <div className="flex flex-wrap gap-2">
                  {INTERESSES.map(([v, r]) => (
                    <label key={v} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${interesses.includes(v) ? 'border-teal bg-teal text-white' : 'border-[#E8E4DF] dark:border-[#2D2D2D]'}`}>
                      <input type="checkbox" checked={interesses.includes(v)} onChange={() => alternarInteresse(v)} className="sr-only" />
                      {r}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-1 font-semibold">Orçamento</legend>
                <div className="flex flex-wrap gap-2">
                  {ORCAMENTOS.map(([v, r]) => (
                    <label key={v} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${orcamento === v ? 'border-teal bg-teal text-white' : 'border-[#E8E4DF] dark:border-[#2D2D2D]'}`}>
                      <input type="radio" name="orcamento" value={v} checked={orcamento === v} onChange={() => setOrcamento(v)} className="sr-only" />
                      {r}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button type="submit" disabled={carregando || interesses.length === 0} className="w-full rounded-full bg-teal px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">
                Montar meu roteiro
              </button>
            </form>
          )}
        </section>
      )}
    </>
  )
}
