'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { armazemDoNavegador, guardarCupom } from '@/lib/clube/cupons-locais'
import {
  POLITICA_VERSAO,
  interpretarResgate,
  mascararTelefone,
  textoConsentimento,
  validarResgate,
  type MotivoResgate,
} from '@/lib/clube/resgate'

export interface TextosForm {
  form_titulo: string
  campo_nome: string
  campo_email: string
  campo_telefone: string
  nota_dados: string
  consentimento: string
  politica_link: string
  gerar_cupom: string
  gerando: string
  cancelar: string
  erro_nome: string
  erro_email: string
  erro_telefone: string
  erro_consentimento: string
  erro_ja_tem: string
  erro_resgate: string
  erro_muitos: string
  erro_limite_contato: string
  erro_indisponivel: string
  esgotada: string
}

interface Props {
  partnerId: string
  negocio: string
  textos: TextosForm
  /** Codigo da plaquinha de onde a pessoa veio (dois digitos), ou null. */
  origem: string | null
  /** Prefixo de idioma ('' no pt). */
  prefixo: string
  onCancelar: () => void
}

type Campo = 'nome' | 'email' | 'telefone' | 'consentimento'

/** Id aleatorio do aparelho, guardado no navegador (nao e dado pessoal): so serve para o
 *  servidor limitar quantos cupons saem de um mesmo aparelho por dia. */
function idDoAparelho(): string | null {
  try {
    let id = localStorage.getItem('vg-clube-aparelho')
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
      id = crypto.randomUUID()
      localStorage.setItem('vg-clube-aparelho', id)
    }
    return id
  } catch {
    return null
  }
}

export function FormResgate({ partnerId, negocio, textos, origem, prefixo, onCancelar }: Props) {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [consentimento, setConsentimento] = useState(false)
  const [isca, setIsca] = useState('')
  const [campoComErro, setCampoComErro] = useState<Campo | null>(null)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const refNome = useRef<HTMLInputElement>(null)
  const refEmail = useRef<HTMLInputElement>(null)
  const refTelefone = useRef<HTMLInputElement>(null)
  const refConsentimento = useRef<HTMLInputElement>(null)

  const textoDoConsentimento = textoConsentimento(textos.consentimento, negocio)
  const mensagemDoCampo: Record<Campo, string> = {
    nome: textos.erro_nome,
    email: textos.erro_email,
    telefone: textos.erro_telefone,
    consentimento: textos.erro_consentimento,
  }

  function apontar(campo: Campo) {
    setCampoComErro(campo)
    setErroGeral(null)
    const alvo = { nome: refNome, email: refEmail, telefone: refTelefone, consentimento: refConsentimento }[campo]
    alvo.current?.focus()
  }

  function mensagemDoMotivo(motivo: MotivoResgate): string {
    switch (motivo) {
      case 'ja_tem':
        return textos.erro_ja_tem
      case 'esgotada':
        return textos.esgotada
      case 'muitos':
        return textos.erro_muitos
      case 'limite_contato':
        return textos.erro_limite_contato
      case 'indisponivel':
        return textos.erro_indisponivel
      default:
        return textos.erro_resgate
    }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (enviando) return
    setCampoComErro(null)
    setErroGeral(null)

    const v = validarResgate({ nome, email, telefone, consentimento })
    if (!v.ok) {
      apontar(v.campo)
      return
    }

    setEnviando(true)
    try {
      const { data, error } = await supabase.rpc('gostoso_club_resgatar', {
        p_partner: partnerId,
        p_nome: v.dados.nome,
        p_email: v.dados.email,
        p_telefone: v.dados.telefone,
        p_consentimento: true,
        p_versao: POLITICA_VERSAO,
        p_texto: textoDoConsentimento,
        p_origem: origem,
        p_aparelho: idDoAparelho(),
        p_isca: isca,
      })
      const r = interpretarResgate(data, error)
      if (r.tipo === 'ok') {
        guardarCupom(armazemDoNavegador(), partnerId, r.token)
        router.push(`${prefixo}/clube/cupom/${r.token}`)
        return
      }
      if (r.motivo === 'nome' || r.motivo === 'email' || r.motivo === 'telefone' || r.motivo === 'consentimento') {
        apontar(r.motivo)
      } else {
        setErroGeral(mensagemDoMotivo(r.motivo))
      }
    } catch {
      setErroGeral(textos.erro_resgate)
    }
    setEnviando(false)
  }

  const erro = (campo: Campo) =>
    campoComErro === campo ? (
      <p id={`resgate-${partnerId}-${campo}-erro`} className="clube-erro" role="alert">
        {mensagemDoCampo[campo]}
      </p>
    ) : null
  const descrito = (campo: Campo) => (campoComErro === campo ? `resgate-${partnerId}-${campo}-erro` : undefined)

  return (
    <form className="clube-form" onSubmit={enviar} noValidate aria-label={textos.form_titulo}>
      <p className="clube-tipo">{textos.form_titulo}</p>

      <label className="clube-rotulo">
        <span>{textos.campo_nome}</span>
        <input
          ref={refNome}
          className="clube-campo"
          type="text"
          name="nome"
          autoComplete="name"
          maxLength={80}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          aria-invalid={campoComErro === 'nome'}
          aria-describedby={descrito('nome')}
        />
      </label>
      {erro('nome')}

      <label className="clube-rotulo">
        <span>{textos.campo_email}</span>
        <input
          ref={refEmail}
          className="clube-campo"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={campoComErro === 'email'}
          aria-describedby={descrito('email')}
        />
      </label>
      {erro('email')}

      <label className="clube-rotulo">
        <span>{textos.campo_telefone}</span>
        <input
          ref={refTelefone}
          className="clube-campo"
          type="tel"
          name="telefone"
          autoComplete="tel-national"
          inputMode="tel"
          placeholder="(84) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
          aria-invalid={campoComErro === 'telefone'}
          aria-describedby={descrito('telefone')}
        />
      </label>
      {erro('telefone')}

      <label className="clube-check">
        <input
          ref={refConsentimento}
          type="checkbox"
          name="consentimento"
          checked={consentimento}
          onChange={(e) => setConsentimento(e.target.checked)}
          aria-invalid={campoComErro === 'consentimento'}
          aria-describedby={descrito('consentimento')}
        />
        <span>
          {textoDoConsentimento}{' '}
          <a href={`${prefixo}/privacidade`} target="_blank" rel="noopener noreferrer">
            {textos.politica_link}
          </a>
          .
        </span>
      </label>
      {erro('consentimento')}

      {/* campo isca: pessoa nao ve nem preenche; robo preenche e o servidor recusa */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Contato extra
          <input type="text" name="contato_extra" tabIndex={-1} autoComplete="off" data-lpignore="true" data-1p-ignore value={isca} onChange={(e) => setIsca(e.target.value)} />
        </label>
      </div>

      <p className="clube-regra">{textos.nota_dados}</p>

      {erroGeral ? (
        <p className="clube-erro" role="alert">
          {erroGeral}
        </p>
      ) : null}

      <div className="clube-acoes">
        <button type="submit" className="clube-btn clube-btn--verde" disabled={enviando}>
          {enviando ? textos.gerando : textos.gerar_cupom}
        </button>
        <button type="button" className="clube-btn clube-btn--contorno" onClick={onCancelar} disabled={enviando}>
          {textos.cancelar}
        </button>
      </div>
    </form>
  )
}
