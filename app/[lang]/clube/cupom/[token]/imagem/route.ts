// app/[lang]/clube/cupom/[token]/imagem/route.ts
// A imagem PNG do cupom: o bilhete que a pessoa baixa e mostra no estabelecimento.
// Quem tem o token e o titular, entao a imagem leva o nome inteiro. `?baixar=1` manda o
// navegador salvar o arquivo em vez de abrir. Sem indexacao e sem cache compartilhado.
import { dicionario, ehIdioma } from '@/lib/bio/dicionario'
import { cupomDoTitular, tokenValido } from '@/lib/clube/cupom'
import { imagemDoCupom } from '@/lib/clube/cupom-imagem'
import { VIVE } from '@/lib/bio/contato'

const LOCALES = { pt: 'pt-BR', en: 'en', es: 'es' } as const

function semAcento(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export async function GET(req: Request, { params }: { params: Promise<{ lang: string; token: string }> }) {
  const { lang, token } = await params
  if (!tokenValido(token)) return new Response('Not found', { status: 404 })

  const cupom = await cupomDoTitular(token)
  if (cupom.status === 'invalido' || !cupom.negocio || !cupom.codigo || !cupom.expira_em || !cupom.nome) {
    return new Response('Not found', { status: cupom.erro ? 503 : 404 })
  }

  const idioma = ehIdioma(lang) ? lang : 'pt'
  const t = dicionario(idioma).cupom
  const prefixo = idioma === 'pt' ? '' : `/${idioma}`
  const imagem = await imagemDoCupom(
    {
      negocio: cupom.negocio,
      beneficio: cupom.beneficio ?? '',
      nome: cupom.nome,
      codigo: cupom.codigo,
      expiraEm: cupom.expira_em,
      urlVerificacao: `${VIVE.site}${prefixo}/clube/v/${token}`,
    },
    {
      marca: t.img_marca,
      titulo: t.img_titulo,
      para: t.img_para,
      codigo: t.img_codigo,
      validoAte: t.img_valido_ate,
      umaCompra: t.img_uma_compra,
      mostre: t.img_mostre,
      locale: LOCALES[idioma],
    },
  )

  const baixar = new URL(req.url).searchParams.get('baixar') === '1'
  const slug = (cupom.slug ?? 'cupom').replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'cupom'
  const arquivo = `${semAcento(t.arquivo)}-${slug}.png`

  const headers = new Headers(imagem.headers)
  headers.set('Cache-Control', 'private, max-age=300')
  headers.set('X-Robots-Tag', 'noindex, nofollow')
  if (baixar) headers.set('Content-Disposition', `attachment; filename="${arquivo}"`)
  return new Response(imagem.body, { status: 200, headers })
}
