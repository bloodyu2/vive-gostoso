-- Link transfer providers to their gostoso_businesses entry.
-- When a transfer is also a business, reviews submitted via the transfer modal
-- should go to business_id so they appear on the /negocio/[slug] profile page.
ALTER TABLE public.gostoso_transfers
  ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.gostoso_businesses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_gostoso_transfers_business_id
  ON public.gostoso_transfers(business_id);
