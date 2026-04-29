-- Add is_published (draft/published status controlled by business owner)
-- and services (list of services offered)
-- and storage bucket for photos

ALTER TABLE gostoso_businesses
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS services     jsonb DEFAULT '[]'::jsonb;

-- Storage: business-photos bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-photos',
  'business-photos',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: allow authenticated users to upload to their own folder
CREATE POLICY IF NOT EXISTS "Owner upload business photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'business-photos');

CREATE POLICY IF NOT EXISTS "Public read business photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'business-photos');

CREATE POLICY IF NOT EXISTS "Owner delete business photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'business-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
