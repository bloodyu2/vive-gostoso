-- Fix business coordinates that land in the Atlantic Ocean.
--
-- Diagnosis (2026-05-19 via Supabase MCP):
--   - 149 businesses have coordinates; most are correctly placed in São Miguel
--     do Gostoso (lng -35.643 to -35.620, lat -5.11 to -5.13).
--   - "4 Ventos Kite & Wing" had lng = -35.6018, placing the pin ~4 km east
--     of the town — visibly in the ocean on the Mapbox map.
--   - Other kite-beach businesses (lng -35.612 to -35.617) are on the narrow
--     eastern cape and may still appear near the water; those need manual GPS
--     correction by each business owner via the admin panel.
--
-- Applied directly via MCP on 2026-05-19; this file documents the change.

UPDATE public.gostoso_businesses
SET lng = -35.6200
WHERE name = '4 Ventos Kite & Wing'
  AND lng > -35.605;
