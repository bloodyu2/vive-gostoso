-- Aprovacao de claim atomica: antes eram 4 mutations sequenciais no client.
-- Se a 3a ou 4a falhasse, o banco ficava inconsistente (claim aprovado sem vinculo).
-- Functions plpgsql sao transacionais: qualquer erro reverte tudo.
create or replace function public.gostoso_approve_claim(
  p_claim_id uuid,
  p_business_id uuid,
  p_profile_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not gostoso_is_admin() then
    raise exception 'not authorized';
  end if;

  update gostoso_claim_requests
     set status = 'approved', resolved_at = now()
   where id = p_claim_id;

  update gostoso_businesses
     set profile_id = p_profile_id, is_verified = true
   where id = p_business_id;

  update gostoso_profiles
     set business_id = p_business_id
   where id = p_profile_id;

  insert into gostoso_notifications (profile_id, type, title, body, link)
  values (
    p_profile_id,
    'claim_approved',
    'Negocio aprovado!',
    'Seu pedido foi aprovado. Voce ja pode gerenciar seu perfil.',
    '/cadastre/painel'
  );
end;
$$;

revoke execute on function public.gostoso_approve_claim(uuid, uuid, uuid) from anon, public;
grant execute on function public.gostoso_approve_claim(uuid, uuid, uuid) to authenticated;
