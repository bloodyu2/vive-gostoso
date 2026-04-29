-- Add Stripe fields to gostoso_businesses
-- plan column already exists as text; drop constraint and re-add with 'destaque'
alter table gostoso_businesses
  drop constraint if exists gostoso_businesses_plan_check;

alter table gostoso_businesses
  add constraint gostoso_businesses_plan_check
  check (plan in ('free', 'associado', 'destaque'));

alter table gostoso_businesses
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

-- Index for webhook lookups
create index if not exists idx_businesses_stripe_sub
  on gostoso_businesses (stripe_subscription_id)
  where stripe_subscription_id is not null;
