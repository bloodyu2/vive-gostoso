-- Casa Reduto Artesanato Colaborativo: Instagram, descricao, destaque na home e
-- horario reconferido. Dado de um unico negocio, sem mudanca de esquema nem de
-- permissao. Idempotente: rodar duas vezes deixa o mesmo resultado.
--
-- Fontes (conferidas em 28/10/2026):
-- - Instagram: link da ficha do Google Maps e perfil instagram.com/casareduto.
-- - Descricao: bio do Instagram ("Encontro de artesaos locais, valorizando a
--   cultura do nosso Brasil") e destaques do perfil (madeira, taboa, macrame,
--   croche, carnauba).
-- - Horario: ficha do Maps, 10:00 as 18:00 todos os dias. A bio do Instagram diz
--   09h as 18h; fica o horario do Maps, que ja estava gravado, ate o dono confirmar.
-- - O beneficio do clube (10% de desconto no Pix) ja esta em gostoso_club_partners.

update public.gostoso_businesses
set
  instagram = 'casareduto',
  description = 'Loja colaborativa no Povoado do Reduto: encontro de artesãos locais que valoriza a cultura do Brasil. Peças em madeira, taboa, macramê, crochê e carnaúba. Aberta todos os dias.',
  is_featured = true,
  horario_conferido_em = '2026-10-28',
  horario_fonte = 'google_maps_28_10',
  updated_at = now()
where id = '3cc9ad63-961f-4bad-9275-de0617831536';
