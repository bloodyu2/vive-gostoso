-- Categories seed
INSERT INTO gostoso_categories (name, slug, verb, icon, color, display_order) VALUES
  ('Restaurantes',    'restaurantes',    'come',     'utensils',     '#E05A3A', 1),
  ('Bares',           'bares',           'come',     'beer',         '#C97D2A', 2),
  ('Pousadas',        'pousadas',        'fique',    'bed-double',   '#0D7C7C', 3),
  ('Passeios',        'passeios',        'passeie',  'map-pin',      '#3D8B5A', 4),
  ('Kite & Windsurf', 'kite-windsurf',   'passeie',  'wind',         '#C97D2A', 5),
  ('Buggy',           'buggy',           'passeie',  'car',          '#A05E1A', 6),
  ('Artesanato',      'artesanato',      'passeie',  'shopping-bag', '#737373', 7),
  ('Serviços Locais', 'servicos-locais', 'passeie',  'wrench',       '#737373', 8)
ON CONFLICT (slug) DO NOTHING;

-- Businesses seed
INSERT INTO gostoso_businesses (name, slug, description, category_id, address, lat, lng, phone, is_verified, is_featured, plan, opening_hours)
SELECT
  'Bar do Zé', 'bar-do-ze',
  '18 anos servindo sururu fresco na beira da Praia do Minhoto. O Zé conhece cada pescador da região.',
  id,
  'Praia do Minhoto, São Miguel do Gostoso, RN',
  -5.1180, -35.4960, '+55 84 99999-0001',
  true, false, 'associado',
  '{"seg":{"open":"11:00","close":"22:00","closed":false},"ter":{"open":"11:00","close":"22:00","closed":false},"qua":{"open":"11:00","close":"22:00","closed":false},"qui":{"open":"11:00","close":"22:00","closed":false},"sex":{"open":"11:00","close":"23:00","closed":false},"sab":{"open":"10:00","close":"23:00","closed":false},"dom":{"open":"10:00","close":"21:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses (name, slug, description, category_id, address, lat, lng, is_verified, is_featured, plan, opening_hours)
SELECT
  'Cantinho da Fátima', 'cantinho-da-fatima',
  'Fátima cozinha há 22 anos. Almoço caseiro, feito com amor e ingredientes da região.',
  id,
  'Centro, São Miguel do Gostoso, RN',
  -5.1225, -35.4992,
  true, true, 'associado',
  '{"seg":{"open":"11:00","close":"15:00","closed":false},"ter":{"open":"11:00","close":"15:00","closed":false},"qua":{"open":"11:00","close":"15:00","closed":false},"qui":{"open":"11:00","close":"15:00","closed":false},"sex":{"open":"11:00","close":"15:00","closed":false},"sab":{"open":"11:00","close":"15:00","closed":false},"dom":{"open":"00:00","close":"00:00","closed":true}}'::jsonb
FROM gostoso_categories WHERE slug = 'restaurantes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses (name, slug, description, category_id, address, lat, lng, is_verified, is_featured, plan, opening_hours)
SELECT
  'Pousada Ventania', 'pousada-ventania',
  'Vista pro mar, kite na porta. 12 quartos com ventilação natural e café da manhã nordestino.',
  id,
  'Praia do Maceió, São Miguel do Gostoso, RN',
  -5.1195, -35.4970,
  true, true, 'associado',
  '{"seg":{"open":"08:00","close":"22:00","closed":false},"ter":{"open":"08:00","close":"22:00","closed":false},"qua":{"open":"08:00","close":"22:00","closed":false},"qui":{"open":"08:00","close":"22:00","closed":false},"sex":{"open":"08:00","close":"22:00","closed":false},"sab":{"open":"08:00","close":"22:00","closed":false},"dom":{"open":"08:00","close":"22:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'pousadas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gostoso_businesses (name, slug, description, category_id, address, lat, lng, is_verified, is_featured, plan, opening_hours)
SELECT
  'Gostoso Kite School', 'gostoso-kite-school',
  'Escola certificada IKO. Aulas para iniciantes e avançados. Aluguel de equipamento.',
  id,
  'Praia de Tourinhos, São Miguel do Gostoso, RN',
  -5.1210, -35.4985,
  true, false, 'associado',
  '{"seg":{"open":"07:00","close":"17:00","closed":false},"ter":{"open":"07:00","close":"17:00","closed":false},"qua":{"open":"07:00","close":"17:00","closed":false},"qui":{"open":"07:00","close":"17:00","closed":false},"sex":{"open":"07:00","close":"17:00","closed":false},"sab":{"open":"07:00","close":"17:00","closed":false},"dom":{"open":"07:00","close":"17:00","closed":false}}'::jsonb
FROM gostoso_categories WHERE slug = 'kite-windsurf'
ON CONFLICT (slug) DO NOTHING;

-- Events seed
INSERT INTO gostoso_events (name, description, starts_at, ends_at, location, event_type, is_featured) VALUES
  ('Gostoso Sunset Festival',          'O festival de pôr do sol mais famoso do Nordeste. Música, gastronomia e kite na beira da praia.', '2026-08-01 16:00:00+00', '2026-09-30 22:00:00+00', 'Praia do Minhoto',    'festival',    true),
  ('Réveillon do Gostoso',             '~2.500 pessoas por noite, 5-6 dias de festa. Um dos réveillons mais famosos do Brasil.',           '2026-12-28 20:00:00+00', '2027-01-02 04:00:00+00', 'Praça Central',       'festival',    true),
  ('Bossa Nova & Jazz Festival',        'Uma noite de música sofisticada com o horizonte do Atlântico ao fundo.',                          '2026-09-15 19:00:00+00', '2026-09-15 23:00:00+00', 'Praia de Tourinhos',  'cultural',    false),
  ('Open de Beach Tênis',              'Torneio aberto de beach tênis. Inscrições abertas para amadores e profissionais.',                 '2026-10-10 08:00:00+00', '2026-10-12 18:00:00+00', 'Praia do Maceió',     'esporte',     false),
  ('Festival Eita Camarão',            'Gastronomia nordestina no melhor estilo. Camarão fresquinho em mais de 20 preparações.',           '2026-11-01 12:00:00+00', '2026-11-03 22:00:00+00', 'Centro',              'gastronomia', true),
  ('Mostra de Cinema de Gostoso',      '10ª edição da mostra. Cinema a céu aberto, curtas nacionais e internacionais.',                   '2026-07-20 19:00:00+00', '2026-07-27 23:00:00+00', 'Praça Central',       'cultural',    false),
  ('Campeonato Brasileiro Wing Foil',  'Etapa nacional do campeonato de wing foil. Atletas de todo o Brasil.',                             '2026-09-05 08:00:00+00', '2026-09-07 18:00:00+00', 'Praia de Tourinhos',  'esporte',     true)
ON CONFLICT DO NOTHING;

-- Fund entries seed
INSERT INTO gostoso_fund_entries (description, amount_cents, entry_date, status, category, notes) VALUES
  ('Sunset Festival — cartaz e divulgação',  300000, '2026-04-12', 'realizado',  'marketing', 'Impressão de 500 cartazes A2 + distribuição'),
  ('Festival de Kite — patrocínio',          240000, '2026-04-03', 'realizado',  'marketing', 'Patrocínio oficial da etapa regional'),
  ('Manutenção da plataforma',               82000,  '2026-04-01', 'realizado',  'operacao',  'Hosting Vercel + Supabase + domínio'),
  ('Mostra de Cinema — apoio',               150000, '2026-04-20', 'programado', 'marketing', 'Projetor + estrutura de palco'),
  ('Cartaz Réveillon (impressão)',           220000, '2026-04-28', 'programado', 'marketing', 'Campanha digital + outdoor'),
  ('Receita — assinaturas prestadores',      620000, '2026-04-30', 'realizado',  'acumulado', '14 prestadores × R$44,28 média')
ON CONFLICT DO NOTHING;
