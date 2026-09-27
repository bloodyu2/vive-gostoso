-- 20260927_gostoso_mares.sql
-- Tabua de mares (pagina /explore/mares). Uma linha por mare alta ou baixa de
-- uma estacao da Marinha do Brasil (CHM/DHN). Preenchida pelo importador
-- scripts/mares/importar-tabua-marinha.ts com a service role.
--
-- data_hora e timestamptz: o importador grava com deslocamento -03:00
-- (America/Fortaleza, o "Fuso UTC -03.0" impresso na tabua).
--
-- Leitura publica pela RLS; escrita so pela service role (que tem BYPASSRLS).
-- Nao existe policy de escrita, entao anon e authenticated nao escrevem mesmo
-- com os grants do template obrigatorio (decisoes.md).

create table if not exists public.gostoso_mares (
  id bigint generated always as identity primary key,
  estacao text not null,
  data_hora timestamptz not null,
  altura_m numeric(4,2) not null,
  tipo text not null check (tipo in ('alta', 'baixa')),
  fonte text not null,
  ano smallint not null,
  criado_em timestamptz not null default now(),
  constraint gostoso_mares_estacao_data_hora_key unique (estacao, data_hora)
);

comment on table public.gostoso_mares is
  'Previsao de mares (Tabuas de Mare da Marinha do Brasil, CHM/DHN). Escrita so pelo importador com service role.';

create index if not exists gostoso_mares_data_hora_idx on public.gostoso_mares (data_hora);

alter table public.gostoso_mares enable row level security;

drop policy if exists "leitura publica das mares" on public.gostoso_mares;
create policy "leitura publica das mares"
  on public.gostoso_mares
  for select
  to anon, authenticated
  using (true);

-- Template obrigatorio de grants (decisoes.md). A escrita de anon e
-- authenticated continua bloqueada: nao ha policy de insert/update/delete.
grant select on public.gostoso_mares to anon;
grant select, insert, update, delete on public.gostoso_mares to authenticated;
grant all on public.gostoso_mares to service_role;
