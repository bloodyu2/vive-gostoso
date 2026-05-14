import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FAQItem {
  question: string
  /** Pode ser texto puro ou markdown-like simples (apenas <br/>, <a>, **bold**) */
  answer: string
}

interface FAQSectionProps {
  items: FAQItem[]
  /** Heading mostrado acima da lista. Default: 'Perguntas frequentes' */
  heading?: string
}

/**
 * Acordeão de FAQ. O JSON-LD FAQPage correspondente
 * deve ser injetado via usePageMeta({ jsonLd: [faqSchema(items)] }).
 */
export function FAQSection({ items, heading = 'Perguntas frequentes' }: FAQSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  return (
    <section className="not-prose my-12">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1A1A1A] dark:text-white mb-6">
        {heading}
      </h2>
      <div className="space-y-2">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={idx}
              className="rounded-2xl border border-[#E8E4DF] dark:border-[#2D2D2D] bg-white dark:bg-[#222] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-areia/50 dark:hover:bg-[#2D2D2D] transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-[#1A1A1A] dark:text-white text-base">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-[#737373] flex-shrink-0 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-[#3D3D3D] dark:text-[#C0BCB8] leading-relaxed text-sm">
                  {item.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
