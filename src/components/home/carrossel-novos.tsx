'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Selo } from '@/components/business/selo'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { useLocalePath } from '@/hooks/useLocalePath'
import { indiceAnterior, proximoIndice, type ItemCarrossel } from '@/lib/carrossel-novos'
import { cn } from '@/lib/utils'

/** Intervalo entre um slide e o seguinte. */
const INTERVALO_MS = 5500
/** Depois de um toque, clique ou tecla, o avanço automático espera este tempo. */
const RETOMADA_MS = 8000

const CONSULTA_MOVIMENTO = '(prefers-reduced-motion: reduce)'

function assinarMovimento(aviso: () => void) {
  const m = window.matchMedia(CONSULTA_MOVIMENTO)
  m.addEventListener('change', aviso)
  return () => m.removeEventListener('change', aviso)
}

/** true quando a pessoa pediu menos movimento no sistema. No servidor, false. */
function useMovimentoReduzido() {
  return useSyncExternalStore(
    assinarMovimento,
    () => window.matchMedia(CONSULTA_MOVIMENTO).matches,
    () => false,
  )
}

/**
 * Banner carrossel da home: destaque, novos e verificados.
 *
 * O avanço automático é uma camada por cima de uma lista que ja funciona sem
 * ele (scroll horizontal com snap, botoes, pontos). Para de avancar quando:
 * - a pessoa pediu menos movimento no sistema (nunca liga);
 * - o mouse esta em cima, ou o foco do teclado esta dentro;
 * - houve toque, clique ou tecla ha menos de 8 s;
 * - o carrossel esta fora da tela ou a aba esta em segundo plano;
 * - a pessoa apertou o botao de pausa (WCAG 2.2.2).
 */
export function CarrosselNovos({ itens }: { itens: ItemCarrossel[] }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const reduzido = useMovimentoReduzido()

  const trilhoRef = useRef<HTMLUListElement>(null)
  const raizRef = useRef<HTMLElement>(null)
  const ativoRef = useRef(0)
  const sobreRef = useRef(false)
  const focoRef = useRef(false)
  const visivelRef = useRef(true)
  const pausaAteRef = useRef(0)

  const [ativo, setAtivo] = useState(0)
  const [pausadoPorMim, setPausadoPorMim] = useState(false)
  const pausadoRef = useRef(false)

  const total = itens.length

  const irPara = useCallback(
    (indice: number, suave: boolean) => {
      const trilho = trilhoRef.current
      const alvo = trilho?.children[indice] as HTMLElement | undefined
      if (!trilho || !alvo) return
      trilho.scrollTo({
        left: alvo.offsetLeft - trilho.offsetLeft,
        behavior: suave && !reduzido ? 'smooth' : 'auto',
      })
    },
    [reduzido],
  )

  /* O indice ativo vem da posicao real do trilho, nao de um contador: assim o
     ponto acompanha tambem quando a pessoa arrasta com o dedo. */
  const aoRolar = useCallback(() => {
    const trilho = trilhoRef.current
    if (!trilho) return
    const filhos = Array.from(trilho.children) as HTMLElement[]
    const margem = trilho.scrollLeft + trilho.offsetLeft
    let melhor = 0
    let menor = Infinity
    filhos.forEach((f, i) => {
      const d = Math.abs(f.offsetLeft - margem)
      if (d < menor) {
        menor = d
        melhor = i
      }
    })
    /* No fim do trilho o ultimo slide pode nao chegar ao inicio: conta como
       ativo para o ponto nao ficar preso no penultimo. */
    if (trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 2) melhor = filhos.length - 1
    if (melhor !== ativoRef.current) {
      ativoRef.current = melhor
      setAtivo(melhor)
    }
  }, [])

  const registrarInteracao = useCallback(() => {
    pausaAteRef.current = Date.now() + RETOMADA_MS
  }, [])

  const alternarPausa = useCallback(() => {
    pausadoRef.current = !pausadoRef.current
    setPausadoPorMim(pausadoRef.current)
  }, [])

  const ir = useCallback(
    (indice: number) => {
      registrarInteracao()
      irPara(indice, true)
    },
    [irPara, registrarInteracao],
  )

  /* Avanco automatico. O relogio so confere as condicoes e avanca; nenhuma
     delas dispara render. */
  useEffect(() => {
    if (reduzido || total < 2) return
    const id = window.setInterval(() => {
      if (pausadoRef.current) return
      if (sobreRef.current || focoRef.current) return
      if (!visivelRef.current || document.hidden) return
      if (Date.now() < pausaAteRef.current) return
      const prox = proximoIndice(ativoRef.current, total)
      irPara(prox, true)
    }, INTERVALO_MS)
    return () => window.clearInterval(id)
  }, [reduzido, total, irPara])

  /* Fora da tela, nao avanca (e nao gasta bateria). */
  useEffect(() => {
    const el = raizRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => {
      visivelRef.current = e.isIntersecting
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (total === 0) return null

  const mostrarBotaoPausa = !reduzido && total > 1
  const textoPausa = pausadoPorMim ? t('home.carrossel_reproduzir') : t('home.carrossel_pausar')

  return (
    <section
      ref={raizRef}
      aria-roledescription="carousel"
      aria-label={t('home.carrossel_titulo')}
      className="max-w-6xl mx-auto px-5 md:px-8 pb-10 md:pb-14"
      onPointerEnter={e => {
        if (e.pointerType === 'mouse') sobreRef.current = true
      }}
      onPointerLeave={e => {
        if (e.pointerType === 'mouse') sobreRef.current = false
      }}
      onPointerDown={registrarInteracao}
      onKeyDown={registrarInteracao}
      onFocusCapture={() => {
        focoRef.current = true
      }}
      onBlurCapture={() => {
        focoRef.current = false
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-h3 font-semibold text-balance">{t('home.carrossel_titulo')}</h2>
        <div className="flex items-center gap-1.5">
          {mostrarBotaoPausa && (
            <button
              type="button"
              onClick={alternarPausa}
              aria-label={textoPausa}
              title={textoPausa}
              className="size-11 inline-flex items-center justify-center rounded-full border border-border-1 text-fg-2 hover:bg-white dark:hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              {pausadoPorMim ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
            </button>
          )}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => ir(indiceAnterior(ativo, total))}
                aria-label={t('home.carrossel_anterior')}
                className="hidden sm:inline-flex size-11 items-center justify-center rounded-full border border-border-1 text-fg-2 hover:bg-white dark:hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => ir(proximoIndice(ativo, total))}
                aria-label={t('home.carrossel_proximo')}
                className="hidden sm:inline-flex size-11 items-center justify-center rounded-full border border-border-1 text-fg-2 hover:bg-white dark:hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      <ul
        ref={trilhoRef}
        onScroll={aoRolar}
        aria-live={pausadoPorMim || reduzido ? 'polite' : 'off'}
        className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-0 pb-1 scrollbar-none"
      >
        {itens.map((b, i) => (
          <li
            key={b.id}
            role="group"
            aria-roledescription="slide"
            aria-label={t('home.carrossel_item', { atual: i + 1, total })}
            className="snap-start shrink-0 w-[86%] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
          >
            <Link
              href={lp(`/negocio/${b.slug}`)}
              className="group relative block aspect-[4/5] sm:aspect-[4/3] overflow-hidden rounded-2xl bg-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              <SafeCoverImage
                src={b.cover_url as string}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                sizes="(max-width: 639px) 86vw, (max-width: 1023px) 48vw, 32vw"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 pt-24 pb-4 px-4 md:px-5 bg-gradient-to-t from-black/80 via-black/45 to-transparent">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none',
                      b.motivo === 'destaque' && 'bg-ocre-400 text-black',
                      b.motivo === 'novo' && 'bg-white text-teal-dark',
                      b.motivo === 'verificado' && 'bg-white text-teal-dark',
                    )}
                  >
                    {t(`home.carrossel_motivo_${b.motivo}`)}
                  </span>
                  {b.is_verified && b.motivo !== 'verificado' && <Selo tipo="prata" size="md" />}
                </div>
                <p className="font-display font-bold text-xl md:text-2xl text-white leading-tight text-balance">{b.name}</p>
                {b.category && <p className="mt-1 text-sm text-white/90">{b.category.name}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1" role="group" aria-label={t('home.carrossel_pontos')}>
          {itens.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => ir(i)}
              aria-label={t('home.carrossel_ir', { n: i + 1 })}
              aria-current={i === ativo ? 'true' : undefined}
              className="size-6 inline-flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal"
            >
              <span
                className={cn(
                  'block h-2 rounded-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none',
                  i === ativo ? 'w-6 bg-teal' : 'w-2 bg-fg-3/40',
                )}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
