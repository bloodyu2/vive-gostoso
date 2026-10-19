-- Coordenadas no mar ou longe do endereco (19/10/2026).
-- Antes de mexer, guarda as linhas originais em tabela de backup (sem acesso pela API publica).
-- Depois corrige com a posicao do Google Maps. Quem nao tem ficha no Maps e estava no mar fica sem coordenada (nao apaga o negocio).
-- Reversao: update gostoso_businesses b set lat = k.lat_antes, lng = k.lng_antes from gostoso_businesses_coord_backup_20261019 k where k.id = b.id;

create table if not exists public.gostoso_businesses_coord_backup_20261019 (
  id uuid primary key,
  slug text not null,
  lat_antes numeric,
  lng_antes numeric,
  lat_depois numeric,
  lng_depois numeric,
  fonte text not null,
  corrigido_em timestamptz not null default now()
);
alter table public.gostoso_businesses_coord_backup_20261019 enable row level security;
revoke all on public.gostoso_businesses_coord_backup_20261019 from anon, authenticated;

with novos(slug, lat, lng, fonte) as (values
  ('bar-do-tico', -5.121665, -35.6297061, 'Google Maps: BAR DO TICO'),
  ('bistro-capella', -5.1219408, -35.6343541, 'Google Maps: Bistrô Capella'),
  ('dr-wind', -5.1195898, -35.6205673, 'Google Maps: Dr.WIND Water Sports Club'),
  ('gks-kite-school', -5.1179755, -35.619364, 'Google Maps: GKS kiteschool'),
  ('gostoso-adventure', -5.1229866, -35.6366837, 'Google Maps: Gostoso Adventure'),
  ('gostoso-kitesurf', -5.1197888, -35.6220857, 'Google Maps: Gostoso Kitesurf'),
  ('hara-chales-e-spa', -5.1199209, -35.644232, 'Google Maps: Hara Pousada e SPA'),
  ('kauli-seadi-beach-hotel', -5.1238021, -35.6135025, 'Google Maps: Kauli Seadi Beach Hotel'),
  ('leal-turismo', -5.1239033, -35.631459, 'Google Maps: Leal Turismo Passeios e Locações'),
  ('mar-y-brasa', -5.1193402, -35.620724, 'Google Maps: Mar y Brasa Restaurante & Bar'),
  ('portofino-pousada', -5.1251066, -35.6256464, 'Google Maps: Portofino Pousada'),
  ('pousada-chantilly', -5.1215829, -35.6337148, 'Google Maps: Pousada Chantilly'),
  ('pousada-enseada-do-gostoso', -5.120809, -35.6390075, 'Google Maps: Pousada Enseada (nome parecido, confianca media)'),
  ('pousada-mi-secreto', -5.1196477, -35.6207489, 'Google Maps: Mi Secreto Pousada & Spa'),
  ('pousada-so-alegria', -5.1223724, -35.6365435, 'Google Maps: Pousada Só Alegria'),
  ('pousada-solarium', -5.1262681, -35.6358147, 'Google Maps: Pousada Solarium de Gostoso'),
  ('sampei', -5.1225785, -35.6363765, 'Google Maps: Restaurante Sampei'),
  ('tribo-do-kite', -5.120863, -35.639007, 'Google Maps: Tribo do kite School'),
  ('baboon-restaurante', -5.1222225, -35.6342485, 'Google Maps: Baboon Restaurante (400 m do ponto antigo)'),
  ('ore-cozinha', -5.1224102, -35.6344614, 'Google Maps: Oré Restaurante (500 m do ponto antigo)'),
  ('loja-kite-gostoso', null, null, 'no mar e sem ficha no Google Maps'),
  ('luck-receptivo', null, null, 'no mar e sem ficha no Google Maps'),
  ('mercadao-gostoso', null, null, 'no mar e sem ficha no Google Maps'),
  ('passeio-de-barco-gostoso', null, null, 'no mar e sem ficha no Google Maps'),
  ('salao-brisa-do-mar', null, null, 'no mar e sem ficha no Google Maps')
)
insert into public.gostoso_businesses_coord_backup_20261019 (id, slug, lat_antes, lng_antes, lat_depois, lng_depois, fonte)
select b.id, b.slug, b.lat, b.lng, n.lat::numeric, n.lng::numeric, n.fonte
from novos n join public.gostoso_businesses b on b.slug = n.slug
on conflict (id) do nothing;

update public.gostoso_businesses b
set lat = k.lat_depois, lng = k.lng_depois
from public.gostoso_businesses_coord_backup_20261019 k
where k.id = b.id;
