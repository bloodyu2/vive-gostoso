-- Permite admins lerem todos os perfis (necessário para joins no AdminClaims, etc.)
-- Antes desta migration, a única regra em gostoso_profiles era "own profile"
-- (auth_user_id = auth.uid()), então o join `profile:gostoso_profiles(...)` em
-- useClaimsAdmin retornava null para perfis de outros usuários — o componente
-- acessava `claim.profile.email` e a página ficava em branco.
--
-- Importante: a função `gostoso_is_admin()` é SECURITY DEFINER para evitar
-- recursão infinita (uma policy em gostoso_profiles que consulta
-- gostoso_profiles dispara o erro 42P17).

create or replace function public.gostoso_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from gostoso_profiles
    where auth_user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.gostoso_is_admin() from public;
grant execute on function public.gostoso_is_admin() to authenticated, anon, service_role;

create policy "admin read profiles" on gostoso_profiles for select
  using (public.gostoso_is_admin());
