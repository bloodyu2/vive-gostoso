import Link from 'next/link'
import type { Idioma, PraiaMare } from '@/data/praias-mares'
import { PARCEIROS_POR_PRAIA } from '@/data/parceiros-por-praia'
import { CLUBE_PUBLICO } from '@/lib/clube/config'
import { formatarDistancia } from '@/lib/perto'
import { linkMapaDaPraia, pontosPerto, praiasVizinhas, RAIO_PONTOS_KM } from '@/lib/mares/vizinhanca'
import { preencher, textosMares } from '@/lib/mares/seo-mares'
import { caminhoLocal } from './partes'

const PREFIXO: Record<Idioma, string> = { pt: '', en: '/en', es: '/es' }

/** Texto da pagina de uma praia que vem do dado, nao da tabua: as praias mais
 *  perto (hub e radiais, para o Google e para quem esta planejando o dia), os
 *  pontos do mapa num raio curto, o link da rota e a porta para o Passaporte.
 *  Praia sem coordenada nao mostra distancia nem rota: nada e calculado em cima
 *  de dado que ninguem conferiu. */
export function Arredores({ lang, praia }: { lang: Idioma; praia: PraiaMare }) {
  const t = textosMares(lang).arredores
  const vizinhas = praiasVizinhas(praia)
  const pontos = pontosPerto(praia)
  const mapa = linkMapaDaPraia(praia)
  const comDistancia = vizinhas.some((v) => v.km !== undefined)
  const parceiros = PARCEIROS_POR_PRAIA[praia.slug] ?? []

  return (
    <section aria-labelledby="arredores-titulo" className="mt-12 space-y-8 max-w-[65ch]">
      {vizinhas.length > 0 && (
        <div>
          <h2 id="arredores-titulo" className="font-display font-bold text-2xl text-fg-1">
            {t.vizinhas_titulo}
          </h2>
          <p className="mt-1 text-fg-2 leading-relaxed">
            {comDistancia ? t.vizinhas_desc : preencher(t.vizinhas_desc_municipio, { municipio: praia.municipio })}
          </p>
          <ul className="mt-3 space-y-2">
            {vizinhas.map(({ praia: v, km }) => (
              <li key={v.slug}>
                <Link
                  href={caminhoLocal(lang, v.slug)}
                  className="inline-flex min-h-11 items-center font-semibold text-teal underline underline-offset-2 hover:text-teal-dark"
                >
                  {km !== undefined ? preencher(t.vizinha_item, { praia: v.nome, dist: formatarDistancia(km * 1000, lang) }) : v.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pontos.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-2xl text-fg-1">{t.pontos_titulo}</h2>
          <p className="mt-1 text-fg-2 leading-relaxed">{preencher(t.pontos_desc, { raio: RAIO_PONTOS_KM })}</p>
          <ul className="mt-3 space-y-3">
            {pontos.map(({ ponto, km }) => (
              <li key={ponto.id}>
                <p className="font-semibold text-fg-1">{preencher(t.ponto_item, { nome: ponto.nome, dist: formatarDistancia(km * 1000, lang) })}</p>
                <p className="text-fg-2 leading-relaxed">{ponto.descricao[lang]}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mapa && (
        <p>
          <a
            href={mapa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-semibold text-teal underline underline-offset-2 hover:text-teal-dark"
          >
            {preencher(t.mapa, { praia: praia.nome })}
          </a>
        </p>
      )}

      {CLUBE_PUBLICO && parceiros.length > 0 && (
        <div className="rounded-xl bg-teal/10 p-4">
          <h2 className="text-sm font-semibold text-fg-1">{t.clube_titulo}</h2>
          <p className="mt-1 text-fg-2 leading-relaxed">{t.clube_parceiros}</p>
          <ul className="mt-2 space-y-1">
            {parceiros.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`${PREFIXO[lang]}/negocio/${p.slug}`}
                  className="inline-flex min-h-11 items-center font-semibold text-teal underline underline-offset-2 hover:text-teal-dark"
                >
                  {p.nome}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={`${PREFIXO[lang]}/clube`}
            className="mt-1 inline-flex min-h-11 items-center font-semibold text-teal underline underline-offset-2 hover:text-teal-dark"
          >
            {t.clube_cta}
          </Link>
        </div>
      )}
    </section>
  )
}
