-- Fix: storage policy column name ambiguity
-- Root cause: inside the EXISTS subquery, PostgreSQL resolved the bare `name`
-- reference to gostoso_businesses.name (display name) instead of
-- storage.objects.name (file path). This caused the ownership check to always
-- fail for non-admin owners, blocking all image uploads since 2026-05-14.
--
-- Fix: move (storage.foldername(name))[1] outside the subquery so `name`
-- unambiguously refers to the storage.objects.name column.
-- Applied directly to Supabase on 2026-06-06.

-- INSERT (cover + gallery upload)
DROP POLICY IF EXISTS "business_photos_owner_upload" ON storage.objects;
CREATE POLICY "business_photos_owner_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'business-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT b.id::text
      FROM gostoso_businesses b
      JOIN gostoso_profiles p ON p.id = b.profile_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- UPDATE (upsert path when file already exists)
DROP POLICY IF EXISTS "business_photos_owner_update" ON storage.objects;
CREATE POLICY "business_photos_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'business-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT b.id::text
      FROM gostoso_businesses b
      JOIN gostoso_profiles p ON p.id = b.profile_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- DELETE (remove photo from gallery)
DROP POLICY IF EXISTS "business_photos_owner_delete" ON storage.objects;
CREATE POLICY "business_photos_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'business-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT b.id::text
      FROM gostoso_businesses b
      JOIN gostoso_profiles p ON p.id = b.profile_id
      WHERE p.auth_user_id = auth.uid()
    )
  );
