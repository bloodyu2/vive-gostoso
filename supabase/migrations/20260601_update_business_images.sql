-- Migration: Update business images by category
-- 2026-06-01

-- Update Restaurants without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/restaurante.jpg'
WHERE cover_url IS NULL AND category_id = '9d9f0af4-2218-4ffb-a417-6e7b73b55a73';

-- Update Pousadas without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/pousada.jpg'
WHERE cover_url IS NULL AND category_id = 'e5a30de9-dabb-4a9b-8d5a-62fd68ff656c';

-- Update Kite & Windsurf without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/kitesurf.jpg'
WHERE cover_url IS NULL AND category_id = 'f36a2007-cbd2-4ca1-b2a7-87372a3c046c';

-- Update Bares without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/bar.jpg'
WHERE cover_url IS NULL AND category_id = 'a8ce3b85-7974-4510-8de0-e4e792b69c54';

-- Update Artesanato without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/artesanato.jpg'
WHERE cover_url IS NULL AND category_id = '5c848399-0bc2-463c-b6fe-06825610699c';

-- Update Lavanderia without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/lavanderia.jpg'
WHERE cover_url IS NULL AND category_id = '5b59e94e-91aa-417d-859f-140511496f3d';

-- Update Farmacia without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/farmacia.jpg'
WHERE cover_url IS NULL AND category_id = '615e279c-16b4-4934-9ea7-1dceb1219324';

-- Update Mercado without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/mercado.jpg'
WHERE cover_url IS NULL AND category_id = '1ae0fc17-73f2-427f-b387-f46dcdbb515b';

-- Update Barbearia & Salao without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/padaria.jpg'
WHERE cover_url IS NULL AND category_id = 'a564c661-417b-4053-834a-b72e9b2c3c23';

-- Update Buggy & Quad without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/buggy.jpg'
WHERE cover_url IS NULL AND category_id = 'a1d50450-fa74-465f-85a1-97d522bae225';

-- Update Passeios without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/kitesurf.jpg'
WHERE cover_url IS NULL AND category_id = '5f9e5cb6-864d-4074-b5ac-47fdb3118ef3';

-- Update Saude & Bem-estar without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/massagem.jpg'
WHERE cover_url IS NULL AND category_id = '9180849e-db40-44de-b0d1-3b0a89e53a87';

-- Update Servicos Locais without images
UPDATE gostoso_businesses 
SET cover_url = '/images/businesses/mercado.jpg'
WHERE cover_url IS NULL AND category_id = 'd3e756a9-67c6-4cce-9424-fbb7e0710d28';
