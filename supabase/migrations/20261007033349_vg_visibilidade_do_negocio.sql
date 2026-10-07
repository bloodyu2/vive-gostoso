-- Visibilidade do negocio: quem decide o que e publico.
--
-- 1. A leitura publica exige `active = true` E `is_published = true`. O dono
--    continua vendo os proprios negocios pela politica "owner write businesses",
--    e o admin pela politica de admin.
-- 2. `active` passa a ser decisao do admin: o trigger de atualizacao o mantem
--    como estava quando quem altera nao e admin. `is_published` segue com o dono
--    (publicar e despublicar o proprio negocio).
--
-- Nenhuma linha e alterada. Hoje: 183 negocios ativos e publicados, 2 inativos.
--
-- REVERSAO (rodar para desfazer):
--   drop policy "public read businesses" on public.gostoso_businesses;
--   create policy "public read businesses" on public.gostoso_businesses for select using (active = true);
--   create or replace function public.gostoso_guard_business_update() returns trigger
--     language plpgsql security definer set search_path to 'public' as $f$
--   declare is_admin boolean;
--   begin
--     if auth.uid() is null then return new; end if;
--     select exists (select 1 from gostoso_profiles where auth_user_id = auth.uid() and role = 'admin') into is_admin;
--     if is_admin then return new; end if;
--     new.plan := old.plan; new.is_featured := old.is_featured; new.is_verified := old.is_verified;
--     new.display_order := old.display_order; new.stripe_customer_id := old.stripe_customer_id;
--     new.stripe_subscription_id := old.stripe_subscription_id; new.plan_expires_at := old.plan_expires_at;
--     new.profile_id := old.profile_id;
--     return new;
--   end;
--   $f$;

create or replace function public.gostoso_guard_business_update()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  is_admin boolean;
begin
  -- Service role (auth.uid() nulo) passa.
  if auth.uid() is null then
    return new;
  end if;

  select exists (
    select 1 from gostoso_profiles
    where auth_user_id = auth.uid() and role = 'admin'
  ) into is_admin;

  if is_admin then
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

  return new;
end;
$$;

drop policy if exists "public read businesses" on public.gostoso_businesses;

create policy "public read businesses"
  on public.gostoso_businesses for select
  using (active = true and is_published = true);
