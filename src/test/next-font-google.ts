// Substituto de next/font/google nos testes (KAN-463). Fora do build do Next a
// funcao da fonte nao existe (quem a gera e o compilador do Next); aqui basta
// devolver o formato que o layout usa.
type Opcoes = { variable?: string }
function fonte(opcoes: Opcoes = {}) {
  return { className: 'fonte-de-teste', variable: opcoes.variable ?? '', style: { fontFamily: 'serif' } }
}
export const Fraunces = fonte
export const Plus_Jakarta_Sans = fonte
