-- Spec 4.1: add slug column to gostoso_transfers
ALTER TABLE public.gostoso_transfers
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Populate slugs from provider_name for existing rows
UPDATE public.gostoso_transfers
SET slug = lower(
  regexp_replace(
    regexp_replace(
      translate(provider_name,
        'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ',
        'aaaaaeeeeiiiiooooouuuuucAAAAAEEEEIIIIOOOOOUUUUUC'
      ),
    '[^a-zA-Z0-9\s-]', '', 'g'),
  '\s+', '-', 'g')
)
WHERE slug IS NULL;

-- Make slug unique and not-null going forward
ALTER TABLE public.gostoso_transfers
  ALTER COLUMN slug SET DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS gostoso_transfers_slug_key ON public.gostoso_transfers (slug);

-- Spec 4.2: aggregated ratings view for transfers
-- Reuses gostoso_reviews.transfer_id (set when a review targets a transfer via business_id link)
CREATE OR REPLACE VIEW public.gostoso_transfer_ratings AS
SELECT
  r.transfer_id,
  round(avg(r.rating)::numeric, 1) AS avg_rating,
  count(*) AS review_count
FROM public.gostoso_reviews r
WHERE r.transfer_id IS NOT NULL
  AND r.approved = true
GROUP BY r.transfer_id;

GRANT SELECT ON public.gostoso_transfer_ratings TO anon, authenticated;
