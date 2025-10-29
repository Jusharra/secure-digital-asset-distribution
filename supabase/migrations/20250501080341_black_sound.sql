/*
  # Update id_bank RLS policies

  1. Changes
    - Remove existing policies that might conflict
    - Add clear, specific policies for different roles
    - Ensure retailers can only read codes linked to their cards
    - Maintain admin full access
    
  2. Security
    - Enable RLS (already enabled)
    - Add specific policies for:
      - Admin full access
      - Retailer read-only access for linked codes
    
  Note: This maintains security while allowing retailers to view necessary codes
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage id_bank" ON id_bank;
DROP POLICY IF EXISTS "Retailers can read codes linked to their cards" ON id_bank;
DROP POLICY IF EXISTS "admin_full_access_id_bank" ON id_bank;

-- Create new policies with clear permissions
CREATE POLICY "admin_full_access_id_bank"
ON id_bank
FOR ALL 
TO public
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Allow retailers to only read codes linked to their prepaid cards
CREATE POLICY "retailer_read_linked_codes"
ON id_bank
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM prepaid_cards
    WHERE prepaid_cards.serial_code = id_bank.code
    AND prepaid_cards.retailer_id = auth.uid()
  )
);