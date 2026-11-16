'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { interpretarResposta, type RespostaUso } from '@/lib/clube/pergunta'

interface Props {
  /** token da pergunta (do e-mail) ou do cupom */
  token: string
  /** resposta que a pessoa ja deu antes, ou null */
  respostaInicial: RespostaUso | null
  /** o cupom ja esta marcado como usado (pelo parceiro ou pela pessoa) */
  jaUsado: boolean
  primeiroNome: string
  validade: string
  textos: {
    btn_usei: string
    btn_nao: string
    enviando: string
    obrigado_sim: string
    obrigado_nao: string
    ja_usado: string
    erro: string
  }
}

/** Os dois botoes da pagina. A resposta so e gravada no toque (chamada ao banco), nunca por
 *  abrir o link: leitores de e-mail e previews abrem links sozinhos. */
export function ResponderUso({ token, respostaInicial, jaUsado, primeiroNome, validade, textos }: Props) {
  const [resposta, setResposta] = useState<RespostaUso | null>(respostaInicial)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(false)

  async function responder(usou: boolean) {
    if (enviando) return
    setEnviando(true)
    setErro(false)
    try {
      const { data, error } = await supabase.rpc('gostoso_club_responder_uso', { p_token: token, p_usou: usou })
      const r = interpretarResposta(data, error)
      if (r.tipo === 'ok') setResposta(r.resposta)
      else setErro(true)
    } catch {
      setErro(true)
    }
    setEnviando(false)
  }

  if (resposta === 'sim' || (jaUsado && resposta === null)) {
    return (
      <p role="status" style={{ fontSize: '1.05rem', marginTop: '1rem' }}>
        {resposta === 'sim' ? textos.obrigado_sim.replace('{nome}', () => primeiroNome) : textos.ja_usado}
      </p>
    )
  }

  return (
    <div className="clube-pilha" style={{ marginTop: '1rem' }}>
      {resposta === 'nao' ? (
        <p role="status">{textos.obrigado_nao.replace('{nome}', () => primeiroNome).replace('{data}', () => validade)}</p>
      ) : null}
      <button type="button" className="clube-btn clube-btn--verde clube-btn--cheio" onClick={() => responder(true)} disabled={enviando}>
        {enviando ? textos.enviando : textos.btn_usei}
      </button>
      {resposta === 'nao' ? null : (
        <button type="button" className="clube-btn clube-btn--contorno clube-btn--cheio" onClick={() => responder(false)} disabled={enviando}>
          {textos.btn_nao}
        </button>
      )}
      {erro ? (
        <p className="clube-erro" role="alert">
          {textos.erro}
        </p>
      ) : null}
    </div>
  )
}
