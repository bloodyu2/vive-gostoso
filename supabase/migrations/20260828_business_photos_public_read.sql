-- A bucket 'business-photos' é pública (storage.buckets.public = true), mas a migration
-- 20260826_fix_business_photos_bucket.sql que a configurou nunca criou uma policy de SELECT
-- em storage.objects para ela.
--
-- Sem policy de SELECT, o INSERT ... RETURNING que o Supabase Storage executa internamente
-- em TODO upload falha com 42501 ("new row violates row-level security policy"), mesmo
-- quando o INSERT em si é de um dono legítimo do negócio — o Postgres exige que a linha
-- recém-inserida também satisfaça as policies de SELECT para poder ser retornada via RETURNING.
--
-- Isso reproduzia exatamente a mesma mensagem de erro do bug de JWT signing key (ver
-- rotação de chave JWT aplicada em 2026-08-28 no Dashboard do Supabase), mas é uma causa
-- raiz adicional e independente — confirmada via reprodução direta (INSERT ... RETURNING
-- em storage.objects sob role authenticated, mesmo com auth.uid() e ownership corretos,
-- falhava até esta policy ser criada).
CREATE POLICY "business_photos_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'business-photos');
