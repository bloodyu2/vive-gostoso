-- =============================================================
-- SEED: Vive Gostoso - dados reais de São Miguel do Gostoso, RN
-- Última atualização: 2026-04-27
-- Fontes: TripAdvisor, Instagram, Blumar Turismo, sites próprios
-- =============================================================

-- Categories
INSERT INTO gostoso_categories (name, slug, verb, icon, color, display_order) VALUES
  ('Restaurantes',    'restaurantes',    'come',     'utensils',     '#E05A3A', 1),
  ('Bares',           'bares',           'come',     'beer',         '#C97D2A', 2),
  ('Pousadas',        'pousadas',        'fique',    'bed-double',   '#0D7C7C', 3),
  ('Kite & Windsurf', 'kite-windsurf',   'passeie',  'wind',         '#C97D2A', 5),
  ('Buggy & Quad',    'buggy',           'passeie',  'car',          '#A05E1A', 6),
  ('Passeios',        'passeios',        'passeie',  'map-pin',      '#3D8B5A', 4),
  ('Artesanato',      'artesanato',      'passeie',  'shopping-bag', '#737373', 7)
ON CONFLICT (slug) DO NOTHING;


-- =============================================================
-- COME -- Restaurantes e bares
-- =============================================================

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Baboon Restaurante', 'baboon-restaurante',
  'Um dos mais tradicionais de Gostoso, direto na Avenida dos Arrecifes. Cardápio amplo com peixes, frutos do mar e pratos nordestinos, em ambiente despretensioso e sempre cheio. Favorito dos moradores e dos turistas que voltam todo ano.',
  id,
  'Av. dos Arrecifes, 1939, São Miguel do Gostoso, RN',
  -5.1178, -35.4958,
  '(84) 99462-8071', '5584994628071',
  'baboon_restaurante',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1559304822-9eb2813c9095?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop'
  ],
  true, true, 'associado', 1,
  '{"seg":{"open":"11:00","close":"22:00","closed":false},"ter":{"open":"11:00","close":"22:00","closed":false},"qua":{"open":"11:00","close":"22:00","closed":false},"qui":{"open":"11:00","close":"22:00","closed":false},"sex":{"open":"11:00","close":"23:00","closed":false},"sab":{"open":"10:00","close":"23:00","closed":false},"dom":{"open":"10:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Bistrô Capella', 'bistro-capella',
  'O #1 do TripAdvisor em Gostoso. Pequeno, aconchegante, na Rua Praia da Xepa. Cardápio autoral com influências regionais, massas frescas e um dos melhores vinhos da cidade. Reservas com antecedência.',
  id,
  'Rua Praia da Xepa, 149B, São Miguel do Gostoso, RN',
  -5.1195, -35.4982,
  NULL, NULL,
  NULL,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop'
  ],
  true, true, 'associado', 2,
  '{"seg":{"open":"00:00","close":"00:00","closed":true},"ter":{"open":"18:00","close":"23:00","closed":false},"qua":{"open":"18:00","close":"23:00","closed":false},"qui":{"open":"18:00","close":"23:00","closed":false},"sex":{"open":"18:00","close":"23:00","closed":false},"sab":{"open":"18:00","close":"23:00","closed":false},"dom":{"open":"18:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, website, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Vitor B Lá Pasta', 'vitor-b-la-pasta',
  'Massas artesanais feitas na hora, numa casa cheia de personalidade na Rua Cavalo Marinho. O Vitor é chef e anfitrião -- a combinação perfeita para uma noite que não se esquece em Gostoso.',
  id,
  'Rua Cavalo Marinho, 20-A, São Miguel do Gostoso, RN',
  -5.1215, -35.4990,
  '(84) 99139-7001', '5584991397001',
  'restaurantevitorb_smg',
  NULL,
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop'
  ],
  true, false, 'associado', 3,
  '{"seg":{"open":"00:00","close":"00:00","closed":true},"ter":{"open":"19:00","close":"23:00","closed":false},"qua":{"open":"19:00","close":"23:00","closed":false},"qui":{"open":"19:00","close":"23:00","closed":false},"sex":{"open":"19:00","close":"23:30","closed":false},"sab":{"open":"12:00","close":"15:00","closed":false},"dom":{"open":"12:00","close":"15:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Oré Cozinha', 'ore-cozinha',
  'Novidade que virou destaque rapidinho. Fettuccine com ovas de ouriço, risoto de rubação com linguiça suína caseira -- ingredientes do litoral do RN num cardápio que respeita o território. Uma das surpresas gastronômicas de Gostoso.',
  id,
  'Rua Praia da Xepa, 50, São Miguel do Gostoso, RN',
  -5.1200, -35.4985,
  '(84) 98119-5083', '5584981195083',
  'ore.cozinha',
  'https://images.unsplash.com/photo-1559304822-9eb2813c9095?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop'
  ],
  true, false, 'associado', 4,
  '{"seg":{"open":"00:00","close":"00:00","closed":true},"ter":{"open":"18:30","close":"23:00","closed":false},"qua":{"open":"18:30","close":"23:00","closed":false},"qui":{"open":"18:30","close":"23:00","closed":false},"sex":{"open":"12:00","close":"15:00","closed":false},"sab":{"open":"12:00","close":"15:00","closed":false},"dom":{"open":"12:00","close":"15:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Mar y Brasa', 'mar-y-brasa',
  'Cozinha regional encontra o Mediterrâneo. Massas artesanais e peixes frescos pescados no litoral do RN, numa casa com jeitão de quem conhece a história do lugar. Um dos mais elogiados da cidade.',
  id,
  'Rua Ponta do Santo Cristo, São Miguel do Gostoso, RN',
  -5.1145, -35.4912,
  NULL, NULL,
  'marybrasarestaurante',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559304822-9eb2813c9095?w=800&auto=format&fit=crop'
  ],
  true, false, 'associado', 5,
  '{"seg":{"open":"12:00","close":"22:00","closed":false},"ter":{"open":"12:00","close":"22:00","closed":false},"qua":{"open":"12:00","close":"22:00","closed":false},"qui":{"open":"12:00","close":"22:00","closed":false},"sex":{"open":"12:00","close":"23:00","closed":false},"sab":{"open":"12:00","close":"23:00","closed":false},"dom":{"open":"12:00","close":"21:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Afetuoso Bistrô & Lavanderia', 'afetuoso-bistro',
  'O nome é exato: afetuoso. Culinária asiática e saudável num ambiente que mistura bistrô e galeria. Funciona à noite, de segunda a sábado. Um dos mais bem avaliados do TripAdvisor.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1220, -35.4995,
  NULL, NULL,
  'afetuosogostoso',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop'
  ],
  true, false, 'free', 6,
  '{"seg":{"open":"18:00","close":"22:00","closed":false},"ter":{"open":"18:00","close":"22:00","closed":false},"qua":{"open":"18:00","close":"22:00","closed":false},"qui":{"open":"18:00","close":"22:00","closed":false},"sex":{"open":"18:00","close":"22:00","closed":false},"sab":{"open":"18:00","close":"22:00","closed":false},"dom":{"open":"00:00","close":"00:00","closed":true}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Bambuareca Restaurante Bar', 'bambuareca',
  'Restaurante bar na Av. dos Arrecifes com jeito de casa de praia: bambuzal, vento, música boa. Comida regional com frutos do mar. Um lugar pra ficar mais tempo do que você planejou.',
  id,
  'Av. dos Arrecifes, 1268, São Miguel do Gostoso, RN',
  -5.1172, -35.4952,
  '(84) 98127-2991', '5584981272991',
  'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1552566626-52f8b828329d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop'
  ],
  true, false, 'free', 7,
  '{"seg":{"open":"11:00","close":"22:00","closed":false},"ter":{"open":"11:00","close":"22:00","closed":false},"qua":{"open":"11:00","close":"22:00","closed":false},"qui":{"open":"11:00","close":"22:00","closed":false},"sex":{"open":"11:00","close":"23:00","closed":false},"sab":{"open":"11:00","close":"23:00","closed":false},"dom":{"open":"11:00","close":"21:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Sampei', 'sampei',
  'A melhor opção de peixe em Gostoso, segundo quem entende. O modelo é simples e especial: você escolhe o peixe com o chef, e ele prepara na hora. Frescor que chega na mesa. Favorito dos mais exigentes.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1185, -35.4965,
  NULL, NULL,
  'https://images.unsplash.com/photo-1559304822-9eb2813c9095?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop'
  ],
  true, false, 'free', 8,
  '{"seg":{"open":"12:00","close":"22:00","closed":false},"ter":{"open":"12:00","close":"22:00","closed":false},"qua":{"open":"12:00","close":"22:00","closed":false},"qui":{"open":"12:00","close":"22:00","closed":false},"sex":{"open":"12:00","close":"23:00","closed":false},"sab":{"open":"12:00","close":"23:00","closed":false},"dom":{"open":"12:00","close":"21:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Pizzaria Trilha do Vento', 'trilha-do-vento',
  'Pizzas artesanais com boa massa e ingredientes frescos, na Av. dos Arrecifes. Uma opção diferente num destino dominado pelo peixe -- e muito bem executada. Ideal para noites com vento e fome de pizza.',
  id,
  'Av. dos Arrecifes, 1597, São Miguel do Gostoso, RN',
  -5.1175, -35.4955,
  '(84) 99152-7218', '5584991527218',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop'
  ],
  true, false, 'free', 9,
  '{"seg":{"open":"00:00","close":"00:00","closed":true},"ter":{"open":"18:00","close":"23:00","closed":false},"qua":{"open":"18:00","close":"23:00","closed":false},"qui":{"open":"18:00","close":"23:00","closed":false},"sex":{"open":"18:00","close":"23:30","closed":false},"sab":{"open":"18:00","close":"23:30","closed":false},"dom":{"open":"18:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Spaço Mix', 'spaco-mix',
  'Fica dentro da Pousada Na Praia Brasil, na Rua Cavalo Marinho. Cardápio variado com opções do mar e da terra, num ambiente de pousada cheirando a brisa. Almoço e jantar com boa qualidade.',
  id,
  'Rua Cavalo Marinho, 40, São Miguel do Gostoso, RN',
  -5.1218, -35.4993,
  '(84) 99199-4641', '5584991994641',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop'
  ],
  false, false, 'free', 10,
  '{"seg":{"open":"11:00","close":"22:00","closed":false},"ter":{"open":"11:00","close":"22:00","closed":false},"qua":{"open":"11:00","close":"22:00","closed":false},"qui":{"open":"11:00","close":"22:00","closed":false},"sex":{"open":"11:00","close":"23:00","closed":false},"sab":{"open":"11:00","close":"23:00","closed":false},"dom":{"open":"11:00","close":"21:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

-- Bares
INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Bar do Tico', 'bar-do-tico',
  'Bar na beira da Praia do Cardeiro, pé na areia de verdade. Caipirinhas geladas, petiscos de frutos do mar, aquele som que combina com o vento. O tipo de lugar que ninguém esquece depois de conhecer.',
  id,
  'Av. Enseada das Baleias, 869, Praia do Cardeiro, São Miguel do Gostoso, RN',
  -5.1160, -35.4930,
  '(84) 99403-5461', '5584994035461',
  'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1552566626-52f8b828329d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop'
  ],
  true, true, 'associado', 1,
  '{"seg":{"open":"11:00","close":"22:00","closed":false},"ter":{"open":"11:00","close":"22:00","closed":false},"qua":{"open":"11:00","close":"22:00","closed":false},"qui":{"open":"11:00","close":"22:00","closed":false},"sex":{"open":"11:00","close":"23:30","closed":false},"sab":{"open":"10:00","close":"23:30","closed":false},"dom":{"open":"10:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'bares'
ON CONFLICT (slug) DO NOTHING;


-- =============================================================
-- FIQUE -- Pousadas
-- =============================================================

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, website, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Pousada Mi Secreto', 'pousada-mi-secreto',
  'Uma das pousadas mais amadas de Gostoso, na Ponta do Santo Cristo. 137 mil seguidores no Instagram por um motivo: café da manhã impecável, quartos lindos e aquela vista que faz você marcar a viagem seguinte antes de sair.',
  id,
  'Ponta do Santo Cristo, São Miguel do Gostoso, RN',
  -5.1138, -35.4905,
  NULL, NULL,
  'pousadamisecreto',
  'https://misecretopousada.com',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop'
  ],
  true, true, 'associado', 1,
  '{"seg":{"open":"08:00","close":"22:00","closed":false},"ter":{"open":"08:00","close":"22:00","closed":false},"qua":{"open":"08:00","close":"22:00","closed":false},"qui":{"open":"08:00","close":"22:00","closed":false},"sex":{"open":"08:00","close":"22:00","closed":false},"sab":{"open":"08:00","close":"22:00","closed":false},"dom":{"open":"08:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'pousadas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Awara Pousada Boutique', 'awara-pousada',
  'Pousada boutique com suítes em chalés, cada uma envolta em água com piscina privativa. 52 mil seguidores e avaliações entusiasmadas. Fica a 2,1 km da Praia do Santo Cristo. Uma das mais sofisticadas de Gostoso.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1155, -35.4925,
  NULL, NULL,
  'awarapousada',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1551882547-ff40c63fe2e8?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop'
  ],
  true, true, 'associado', 2,
  '{"seg":{"open":"08:00","close":"22:00","closed":false},"ter":{"open":"08:00","close":"22:00","closed":false},"qua":{"open":"08:00","close":"22:00","closed":false},"qui":{"open":"08:00","close":"22:00","closed":false},"sex":{"open":"08:00","close":"22:00","closed":false},"sab":{"open":"08:00","close":"22:00","closed":false},"dom":{"open":"08:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'pousadas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Portofino Pousada', 'portofino-pousada',
  'Uma das mais bem avaliadas do TripAdvisor. Ambiente com toque italiano, a 12 minutos da Praia do Cardeiro. Piscina, estacionamento gratuito, bar e jardim. 30 mil seguidores confirmam a qualidade.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1168, -35.4942,
  NULL, NULL,
  'portofino_pousada',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
  ],
  true, false, 'associado', 3,
  '{"seg":{"open":"08:00","close":"22:00","closed":false},"ter":{"open":"08:00","close":"22:00","closed":false},"qua":{"open":"08:00","close":"22:00","closed":false},"qui":{"open":"08:00","close":"22:00","closed":false},"sex":{"open":"08:00","close":"22:00","closed":false},"sab":{"open":"08:00","close":"22:00","closed":false},"dom":{"open":"08:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'pousadas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Pousada Chantilly', 'pousada-chantilly',
  'Feel at home -- é o que dizem Michelle e Fábio, os donos. E é exatamente o que acontece. Na Praia da Xêpa, com vista linda e aquele acolhimento de anfitrião que não se acha nos grandes hotéis.',
  id,
  'Praia da Xêpa, São Miguel do Gostoso, RN',
  -5.1198, -35.4980,
  NULL, NULL,
  'pousadachantilly',
  'https://images.unsplash.com/photo-1587874522487-fe10e954d035?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop'
  ],
  true, false, 'free', 4,
  '{"seg":{"open":"08:00","close":"22:00","closed":false},"ter":{"open":"08:00","close":"22:00","closed":false},"qua":{"open":"08:00","close":"22:00","closed":false},"qui":{"open":"08:00","close":"22:00","closed":false},"sex":{"open":"08:00","close":"22:00","closed":false},"sab":{"open":"08:00","close":"22:00","closed":false},"dom":{"open":"08:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'pousadas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, website, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Pousada Só Alegria', 'pousada-so-alegria',
  'No coração de Gostoso, na frente do mar. Romano e Fátima comandam com jeito de casa de família. Café da manhã nordestino, equipe atenciosa e aquela energia de quem ama receber.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1188, -35.4970,
  NULL, NULL,
  NULL,
  'https://www.pousadasoalegria.com.br',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe2e8?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop'
  ],
  true, false, 'free', 5,
  '{"seg":{"open":"08:00","close":"22:00","closed":false},"ter":{"open":"08:00","close":"22:00","closed":false},"qua":{"open":"08:00","close":"22:00","closed":false},"qui":{"open":"08:00","close":"22:00","closed":false},"sex":{"open":"08:00","close":"22:00","closed":false},"sab":{"open":"08:00","close":"22:00","closed":false},"dom":{"open":"08:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'pousadas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Kauli Seadi Beach Hotel', 'kauli-seadi-beach-hotel',
  'O único hotel de Gostoso com nome de atleta -- Kauli Seadi, campeão mundial de windsurf que nasceu aqui. Estrutura completa, na beira da praia, com escola de windsurf e kite integrada. O destino certo para quem vem para os esportes.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1170, -35.4945,
  NULL, NULL,
  NULL,
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop'
  ],
  true, false, 'free', 6,
  '{"seg":{"open":"08:00","close":"22:00","closed":false},"ter":{"open":"08:00","close":"22:00","closed":false},"qua":{"open":"08:00","close":"22:00","closed":false},"qui":{"open":"08:00","close":"22:00","closed":false},"sex":{"open":"08:00","close":"22:00","closed":false},"sab":{"open":"08:00","close":"22:00","closed":false},"dom":{"open":"08:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'pousadas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, website, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Pousada Enseada do Gostoso', 'pousada-enseada-do-gostoso',
  'Frente ao mar, uma das mais bem posicionadas de toda a orla. Chalés, piscina, bar na piscina e aquele café da manhã que é o motivo de muita gente voltar. Tem site próprio e reservas diretas.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1182, -35.4962,
  NULL, NULL,
  NULL,
  'https://pousadaenseadadogostoso.com.br',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop'
  ],
  true, false, 'free', 7,
  '{"seg":{"open":"08:00","close":"22:00","closed":false},"ter":{"open":"08:00","close":"22:00","closed":false},"qua":{"open":"08:00","close":"22:00","closed":false},"qui":{"open":"08:00","close":"22:00","closed":false},"sex":{"open":"08:00","close":"22:00","closed":false},"sab":{"open":"08:00","close":"22:00","closed":false},"dom":{"open":"08:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'pousadas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Hara Chalés e Spa', 'hara-chales-e-spa',
  'Pousada que vai além: tem spa. Chalés confortáveis, piscina, diferentes tipos de acomodação e cuidados corporais no meio do Nordeste. Uma das mais completas de Gostoso para quem quer descanso de verdade.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1192, -35.4975,
  NULL, NULL,
  NULL,
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1587874522487-fe10e954d035?w=800&auto=format&fit=crop'
  ],
  true, false, 'free', 8,
  '{"seg":{"open":"08:00","close":"22:00","closed":false},"ter":{"open":"08:00","close":"22:00","closed":false},"qua":{"open":"08:00","close":"22:00","closed":false},"qui":{"open":"08:00","close":"22:00","closed":false},"sex":{"open":"08:00","close":"22:00","closed":false},"sab":{"open":"08:00","close":"22:00","closed":false},"dom":{"open":"08:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'pousadas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Pousada Recanto da Praia', 'pousada-recanto-da-praia',
  'Direto na Praia Xêpa, com bar na praia e piscinas para adultos e crianças. Ideal para família. Uma das pousadas beira-mar mais completas de Gostoso.',
  id,
  'Praia Xêpa, São Miguel do Gostoso, RN',
  -5.1202, -35.4988,
  NULL, NULL,
  NULL,
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1551882547-ff40c63fe2e8?w=800&auto=format&fit=crop'
  ],
  true, false, 'free', 9,
  '{"seg":{"open":"08:00","close":"22:00","closed":false},"ter":{"open":"08:00","close":"22:00","closed":false},"qua":{"open":"08:00","close":"22:00","closed":false},"qui":{"open":"08:00","close":"22:00","closed":false},"sex":{"open":"08:00","close":"22:00","closed":false},"sab":{"open":"08:00","close":"22:00","closed":false},"dom":{"open":"08:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'pousadas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Pousada Solarium de Gostoso', 'pousada-solarium',
  'Bem posicionada em Gostoso, com quartos arejados e vista para o mar. Um dos clássicos da cidade para quem prefere uma estadia simples, honesta e com muito sol.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1178, -35.4958,
  NULL, NULL,
  'pousadasolariumdegostoso',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
  ],
  false, false, 'free', 10,
  '{"seg":{"open":"08:00","close":"22:00","closed":false},"ter":{"open":"08:00","close":"22:00","closed":false},"qua":{"open":"08:00","close":"22:00","closed":false},"qui":{"open":"08:00","close":"22:00","closed":false},"sex":{"open":"08:00","close":"22:00","closed":false},"sab":{"open":"08:00","close":"22:00","closed":false},"dom":{"open":"08:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'pousadas'
ON CONFLICT (slug) DO NOTHING;


-- =============================================================
-- PASSEIE -- Kite, Buggy, Passeios
-- =============================================================

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, website, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Dr. Wind Beach Club & Watersports', 'dr-wind',
  'O beach club de referência para esportes náuticos em Gostoso. Escola de kitesurf, windsurf e wingfoil, aluguel de equipamentos e restaurante na praia. Aberto todos os dias das 10h às 18h. O lugar certo para começar ou evoluir no kite.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1168, -35.4940,
  NULL, NULL,
  'drwindgostoso',
  'https://www.drwind.surf',
  'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516463407448-4c76f7f89dab?w=800&auto=format&fit=crop'
  ],
  true, true, 'associado', 1,
  '{"seg":{"open":"10:00","close":"18:00","closed":false},"ter":{"open":"10:00","close":"18:00","closed":false},"qua":{"open":"10:00","close":"18:00","closed":false},"qui":{"open":"10:00","close":"18:00","closed":false},"sex":{"open":"10:00","close":"18:00","closed":false},"sab":{"open":"10:00","close":"18:00","closed":false},"dom":{"open":"10:00","close":"18:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'kite-windsurf'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, website, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Tribo do Kite', 'tribo-do-kite',
  'Escola certificada IKO na Enseada das Baleias. Metodologia internacional do maior organismo de kitesurf do mundo, do iniciante ao primeiro nível profissional. Infraestrutura completa na praia, com segurança e responsabilidade.',
  id,
  'Enseada das Baleias, 1028, Maceió, São Miguel do Gostoso, RN',
  -5.1155, -35.4928,
  '(84) 99198-4977', '5584991984977',
  'tribodokite',
  'https://www.tribodokite.com',
  'https://images.unsplash.com/photo-1516463407448-4c76f7f89dab?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop'
  ],
  true, true, 'associado', 2,
  '{"seg":{"open":"07:00","close":"17:00","closed":false},"ter":{"open":"07:00","close":"17:00","closed":false},"qua":{"open":"07:00","close":"17:00","closed":false},"qui":{"open":"07:00","close":"17:00","closed":false},"sex":{"open":"07:00","close":"17:00","closed":false},"sab":{"open":"07:00","close":"17:00","closed":false},"dom":{"open":"07:00","close":"17:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'kite-windsurf'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, website, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Gostoso Kitesurf', 'gostoso-kitesurf',
  'Escola local com aulas de kitesurf e wingfoil para todos os níveis. Instrutores certificados, equipamentos modernos e o melhor spot de vento do nordeste como sala de aula.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1162, -35.4935,
  NULL, NULL,
  'gostoso_kitesurf',
  'https://www.gostosokitesurf.com',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1516463407448-4c76f7f89dab?w=800&auto=format&fit=crop'
  ],
  true, false, 'free', 3,
  '{"seg":{"open":"07:00","close":"17:00","closed":false},"ter":{"open":"07:00","close":"17:00","closed":false},"qua":{"open":"07:00","close":"17:00","closed":false},"qui":{"open":"07:00","close":"17:00","closed":false},"sex":{"open":"07:00","close":"17:00","closed":false},"sab":{"open":"07:00","close":"17:00","closed":false},"dom":{"open":"07:00","close":"17:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'kite-windsurf'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'GKS Kite School', 'gks-kite-school',
  'Escola de kitesurf sólida em São Miguel do Gostoso. Aulas personalizadas, monitores experientes e foco no progresso real do aluno. Para quem quer aprender do jeito certo.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1158, -35.4932,
  NULL, NULL,
  'gkskiteschool',
  'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop'
  ],
  false, false, 'free', 4,
  '{"seg":{"open":"07:00","close":"17:00","closed":false},"ter":{"open":"07:00","close":"17:00","closed":false},"qua":{"open":"07:00","close":"17:00","closed":false},"qui":{"open":"07:00","close":"17:00","closed":false},"sex":{"open":"07:00","close":"17:00","closed":false},"sab":{"open":"07:00","close":"17:00","closed":false},"dom":{"open":"07:00","close":"17:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'kite-windsurf'
ON CONFLICT (slug) DO NOTHING;

-- Buggy & Quad
INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, website, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Gostoso Adventure', 'gostoso-adventure',
  'Referência em passeios de buggy em Gostoso. Roteiros de 5h (R$450), 8h (R$750) e 9h (R$800) com bugueiro credenciado, cooler com água e sandboard nas dunas. Transfer e aluguel de veículos também. Um dos mais completos da região.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1190, -35.4972,
  NULL, NULL,
  NULL,
  'https://gostosoadventure.com.br',
  'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1583418007992-a8e33d41d378?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop'
  ],
  true, true, 'associado', 1,
  '{"seg":{"open":"07:00","close":"18:00","closed":false},"ter":{"open":"07:00","close":"18:00","closed":false},"qua":{"open":"07:00","close":"18:00","closed":false},"qui":{"open":"07:00","close":"18:00","closed":false},"sex":{"open":"07:00","close":"18:00","closed":false},"sab":{"open":"07:00","close":"18:00","closed":false},"dom":{"open":"07:00","close":"18:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'buggy'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, instagram, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Leal Turismo', 'leal-turismo',
  'Mais de 10 anos de experiência em Gostoso. Passeios de jardineira, quadriciclo, UTV e buggy. Locação de veículos e transfers. Uma das agências mais confiáveis para explorar a costa de Gostoso e chegar até Galinhos.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1195, -35.4978,
  NULL, NULL,
  'lealturismosmg',
  'https://images.unsplash.com/photo-1583418007992-a8e33d41d378?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&auto=format&fit=crop'
  ],
  true, false, 'associado', 2,
  '{"seg":{"open":"07:00","close":"18:00","closed":false},"ter":{"open":"07:00","close":"18:00","closed":false},"qua":{"open":"07:00","close":"18:00","closed":false},"qui":{"open":"07:00","close":"18:00","closed":false},"sex":{"open":"07:00","close":"18:00","closed":false},"sab":{"open":"07:00","close":"18:00","closed":false},"dom":{"open":"07:00","close":"18:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'buggy'
ON CONFLICT (slug) DO NOTHING;

-- Passeios gerais
INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Luck Receptivo', 'luck-receptivo',
  'Passeio clássico de Gostoso a Galinhos, a península isolada a 1 hora de barco. Salinas, manguezais, dunas, pôr do sol na Praia de Tourinhos no retorno. Uma das experiências mais marcantes do litoral norte do RN.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1185, -35.4968,
  NULL, NULL,
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&auto=format&fit=crop'
  ],
  true, true, 'associado', 1,
  '{"seg":{"open":"07:00","close":"18:00","closed":false},"ter":{"open":"07:00","close":"18:00","closed":false},"qua":{"open":"07:00","close":"18:00","closed":false},"qui":{"open":"07:00","close":"18:00","closed":false},"sex":{"open":"07:00","close":"18:00","closed":false},"sab":{"open":"07:00","close":"18:00","closed":false},"dom":{"open":"07:00","close":"18:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'passeios'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'Passeio de Barco Gostoso', 'passeio-de-barco-gostoso',
  'Saída de barco pelas águas do litoral norte do RN. Snorkeling, observação da costa a partir do mar e por do sol em alto mar. Um dos passeios mais pedidos por quem visita a cidade.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1180, -35.4962,
  NULL, NULL,
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&auto=format&fit=crop'
  ],
  false, false, 'free', 2,
  '{"seg":{"open":"07:00","close":"18:00","closed":false},"ter":{"open":"07:00","close":"18:00","closed":false},"qua":{"open":"07:00","close":"18:00","closed":false},"qui":{"open":"07:00","close":"18:00","closed":false},"sex":{"open":"07:00","close":"18:00","closed":false},"sab":{"open":"07:00","close":"18:00","closed":false},"dom":{"open":"07:00","close":"18:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'passeios'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses
  (name, slug, description, category_id, address, lat, lng, phone, whatsapp, website, cover_url, photos, is_verified, is_featured, plan, display_order, opening_hours)
SELECT
  'EasyTour Gostoso', 'easy-tour-gostoso',
  'Receptivo especializado em São Miguel do Gostoso. Quadriciclo a R$200, buggy de R$360 a R$560 dependendo do roteiro. Traslados, transfers e roteiros personalizados para grupos e famílias.',
  id,
  'São Miguel do Gostoso, RN',
  -5.1200, -35.4982,
  NULL, NULL,
  'https://www.easytourrn.com.br',
  'https://images.unsplash.com/photo-1583418007992-a8e33d41d378?w=800&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&auto=format&fit=crop'
  ],
  false, false, 'free', 3,
  '{"seg":{"open":"07:00","close":"18:00","closed":false},"ter":{"open":"07:00","close":"18:00","closed":false},"qua":{"open":"07:00","close":"18:00","closed":false},"qui":{"open":"07:00","close":"18:00","closed":false},"sex":{"open":"07:00","close":"18:00","closed":false},"sab":{"open":"07:00","close":"18:00","closed":false},"dom":{"open":"07:00","close":"18:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'passeios'
ON CONFLICT (slug) DO NOTHING;


-- =============================================================
-- EVENTS
-- =============================================================

INSERT INTO gostoso_events (name, description, starts_at, ends_at, location, event_type, is_featured) VALUES
  ('Gostoso Sunset Festival',
   'O festival de pôr do sol mais famoso do Nordeste. Música ao vivo, gastronomia e kite na beira da praia. Todos os finais de semana de julho a setembro.',
   '2026-08-01 16:00:00+00', '2026-09-30 22:00:00+00',
   'Praia do Minhoto', 'festival', true),

  ('Réveillon do Gostoso',
   'Um dos réveillons mais famosos do Brasil. Cerca de 2.500 pessoas por noite, 5 a 6 dias de festa, música ao vivo e fogos sobre o mar.',
   '2026-12-28 20:00:00+00', '2027-01-02 04:00:00+00',
   'Praça Central / Orla', 'festival', true),

  ('Bossa Nova & Jazz Festival',
   'Uma noite de música sofisticada com o horizonte do Atlântico ao fundo. Edição especial do festival cultural de Gostoso.',
   '2026-09-15 19:00:00+00', '2026-09-15 23:00:00+00',
   'Praia de Tourinhos', 'cultural', false),

  ('Open de Beach Tênis de Gostoso',
   'Torneio aberto de beach tênis com categorias amadora e profissional. Inscrições abertas para duplas.',
   '2026-10-10 08:00:00+00', '2026-10-12 18:00:00+00',
   'Praia do Maceió', 'esporte', false),

  ('Festival Eita Camarão',
   'Gastronomia nordestina no melhor estilo. Camarão fresquinho em mais de 20 preparações diferentes, dos restaurantes e barracas da cidade.',
   '2026-11-01 12:00:00+00', '2026-11-03 22:00:00+00',
   'Centro de Gostoso', 'gastronomia', true),

  ('Mostra de Cinema de Gostoso',
   '10ª edição da mostra. Cinema a céu aberto com curtas-metragens nacionais e internacionais. Entrada gratuita.',
   '2026-07-20 19:00:00+00', '2026-07-27 23:00:00+00',
   'Praça Central', 'cultural', false),

  ('Campeonato Brasileiro de Wing Foil',
   'Etapa nacional do campeonato de wing foil em Gostoso, um dos melhores spots do Brasil para o esporte.',
   '2026-09-05 08:00:00+00', '2026-09-07 18:00:00+00',
   'Praia de Tourinhos', 'esporte', true),

  ('Gostoso Sunset Festival -- Encerramento',
   'Grande festa de encerramento da temporada do Sunset Festival. Artistas convidados, gastronomia especial.',
   '2026-09-27 16:00:00+00', '2026-09-27 23:59:00+00',
   'Praia do Minhoto', 'festival', false)

ON CONFLICT DO NOTHING;


-- =============================================================
-- FUND ENTRIES (APOIE)
-- =============================================================

INSERT INTO gostoso_fund_entries (description, amount_cents, entry_date, status, category, notes) VALUES
  ('Sunset Festival -- material gráfico e divulgação digital',
   320000, '2026-04-12', 'realizado', 'marketing',
   'Impressão de 500 cartazes A2 + campanha nas redes sociais'),

  ('Festival de Kite -- patrocínio da etapa regional',
   240000, '2026-04-03', 'realizado', 'marketing',
   'Patrocínio oficial do campeonato regional de kite'),

  ('Hosting Vercel + Supabase + domínio (mai/2026)',
   82000, '2026-05-01', 'programado', 'operacao',
   'Infraestrutura técnica da plataforma'),

  ('Mostra de Cinema -- projetor e estrutura',
   150000, '2026-04-20', 'programado', 'marketing',
   'Aluguel de projetor e estrutura de palco para exibição ao ar livre'),

  ('Cartaz e outdoor do Réveillon 2026/27',
   220000, '2026-04-28', 'programado', 'marketing',
   'Campanha digital + outdoor na entrada da cidade'),

  ('Receita -- assinaturas de prestadores (abr/2026)',
   620000, '2026-04-30', 'realizado', 'acumulado',
   '14 prestadores ativos, mensalidade média R$44,28'),

  ('Festival Eita Camarão -- apoio à divulgação',
   180000, '2026-05-10', 'programado', 'marketing',
   'Material visual, redes sociais e cobertura fotográfica'),

  ('Sinalização da orla -- placas informativas',
   95000, '2026-05-15', 'programado', 'operacao',
   'Placas com QR code para a plataforma nas praias')

ON CONFLICT DO NOTHING;
