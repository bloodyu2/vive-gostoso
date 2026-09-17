# Changelog — Vive Gostoso

> Responde: **o que mudou em cada versão?**
> Versionamento semântico: `MAIOR.MENOR.CORREÇÃO`. Entrada nova no topo. Registrar também o que impacta outra parte do sistema, porque é o que permite voltar atrás com segurança.

---

## [Não publicado]
- KAN-92: o contador de negócios associados sai da página do fundo. Os selos de associado e destaque continuam, como cortesia de pré-lançamento. Chaves `fund.raised_month` e `fund.raised_month_plural` removidas nos três idiomas, prop `associadosCount` removida de `FundHero` e o hook `useAssociadosCount` removido de `src/hooks/useFund.ts`. Guarda em `src/lib/contador-de-associados.test.ts`.
- Adotados os seis arquivos de contexto na raiz: `PRD.md`, `decisoes.md`, `mistakes.md`, `design.md`, `CLAUDE.md` e `CHANGELOG.md`.

## [1.4.0] — 2026-09
### Adicionado
- Correção de `hreflang`, com verificação no Search Console prevista para duas semanas depois.

## [1.3.0] — 2026-06
### Adicionado
- Módulo TRANSFER: listagem de prestadores, modal de detalhe, painel de moderação e estatísticas no admin.

## [1.2.0] — 2026-05-14
### Adicionado
- Design system com tokens em `@theme`, aplicativo instalável com manifest, service worker e ícones `teal-V`. PR #1 (`feature/design-system-pwa`) mergeada.
- Três idiomas completos, com roteamento por URL e `hreflang` em toda página pública.
- Planos mensal e anual e doação avulsa via Stripe.
- Sitemap gerado no prebuild e prévia social por página.

## [1.1.0] — 2026-05
### Segurança
- Auditoria aplicada nas migrations `20260514_security_audit_2026_05.sql` e `20260514_security_hardening_followup.sql`.
- Triggers anti-elevação em `gostoso_profiles` e `gostoso_businesses`.
- Lista de origens permitidas nas Edge Functions de pagamento.
- Cabeçalhos de segurança em `vercel.json`: HSTS com preload de dois anos, nosniff, frame DENY, referrer estrito, permissions restritiva e CSP com lista explícita, com relatório de violação em `/api/csp-report`.
- Senha com mínimo de 8 caracteres nos formulários de cadastro e de troca.
### Mudança que impacta outras partes
- `gostoso_is_admin()` passa a ser exigida em policies de `gostoso_profiles`. Policy `cmd=ALL` que a invoca precisa de `to authenticated`, senão quebra com 42501 em consulta anônima.

## [1.0.0] — 2026
### Adicionado
- Todos os módulos da Fase 0: COME, FIQUE, PASSEIE, EXPLORE, PARTICIPE, CONHEÇA, APOIE e CONTRATE.

---

**Antes disso** o histórico está em `./memory.md` e no arquivo do cliente no cérebro da Balaio. Esta numeração foi reconstruída em 10/09/2026 a partir desses registros e é aproximada; daqui em diante é mantida em tempo real.
