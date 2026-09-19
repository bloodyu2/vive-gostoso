/** Serializa JSON-LD para embutir em <script type="application/ld+json"> sem
 *  deixar um `</script>` vindo de dado de banco fechar a tag e abrir um script
 *  executavel. Os sinks afetados leem nome/descricao/endereco de negocio,
 *  titulo/slug de post e a coluna livre `faq_jsonld`.
 *
 *  O escape de `<` como `\u003c` continua sendo JSON valido: o parseador de
 *  JSON-LD le a mesma string, mas o parseador de HTML nao encontra `</script>`.
 *  Nao troque por sanitizacao de HTML aqui -- o payload precisa seguir JSON.
 *
 *  Use SEMPRE que o destino for dangerouslySetInnerHTML com ld+json. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
