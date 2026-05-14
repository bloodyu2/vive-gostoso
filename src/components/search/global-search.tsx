import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SearchResult {
  id: string
  name: string
  slug: string
  cover_url: string | null
  category: { name: string } | null
  address: string | null
}

let debounceTimer: ReturnType<typeof setTimeout>

function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      setLoading(true)
      // Sanitize for PostgREST .or() filter syntax: comma, parens, backslash
      // and asterisk are filter delimiters / wildcards. Strip them so that
      // user input cannot break out of the ilike pattern.
      const q = query.trim().replace(/[,()\\*]/g, '').slice(0, 80)
      if (q.length < 2) {
        setResults([])
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('gostoso_businesses')
        .select('id, name, slug, cover_url, address, category:gostoso_categories(name)')
        .eq('active', true)
        .or(`name.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%`)
        .limit(8)

      setResults(
        (data ?? []).map((b: any) => ({
          ...b,
          category: Array.isArray(b.category) ? (b.category[0] ?? null) : b.category,
        }))
      )
      setLoading(false)
    }, 280)
  }, [query])

  return { results, loading }
}

interface Props {
  onClose: () => void
}

export function GlobalSearch({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const { results, loading } = useSearch(query)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount, close on Escape
  useEffect(() => {
    inputRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-[#E8E4DF] dark:border-[#2D2D2D] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E4DF] dark:border-[#2D2D2D]">
          <Search className="w-5 h-5 text-[#737373] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar negócio em Gostoso..."
            className="flex-1 text-sm bg-transparent outline-none text-[#1A1A1A] dark:text-white placeholder:text-[#737373]"
          />
          {query ? (
            <button onClick={() => setQuery('')} className="text-[#737373] hover:text-[#1A1A1A] transition-colors">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onClose} className="text-[#737373] hover:text-[#1A1A1A] transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length < 2 && (
            <div className="px-4 py-10 text-center text-sm text-[#737373]">
              Digite o nome do negócio, categoria ou bairro
            </div>
          )}

          {query.trim().length >= 2 && loading && (
            <div className="px-4 py-8 text-center text-sm text-[#737373]">
              Buscando...
            </div>
          )}

          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[#737373] mb-3">
                Nenhum negócio encontrado para <strong>"{query}"</strong>.
              </p>
              <Link
                to="/cadastre"
                onClick={onClose}
                className="text-sm text-teal font-semibold hover:underline"
              >
                Cadastrar este negócio →
              </Link>
            </div>
          )}

          {results.length > 0 && (
            <ul className="py-2">
              {results.map(r => (
                <li key={r.id}>
                  <Link
                    to={`/negocio/${r.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-areia dark:hover:bg-[#2D2D2D] transition-colors"
                  >
                    {/* Thumb */}
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-teal to-teal-dark">
                      {r.cover_url && (
                        <img src={r.cover_url} alt={r.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white truncate">{r.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {r.category && (
                          <span className="text-xs text-teal">{r.category.name}</span>
                        )}
                        {r.address && (
                          <span className="flex items-center gap-0.5 text-xs text-[#737373]">
                            <MapPin className="w-3 h-3" />
                            {r.address}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-[#C4BFBA] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
              <li className="px-4 py-2 border-t border-[#F5F2EE] dark:border-[#2D2D2D] text-center">
                <span className="text-xs text-[#737373]">{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
              </li>
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-[#F5F2EE] dark:border-[#2D2D2D] flex items-center justify-between">
          <span className="text-xs text-[#737373]">Pressione <kbd className="bg-[#F5F2EE] dark:bg-[#2D2D2D] px-1.5 py-0.5 rounded text-[#3D3D3D] dark:text-white font-mono text-[10px]">Esc</kbd> para fechar</span>
          <span className="text-xs text-[#737373]">São Miguel do Gostoso</span>
        </div>
      </div>
    </div>
  )
}
