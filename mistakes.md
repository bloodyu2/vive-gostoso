# Erros: Vive Gostoso

> Responde: **que erro não pode acontecer de novo?**
> Registrar antes de seguir sempre que algo falhar. Formato: data, o que aconteceu, e a regra que fica.

---

## 2026-10-28: `scrollbar-none` nunca funcionou, por causa de camada
**O que aconteceu:** o `globals.css` tinha `* { scrollbar-width: thin }` fora de qualquer `@layer`. Regra sem camada ganha de qualquer utilidade do Tailwind v4 (que mora em `@layer utilities`), então `scrollbar-none` (e `[scrollbar-width:none]`) não escondiam nada. O comentário do arquivo já dizia que "o scrollbar continuava aparecendo onde o código achava que tinha escondido". Achado medindo `getComputedStyle(...).scrollbarWidth` (`thin`) no carrossel novo da home.
**Regra:** CSS global de elemento (`*`, `body`, `a`) entra em `@layer base`. Utilidade que "não pega" se confere pelo valor computado no navegador, não pela classe no HTML.

## 2026-10-28: upload no Storage pelo painel cai na raiz se a pasta não for criada a tempo
**O que aconteceu:** ao subir fotos em lote pelo painel do Supabase (criar pasta com o id do negócio e enviar), em 3 de 40 tentativas a pasta não abriu e o arquivo foi para a raiz do bucket. Duas vezes foi o primeiro arquivo logo após carregar a página.
**Regra:** esperar a página carregar (5 a 6 s), conferir `location.search` com `?path=<id>` antes de enviar e, no fim, rodar `select name from storage.objects where bucket_id = 'business-photos' and name not like '%/%'` para achar solto na raiz. Não renomear por SQL em `storage.objects` (a chave física não acompanha); apagar o arquivo errado e reenviar.

## 2026-10-28: o servidor de desenvolvimento lê e escreve no banco de produção
**O que aconteceu:** o `.env.local` aponta para o Supabase de produção. Testar o formulário de resgate com `npm run dev` criaria resgates e consentimentos reais.
**Regra:** fluxo que escreve no banco não se testa contra o servidor local com o `.env` normal. Subir o banco de teste local (PGlite com a migração, mini PostgREST) e trocar as variáveis só no processo do teste. Conferir o endereço do Supabase na aba de rede antes de apertar o botão.

## 2026-10-26: rota nova em app/[lang] não chega se o proxy tiver desvio para o prefixo
**O que aconteceu:** ao trocar o link curto das plaquinhas (`/p/NN`, antes um route handler fora de `[lang]`) por uma página em `app/[lang]/p/[codigo]`, o `/p/01` dava 404 em português e funcionava em `/en/p/01`. O `proxy.ts` tinha um desvio `pathname.startsWith('/p/')` (PR 51) que pulava o next-intl: sem o rewrite para `/pt/p/01`, o Next casava `p` como idioma. Procurei no layout e em `generateStaticParams` antes de olhar o proxy.
**Regra:** rota nova sob `app/[lang]` que responde sem prefixo precisa passar pelo next-intl. Antes de depurar a página, conferir o cabeçalho `x-middleware-rewrite` da resposta (`curl -D -`): se ele não existe, o desvio está no `proxy.ts`.

## 2026-10-07: o código da Edge Function no repositório não é o que está no ar
**O que aconteceu:** `supabase/functions/*` é implantado pelo Supabase, não pela Vercel. Um push na `master` não publica função nenhuma. A versão de `create-checkout-session` implantada tinha ficado cinco meses atrás da do repositório (sem a checagem de dono do negócio), e a do webhook também.
**Regra:** depois de alterar qualquer arquivo em `supabase/functions/`, reimplantar a função e conferir o conteúdo implantado contra o arquivo (a API do Supabase devolve o código). Pagamento é onde essa diferença custa mais.

## 2026-09-24: node_modules ligado entre worktree e checkout principal
**O que aconteceu:** no PR #23, o `node_modules` da worktree foi ligado (link) ao `node_modules` do checkout principal para rodar os testes. Ao remover a worktree com `git worktree remove --force`, o git seguiu o link e apagou parte do `node_modules` principal. Foi reinstalado com `npm ci` e nada foi perdido no repositório.
**Regra:** em worktree, rodar `npm ci` próprio, nunca ligar ao `node_modules` de outro checkout. Remover a worktree sem `--force`; se não sair limpo, investigar o motivo antes de forçar.

## 2026-09-23: Push direto na master é proibido
**O que aconteceu:** a regra nasceu do commit `b0c961f` no balaio-digital em 23/09/2026: outro agente empurrou direto na `main` de lá, sem PR e sem preview, e foi a produção.
**Regra:** Push direto na master é proibido, inclusive para agentes. Todo trabalho entra por PR com preview verde. Agente trabalha em worktree próprio, nunca no checkout principal.
**Observação:** o GitHub agora bloqueia: branch protection na master exige PR, check Vercel verde, vale para admins, sem force push e sem apagar a branch (ativado em 23/09/2026).

## 2026-09-27: e-mail do Victor no User-Agent de consulta ao Nominatim
**O que aconteceu:** ao conferir praias no OpenStreetMap, uma consulta ao Nominatim saiu com o e-mail do Victor no cabeçalho User-Agent (a política do Nominatim pede contato). Foram 7 requisições. As seguintes saíram só com o nome do projeto.
**Regra:** dado pessoal do Victor não vai em cabeçalho, URL ou corpo de serviço de terceiro sem ele pedir. Para o Nominatim, identificar o projeto (`vive-gostoso-mares/1.0`) basta.

## 2026-10-30: verificar no navegador com `next dev` mostra a pagina sem JavaScript
**O que aconteceu:** ao conferir o filtro da /clube com `next dev`, os botoes nao respondiam. A CSP do `proxy.ts` nao aceita `eval` (o relatorio `/api/csp-report` mostrou `blocked-uri: eval`), entao o bundle de desenvolvimento nunca hidrata; o HTML do servidor aparece e parece pronto. Alem disso o Turbopack do `next dev` nao resolve `next/font/google` neste projeto (o build usa `--webpack`).
**Regra:** conferir interacao de tela so com `npm run build` e `npx next start -p 3100` (com `NEXT_PUBLIC_SUPABASE_URL` e a chave publica anon no ambiente do processo). Antes de acreditar que um clique "nao funciona", conferir se houve hidratacao (`Object.keys(elemento)` com chave `__react`). Para 390 px reais no Chrome do Windows: proxy local que tira `x-frame-options` e a CSP, moldura com iframe de 390 px na mesma origem; a captura de tela so sai se a janela for redimensionada logo antes (`resize_window`), senao o CDP trava em 30 s.

## 2026-10-30: teste de varredura estourava 5 s com os testes de PGlite juntos
**O que aconteceu:** `numeros-de-produto.test.ts` le todos os arquivos de `src` e passou do prazo padrao do vitest quando rodou junto dos testes de PGlite (passava sozinho).
**Regra:** teste que varre o repositorio ou sobe PGlite declara o proprio prazo (`60_000` no `beforeAll`, `30_000` na varredura). Falha so no conjunto completo e sinal de prazo, nao de regra.
