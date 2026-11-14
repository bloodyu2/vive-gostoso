import { CalendarClock, MessageCircle } from 'lucide-react'
import { formatarWhatsApp } from '@/lib/clube/vantagens'

export interface TextosAgendamento {
  /** "Agende antes com {com}" */
  titulo: string
  texto: string
  botao: string
}

interface Props {
  /** com quem agendar, ja resolvido (nome da pessoa ou do negocio) */
  com: string
  /** WhatsApp so com digitos, ou null (sem numero valido nao ha botao) */
  contato: string | null
  /** link do WhatsApp ja montado com a mensagem; null quando nao ha contato */
  href: string | null
  textos: TextosAgendamento
  /** evento de medicao do clique, quando a tela mede (so no cliente) */
  onClick?: () => void
}

/** "Agende antes com a Satya": o aviso do parceiro que so atende com hora marcada.
 *  Sem hooks e sem i18n do cliente, serve igual a paginas de servidor e de cliente. */
export function AvisoAgendamento({ com, contato, href, textos, onClick }: Props) {
  return (
    <div className="clube-agendar" role="note">
      <p className="clube-agendar-titulo">
        <CalendarClock size={18} strokeWidth={2.25} aria-hidden />
        <span>{textos.titulo.replace('{com}', () => com)}</span>
      </p>
      <p className="clube-agendar-texto">{textos.texto}</p>
      {href && contato ? (
        <a
          className="clube-btn clube-btn--mostarda clube-agendar-botao"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
        >
          <MessageCircle size={18} aria-hidden />
          <span>{textos.botao}</span>
          <span className="clube-agendar-numero">{formatarWhatsApp(contato)}</span>
        </a>
      ) : null}
    </div>
  )
}
