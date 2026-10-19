-- Selo prata e Cafe com Biscoitos Damy (18/10/2026).
-- Ainda NAO aplicado quando este arquivo foi escrito: roda depois do deploy do codigo.
--
-- 1) Os negocios com conta de dono, ativos e sem verificacao passam a verificados
--    (o dono confirmou o cadastro). Farmacia Verde fica de fora: desativada pela
--    equipe. Os 115 perfis da plataforma sem dono NAO entram: verificado exige
--    confirmacao por um responsavel.
-- 2) Cadastra o Cafe com Biscoitos Damy como perfil da plataforma (profile_id
--    nulo, gerido pela Balaio), com o aval da Damy. Dados do Google Maps
--    conferidos em 18/10/2026. Fotos em public/negocios/biscoitos-damy/.
--
-- Reversao:
--   delete from gostoso_businesses where slug = 'cafe-com-biscoitos-damy';
--   update gostoso_businesses set is_verified = false
--     where slug in ('chale-gostoso-smg','o-pico-surf-skate-shop','victoria-ribeiro-penteados');

update gostoso_businesses
   set is_verified = true
 where slug in ('chale-gostoso-smg', 'o-pico-surf-skate-shop', 'victoria-ribeiro-penteados')
   and active = true
   and is_verified = false;

insert into gostoso_businesses (
  name, slug, description, category_id, profile_id, address, lat, lng,
  phone, whatsapp, instagram, cover_url, photos, opening_hours,
  is_verified, is_featured, plan, active, display_order, is_published,
  business_type, horario_conferido_em, horario_fonte
)
select
  'Café com Biscoitos Damy',
  'cafe-com-biscoitos-damy',
  'Cafeteria na Praia de Tourinhos, com biscoitos caseiros, bolos, tapioca e café coado, servidos na areia. A Damy faz os biscoitos (raivinha, castanha com doce de caju, nata com goiaba, casadinho, salgado de queijo coalho) e também vende para levar.',
  '9d9f0af4-2218-4ffb-a417-6e7b73b55a73',
  null,
  'Praia de Tourinhos, São Miguel do Gostoso/RN',
  -5.1044749,
  -35.6995711,
  '(84) 98141-7096',
  '5584981417096',
  'biscoitos_damy',
  '/negocios/biscoitos-damy/ambiente.jpg',
  array['/negocios/biscoitos-damy/tapioca.jpg', '/negocios/biscoitos-damy/noite.jpg'],
  '{"dom":{"open":"11:00","close":"19:00","closed":false},"seg":{"open":"11:00","close":"19:00","closed":false},"ter":{"open":"11:00","close":"19:00","closed":false},"qua":{"open":"11:00","close":"19:00","closed":false},"qui":{"open":"11:00","close":"19:00","closed":false},"sex":{"open":"11:00","close":"19:00","closed":false},"sab":{"open":"11:00","close":"19:00","closed":false}}'::jsonb,
  true, false, 'free', true, 100, true,
  'local', date '2026-10-18', 'google_maps_18_10'
where not exists (select 1 from gostoso_businesses where slug = 'cafe-com-biscoitos-damy');
