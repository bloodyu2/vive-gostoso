import { dicionario } from '@/lib/bio/dicionario'
import { ARQUIVO_VCARD, vcardVive } from '@/lib/bio/vcard'

/** O arquivo que abre a agenda do celular já preenchida.
 *
 *  `attachment` e não `inline`: no Android é o que faz o Chrome baixar e oferecer o
 *  aplicativo de contatos; no iPhone o Safari abre a ficha de "Novo contato" de
 *  qualquer jeito, porque lá quem manda é o text/vcard.
 *
 *  O charset no Content-Type não é enfeite. Sem ele o importador assume latin-1 e
 *  "São Miguel do Gostoso" chega quebrado na agenda de quem salvou.
 *
 *  ELE VIVE DENTRO DO [lang] DE PROPÓSITO: quem chegou pela versão em inglês salva
 *  um contato com o cargo em inglês. São três arquivos estáticos, um por idioma. */
export const dynamic = 'force-static'

export function generateStaticParams() {
  return [{ lang: 'pt' }, { lang: 'en' }, { lang: 'es' }]
}

export async function GET(
  _pedido: Request,
  { params }: { params: Promise<{ lang: string }> },
): Promise<Response> {
  const { lang } = await params
  const t = dicionario(lang).bio

  return new Response(vcardVive({ papel: t.role, nota: t.page_description }), {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${ARQUIVO_VCARD}"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Robots-Tag': 'noindex',
    },
  })
}
