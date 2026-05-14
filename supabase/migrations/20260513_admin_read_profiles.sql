-- Permite admins lerem todos os perfis (necessário para joins no AdminClaims, etc.)
-- Antes desta policy, a única regra em gostoso_profiles era "own profile" (auth_user_id = auth.uid()),
-- então o join `profile:gostoso_profiles(...)` em useClaimsAdmin retornava null para perfis de outros
-- usuários — o componente acessava `claim.profile.email` e a página ficava em branco.

create policy "admin read profiles" on gostoso_profiles for select
  using (
    (select role from gostoso_profiles where auth_user_id = auth.uid()) = 'admin'
  );
