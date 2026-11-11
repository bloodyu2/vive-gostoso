// KAN-686: primeira linha de defesa do guia, antes de qualquer chamada ao modelo.
// Deterministico, sem rede, sem custo. O que cai aqui recebe a recusa fixa e conta como abuso.
// Nao substitui o prompt fechado nem o filtro de saida: e uma camada a mais.

export type MotivoDeRecusa = 'vazio' | 'ruido' | 'injecao' | 'segredo' | 'codigo' | 'ofensa' | 'fora_do_tema'

export type Veredito = { ok: true } | { ok: false; motivo: MotivoDeRecusa }

const c = (n: number) => String.fromCharCode(n)
/** Controles, zero-width, marcas de direcao, separadores de linha e "tags" Unicode. Montada com
 *  fromCharCode para o arquivo nao carregar nenhum caractere invisivel no fonte. */
const INVISIVEIS = new RegExp(
  `[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F${c(0x200b)}-${c(0x200f)}${c(0x2028)}-${c(0x202e)}${c(0x2060)}-${c(0x206f)}${c(0xfeff)}]|\\uDB40[\\uDC00-\\uDC7F]`,
  'g',
)

/** Texto limpo para exibir e enviar: Unicode normalizado, sem caractere de controle nem invisivel, espaco unico. */
export function normalizarTexto(s: string): string {
  return s
    .normalize('NFKC')
    .replace(INVISIVEIS, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Forma de comparacao: minuscula, sem acento, leet simples desfeito, letras repetidas reduzidas a duas. */
export function paraComparar(s: string): string {
  return normalizarTexto(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // letras soltas separadas por ponto, hifen, asterisco ou espaco ("i.g.n.o.r.e") voltam a ser uma palavra
    .replace(/\b(?:[a-z][._*\- ]){3,}[a-z]\b/g, (m) => m.replace(/[._*\- ]/g, ''))
    .replace(/[@]/g, 'a')
    .replace(/\$/g, 's')
    // numeros colados em letra viram a letra parecida ("1gn0re"); numero sozinho ("3 dias") fica como esta
    .replace(/(?<=[a-z])[01345]|[01345](?=[a-z])/g, (d) => ({ '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's' })[d] as string)
    .replace(/([a-z])\1{2,}/g, '$1')
    .replace(/[._*-]+(?=[a-z])/g, ' ')
}

const INJECAO: RegExp[] = [
  /ignor(e|a|ar|em|ando)\b.{0,40}(instruc|regra|prompt|anterior|acima|restric|diretriz)/,
  /(esquec|desconsider|abandon)\w*.{0,40}(instruc|regra|tudo|anterior|acima|restric|diretriz)/,
  /(system|sistema|inicial|original|oculto|secreto)\s*(prompt|message|mensagem|instruc)/,
  /prompt\s*(do\s*)?(sistema|inicial|original|oculto)/,
  /(voce|vc|tu)\s*(agora\s*)?(e|eh|sera|vai ser|passa a ser|se torna)\s+(um|uma|o|a)?\s*(dan|jailbreak|hacker|outro|outra|assistente sem|ia sem|chatgpt|gpt|llm sem)/,
  /(modo|mode)\s*(desenvolvedor|developer|deus|god|dan|admin|sem restric|irrestrito|debug|manutencao|teste)/,
  /\b(jailbreak|dan|dude|stan)\b.{0,20}(mode|modo|prompt)?/,
  /(finja|finge|pretend|act as|aja como|atue como|faca de conta|roleplay|role play|interprete o papel|assuma o papel|simule (ser|que))/,
  /(repita|repete|mostre|exiba|revele|diga|imprima|escreva|liste|copie|cole|vaze|soletre).{0,50}(instruc|prompt|regras|texto acima|mensagem acima|configurac|diretriz|suas ordens|seu codigo|como voce foi)/,
  /(traduza|translate|resuma|resume|parafraseie|reescreva).{0,40}(instruc|prompt|regras|suas ordens|texto acima)/,
  /(ignore|disregard|forget|override)\s+(all|any|the|your|previous|above|prior)/,
  /(contorn|burl|desativ|remov|desligu|bypass|jailbreak).{0,30}(regra|filtro|restric|seguranca|limite|rule|filter|guardrail|protecao)/,
  /<\s*\/?\s*(system|assistant|user|tool|im_start|im_end|instruction)/,
  /\[\s*\/?\s*(inst|sys|system)\s*\]/,
  /#{2,}\s*(system|instruction|instrucao|nova regra)/,
  /(nova|novas)\s+(regra|instrucao|instrucoes|ordem|ordens)\s*:/,
  /(a partir de agora|de agora em diante).{0,40}(voce|vc|responda|ignore|aja|seja)/,
  /(qual|quais|me fale|me diga|conte).{0,30}(seu|suas|sua)\s*(prompt|instruc|regras|configurac|modelo|versao|fornecedor|provedor|api)/,
  /(que|qual)\s*(modelo|llm|ia|inteligencia)(\s+de\s+(ia|inteligencia artificial))?\s*(voce|vc)\s*(e|eh|usa|roda|esta usando)/,
  /(base64|hexadecimal|rot13|codificad).{0,30}(instruc|ordem|comando|decodifique)/,
  /(sudo|admin|root|developer)\s*(mode|modo|access|acesso|override)/,
]

const SEGREDO: RegExp[] = [
  /(api[\s_-]?key|apikey|secret[\s_-]?key|access[\s_-]?token|bearer\s|\.env\b|service[\s_-]?role|anon[\s_-]?key)/,
  /chave\s*(da|de|do)?\s*(api|openai|supabase|vercel|stripe|asaas|acesso|secreta|mestra|servidor)/,
  /(senha|password|token|credencia\w*)\s*(do|da|de)?\s*(admin|administrador|banco|sistema|supabase|vercel|painel|servidor|site|api|github)/,
  /variaveis?\s*(de\s*)?ambiente/,
  /(dados|lista|emails?|telefones?|cpf|contatos?)\s*(dos|das|de)?\s*(usuarios|clientes|cadastrados|donos|parceiros|visitantes)/,
  /(banco de dados|database|tabela\s+\w+|schema|rls|sql)\s*(do site|do vive|completo|inteiro)?.{0,20}(acesso|dump|exporte|baixe|liste)/,
]

const CODIGO: RegExp[] = [
  /```/,
  /<\s*(script|iframe|img|svg|style|html|body|link|object)\b/,
  /\bselect\b.{0,40}\bfrom\b|\bdrop\s+(table|database)\b|\binsert\s+into\b|\bunion\s+select\b|\bdelete\s+from\b|\bupdate\b.{0,30}\bset\b/,
  /\b(eval|exec|system|require|fetch|curl|wget)\s*\(/,
  /\b(import|from)\s+[\w./]+\s+(import|as)\b|\bdef\s+\w+\s*\(|\bfunction\s*\w*\s*\(|=>\s*\{|console\.log|\bsudo\b|rm\s+-rf|\bchmod\b|\bgit\s+(clone|push)\b|\bnpm\s+(install|run)\b/,
  /(escreva|crie|faca|gere|programe|implemente|depure|debug|corrija)\s+(para mim\s+)?(um|uma|o|a)?\s*(codigo|script|programa|funcao|classe|algoritmo|app|aplicativo|site|bot|macro|query|consulta sql|regex)/,
  /\b(em|usando|com)\s+(python|javascript|typescript|java|c\+\+|c#|php|ruby|golang|rust|sql|html|css|bash|powershell|react|node)\b/,
]

const OFENSA: RegExp[] = [
  /\b(put[ao]s?|porra|caralh\w*|fdp|filho\s*d[ae]\s*put\w*|vsf|vtnc|tnc|merd\w*|bucet\w*|\bcu\b|arrombad\w*|otari\w*|viados?|idiot\w*|imbecil\w*|retardad\w*|babac\w*|desgrac\w*|estupid\w*|cretin\w*|vagabund\w*|corno)\b/,
  /\b(fuck|shit|bitch|asshole|dick|cunt|nigg\w*|retard\w*|stupid|idiot|moron|suck\w*)\b/,
  /\b(vou|iremos|vamos)\s+(te\s+)?(matar|hackear|derrubar|invadir|destruir|quebrar|atacar)\b/,
]

const FORA_DO_TEMA: RegExp[] = [
  // politica e religiao como debate
  /\b(eleic\w*|president\w*|lula|bolsonaro|trump|biden|putin|partido\s*politic\w*|esquerda|direita|bolsonarista|petista|comunis\w*|facist\w*|nazis\w*|golpe|impeachment|governo federal|congresso|senado|stf|voto|candidato)\b/,
  /(deus existe|existe deus|qual a melhor religiao|aborto|pena de morte|eutanasia)/,
  // sexual, violencia, ilegal
  /\b(porn\w*|sexo|sexual|nud[ea]s?|nu[ae]s?\b|erotic\w*|fetiche|prostitu\w*|acompanhante de luxo|garota de programa|onlyfans|camgirl|striptease|masturba\w*)\b/,
  /(como\s+(fazer|construir|montar|criar|comprar|vender|conseguir|roubar|fabricar|esconder)\s+(uma\s+)?(bomba|arma|veneno|droga|maconha|cocaina|crack|lsd|explosivo|clone de cartao|dinheiro falso|documento falso|virus|malware))/,
  /\b(suicid\w*|me matar|automutila\w*|overdose)\b/,
  // saude, juridico, financas
  /\b(diagnostic\w*|sintoma\w*|remedio para|dose de|receita medica|tratamento (de|para)|doenca|cancer|diabetes|depressao|ansiedade|medicamento\w*|antibiotico\w*)\b/,
  /\b(processar|advogado para|habeas|inventario|divorcio|guarda de filho|multa de transito|recurso (de|da) multa|imposto de renda|declarar imposto)\b/,
  /\b(bitcoin|cripto\w*|ethereum|forex|day\s*trade|acoes da bolsa|comprar acoes|investir em|investimento em|renda fixa|tesouro direto|criptomoeda\w*|nft|apostas?|bets?|cassino|jogo do tigrinho|loteria)\b/,
  // tarefas genericas de assistente
  /(resolva|calcule|resolver|calcular)\s+(a\s+|o\s+)?(equacao|integral|derivada|expressao|problema de matematica|exercicio|questao|prova)/,
  /(redacao|trabalho escolar|dever de casa|tcc|monografia|artigo cientifico|poema|poesia|letra de musica|historia infantil|piada|roteiro de filme)\s*(sobre|de|do|da|para)?/,
  /(traduza|traducao de|translate)\s+(este|esse|o|a|um|uma)?\s*(texto|frase|paragrafo|documento|musica|carta|e\s?mail|email)/,
  /\b(receita de|como cozinhar|como preparar|ingredientes para)\b/,
  /(horoscopo|signo de|mapa astral|tarot|numerologia|previsao do futuro)/,
  /(quem (ganhou|venceu|vai ganhar)|resultado do jogo|placar|campeonato|copa do mundo|champions|brasileirao)/,
  /(preco do dolar|cotacao|bolsa de valores|ibovespa)/,
  /(crie|gere|faca|escreva)\s+(um|uma)?\s*(e\s?mail|post|legenda|carta|curriculo|apresentacao|plano de negocio|contrato|texto de venda)\b/,
  /(chatgpt|openai|anthropic|claude|gemini|deepseek|command\s*code|grok|llama|copilot|midjourney)/,
]

/** Relacao de assunto aceito. Uma mensagem curta sem nenhuma palavra do tema nao e recusada por isso (ex.: "e para 2 pessoas"):
 *  quem decide o que fazer com ela e o prompt fechado. Aqui so se barra o que e claramente abuso. */
export function classificar(texto: string): Veredito {
  const t = paraComparar(texto)
  if (t.length === 0) return { ok: false, motivo: 'vazio' }

  // `t` troca ponto e hifen por espaco (para pegar "i.g.n.o.r.e"); `bruto` guarda a pontuacao (para pegar ".env" e "console.log").
  const bruto = normalizarTexto(texto).toLowerCase()
  if (INJECAO.some((r) => r.test(t) || r.test(bruto))) return { ok: false, motivo: 'injecao' }
  if (SEGREDO.some((r) => r.test(t) || r.test(bruto))) return { ok: false, motivo: 'segredo' }
  if (CODIGO.some((r) => r.test(t) || r.test(bruto))) return { ok: false, motivo: 'codigo' }

  // ruido: pouca letra, repeticao longa, ou so simbolo
  const letras = (t.match(/[a-z]/g) ?? []).length
  if (t.length >= 6 && letras / t.length < 0.55) return { ok: false, motivo: 'ruido' }
  if (/(.)\1{11,}/.test(normalizarTexto(texto))) return { ok: false, motivo: 'ruido' }
  if (/(\b\w+\b)(\s+\1){5,}/.test(t)) return { ok: false, motivo: 'ruido' }

  if (OFENSA.some((r) => r.test(t))) return { ok: false, motivo: 'ofensa' }
  if (FORA_DO_TEMA.some((r) => r.test(t))) return { ok: false, motivo: 'fora_do_tema' }
  return { ok: true }
}

/** Texto vindo do banco ou de ferramenta: se parecer instrucao ou segredo, vai vazio. Dado nunca vira ordem. */
export function textoDeDadoSeguro(s: string, max: number): string {
  const semLinks = String(s ?? '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\S+@\S+\.\S+/g, '')
    .replace(/<[^>]*>/g, '')
  const limpo = normalizarTexto(semLinks).slice(0, max).trim()
  const v = classificar(limpo)
  if (!v.ok && (v.motivo === 'injecao' || v.motivo === 'segredo' || v.motivo === 'codigo')) return ''
  return limpo
}
