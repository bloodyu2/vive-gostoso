'use client'

import { useEffect, useState } from 'react'
import { armazemDoNavegador, lerCupons } from '@/lib/clube/cupons-locais'
import { FormResgate, type TextosForm } from './form-resgate'

export interface TextosResgatePlaquinha extends TextosForm {
  usar: string
  ver_cupom: string
  resgatar_de_novo: string
}

interface Props {
  partnerId: string
  negocio: string
  textos: TextosResgatePlaquinha
  /** Codigo da plaquinha (dois digitos): o resgate guarda de qual balcao a pessoa veio. */
  origem: string
  /** Prefixo de idioma ('' no pt). */
  prefixo: string
  /** false quando o banco nao respondeu: o botao fica desligado. */
  doBanco: boolean
  esgotada: boolean
}

/** O botao de resgatar da pagina /p/NN: abre o mesmo formulario da /clube, no proprio
 *  lugar. Quem ja resgatou neste aparelho ve "Ver meu cupom" (so existe no navegador,
 *  por isso entra depois da hidratacao). */
export function ResgatePlaquinha({ partnerId, negocio, textos, origem, prefixo, doBanco, esgotada }: Props) {
  const [aberto, setAberto] = useState(false)
  const [token, setToken] = useState<string | undefined>(undefined)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura do navegador, so existe depois de montar
    setToken(lerCupons(armazemDoNavegador())[partnerId])
  }, [partnerId])

  if (aberto) {
    return (
      <FormResgate
        partnerId={partnerId}
        negocio={negocio}
        textos={textos}
        origem={origem}
        prefixo={prefixo}
        onCancelar={() => setAberto(false)}
      />
    )
  }

  return (
    <>
      {token ? (
        <a className="clube-btn clube-btn--verde clube-btn--cheio" href={`${prefixo}/clube/cupom/${token}`}>
          {textos.ver_cupom}
        </a>
      ) : null}
      {esgotada ? (
        <p className="clube-aviso">{textos.esgotada}</p>
      ) : (
        <button
          type="button"
          className={`clube-btn ${token ? 'clube-btn--contorno' : 'clube-btn--verde'} clube-btn--cheio`}
          onClick={() => setAberto(true)}
          disabled={!doBanco}
        >
          {token ? textos.resgatar_de_novo : textos.usar}
        </button>
      )}
    </>
  )
}
