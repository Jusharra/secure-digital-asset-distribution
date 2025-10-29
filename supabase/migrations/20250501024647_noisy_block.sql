/*
  # Add Admin RLS Policies

  1. Changes
    - Create utility function for admin check
    - Add admin RLS policies to all tables
    - Ensure admins have full access to all operations

  2. Security
    - Enable RLS on all tables
    - Grant full access to admin role
    - Maintain existing policies while adding admin override
*/

-- Create utility function for admin check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE;

-- Apply RLS policies for each table
-- ---------------------------------------

-- 1. digital_assets
CREATE POLICY admin_full_access_digital_assets
ON digital_assets
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 2. encryption_keys
CREATE POLICY admin_full_access_encryption_keys
ON encryption_keys
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 3. purchased_keys
CREATE POLICY admin_full_access_purchased_keys
ON purchased_keys
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 4. id_bank
CREATE POLICY admin_full_access_id_bank
ON id_bank
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 5. prepaid_cards
CREATE POLICY admin_full_access_prepaid_cards
ON prepaid_cards
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 6. asset_access_logs
CREATE POLICY admin_full_access_asset_logs
ON asset_access_logs
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 7. withdrawal_requests
CREATE POLICY admin_full_access_withdrawals
ON withdrawal_requests
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 8. courier_assignments
CREATE POLICY admin_full_access_couriers
ON courier_assignments
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 9. delivery_queue
CREATE POLICY admin_full_access_deliveries
ON delivery_queue
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 10. referrals
CREATE POLICY admin_full_access_referrals
ON referrals
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 11. user_profiles
CREATE POLICY admin_full_access_profiles
ON user_profiles
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());