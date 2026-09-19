-- KAN-? / migracao Stripe -> Asaas: ancora de cobranca do Asaas para a Vive Gostoso.
--
-- POR QUE ESTA TABELA EXISTE:
--
-- O webhook do Asaas precisa de um lugar para (a) saber a que negocio e a que
-- plano pertence o pagamento e (b) nao aplicar duas vezes o mesmo evento. O
-- padrao da casa resolve isso com uma tabela de cobrancas propria (o
-- balaio-digital usa `contract_payments` e `adhoc_charges`), e nao com coluna de
-- fornecedor no cadastro do cliente.
--
-- O Stripe continua intocado: as colunas `stripe_customer_id` e
-- `stripe_subscription_id` seguem como estao, e as tres edge functions do Stripe
-- seguem ativas. As duas colunas `asaas_*` abaixo sao ADITIVAS.
--
-- Sem policy de leitura publica de proposito: so a service role (as rotas de
-- cobranca e o webhook) toca esta tabela. Nenhuma tela publica precisa dela, e a
-- auditoria KAN-330/KAN-341 mostrou o custo de expor identificador de cobranca.

create table if not exists public.gostoso_asaas_pagamentos (
  id                 uuid primary key default gen_random_uuid(),
  -- referencia externa montada pela rota: 'plano:<businessId>:<plano>:<billing>'
  -- ou 'doacao:<uuid>'. E a chave de correlacao antes de existir payment id.
  external_reference text not null unique,
  tipo               text not null check (tipo in ('plano', 'doacao')),
  asaas_payment_id   text unique,
  asaas_checkout_id  text,
  business_id        uuid references public.gostoso_businesses(id) on delete set null,
  plan               text check (plan in ('associado', 'destaque')),
  billing            text check (billing in ('monthly', 'annual')),
  valor_centavos     int  not null,
  status             text not null default 'pendente'
                       check (status in ('pendente', 'confirmado', 'vencido', 'estornado', 'falhou')),
  invoice_url        text,
  confirmado_em      timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_gostoso_asaas_pagamentos_business
  on public.gostoso_asaas_pagamentos (business_id)
  where business_id is not null;

create trigger trg_gostoso_asaas_pagamentos_updated_at
  before update on public.gostoso_asaas_pagamentos
  for each row execute function update_updated_at();

alter table public.gostoso_asaas_pagamentos enable row level security;

-- Nenhum grant a anon/authenticated: sem SELECT, sem INSERT. Só service_role.
revoke all on table public.gostoso_asaas_pagamentos from anon, authenticated;
grant all on table public.gostoso_asaas_pagamentos to service_role;

-- Cliente e assinatura do Asaas no negocio. ADITIVO: nao toca nas colunas
-- stripe_*. Os triggers anti-autoelevacao (gostoso_guard_business_update/insert) ja
-- reescrevem apenas as colunas que conhecem, entao estas nascem protegidas de
-- escrita pelo dono: o dono so as recebe via service role.
alter table public.gostoso_businesses
  add column if not exists asaas_customer_id     text,
  add column if not exists asaas_subscription_id text;

create index if not exists idx_gostoso_businesses_asaas_sub
  on public.gostoso_businesses (asaas_subscription_id)
  where asaas_subscription_id is not null;
