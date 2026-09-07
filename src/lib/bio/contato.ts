import { OFFICIAL_WHATSAPP } from '@/lib/whatsapp'

/** Os dados que a tag NFC entrega. Fonte única para a página, para o vCard e para
 *  a imagem de compartilhamento.
 *
 *  O telefone vem de src/lib/whatsapp.ts, que é de onde todos os CTAs fixos do site
 *  já leem. Uma tag NFC é objeto físico, encostada no celular de alguém numa feira:
 *  número divergente aqui só apareceria quando a pessoa não recebesse resposta.
 *
 *  ATENÇÃO, ANOTADO EM 06/09/2026: este é o mesmo número que a Balaio usa. É decisão
 *  registrada, não engano: o Vive Gostoso compartilha o canal com a Balaio. Se um dia
 *  ele passar a ser um número próprio, muda em src/lib/whatsapp.ts e esta página vai
 *  junto, porque ela não guarda cópia. */

export const VIVE = {
  nome: 'Vive Gostoso',
  cidade: 'São Miguel do Gostoso',
  uf: 'RN',

  whatsapp: OFFICIAL_WHATSAPP,
  email: 'contato@vivegostoso.com.br',
  site: 'https://www.vivegostoso.com.br',
  siteRotulo: 'vivegostoso.com.br',
  instagram: 'https://instagram.com/vivegostoso',
  instagramRotulo: '@vivegostoso',
} as const

/** "(84) 93618-0839", para quando o número é lido na tela em vez de virar link. */
export function whatsappFormatado(): string {
  const d = VIVE.whatsapp
  const ddd = d.slice(2, 4)
  const resto = d.slice(4)
  const meio = resto.length === 9 ? 5 : 4
  return `(${ddd}) ${resto.slice(0, meio)}-${resto.slice(meio)}`
}

export function linkWhatsAppBio(mensagem: string): string {
  return `https://wa.me/${VIVE.whatsapp}?text=${encodeURIComponent(mensagem)}`
}
