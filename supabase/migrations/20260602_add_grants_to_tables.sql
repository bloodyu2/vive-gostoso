-- Migration: Add grants to recently updated tables
-- 2026-06-02
-- Fix: Missing grants causing 42501 errors in supabase-js

-- Grants for gostoso_businesses (already exists, just needs grants)
grant select on public.gostoso_businesses to anon;
grant select, insert, update, delete on public.gostoso_businesses to authenticated;
grant all on public.gostoso_businesses to service_role;

-- Grants for gostoso_events (already exists, just needs grants)
grant select on public.gostoso_events to anon;
grant select, insert, update, delete on public.gostoso_events to authenticated;
grant all on public.gostoso_events to service_role;

-- Grants for gostoso_categories (already exists, just needs grants)
grant select on public.gostoso_categories to anon;
grant select, insert, update, delete on public.gostoso_categories to authenticated;
grant all on public.gostoso_categories to service_role;

-- Grants for gostoso_fund_entries (already exists, just needs grants)
grant select on public.gostoso_fund_entries to anon;
grant select, insert, update, delete on public.gostoso_fund_entries to authenticated;
grant all on public.gostoso_fund_entries to service_role;

-- Grants for gostoso_goals (already exists, just needs grants)
grant select on public.gostoso_goals to anon;
grant select, insert, update, delete on public.gostoso_goals to authenticated;
grant all on public.gostoso_goals to service_role;

-- Grants for gostoso_blog_posts (already exists, just needs grants)
grant select on public.gostoso_blog_posts to anon;
grant select, insert, update, delete on public.gostoso_blog_posts to authenticated;
grant all on public.gostoso_blog_posts to service_role;

-- Grants for gostoso_claim_requests (already exists, just needs grants)
grant select on public.gostoso_claim_requests to anon;
grant select, insert, update, delete on public.gostoso_claim_requests to authenticated;
grant all on public.gostoso_claim_requests to service_role;

-- Grants for gostoso_event_submissions (already exists, just needs grants)
grant select on public.gostoso_event_submissions to anon;
grant select, insert, update, delete on public.gostoso_event_submissions to authenticated;
grant all on public.gostoso_event_submissions to service_role;

-- Grants for gostoso_transfers (already exists, just needs grants)
grant select on public.gostoso_transfers to anon;
grant select, insert, update, delete on public.gostoso_transfers to authenticated;
grant all on public.gostoso_transfers to service_role;

-- Grants for gostoso_professionals (already exists, just needs grants)
grant select on public.gostoso_professionals to anon;
grant select, insert, update, delete on public.gostoso_professionals to authenticated;
grant all on public.gostoso_professionals to service_role;