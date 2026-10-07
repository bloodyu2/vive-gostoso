/** O que o admin grava ao publicar ou despublicar um negocio.
 *
 *  O dono tambem alterna `is_published` (publicar o proprio negocio), mas so o
 *  admin altera `active` (o banco mantem `active` como estava quando quem grava
 *  nao e admin). Por isso o admin liga e desliga as duas colunas juntas: assim a
 *  despublicacao dele nao e desfeita quando o dono volta a publicar. */
export function estadoDePublicacaoDoAdmin(publicar: boolean): { is_published: boolean; active: boolean } {
  return { is_published: publicar, active: publicar }
}
