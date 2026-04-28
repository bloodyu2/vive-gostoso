-- Informações essenciais do negócio: faixa de preço, cardápio, comodidades

ALTER TABLE gostoso_businesses
  ADD COLUMN IF NOT EXISTS price_range text,
  ADD COLUMN IF NOT EXISTS menu_url    text,
  ADD COLUMN IF NOT EXISTS amenities   jsonb DEFAULT '{}';
