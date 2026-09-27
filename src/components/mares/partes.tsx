import Link from 'next/link'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { Idioma, PraiaMare } from '@/data/praias-mares'
import type { DiaDeMare } from '@/lib/mares/semana'
import type { FaseDaLua } from '@/lib/mares/lua'
import { formatarAltura, rotuloDoDia } from '@/lib/mares/formato'
import { preencher, textosMares, caminhoMares } from '@/lib/mares/seo-mares'
import { ESTACOES, PRAIAS_MARES } from '@/data/praias-mares'
import { CurvaMare } from './curva-mare'

const PREFIXO: Record<Idioma, string> = { pt: '', en: '/en', es: '/es' }
export const caminhoLocal = (lang: Idioma, slug?: string) => `${PREFIXO[lang]}${caminhoMares(slug)}`

/** Lua desenhada pela fracao iluminada. Lado iluminado a esquerda na
 *  crescente, como a lua aparece no hemisferio sul. */
export function IconeLua({ lua, tamanho = 28 }: { lua: FaseDaLua; tamanho?: number }) {
  const R = 10
  const c = 12
  const crescente = lua.fracao < 0.5
  const rx = R * Math.abs(1 - 2 * lua.iluminacao)
  const emCrescente = lua.iluminacao < 0.5
  const terminadorPelaEsquerda = crescente ? emCrescente : !emCrescente
  const d = `M${c} ${c - R} A${R} ${R} 0 0 ${crescente ? 0 : 1} ${c} ${c + R} A${rx.toFixed(2)} ${R} 0 0 ${terminadorPelaEsquerda ? 1 : 0} ${c} ${c - R} Z`
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <circle cx={c} cy={c} r={R} className="fill-fg-1/15" />
      {lua.iluminacao > 0.02 && <path d={d} className="fill-ocre-400" />}
      <circle cx={c} cy={c} r={R} fill="none" className="stroke-fg-3/40" strokeWidth={0.75} />
    </svg>
  )
}

export function SeletorPraias({ lang, atual }: { lang: Idioma; atual?: string }) {
  const t = textosMares(lang)
  return (
    <nav aria-label={t.praias}>
      <ul className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0">
        {PRAIAS_MARES.map((p) => {
          const ativa = p.slug === atual
          return (
            <li key={p.slug} className="shrink-0">
              <Link
                href={caminhoLocal(lang, p.slug)}
                aria-current={ativa ? 'page' : undefined}
                className={`inline-flex items-center min-h-11 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors motion-reduce:transition-none ${
                  ativa ? 'bg-teal border-teal text-white' : 'bg-elev border-border-1 text-fg-1 hover:border-teal hover:text-teal'
                }`}
              >
                {p.nome.replace(/^Praia (do|da|de) /, '')}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function Mare({ e, lang }: { e: DiaDeMare['eventos'][number]; lang: Idioma }) {
  const t = textosMares(lang)
  const alta = e.tipo === 'alta'
  return (
    <li className="flex flex-col">
      <span className={`inline-flex items-center gap-1 text-sm font-semibold ${alta ? 'text-teal-700 dark:text-teal-100' : 'text-ocre-700 dark:text-ocre-100'}`}>
        {alta ? <ArrowUp className="w-4 h-4" aria-hidden="true" /> : <ArrowDown className="w-4 h-4" aria-hidden="true" />}
        {alta ? t.alta : t.baixa}
      </span>
      <span className="font-display font-bold text-4xl leading-none text-fg-1 tabular-nums mt-1">{e.hora}</span>
      <span className="text-base text-fg-2 tabular-nums mt-1">{formatarAltura(e.altura, lang)}</span>
    </li>
  )
}

export function CartaoDoDia({
  dia,
  hoje,
  lang,
  praia,
}: {
  dia: DiaDeMare
  hoje: string
  lang: Idioma
  praia?: PraiaMare
}) {
  const t = textosMares(lang)
  const rotulo = rotuloDoDia(dia.data, hoje, lang)
  const nomeFase = t.fases[dia.lua.fase]
  const descricaoCurva = preencher(t.curva_aria, {
    dia: `${rotulo.nome} ${rotulo.data}`,
    mares: dia.eventos
      .map((e) => `${e.tipo === 'alta' ? t.alta : t.baixa} ${e.hora}, ${formatarAltura(e.altura, lang)}`)
      .join('; '),
  })

  return (
    <section aria-label={`${rotulo.nome} ${rotulo.data}`} className="rounded-2xl border border-border-1 bg-elev p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-fg-1">
          {rotulo.nome} <span className="text-fg-3 font-normal text-lg tabular-nums">{rotulo.data}</span>
        </h2>
        <p className="inline-flex items-center gap-2 text-sm text-fg-2">
          <IconeLua lua={dia.lua} />
          <span>{nomeFase}</span>
        </p>
      </div>

      {!dia.temDados ? (
        <p className="mt-6 text-fg-2">{t.dia_sem_dado}</p>
      ) : (
        <>
          <ul className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5">
            {dia.eventos.map((e) => (
              <Mare key={e.iso} e={e} lang={lang} />
            ))}
          </ul>
          <div className="mt-6">
            <CurvaMare
              data={dia.data}
              pontos={dia.curva}
              eventos={dia.eventos}
              janela={dia.janela ? { inicioMin: dia.janela.inicioMin, fimMin: dia.janela.fimMin } : null}
              rotuloAgora={t.agora}
              descricao={descricaoCurva}
            />
          </div>
        </>
      )}

      {praia?.dica && (
        <div className="mt-5 rounded-xl bg-teal/10 p-4">
          <h3 className="text-sm font-semibold text-fg-1">{t.o_que_muda}</h3>
          <p className="mt-1 text-fg-2 leading-relaxed">{praia.dica[lang]}</p>
          {praia.melhorMare && praia.rotuloJanela && dia.temDados && (
            <p className="mt-2 font-semibold text-fg-1">
              {dia.janela
                ? preencher(t.melhor_entre, { rotulo: praia.rotuloJanela[lang], inicio: dia.janela.inicio, fim: dia.janela.fim })
                : preencher(t.sem_janela, { rotulo: praia.rotuloJanela[lang] })}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

export function TabelaSemana({ semana, hoje, lang }: { semana: DiaDeMare[]; hoje: string; lang: Idioma }) {
  const t = textosMares(lang)
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-semibold text-fg-1">{t.semana}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-fg-3">
            <tr className="border-b border-border-1">
              <th scope="col" className="py-2 pr-3 font-medium">{t.col_dia}</th>
              <th scope="col" className="py-2 pr-3 font-medium">{t.col_mares}</th>
              <th scope="col" className="py-2 font-medium">{t.col_lua}</th>
            </tr>
          </thead>
          <tbody>
            {semana.map((d) => {
              const r = rotuloDoDia(d.data, hoje, lang)
              return (
                <tr key={d.data} className="border-b border-border-1 align-top">
                  <th scope="row" className="py-3 pr-3 font-semibold text-fg-1 whitespace-nowrap">
                    {r.nome} <span className="block font-normal text-fg-3 tabular-nums">{r.data}</span>
                  </th>
                  <td className="py-3 pr-3">
                    {d.temDados ? (
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-fg-1 tabular-nums">
                        {d.eventos.map((e) => (
                          <li key={e.iso} className="inline-flex items-center gap-1 whitespace-nowrap">
                            {e.tipo === 'alta' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-teal" aria-label={t.alta_curta} />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-ocre-700 dark:text-ocre-400" aria-label={t.baixa_curta} />
                            )}
                            <span className="font-semibold">{e.hora}</span>
                            <span className="text-fg-2">{formatarAltura(e.altura, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-fg-3">{t.dia_sem_dado}</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2 text-fg-2 whitespace-nowrap">
                      <IconeLua lua={d.lua} tamanho={20} />
                      <span className="hidden sm:inline">{t.fases[d.lua.fase]}</span>
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function EstadoVazio({ lang }: { lang: Idioma }) {
  const t = textosMares(lang)
  return (
    <section className="rounded-2xl border border-border-1 bg-elev p-6">
      <h2 className="font-display text-2xl font-semibold text-fg-1">{t.vazio_titulo}</h2>
      <p className="mt-2 text-fg-2 leading-relaxed">{t.vazio_desc}</p>
    </section>
  )
}

export function RodapeFonte({ lang, distanciaKm }: { lang: Idioma; distanciaKm?: number }) {
  const t = textosMares(lang)
  return (
    <footer className="mt-12 border-t border-border-1 pt-6 text-sm text-fg-2 leading-relaxed max-w-[65ch]">
      <p>
        <a
          href={ESTACOES.COM3DN.fonteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-teal underline underline-offset-2 hover:text-teal-dark"
        >
          {t.fonte}
        </a>
      </p>
      {distanciaKm !== undefined && <p className="mt-2">{preencher(t.estacao, { km: distanciaKm })}</p>}
      <p className="mt-2">{t.aviso}</p>
    </footer>
  )
}
