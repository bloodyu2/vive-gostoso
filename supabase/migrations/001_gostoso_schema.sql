-- Categories
CREATE TABLE IF NOT EXISTS gostoso_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  verb          text NOT NULL,
  icon          text,
  color         text,
  display_order int DEFAULT 0,
  active        boolean DEFAULT true
);

-- Profiles (created before businesses due to FK)
CREATE TABLE IF NOT EXISTS gostoso_profiles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id  uuid,
  role         text DEFAULT 'prestador',
  full_name    text,
  email        text,
  phone        text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Businesses
CREATE TABLE IF NOT EXISTS gostoso_businesses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  description   text,
  category_id   uuid REFERENCES gostoso_categories(id),
  profile_id    uuid REFERENCES gostoso_profiles(id),
  address       text,
  lat           decimal(10,7),
  lng           decimal(10,7),
  phone         text,
  whatsapp      text,
  website       text,
  instagram     text,
  cover_url     text,
  photos        text[] DEFAULT '{}',
  opening_hours jsonb,
  is_verified   boolean DEFAULT false,
  is_featured   boolean DEFAULT false,
  plan          text DEFAULT 'free',
  active        boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- FK retroativa: profiles → businesses
ALTER TABLE gostoso_profiles
  ADD CONSTRAINT fk_profile_business
  FOREIGN KEY (business_id) REFERENCES gostoso_businesses(id) ON DELETE SET NULL;

-- Events
CREATE TABLE IF NOT EXISTS gostoso_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  starts_at   timestamptz NOT NULL,
  ends_at     timestamptz,
  location    text,
  cover_url   text,
  event_type  text,
  is_featured boolean DEFAULT false,
  source_url  text,
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- Fund entries
CREATE TABLE IF NOT EXISTS gostoso_fund_entries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description  text NOT NULL,
  amount_cents int NOT NULL,
  entry_date   date NOT NULL,
  status       text NOT NULL,
  category     text NOT NULL,
  notes        text,
  created_at   timestamptz DEFAULT now()
);

-- updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON gostoso_businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON gostoso_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE gostoso_businesses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gostoso_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gostoso_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE gostoso_fund_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gostoso_profiles     ENABLE ROW LEVEL SECURITY;

-- Public reads
CREATE POLICY "public read businesses"  ON gostoso_businesses   FOR SELECT USING (active = true);
CREATE POLICY "public read categories"  ON gostoso_categories   FOR SELECT USING (active = true);
CREATE POLICY "public read events"      ON gostoso_events       FOR SELECT USING (active = true);
CREATE POLICY "public read fund"        ON gostoso_fund_entries FOR SELECT USING (true);

-- Owner writes businesses (only the owner's profile)
CREATE POLICY "owner write businesses" ON gostoso_businesses FOR ALL
  USING (profile_id IN (
    SELECT id FROM gostoso_profiles WHERE auth_user_id = auth.uid()
  ));

-- Prestador: read/write own profile
CREATE POLICY "own profile" ON gostoso_profiles FOR ALL
  USING (auth_user_id = auth.uid());

-- Admin-only writes for fund entries and events
CREATE POLICY "admin write fund" ON gostoso_fund_entries FOR ALL
  USING (
    (SELECT role FROM gostoso_profiles WHERE auth_user_id = auth.uid()) = 'admin'
  );

CREATE POLICY "admin write events" ON gostoso_events FOR ALL
  USING (
    (SELECT role FROM gostoso_profiles WHERE auth_user_id = auth.uid()) = 'admin'
  );

-- Storage bucket for business photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('gostoso', 'gostoso', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "public read gostoso storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gostoso');

CREATE POLICY "auth upload gostoso storage"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gostoso' AND auth.uid() IS NOT NULL);
