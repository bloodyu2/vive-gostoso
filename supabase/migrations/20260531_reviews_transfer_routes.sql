-- supabase/migrations/20260531_reviews_transfer_routes.sql
-- Adiciona suporte a reviews em Transfer providers + constraint multi-target

-- 1. Adicionar coluna transfer_id
alter table public.gostoso_reviews
  add column transfer_id uuid references public.gostoso_transfers(id) on delete cascade;

-- 2. Atualizar constraint: exatamente um alvo por review (business OU professional OU transfer)
alter table public.gostoso_reviews
  drop constraint if exists reviews_one_target;

alter table public.gostoso_reviews
  add constraint reviews_one_target check (
    (business_id is not null)::integer +
    (professional_id is not null)::integer +
    (transfer_id is not null)::integer = 1
  );

-- 3. Índice para buscas por transfer
create index if not exists idx_gostoso_reviews_transfer
  on public.gostoso_reviews(transfer_id, approved);

-- 4. Atualizar RLS: permitir insert com transfer_id (approved=false)
drop policy if exists "public_insert_review" on public.gostoso_reviews;
create policy "public_insert_review"
  on public.gostoso_reviews for insert
  with check (
    approved = false
    and (
      (business_id is not null)::integer +
      (professional_id is not null)::integer +
      (transfer_id is not null)::integer = 1
    )
  );

-- Grants obrigatórios
grant select on public.gostoso_reviews to anon;
grant select, insert, update, delete on public.gostoso_reviews to authenticated;
grant all on public.gostoso_reviews to service_role;
