# Decisões — Vive Gostoso

> Responde: **por que estamos construindo assim?**
> Decisão registrada aqui não se rediscute sem motivo concreto novo. Rediscutindo, escreva o motivo e a data embaixo da original, não apague.

---

## A branch padrão é `master`, não `main`
**Por quê:** herança do início do projeto.
**Consequência:** todo script, workflow e comando precisa usar `master`. Errar isso é o jeito mais fácil de fazer um push sumir.

## Toda migração que cria tabela nova precisa de grants explícitos
**Decisão:** template obrigatório em qualquer migração que crie tabela em `public`:
```sql
grant select on public.<tabela> to anon;
grant select, insert, update, delete on public.<tabela> to authenticated;
grant all on public.<tabela> to service_role;
```
**Por quê:** depois de outubro de 2026 tabela nova não é mais exposta automaticamente, e o supabase-js devolve 42501.
**Ajuste permitido:** tabela interna pode não precisar de `anon`. O resto não se negocia.

## `gostoso_is_admin()` existe para evitar recursão em RLS
**Decisão:** função `sql`, `SECURITY DEFINER`, `search_path = public`, que devolve true quando o `auth.uid()` corrente é admin.
**Por quê:** as policies de `gostoso_profiles` precisariam consultar a própria tabela, o que gera recursão infinita.
**Cuidado que veio junto:** `EXECUTE` revogado de `anon` e `public`, só `authenticated` chama. E toda policy `cmd=ALL` que a invoca precisa de `to authenticated` explícito, senão quebra com 42501 em consulta anônima.

## Elevação de privilégio é bloqueada por trigger, não só por policy
**Decisão:** triggers `SECURITY DEFINER` em `gostoso_profiles` e `gostoso_businesses` impedem que o próprio usuário mude `role`, `auth_user_id`, `plan`, `is_featured`, `is_verified`, `display_order`, `stripe_*` e `plan_expires_at`. Insert força valores seguros. Só admin sobrescreve.
**Por quê:** policy sozinha protege a linha, não protege o campo. Auditoria de maio de 2026.
**Onde:** migrations `20260514_security_audit_2026_05.sql` e `20260514_security_hardening_followup.sql`.

## Edge Function de pagamento valida a origem
**Decisão:** `create-checkout-session` e `create-donation-session` conferem o header `Origin` contra lista fixa: `vivegostoso.com.br`, `www.vivegostoso.com.br` e previews da Vercel.
**Por quê:** impedir que domínio externo dispare cobrança usando a nossa função.

## PIX foi removido
**Decisão:** aceitar cartão e boleto, não PIX.
**Por quê:** não está ativado na conta Stripe.
**Se for reativar:** é decisão comercial, não técnica. Registrar aqui com a data.

## Link de WhatsApp sempre pelo helper
**Decisão:** usar `buildWhatsAppLink` de `src/lib/whatsapp.ts`, formato `wa.me/55DDDNUMERO?text=...`.
**Por quê:** montar URL à mão já produziu link quebrado em produção. O helper é o único caminho.

## Cadastro do público entra desativado
**Decisão:** serviço e vaga entram com `is_active = false` e um humano aprova.
**Por quê:** é guia de cidade pequena. Uma publicação ruim custa reputação e não tem como desfazer na cabeça de quem viu.

## Idioma por URL, não por cookie nem por detecção
**Decisão:** `/en/...` e `/es/...`, com `hreflang`.
**Por quê:** é o único formato que o buscador entende e que permite compartilhar link na língua certa.

## Bucket público, com upload verificado
**Decisão:** `business-photos` e `gostoso` são `public = true`, servindo por CDN sem RLS. As policies amplas de SELECT foram removidas.
**Por quê:** foto de negócio é conteúdo público, e RLS em cima disso só custa desempenho.
**A trava está no upload:** ownership conferido por `storage.foldername(name)[1]` casado com `gostoso_businesses.id`, limite de 5 MB, e mime type restrito a jpeg, png e webp, mais svg no bucket `gostoso`.

## O contador de associados sai, os selos ficam
**Decisão de Victor em 17/09/2026.**
**O que aconteceu:** a página do fundo mostrava "0 negócio associado" ao lado de cartões com selo de associado e de destaque. Zero associado com selo de associado na mesma tela se contradiz.
**Decisão:** tirar o contador e manter os selos. Os selos ficam como cortesia de pré-lançamento.
**Por quê:** o número verdadeiro hoje é zero, e nenhum número inventado entra no lugar. O que sai, sai.
**Consequência:** `fund.raised_month` e `fund.raised_month_plural` não existem mais em nenhum idioma, `FundHero` não recebe contagem e `useAssociadosCount` foi removido. Voltar a mostrar contagem de associados é decisão comercial nova, e se registra aqui com a data.

## Tábua de marés: fonte, estação, praias e cache (27/09/2026)
**Ordem do Victor de 27/09/2026.** Página `/explore/mares` e uma por praia.

**Fonte: PDF da Marinha, plano A.** As Tábuas de Maré do CHM/DHN de 2026 baixam direto de `assets.marinha.mil.br` (a página `www.marinha.mil.br/chm/tabuas-de-mare-6` fica atrás de um desafio Cloudflare, e ninguém resolve desafio por robô). O PDF do Porto de Natal tem camada de texto limpa; a extração é por posição (x, y) e foi conferida em 17 dias espalhados pelo ano, contra uma renderização independente do mesmo PDF (poppler). Plano B (WorldTides, Stormglass) não foi preciso. A edição de 2027 não estava publicada em 27/09/2026.

**Estação: Porto de Natal (COM3DN) para todas as praias, como a ordem pede.** Distâncias em linha reta, das coordenadas do OSM às do cabeçalho de cada PDF:

| Praia | Porto de Natal | Porto de Guamaré |
|---|---|---|
| Cardeiro, Xêpa, Santo Cristo | 86 km | 76 a 77 km |
| Maceió | 87 km | 75 km |
| Tourinhos | 92 km | 68 km |
| Marco (Pedra Grande) | 101 km | 58 km |

Guamaré fica mais perto de todas. Natal ficou por três motivos: é a estação que a ordem define; a tábua de Natal usa 90 componentes harmônicas e a de Guamaré, 24; e Guamaré é um porto de estuário, com a maré deformada pela plataforma rasa. **Cuidado registrado:** em 01/01/2026 a mesma maré chega a Guamaré de 37 a 72 minutos depois de Natal. Gostoso fica entre as duas, então a diferença real na praia pode passar de "alguns minutos". O aviso da página continua o que a ordem pediu; medir a maré no Cardeiro em alguns dias e comparar é o jeito de saber o tamanho do erro.

**Praias.** Entraram as seis que o OpenStreetMap confirma (ids de 27/09/2026): Xêpa (relation 2115892), Cardeiro (2115893), Maceió (2115894), Santo Cristo (2115895), Tourinhos (node 11643248075; o município confirmado por geocodificação reversa) e Praia do Marco (node 13535219738, Pedra Grande). As dicas são as da ordem do Victor, nos três idiomas. Ficaram de fora Praia do Amor, Zé Martins, Minhoto e Malhada: nenhuma existe no OSM, e a única fonte achada para o Minhoto o põe em Guamaré, não em Touros. O texto de `/conheca` põe o Minhoto e a Praia do Amor em Gostoso; isso não foi mexido e fica para conferir.

**Melhor horário.** Cardeiro, Xêpa e Maceió pela maré baixa, Tourinhos pela alta. Santo Cristo e Marco ficam sem janela: a dica diz que a maré muda o spot e o acesso, mas não diz qual maré é a boa, e inventar isso seria pior que não dizer. Janela = faixa de 15% da variação em torno do extremo (cerca de 1h30 para cada lado), cortada em 6h-18h.

**Cache.** O HTML do site inteiro é dinâmico (o nonce de CSP do `proxy.ts` é gerado por requisição), então o `revalidate = 3600` da página não tem efeito hoje. Quem guarda por 1 h é o cache de dados do Next na leitura do Supabase (`fetchComCache` em `src/lib/mares/consulta.ts`). "Hoje" e "agora" são calculados a cada visita em America/Fortaleza. Se um dia a página virar estática, os rótulos "Hoje/Amanhã" precisam passar a ser calculados no cliente.

**Grants.** A migração segue o template obrigatório (inclusive escrita para `authenticated`), mas não há policy de insert, update ou delete: só a service role escreve. Teste em `src/lib/mares/rls-mares.test.ts`, com PGlite.

**Imagem de compartilhamento.** Usa a fonte padrão do `next/og`. Os recortes de Fraunces e Jakarta do projeto não cobrem dígitos e letras do card, e baixar recortes novos do Google Fonts não estava autorizado nesta ordem. Pendência: gerar os recortes e trocar.
