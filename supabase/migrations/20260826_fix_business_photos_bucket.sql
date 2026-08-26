-- Spec 1.2/1.3: remove file size limit and align mime types on business-photos bucket.
-- All uploads go through compressImage() which always produces JPEG,
-- so heic/gif are excluded from the bucket allow-list (they're converted client-side).
UPDATE storage.buckets
SET
  file_size_limit = NULL,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'business-photos';
