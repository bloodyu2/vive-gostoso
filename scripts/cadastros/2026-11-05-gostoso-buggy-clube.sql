-- Gostoso Buggy no Passaporte Gostoso (05/11/2026), ultimo parceiro da abertura (plaquinha /p/10).
--
-- Acordo do Victor: 10% de desconto no Pix para quem vier pelo Passaporte. Roda UMA vez, logo
-- depois do merge do PR (regra: nada parcial em producao antes do push final). Idempotente.
--
-- O banco guardava o Instagram `gostosobuggy`, que nao existe (a pagina devolve "nao esta
-- disponivel"); o perfil do negocio e `gostosobuggyturismo` ("Gostoso Buggy | Passeios",
-- site gostosobuggy.com.br).
--
-- REVERSAO:
--   delete from public.gostoso_club_partners where business_id = '9620b36c-4a66-474c-99eb-0974a58dc287';
--   update public.gostoso_businesses set instagram = 'gostosobuggy' where id = '9620b36c-4a66-474c-99eb-0974a58dc287';

update public.gostoso_businesses
   set instagram = 'gostosobuggyturismo', updated_at = now()
 where id = '9620b36c-4a66-474c-99eb-0974a58dc287' and slug = 'gostoso-buggy';

insert into public.gostoso_club_partners (business_id, tipo, beneficio, regra, status)
select '9620b36c-4a66-474c-99eb-0974a58dc287', 'Passeios', '10% de desconto no Pix.',
       'Vale para quem mostrar o cupom do Passaporte Gostoso e pagar no Pix.', 'no_ar'
 where exists (select 1 from public.gostoso_businesses where id = '9620b36c-4a66-474c-99eb-0974a58dc287')
   and not exists (select 1 from public.gostoso_club_partners where business_id = '9620b36c-4a66-474c-99eb-0974a58dc287');

-- Conferir: deve devolver 1 linha no_ar, e o contador da /clube passa a dizer 9 de 20.
select b.name, b.instagram, c.status, c.beneficio from public.gostoso_club_partners c
  join public.gostoso_businesses b on b.id = c.business_id where c.business_id = '9620b36c-4a66-474c-99eb-0974a58dc287';
