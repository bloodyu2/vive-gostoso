// Frase do Instituto Vive que acompanha a mensalidade do app (Termos do site, aviso de beta e tela do
// Clube do app). Fica num lugar so e com duas redacoes prontas porque o Victor ainda decide qual vale
// (Item 232 aprovou "pagamento"; o Item 245 pergunta se troca por "constituicao", mais segura enquanto
// o Instituto nao existe como entidade). Trocar a redacao = trocar VARIANTE, nada mais.
// Regra: nao prometer doacao nem recibo; "Instituto Vive" sem "associacao" ou "sem fins lucrativos"
// ate a entidade existir. Texto novo nasce nos tres idiomas (CLAUDE.md).

export type VarianteDoTexto = 'pagamento-232' | 'constituicao-245'
export type IdiomaDoTexto = 'pt' | 'en' | 'es'

export const VARIANTE: VarianteDoTexto = 'pagamento-232'

export const TEXTOS_DO_INSTITUTO: Record<VarianteDoTexto, Record<IdiomaDoTexto, string>> = {
  'pagamento-232': {
    pt: 'Pagando o app você ajuda o Instituto Vive: a receita do app sustenta os cursos gratuitos e os custos da plataforma da cidade. É o pagamento pelo uso do app, não é doação e não gera recibo de doação.',
    en: 'By paying for the app you help the Instituto Vive: the app revenue supports the free courses and the costs of the city platform. It is payment for using the app, not a donation, and it does not generate a donation receipt.',
    es: 'Al pagar la aplicación usted ayuda al Instituto Vive: los ingresos de la aplicación sostienen los cursos gratuitos y los costos de la plataforma de la ciudad. Es el pago por usar la aplicación, no es una donación y no genera recibo de donación.',
  },
  'constituicao-245': {
    pt: 'O Vive é feito pela Balaio Digital. Parte do que o app arrecada será destinada ao Instituto Vive, que está em constituição.',
    en: 'Vive is made by Balaio Digital. Part of what the app collects will be allocated to the Instituto Vive, which is being set up.',
    es: 'Vive es hecho por Balaio Digital. Parte de lo que recauda la aplicación se destinará al Instituto Vive, que está en proceso de constitución.',
  },
}

/** A frase vigente no idioma pedido. */
export const textoDoInstituto = (idioma: IdiomaDoTexto, variante: VarianteDoTexto = VARIANTE): string => TEXTOS_DO_INSTITUTO[variante][idioma]
