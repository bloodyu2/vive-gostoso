import { useEffect, useState } from 'react'

interface TocHeading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  /** CSS selector do container de onde extrair headings. Default: 'article' */
  containerSelector?: string
  /** Quais níveis incluir. Default: [2, 3] */
  levels?: number[]
  /** Título da TOC. Default: 'Neste artigo' */
  heading?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Gera tabela de conteúdo automaticamente a partir dos headings
 * dentro de `containerSelector`. Adiciona id aos headings se não tiverem.
 */
export function TableOfContents({
  containerSelector = 'article',
  levels = [2, 3],
  heading = 'Neste artigo',
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocHeading[]>([])

  useEffect(() => {
    const container = document.querySelector(containerSelector)
    if (!container) return
    const selector = levels.map(l => `h${l}`).join(', ')
    const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[]
    const list: TocHeading[] = elements
      .filter(el => el.textContent?.trim())
      .map(el => {
        const text = el.textContent!.trim()
        const id = el.id || slugify(text)
        if (!el.id) el.id = id
        return { id, text, level: parseInt(el.tagName.slice(1), 10) }
      })
    setHeadings(list)
  }, [containerSelector, levels])

  if (headings.length < 3) return null

  return (
    <nav
      aria-label={heading}
      className="not-prose my-8 rounded-2xl border border-[#E8E4DF] dark:border-[#2D2D2D] bg-[#F5F2EE] dark:bg-[#222] p-5"
    >
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#737373] mb-3">
        {heading}
      </div>
      <ol className="space-y-1.5 text-sm">
        {headings.map(h => (
          <li
            key={h.id}
            className={h.level === 3 ? 'pl-4' : ''}
          >
            <a
              href={`#${h.id}`}
              className="text-[#3D3D3D] dark:text-[#C0BCB8] hover:text-teal transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
