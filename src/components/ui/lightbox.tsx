// src/components/ui/lightbox.tsx
'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface LightboxProps {
  photos: string[]       // array de URLs — índice 0 é capa, demais são galeria
  initialIndex: number   // índice clicado
  onClose: () => void
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const { t } = useTranslation('lightbox')
  const [current, setCurrent] = useState(initialIndex)
  const containerRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const anteriorRef = useRef<HTMLElement | null>(null)

  const prev = useCallback(() =>
    setCurrent(i => (i - 1 + photos.length) % photos.length), [photos.length])

  const next = useCallback(() =>
    setCurrent(i => (i + 1) % photos.length), [photos.length])

  /* Foco preso no dialogo enquanto aberto, e devolvido a quem abriu ao fechar.
     Vale para quem usa teclado ou leitor de tela: o foco nao escapa para a
     pagina por tras do overlay. */
  useEffect(() => {
    anteriorRef.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    function focaveis() {
      const nodes = containerRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
      )
      return nodes ? Array.from(nodes) : []
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Tab') {
        const list = focaveis()
        if (list.length === 0) return
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      anteriorRef.current?.focus?.()
    }
  }, [onClose, prev, next])

  // Bloquear scroll do body enquanto aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('alt', { number: current + 1 })}
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Counter */}
      <div className="absolute top-4 left-4 text-white text-sm font-medium select-none">
        {current + 1} / {photos.length}
      </div>

      {/* Fechar */}
      <button
        ref={closeRef}
        onClick={onClose}
        className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-white hover:text-white/80 transition-colors"
        aria-label={t('close_aria')}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Seta esquerda */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white hover:text-white/80 transition-colors bg-black/40 rounded-full"
          aria-label={t('prev_aria')}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Foto */}
      <img
        src={photos[current]}
        alt={t('alt', { number: current + 1 })}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      />

      {/* Seta direita */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white hover:text-white/80 transition-colors bg-black/40 rounded-full"
          aria-label={t('next_aria')}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
