-- Migration: Update event images and SEO descriptions
-- 2026-06-01

-- Update Gostoso Sunset Festival (keep a7cac2ae-a898-4062-9fce-e3ef05d6a481, delete f190eb5f-f57e-431b-8548-48bc990ca0d5)
UPDATE gostoso_events 
SET 
  cover_url = '/images/events/sunset_festival.jpg',
  description = 'O festival de por do sol mais famoso do Nordeste brasileiro. De julho a setembro, todos os finais de semana: musica ao vivo, gastronomia local, kite e windsurf na Praia do Minhoto. O evento que transformou Sao Miguel do Gostoso em destino cultural do litoral norte-rn.'
WHERE id = 'a7cac2ae-a898-4062-9fce-e3ef05d6a481';

DELETE FROM gostoso_events WHERE id = 'f190eb5f-f57e-431b-8548-48bc990ca0d5';

-- Update Mostra de Cinema (keep 93332392-cdd7-4ad4-8913-beb21d9d3c35, delete a44fdb72-4f46-42cc-9285-6d276e79b35d)
UPDATE gostoso_events 
SET 
  cover_url = '/images/events/outdoor_cinema.jpg',
  description = '10a edicao da Mostra de Cinema de Gostoso. Cinema a ceu aberto na Praca Central com curtas-metragens nacionais e internacionais, debates e oficinas. Entrada gratuita. Uma das principais mostras de cinema independente do Nordeste.'
WHERE id = '93332392-cdd7-4ad4-8913-beb21d9d3c35';

DELETE FROM gostoso_events WHERE id = 'a44fdb72-4f46-42cc-9285-6d276e79b35d';

-- Update Campeonato Brasileiro de Wing Foil (keep 42726834-c81d-40c8-a424-07281fd38292, delete 4cb54f69-fea7-460a-86f6-f3da1d2bdcad)
UPDATE gostoso_events 
SET 
  cover_url = '/images/events/wing_foil.jpg',
  description = 'Etapa nacional do Campeonato Brasileiro de Wing Foil em Sao Miguel do Gostoso. Considerado um dos melhores spots de wing foil do Brasil, Gostoso recebe atletas de todo pais para competicoes nas aguas cristalinas da Praia de Tourinhos.'
WHERE id = '42726834-c81d-40c8-a424-07281fd38292';

DELETE FROM gostoso_events WHERE id = '4cb54f69-fea7-460a-86f6-f3da1d2bdcad';

-- Update Bossa Nova & Jazz Festival (keep af61b7d9-21e0-4b08-aa65-909484661f95, delete 4777752d-2205-4a00-bdcb-16f0196f3352)
UPDATE gostoso_events 
SET 
  cover_url = '/images/events/jazz_bossa.jpg',
  description = 'Uma noite inesquecivel de bossa nova e jazz com o horizonte do Atlantico ao fundo. Musica sofisticada na Praia de Tourinhos, reunindo musicos locais e convidados em um dos eventos culturais mais elegantes de Sao Miguel do Gostoso.'
WHERE id = 'af61b7d9-21e0-4b08-aa65-909484661f95';

DELETE FROM gostoso_events WHERE id = '4777752d-2205-4a00-bdcb-16f0196f3352';

-- Update Open de Beach Tenis (keep 54d6a681-2001-4e1e-89b2-72b5eb19e444, delete bd4ae493-7b7c-4dd3-96a6-6b8703186009)
UPDATE gostoso_events 
SET 
  cover_url = '/images/events/beach_tennis.jpg',
  description = 'Torneio aberto de beach tennis com categorias amadora e profissional. Areia fina, sol e competicao na Praia do Maceio. O maior evento de beach tennis do litoral norte-rn, reunindo atletas de varios estados.'
WHERE id = '54d6a681-2001-4e1e-89b2-72b5eb19e444';

DELETE FROM gostoso_events WHERE id = 'bd4ae493-7b7c-4dd3-96a6-6b8703186009';

-- Update Festival Eita Camarao (keep 9d3e1239-f02b-403c-ad16-20ba72c22cac, delete 3abf3295-9697-4819-8c2c-816e39b44cb4)
UPDATE gostoso_events 
SET 
  cover_url = '/images/events/shrimp_festival.jpg',
  description = 'O maior festival gastronomico de Sao Miguel do Gostoso. Camarao fresquinho em mais de 20 preparacoes diferentes: ao alho e oleo, na manteiga, ensopado, frito, na telha, com tapioca. Musica ao vivo e cultura nordestina no Centro de Gostoso.'
WHERE id = '9d3e1239-f02b-403c-ad16-20ba72c22cac';

DELETE FROM gostoso_events WHERE id = '3abf3295-9697-4819-8c2c-816e39b44cb4';

-- Update Reveillon (keep b3359993-3262-401d-a490-d6e8558f75f0, delete 8d26bfbd-42cb-42a0-b622-8d161fdb9936)
UPDATE gostoso_events 
SET 
  cover_url = '/images/events/reveillon.jpg',
  description = 'Um dos reveillons mais famosos do Brasil. Cerca de 2.500 pessoas por noite, 5 a 6 dias de festa ininterrupta com musica ao vivo, djs, gastronomia e fogos de artificio sobre o mar. A virada mais esperada do litoral norte-rn.'
WHERE id = 'b3359993-3262-401d-a490-d6e8558f75f0';

DELETE FROM gostoso_events WHERE id = '8d26bfbd-42cb-42a0-b622-8d161fdb9936';

-- Update Sunset Festival Encerramento
UPDATE gostoso_events 
SET 
  cover_url = '/images/events/sunset_festival.jpg',
  description = 'Grande festa de encerramento da temporada do Gostoso Sunset Festival. Artistas convidados, gastronomia especial e o ultimo por do sol da temporada na Praia do Minhoto. Despedida inesquecivel do verao em Gostoso.'
WHERE id = 'fd48b29f-6a90-45c0-a07c-b2ac27f77ff7';
