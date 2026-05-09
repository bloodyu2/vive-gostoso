-- Admin write policy for gostoso_businesses
-- Allows users with role='admin' to update/manage all businesses
CREATE POLICY "admin write businesses" ON gostoso_businesses FOR ALL
  USING (
    (SELECT role FROM gostoso_profiles WHERE auth_user_id = auth.uid()) = 'admin'
  );

-- Fix: Pousada Oásis dos Ventos — is_published e slug com espaço/hífen no final
UPDATE gostoso_businesses
SET
  is_published = true,
  slug         = 'pousada-oasis-dos-ventos',
  name         = 'Pousada Oásis dos Ventos'
WHERE id = 'ecfb694c-1972-40e1-8567-cf931be19970';
