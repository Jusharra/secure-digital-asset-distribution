/*
  # Add Card Redemption Support

  1. Schema Changes
    - Add display_id and public_key columns to prepaid_cards
    - Add unique constraints for both columns
    - Add validation functions and triggers
    - Update RLS policies for card redemption

  2. Security
    - Add validation for display_id format (PREFIX-XXXXXX)
    - Add validation for public_key format (PUB-UUID)
    - Update RLS policies for card redemption flow
*/

-- Add new columns to prepaid_cards
ALTER TABLE prepaid_cards
ADD COLUMN display_id text,
ADD COLUMN public_key text;

-- Add unique constraints
ALTER TABLE prepaid_cards
ADD CONSTRAINT prepaid_cards_display_id_key UNIQUE (display_id),
ADD CONSTRAINT prepaid_cards_public_key_key UNIQUE (public_key);

-- Create function to validate display_id format
CREATE OR REPLACE FUNCTION validate_display_id()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.display_id IS NOT NULL AND NEW.display_id !~ '^[A-Z]+-\d{6}$' THEN
      RAISE EXCEPTION 'Invalid display_id format. Must be PREFIX-XXXXXX where X is a digit';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate public_key format
CREATE OR REPLACE FUNCTION validate_public_key()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.public_key IS NOT NULL AND NEW.public_key !~ '^PUB-[a-f0-9-]{36}$' THEN
      RAISE EXCEPTION 'Invalid public_key format. Must start with PUB- followed by UUID';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for validation
CREATE TRIGGER validate_display_id_trigger
  BEFORE INSERT OR UPDATE ON prepaid_cards
  FOR EACH ROW
  EXECUTE FUNCTION validate_display_id();

CREATE TRIGGER validate_public_key_trigger
  BEFORE INSERT OR UPDATE ON prepaid_cards
  FOR EACH ROW
  EXECUTE FUNCTION validate_public_key();

-- Update RLS policies for prepaid_cards
DROP POLICY IF EXISTS "Users can redeem unredeemed cards" ON prepaid_cards;
CREATE POLICY "Users can redeem unredeemed cards"
  ON prepaid_cards
  FOR UPDATE
  TO authenticated
  USING (NOT redeemed)
  WITH CHECK (redeemed = true AND redeemed_by = auth.uid());

-- Add policy for viewing redeemed cards
DROP POLICY IF EXISTS "Users can view their redeemed cards" ON prepaid_cards;
CREATE POLICY "Users can view their redeemed cards"
  ON prepaid_cards
  FOR SELECT
  TO authenticated
  USING (redeemed_by = auth.uid());