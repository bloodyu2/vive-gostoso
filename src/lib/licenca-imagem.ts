/**
 * Licença de imagem: a versão do texto e a pergunta "esta foto tem aceite?".
 *
 * O aceite fica em `gostoso_aceites_licenca_imagem`, com data, usuário e versão
 * do texto. Um booleano solto não serviria: quando a cláusula for revisada,
 * precisamos saber quem aceitou qual versão.
 *
 * A tabela de aceites não é pública, porque quem aceitou o quê é dado de
 * pessoa. O que a página lê é `gostoso_businesses.imagens_licenciadas`, uma
 * coluna derivada que um gatilho mantém em dia com a união das imagens
 * cobertas por aceite.
 */

/** Versão do texto da cláusula em vigor. Mude junto com o texto nos locales:
 *  quem aceitou a versão anterior precisa aceitar de novo para as fotos novas. */
export const VERSAO_LICENCA_IMAGEM = 'v1-2026-09-07'

/**
 * `true` só quando a foto veio com aceite registrado.
 *
 * Foto que já estava no banco antes da cláusula não recebe o rótulo, mesmo que
 * tenha sido o dono que subiu: não temos como provar, e um rótulo que às vezes
 * mente vale menos que rótulo nenhum. Hoje isso marca pouquíssimos casos, e é
 * assim mesmo.
 */
export function temLicenca(
  imagensLicenciadas: string[] | null | undefined,
  url: string | null | undefined
): boolean {
  if (!url || !imagensLicenciadas?.length) return false
  return imagensLicenciadas.includes(url)
}
