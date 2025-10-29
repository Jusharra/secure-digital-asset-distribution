/*
  # Update purchased_keys table structure

  1. Changes
    - Drop existing purchased_keys table
    - Create new purchased_keys table with updated schema
    - Add appropriate constraints and indexes
    - Enable RLS
    - Add RLS policies

  2. Security
    - Enable RLS
    - Add policies for admin and creator access
*/

-- Drop existing table
DROP TABLE IF EXISTS purchased_keys;

-- Create new table with updated structure
CREATE TABLE purchased_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_key text NOT NULL,
  private_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'used', 'sold')),
  price decimal(10,2) NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  sold_to uuid REFERENCES users(id),
  linked_asset_id uuid REFERENCES digital_assets(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE purchased_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage all keys"
  ON purchased_keys
  TO public
  USING (is_admin());

CREATE POLICY "Creators can view their purchased keys"
  ON purchased_keys
  FOR SELECT
  TO public
  USING (auth.uid() = sold_to);

-- Add updated_at trigger
CREATE TRIGGER update_purchased_keys_updated_at
  BEFORE UPDATE ON purchased_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();