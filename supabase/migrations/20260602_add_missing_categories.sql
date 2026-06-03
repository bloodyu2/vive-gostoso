-- Migration: Add missing business categories
-- 2026-06-02
-- Categories identified from Google Maps analysis

-- Farmácia
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '615e279c-16b4-4934-9ea7-1dceb1219324',
  'Farmácia',
  'farmacia',
  'resolva',
  'pharmacy',
  '#E53E3E',
  11,
  true
) ON CONFLICT (id) DO NOTHING;

-- Mercado / Mercearia
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '1ae0fc17-73f2-427f-b387-f46dcdbb515b',
  'Mercado',
  'mercado',
  'resolva',
  'shopping-cart',
  '#38A169',
  12,
  true
) ON CONFLICT (id) DO NOTHING;

-- Posto de Gasolina
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '8f3e4a2b-9c1d-4e5f-8a7b-6c9d0e1f2a3b',
  'Posto de Gasolina',
  'posto-gasolina',
  'resolva',
  'gas-station',
  '#DD6B20',
  13,
  true
) ON CONFLICT (id) DO NOTHING;

-- Lavanderia Self-Service
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '5b59e94e-91aa-417d-859f-140511496f3d',
  'Lavanderia',
  'lavanderia',
  'resolva',
  'shirt',
  '#3182CE',
  14,
  true
) ON CONFLICT (id) DO NOTHING;

-- Aluguel de Bicicletas
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '7c4d5e6f-8a9b-0c1d-2e3f-4a5b6c7d8e9f',
  'Aluguel de Bicicletas',
  'aluguel-bicicletas',
  'passeie',
  'bicycle',
  '#805AD5',
  15,
  true
) ON CONFLICT (id) DO NOTHING;

-- Escola de Kite/Wind
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '9e8f7a6b-5c4d-3e2f-1a0b-9c8d7e6f5a4b',
  'Escola de Kite/Wind',
  'escola-kite-wind',
  'passeie',
  'umbrella',
  '#0D7C7C',
  16,
  true
) ON CONFLICT (id) DO NOTHING;

-- Bar / Balada
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
  'Bar / Balada',
  'bar-balada',
  'come',
  'beer',
  '#D69E2E',
  17,
  true
) ON CONFLICT (id) DO NOTHING;

-- Loja de Conveniência
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  'Loja de Conveniência',
  'loja-conveniencia',
  'resolva',
  'shopping-bag',
  '#E53E3E',
  18,
  true
) ON CONFLICT (id) DO NOTHING;

-- Médico / Clínica
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
  'Médico / Clínica',
  'medico-clinica',
  'resolva',
  'heart',
  '#E53E3E',
  19,
  true
) ON CONFLICT (id) DO NOTHING;

-- Dentista
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
  'Dentista',
  'dentista',
  'resolva',
  'smile',
  '#38A169',
  20,
  true
) ON CONFLICT (id) DO NOTHING;

-- ATM / Banco
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
  'ATM / Banco',
  'atm-banco',
  'resolva',
  'credit-card',
  '#2B6CB0',
  21,
  true
) ON CONFLICT (id) DO NOTHING;

-- Pet Shop
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
  'Pet Shop',
  'pet-shop',
  'resolva',
  'paw-print',
  '#DD6B20',
  22,
  true
) ON CONFLICT (id) DO NOTHING;

-- Gym / Academia
INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES (
  '4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e',
  'Academia',
  'academia',
  'resolva',
  'dumbbell',
  '#805AD5',
  23,
  true
) ON CONFLICT (id) DO NOTHING;