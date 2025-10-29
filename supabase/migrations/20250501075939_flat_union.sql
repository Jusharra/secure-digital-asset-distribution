/*
  # Add retailer read access to id_bank

  1. Changes
    - Add RLS policy to allow retailers to read id_bank codes that are linked to their prepaid cards
    
  2. Security
    - Retailers can only read codes, not modify them
    - Access is limited to codes associated with their prepaid cards
*/

CREATE POLICY "Retailers can read codes linked to their cards"
ON public.id_bank
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM prepaid_cards 
    WHERE prepaid_cards.serial_code = id_bank.code 
    AND prepaid_cards.retailer_id = auth.uid()
  )
);