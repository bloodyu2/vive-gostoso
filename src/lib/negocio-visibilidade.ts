/** O que o admin grava ao publicar ou despublicar um negocio.
 *
 *  O dono tambem alterna `is_published` (publicar o proprio negocio), mas so o
 *  admin altera `active` (o banco mantem `active` como estava quando quem grava
 *  nao e admin). Por isso o admin liga e desliga as duas colunas juntas: assim a
 *  despublicacao dele nao e desfeita quando o dono volta a publicar. */
export function estadoDePublicacaoDoAdmin(publicar: boolean): { is_published: boolean; active: boolean; is_verified?: true } {
  // Regra de 25/10/2026: negocio que a gente inscreve ou aprova ja sai verificado.
  // Despublicar nao mexe no selo.
  return publicar
    ? { is_published: true, active: true, is_verified: true }
    : { is_published: false, active: false }
}
