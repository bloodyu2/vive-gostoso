-- supabase/migrations/20260830_lock_down_gostoso_bucket_storage.sql
--
-- Corrige F1 da auditoria de segurança de 2026-08-29
-- (docs/security-audit/relatorio-auditoria-seguranca.pdf):
--
-- A policy de INSERT do bucket 'gostoso' (001_gostoso_schema.sql:143-145) só exige
-- `auth.uid() IS NOT NULL` -- QUALQUER usuário autenticado no projeto Supabase
-- compartilhado (wppsmvgbagalczoardfl, cujo auth.users também serve o Vive Paraty) pode
-- escrever em qualquer caminho do bucket público 'gostoso', sem nenhuma checagem de
-- propriedade por pasta -- diferente de 'business-photos', que exige
-- storage.foldername(name)[1] == um negócio do próprio usuário
-- (20260514_security_audit_2026_05.sql, 20260606_fix_storage_policy_column_ambiguity.sql).
-- O bucket também aceita image/svg+xml desde 20260514_security_audit_2026_05.sql:267-270,
-- o que combinado com o INSERT aberto permite XSS armazenado via SVG malicioso servido
-- pelo próprio CDN do Supabase.
--
-- Confirmado via grep em src/ e app/ que o front-end atual não referencia mais o bucket
-- 'gostoso' (só 'business-photos' é usado para fotos de negócio -- ver
-- src/views/cadastre/Perfil.tsx:289,587). Não existe, portanto, uma convenção de
-- pasta-por-dono a aplicar aqui como foi feito em business-photos -- em vez de inventar
-- uma, esta migration remove o INSERT público e restringe todo acesso de escrita a admin,
-- e revoga o suporte a SVG.

drop policy if exists "auth upload gostoso storage" on storage.objects;

create policy "gostoso_admin_all"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'gostoso'
    and exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    bucket_id = 'gostoso'
    and exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  );

-- Reduz a superfície de XSS armazenado independentemente de quem escreve no bucket.
-- Leitura pública continua funcionando via CDN (bucket public=true bypassa RLS no path
-- de leitura -- ver 20260514_security_hardening_followup.sql:50-63) -- nenhuma policy de
-- SELECT é necessária aqui.
update storage.buckets
   set allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
 where id = 'gostoso';
