-- CONTRATE module: freelancers e vagas de emprego
-- Rodar no Supabase SQL Editor

-- Serviços oferecidos por moradores/freelancers
create table if not exists public.gostoso_service_listings (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  headline         text not null,
  description      text,
  service_category text not null check (service_category in ('transporte','guia','domestico','construcao','gastronomia','midia','outro')),
  photo_url        text,
  whatsapp         text not null,
  is_active        boolean not null default false,
  is_featured      boolean not null default false,
  created_at       timestamptz not null default now()
);

-- Vagas de emprego abertas pelos negócios
create table if not exists public.gostoso_job_listings (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid references public.gostoso_businesses(id) on delete set null,
  business_name text not null,
  title         text not null,
  description   text,
  contract_type text not null check (contract_type in ('clt','freelance','temporario','estagio')),
  whatsapp      text not null,
  is_active     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- RLS: leitura pública apenas de registros ativos
alter table public.gostoso_service_listings enable row level security;
alter table public.gostoso_job_listings     enable row level security;

-- Qualquer um pode ver o que está ativo
create policy "service_listings_public_read" on public.gostoso_service_listings
  for select using (is_active = true);

create policy "job_listings_public_read" on public.gostoso_job_listings
  for select using (is_active = true);

-- Qualquer um pode enviar um cadastro (fica inativo até admin aprovar)
create policy "service_listings_public_insert" on public.gostoso_service_listings
  for insert with check (is_active = false and is_featured = false);

create policy "job_listings_public_insert" on public.gostoso_job_listings
  for insert with check (is_active = false);

-- Só admins podem atualizar/deletar (via service role key no painel)
-- Adicionar políticas de update/delete para perfis admin quando o painel admin for criado
