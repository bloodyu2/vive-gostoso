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
