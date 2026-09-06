/** O vCard do Vive Gostoso, montado aqui dentro. Nada de serviço externo.
 *
 *  POR QUE vCARD 3.0 E NÃO 4.0. O 4.0 é a versão corrente da especificação, mas o
 *  aplicativo de contatos do Android importa 3.0 sem tropeçar e trata alguns campos
 *  do 4.0 como texto solto. Como o arquivo existe para abrir a agenda de um celular
 *  qualquer no meio da rua, a versão mais velha e mais bem suportada é a certa.
 *
 *  ELE FALA O IDIOMA DA PÁGINA. Quem chegou pela versão em inglês salva um contato
 *  com o cargo em inglês. É uma linha de código a mais e é a diferença entre um
 *  contato que a pessoa entende e um que ela ignora seis meses depois.
 *
 *  AS TRÊS ARMADILHAS DO FORMATO, todas silenciosas: CRLF obrigatório (só \n faz
 *  importador rígido pular a linha), vírgula e ponto e vírgula dentro de um valor
 *  precisam de barra invertida, e linha acima de 75 octetos precisa ser dobrada com
 *  um espaço no início da continuação. A dobra conta BYTES, não caracteres: quebrar
 *  no meio de um "ã" produz lixo na agenda de quem salvou. */

import { VIVE } from './contato'

/** Muda quando os dados mudam, não a cada requisição: um REV com `new Date()` faria
 *  cada download parecer contato novo para quem já salvou. */
const REV = '2026-09-06T00:00:00Z'

const CRLF = '\r\n'

/** Escapa o que o formato lê como separador. A barra invertida vem primeiro, senão
 *  ela escaparia a própria escapada. */
function escapar(valor: string): string {
  return valor
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

/** Dobra a linha em 75 octetos, quebrando só em fronteira de caractere. */
function dobrar(linha: string): string {
  const codificador = new TextEncoder()
  if (codificador.encode(linha).length <= 75) return linha

  const partes: string[] = []
  let atual = ''
  let usados = 0
  // O primeiro pedaço vai até 75; os seguintes até 74, porque o espaço da
  // continuação também ocupa um octeto na linha.
  let limite = 75

  for (const caractere of linha) {
    const tamanho = codificador.encode(caractere).length
    if (usados + tamanho > limite) {
      partes.push(atual)
      atual = ''
      usados = 0
      limite = 74
    }
    atual += caractere
    usados += tamanho
  }
  if (atual) partes.push(atual)

  return partes.join(`${CRLF} `)
}

export function vcardVive({ papel, nota }: { papel: string; nota: string }): string {
  const endereco = [
    '', // caixa postal
    '', // complemento
    '', // logradouro
    escapar(VIVE.cidade),
    escapar(VIVE.uf),
    '', // CEP
    'Brasil',
  ].join(';')

  const linhas = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'PRODID:-//Vive Gostoso//bio//PT-BR',
    // Para pessoa jurídica a convenção é o nome inteiro no primeiro campo do N, e o
    // X-ABShowAs faz o iPhone mostrar como empresa em vez de inverter nome e
    // sobrenome.
    `N:${escapar(VIVE.nome)};;;;`,
    `FN:${escapar(VIVE.nome)}`,
    `ORG:${escapar(VIVE.nome)}`,
    `TITLE:${escapar(papel)}`,
    'X-ABShowAs:COMPANY',
    `TEL;TYPE=CELL,VOICE,PREF:+${VIVE.whatsapp}`,
    `EMAIL;TYPE=INTERNET,PREF:${VIVE.email}`,
    `URL:${VIVE.site}`,
    `ADR;TYPE=WORK:${endereco}`,
    `X-SOCIALPROFILE;TYPE=instagram:${VIVE.instagram}`,
    `NOTE:${escapar(nota)}`,
    `REV:${REV}`,
    'END:VCARD',
  ]

  return linhas.map(dobrar).join(CRLF) + CRLF
}

/** O nome do arquivo que cai na pasta de downloads do Android. */
export const ARQUIVO_VCARD = 'vive-gostoso.vcf'
