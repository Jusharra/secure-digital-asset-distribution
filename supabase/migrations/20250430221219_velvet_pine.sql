/*
  # Create referrals table for tracking user referrals

  1. New Tables
    - `referrals`
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, references users.id)
      - `referred_user_id` (uuid, references users.id)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `referrals` table
    - Add policies for:
      - Users can read their own referrals
      - Users can create referrals when they are the referrer
      - Admins have full access
*/

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own referrals
CREATE POLICY "Users can read their own referrals"
  ON referrals
  FOR SELECT
  TO public
  USING (auth.uid() = referrer_id);

-- Allow users to create referrals when they are the referrer
CREATE POLICY "Users can create their own referrals"
  ON referrals
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = referrer_id);

-- Allow admins full access
CREATE POLICY "Admins have full access to referrals"
  ON referrals
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add trigger for updating the updated_at timestamp
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();