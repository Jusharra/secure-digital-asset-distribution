/*
  # Update id_bank RLS policies
  
  1. Changes
    - Remove existing policies that may conflict
    - Add clear admin full access policy
    - Add retailer read-only policy for linked codes
    - Add policy for inserting new codes
  
  2. Security
    - Admins have full access
    - Retailers can only read codes linked to their prepaid cards
    - Only admins can insert new codes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_full_access_id_bank" ON public.id_bank;
DROP POLICY IF EXISTS "retailer_read_linked_codes" ON public.id_bank;

-- Create admin full access policy
CREATE POLICY "admin_full_access_id_bank" ON public.id_bank
  AS PERMISSIVE FOR ALL
  TO public
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create retailer read-only policy for linked codes
CREATE POLICY "retailer_read_linked_codes" ON public.id_bank
  AS PERMISSIVE FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM prepaid_cards
      WHERE prepaid_cards.display_id = id_bank.code
      AND prepaid_cards.retailer_id = auth.uid()
    )
  );

-- Create policy for inserting new codes (admin only)
CREATE POLICY "admin_insert_id_bank" ON public.id_bank
  AS PERMISSIVE FOR INSERT
  TO public
  WITH CHECK (is_admin());