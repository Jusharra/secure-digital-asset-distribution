/*
  # Update prepaid_cards table schema
  
  1. Changes
    - Remove retailer_id column
    - Add creator_id column
    - Update policies for creator-based access
  
  2. Security
    - Drop existing retailer policies
    - Create new creator-focused policies
    - Update id_bank table policies
*/

-- First drop the dependent policies
DROP POLICY IF EXISTS "Retailers can view their own cards" ON prepaid_cards;
DROP POLICY IF EXISTS "retailer_read_linked_codes" ON id_bank;

-- Drop all existing policies on prepaid_cards to avoid conflicts
DROP POLICY IF EXISTS "Users can redeem unredeemed cards" ON prepaid_cards;
DROP POLICY IF EXISTS "Users can view their redeemed cards" ON prepaid_cards;
DROP POLICY IF EXISTS "Anyone can view unredeemed cards" ON prepaid_cards;
DROP POLICY IF EXISTS "Users can redeem available cards" ON prepaid_cards;
DROP POLICY IF EXISTS "Creators can manage their own cards" ON prepaid_cards;

-- Now we can safely remove the foreign key and column
ALTER TABLE prepaid_cards DROP CONSTRAINT IF EXISTS prepaid_cards_retailer_id_fkey;
ALTER TABLE prepaid_cards DROP COLUMN IF EXISTS retailer_id;

-- Add creator_id column
ALTER TABLE prepaid_cards ADD COLUMN creator_id uuid REFERENCES users(id) ON DELETE CASCADE;

-- Create new policies
CREATE POLICY "Creators can manage their own cards"
  ON prepaid_cards
  FOR ALL
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Anyone can view unredeemed cards"
  ON prepaid_cards
  FOR SELECT
  TO authenticated
  USING (NOT redeemed);

CREATE POLICY "Users can view their redeemed cards"
  ON prepaid_cards
  FOR SELECT
  TO authenticated
  USING (redeemed_by = auth.uid());

CREATE POLICY "Users can redeem available cards"
  ON prepaid_cards
  FOR UPDATE
  TO authenticated
  USING (NOT redeemed)
  WITH CHECK (
    redeemed = true 
    AND redeemed_by = auth.uid()
    AND redeemed_at = now()
  );

-- Create new policy for id_bank table
CREATE POLICY "creator_read_linked_codes"
  ON id_bank
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM prepaid_cards 
      WHERE prepaid_cards.serial_code = id_bank.code 
      AND prepaid_cards.creator_id = auth.uid()
    )
  );