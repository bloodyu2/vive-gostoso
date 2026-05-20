-- Fix business coordinates seeded with wrong longitude values.
-- Seed data used lng ≈ -35.49 (Atlantic Ocean) instead of ≈ -35.64
-- (São Miguel do Gostoso). Shift those coordinates ~0.142° westward
-- so they land in the correct geographic area.
-- Only affects businesses currently placed in the ocean:
--   lat in the expected range AND lng east of -35.55 (wrong side of coast).
UPDATE public.gostoso_businesses
SET lng = lng - 0.1420
WHERE
  lat  BETWEEN -5.20 AND -5.05
  AND  lng > -35.55;
