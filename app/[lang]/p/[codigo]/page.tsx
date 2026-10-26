// app/[lang]/p/[codigo]/page.tsx
// Pagina da plaquinha do balcao (QR e NFC apontam para /p/NN). Cada codigo e de um
// estabelecimento, definido em src/lib/plaquinhas.ts: agradece a visita, leva para a
// avaliacao do Google e para o perfil dele no Vive Gostoso. A chamada para o
// Passaporte Gostoso so aparece com CLUBE_PUBLICO ligado (src/lib/clube/config.ts).
// Codigo sem negocio cai na home, nunca em 404 (a plaquinha ja esta no balcao).
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { RegistrarVisita } from '@/components/clube/registrar-visita'
import { TemaClube } from '@/components/clube/tema'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { dicionario, ehIdioma, prefixo } from '@/lib/bio/dicionario'
import { usaCapaTipografica } from '@/lib/capa-negocio'
import { CLUBE_PUBLICO, CLUBE_ROTA } from '@/lib/clube/config'
import { carregarVantagens } from '@/lib/clube/carregar'
import { DESTINO_PADRAO, linkDeAvaliacao, plaquinhaDoCodigo } from '@/lib/plaquinhas'
import { clientePublico } from '@/lib/supabase/publico'

type Props = { params: Promise<{ lang: string; codigo: string }> }

interface NegocioDaPlaquinha {
  id: string
  name: string
  slug: string
  cover_url: string | null
  logo_url: string | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return {
    title: { absolute: dicionario(lang).plaquinha.page_title },
    robots: { index: false, follow: false, nocache: true },
  }
}

export default async function PlaquinhaPage({ params }: Props) {
  const { lang, codigo } = await params
  const idioma = ehIdioma(lang) ? lang : 'pt'
  const plaquinha = plaquinhaDoCodigo(codigo)
  if (!plaquinha) redirect(DESTINO_PADRAO)

  const { data } = await clientePublico()
    .from('gostoso_businesses')
    .select('id, name, slug, cover_url, logo_url')
    .eq('slug', plaquinha.slug)
    .eq('active', true)
    .eq('is_published', true)
    .maybeSingle()
  const negocio = data as NegocioDaPlaquinha | null
  if (!negocio) redirect(DESTINO_PADRAO)

  const t = dicionario(idioma).plaquinha
  const pre = prefixo(idioma)
  const avaliar = linkDeAvaliacao(plaquinha)
  const foto = !usaCapaTipografica(negocio.cover_url) ? negocio.cover_url : negocio.logo_url

  const vantagem = CLUBE_PUBLICO ? ((await carregarVantagens([negocio.id])).vantagens[0] ?? null) : null

  return (
    <TemaClube>
      <RegistrarVisita codigo={codigo} />
      <header className="clube-topo" style={{ paddingBottom: '1.25rem' }}>
        <div className="clube-col">
          <a className="clube-marca" href={`${pre}/`}>
            Vive Gostoso
          </a>
        </div>
      </header>

      <main className="clube-col" style={{ paddingBlock: '1.75rem 2rem' }}>
        {foto ? (
          <SafeCoverImage
            src={foto}
            alt={negocio.name}
            className="clube-foto"
            width={800}
            height={600}
            loading="eager"
            sizes="(max-width: 448px) 100vw, 448px"
          />
        ) : null}

        <h1 className="clube-h2" style={{ marginTop: foto ? '1.5rem' : 0, fontSize: '1.875rem' }}>
          {t.agradecimento.replace('{nome}', negocio.name)}
        </h1>
        <p style={{ marginTop: '0.625rem', color: 'var(--c-suave)' }}>{t.sub}</p>

        <div className="clube-pilha">
          {avaliar ? (
            <a
              className="clube-btn clube-btn--mostarda clube-btn--cheio"
              href={avaliar}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.avaliar}
            </a>
          ) : null}
          <a className="clube-btn clube-btn--contorno clube-btn--cheio" href={`${pre}/negocio/${negocio.slug}`}>
            {t.ver_perfil.replace('{nome}', negocio.name)}
          </a>
        </div>

        {CLUBE_PUBLICO ? (
          <section className="clube-destaque" style={{ marginTop: '1.75rem' }} aria-labelledby="passaporte">
            <h2 id="passaporte" className="clube-nome">
              {t.passaporte_titulo}
            </h2>
            {vantagem ? (
              <p className="clube-beneficio">
                <strong>{t.passaporte_vantagem}:</strong> {vantagem.beneficio}
              </p>
            ) : (
              <p className="clube-beneficio">{t.passaporte_chamada}</p>
            )}
            <div className="clube-acoes">
              <a className="clube-btn clube-btn--verde" href={`${pre}${CLUBE_ROTA}?n=${codigo}`}>
                {t.passaporte_botao}
              </a>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="clube-rodape">
        <div className="clube-col">{t.rodape}</div>
      </footer>
    </TemaClube>
  )
}
