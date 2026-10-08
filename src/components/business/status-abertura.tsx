'use client'
import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { statusDeAbertura, type Horarios, type StatusAbertura } from '@/lib/status-abertura'

/**
 * O relogio so existe no navegador. O HTML do servidor (ISR de 1 h) nao pode
 * dizer "aberto agora": diria a hora em que a pagina foi montada, nao a de
 * quem esta olhando. Entao no servidor volta `null`, a tela reserva o espaco
 * do selo, e o estado real entra depois da hidratacao e se atualiza a cada
 * minuto.
 */
/* Uma lista tem ate 80 cartoes. Um relogio so, compartilhado: o intervalo nasce
   com o primeiro cartao montado e morre com o ultimo. */
const ouvintes = new Set<() => void>()
let intervalo: number | undefined
const inscreve = (aviso: () => void) => {
  ouvintes.add(aviso)
  if (ouvintes.size === 1) intervalo = window.setInterval(() => ouvintes.forEach((f) => f()), 60_000)
  return () => {
    ouvintes.delete(aviso)
    if (ouvintes.size === 0) window.clearInterval(intervalo)
  }
}
// Minuto corrente: muda a cada 60 s e re-renderiza quem usa o hook.
const minutoAtual = () => Math.floor(Date.now() / 60_000)
const semRelogio = () => null

export function useStatusAbertura(horarios: Horarios | null | undefined): StatusAbertura | null {
  const minuto = useSyncExternalStore<number | null>(inscreve, minutoAtual, semRelogio)
  if (minuto === null) return null
  return statusDeAbertura(horarios, new Date(minuto * 60_000))
}

export function StatusAberturaSelo({ status, temHorarios }: { status: StatusAbertura | null; temHorarios: boolean }) {
  const { t } = useTranslation()
  if (!temHorarios) return null

  // Espaco reservado ate o relogio do navegador responder (sem salto de layout).
  if (!status) return <span aria-hidden="true" className="inline-block h-[26px] w-44" />
  if (status.estado === 'sem-horario') return null

  let texto: string
  let tom: string
  let ponto: string
  if (status.estado === 'aberto') {
    const breve = status.fechaEmBreve
    texto = t(breve ? 'negocio.status_fecha_em_breve' : 'negocio.status_aberto_ate', { hora: status.ate })
    tom = breve ? 'bg-[#FBF0E3] text-[#8F5417]' : 'bg-[#EAF5EF] text-[#2D7A4A]'
    ponto = cn('vg-ping', breve ? 'bg-[#C97D2A]' : 'bg-[#2D7A4A]')
  } else if (!status.proxima) {
    texto = t('negocio.fechado')
    tom = 'bg-areia text-fg-3-texto'
    ponto = 'bg-[#8A8A8A]'
  } else {
    const { quando, hora } = status.proxima
    texto =
      quando === 'hoje'
        ? t('negocio.status_abre_hoje', { hora })
        : quando === 'amanha'
          ? t('negocio.status_abre_amanha', { hora })
          : t('negocio.status_abre_dia', { dia: t(`negocio.dia_${quando}`).toLowerCase(), hora })
    tom = 'bg-areia text-fg-3-texto'
    ponto = 'bg-[#8A8A8A]'
  }

  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full tracking-wide', tom)}>
      <span aria-hidden="true" className={cn('w-1.5 h-1.5 rounded-full', ponto)} />
      {texto}
    </span>
  )
}
