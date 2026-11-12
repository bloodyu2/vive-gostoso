import type { Secao } from '@/data/paginas-legais'

/** Uma seção das páginas legais (termos, exclusão de conta, trecho do aplicativo na privacidade). `{EMAIL}` vira link. */
export function SecaoLegal({ secao, email }: { secao: Secao; email?: { endereco: string; assunto?: string; corpo?: string } }) {
  const comLink = (texto: string) => {
    if (!email || !texto.includes('{EMAIL}')) return texto
    const [antes, depois] = texto.split('{EMAIL}')
    const query = [email.assunto ? `subject=${encodeURIComponent(email.assunto)}` : '', email.corpo ? `body=${encodeURIComponent(email.corpo)}` : ''].filter(Boolean).join('&')
    return (
      <>
        {antes}
        <a className="underline" href={`mailto:${email.endereco}${query ? `?${query}` : ''}`}>{email.endereco}</a>
        {depois}
      </>
    )
  }
  return (
    <section className="border-t border-border-1 pt-6">
      <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">{secao.titulo}</h2>
      {secao.passos ? (
        <ol className="list-decimal pl-6 space-y-2 mb-3">
          {secao.passos.map((p) => <li key={p}>{p}</li>)}
        </ol>
      ) : null}
      {secao.paragrafos ? (
        <div className="space-y-3">
          {secao.paragrafos.map((p) => <p key={p}>{comLink(p)}</p>)}
        </div>
      ) : null}
      {secao.itens ? (
        <ul className="list-disc pl-6 space-y-2 mt-3">
          {secao.itens.map((i) => <li key={i}>{i}</li>)}
        </ul>
      ) : null}
    </section>
  )
}
