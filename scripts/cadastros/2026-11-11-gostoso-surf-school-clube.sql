-- Gostoso Surf School no guia e no Passaporte Gostoso (11/11/2026), KAN-846. Sem plaquinha (a leva acabou).
--
-- Acordo (WhatsApp do Vive Gostoso, +55 84 8818-2779, confirmado em 10/11/2026): 10% de desconto nas
-- aulas e no aluguel de pranchas de surf e SUP, promocao de verao de dezembro a marco, para iniciante,
-- intermediario e avancado. O aluguel e so para quem ja sabe surfar ou remar (a escola confere pelo
-- WhatsApp) e nao ha aula experimental, por causa da alta temporada.
--
-- Roda UMA vez, logo depois do merge do PR (regra: nada parcial em producao antes do push final).
-- Idempotente: o id e o slug sao unicos e a vantagem so entra uma vez por negocio.
--
-- O QUE TEM E O QUE NAO TEM. So entra dado que veio do combinado: nome, WhatsApp (+55 84 99915-7137),
-- categoria, o que a escola oferece e a logo (arquivo recebido em 10/11 as 11h37 e guardado no Drive da
-- Balaio). Nao ha ficha da escola no Google nem pagina encontrada em 11/11, entao ficam VAZIOS, nao
-- inventados: endereco, lat/lng, horario, Instagram, site e preco. Sem foto real, a capa e a tipografica
-- (cover_url nulo) com a logo por cima; as fotos de aula, prancha e instrutores vem da visita combinada
-- no ticket (planejamento semanal de midia). Por isso is_verified fica falso ate alguem conferir
-- endereco e horario.
--
-- VALIDADE: valido_ate = 2027-03-31. O cupom resgatado antes de 1o de dezembro mostra na regra que a
-- promocao vale a partir de dezembro. A vantagem sai do ar sozinha em 01/04/2027 (a lista e o resgate
-- exigem valido_ate >= hoje). Para encerrar antes: update public.gostoso_club_partners set status = 'pausado'.
--
-- REVERSAO:
--   delete from public.gostoso_club_partners where business_id = '1d6b687c-cc25-4617-a0fa-068908048f74';
--   delete from public.gostoso_businesses where id = '1d6b687c-cc25-4617-a0fa-068908048f74' and slug = 'gostoso-surf-school';
--   (a logo sai junto com o codigo: public/parceiros/gostoso-surf-school/)

insert into public.gostoso_businesses
  (id, name, slug, description, category_id, whatsapp, logo_url, cover_url, photos,
   is_verified, is_featured, plan, active, is_published, services, business_type)
select
  '1d6b687c-cc25-4617-a0fa-068908048f74',
  'Gostoso Surf School',
  'gostoso-surf-school',
  'Escola de surf e SUP em São Miguel do Gostoso. Aulas para iniciantes, intermediários e avançados e aluguel de pranchas de surf e SUP, para quem já sabe surfar ou remar. Combine dia e horário pelo WhatsApp.',
  '5f9e5cb6-864d-4074-b5ac-47fdb3118ef3',
  '5584999157137',
  '/parceiros/gostoso-surf-school/logo.jpg',
  null,
  '{}'::text[],
  false, false, 'free', true, true,
  '[{"name":"Aulas de surf e SUP","price":"","description":"Iniciante, intermediário e avançado"},{"name":"Aluguel de pranchas de surf e SUP","price":"","description":"Para quem já sabe surfar ou remar"}]'::jsonb,
  'local'
where not exists (
  select 1 from public.gostoso_businesses
   where id = '1d6b687c-cc25-4617-a0fa-068908048f74' or slug = 'gostoso-surf-school'
);

insert into public.gostoso_club_partners (business_id, tipo, beneficio, regra, limite_mensal, valido_ate, status)
select '1d6b687c-cc25-4617-a0fa-068908048f74', 'Surf e SUP',
       '10% de desconto em aulas e no aluguel de pranchas de surf e SUP.',
       'Promoção de verão, de dezembro a março. Aluguel só para quem já sabe surfar ou remar; a escola confere pelo WhatsApp. Não há aula experimental.',
       null, date '2027-03-31', 'no_ar'
 where exists (select 1 from public.gostoso_businesses where id = '1d6b687c-cc25-4617-a0fa-068908048f74')
   and not exists (select 1 from public.gostoso_club_partners where business_id = '1d6b687c-cc25-4617-a0fa-068908048f74');

-- Conferir: 1 linha, publicada, sem foto, com logo e a vantagem no_ar com valido_ate 2027-03-31;
-- o contador da /clube passa a contar mais um parceiro (12 de 20).
select b.name, b.slug, b.is_published, b.logo_url, b.whatsapp, array_length(b.photos, 1) as fotos,
       c.status, c.tipo, c.beneficio, c.valido_ate
  from public.gostoso_businesses b
  left join public.gostoso_club_partners c on c.business_id = b.id
 where b.slug = 'gostoso-surf-school';
