/*
  # Add purchased keys table for pre-purchased encryption keys

  1. New Tables
    - `purchased_keys`: Stores pre-purchased encryption keys
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references users)
      - `type` (text) - asset type this key is for
      - `title` (text) - planned asset title
      - `notes` (text) - optional description
      - `public_key` (text) - generated public key
      - `status` (text) - 'available' or 'used'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for creators to manage their keys
    - Add policy for admins to view all keys
*/

-- Create purchased_keys table
CREATE TABLE IF NOT EXISTS purchased_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('ebook', 'audio', 'video', 'software', 'service')),
  title text NOT NULL,
  notes text,
  public_key text NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'used')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE purchased_keys ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER update_purchased_keys_updated_at
  BEFORE UPDATE ON purchased_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
CREATE POLICY "Creators can manage their own keys"
  ON purchased_keys
  FOR ALL
  TO public
  USING (creator_id = auth.uid());

CREATE POLICY "Admins can view all keys"
  ON purchased_keys
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add function to check key availability
CREATE OR REPLACE FUNCTION check_key_availability(
  p_creator_id uuid,
  p_type text
) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM purchased_keys
    WHERE creator_id = p_creator_id
    AND type = p_type
    AND status = 'available'
  );
END;
$$ LANGUAGE plpgsql;