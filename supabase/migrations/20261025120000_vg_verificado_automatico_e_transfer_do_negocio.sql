-- 1. Negocio que a gente inscreve ou aprova ja sai verificado (Victor, 25/10/2026).
--    * INSERT feito por admin ou service role (auth.uid() nulo): is_verified = true.
--    * UPDATE feito por admin ou service role que publica um negocio ainda nao
--      publicado: is_verified = true.
--    Dono e visitante seguem sem poder mexer em is_verified (trigger como antes).
-- 2. gostoso_businesses.transfer_id: liga o negocio a um transfer ja cadastrado
--    (ex.: Espetinho do Galego -> transfer do Jonath). Nao mexe em
--    gostoso_transfers.business_id, que continua dono das avaliacoes do transfer.
--
-- REVERSAO:
--   alter table public.gostoso_businesses drop column transfer_id;
--   e recriar as duas funcoes como em 20261007033349_vg_visibilidade_do_negocio.sql
--   (update) e 20260514_security_audit_2026_05.sql (insert).

alter table public.gostoso_businesses
  add column if not exists transfer_id uuid references public.gostoso_transfers(id) on delete set null;

grant select (transfer_id) on table public.gostoso_businesses to anon;
grant select (transfer_id) on table public.gostoso_businesses to authenticated;

create or replace function public.gostoso_guard_business_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  -- Service role (auth.uid() nulo): inscricao nossa, sai verificada.
  if auth.uid() is null then
    new.is_verified := true;
    return new;
  end if;

  select exists (
    select 1 from gostoso_profiles
    where auth_user_id = auth.uid() and role = 'admin'
  ) into is_admin;

  if is_admin then
    new.is_verified := true;
    return new;
  end if;

  new.plan                   := 'free';
  new.is_featured            := false;
  new.is_verified            := false;
  new.display_order          := 0;
  new.stripe_customer_id     := null;
  new.stripe_subscription_id := null;
  new.plan_expires_at        := null;
  new.transfer_id            := null;

  return new;
end;
$$;

create or replace function public.gostoso_guard_business_update()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  is_admin boolean;
begin
  -- Service role (auth.uid() nulo): aprovacao nossa.
  if auth.uid() is null then
    if new.is_published and not coalesce(old.is_published, false) then
      new.is_verified := true;
    end if;
    return new;
  end if;

  select exists (
    select 1 from gostoso_profiles
    where auth_user_id = auth.uid() and role = 'admin'
  ) into is_admin;

  if is_admin then
    if new.is_published and not coalesce(old.is_published, false) then
      new.is_verified := true;
    end if;
    return new;
  end if;

  -- Nao admin: estas colunas ficam como estavam.
  new.plan                   := old.plan;
  new.is_featured            := old.is_featured;
  new.is_verified            := old.is_verified;
  new.display_order          := old.display_order;
  new.stripe_customer_id     := old.stripe_customer_id;
  new.stripe_subscription_id := old.stripe_subscription_id;
  new.plan_expires_at        := old.plan_expires_at;
  new.profile_id             := old.profile_id;
  new.active                 := old.active;
  new.transfer_id            := old.transfer_id;

  return new;
end;
$$;
