/*
  # Add Withdrawal Requests Table

  1. New Tables
    - `withdrawal_requests`: Tracks user withdrawal requests
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `amount_requested` (numeric)
      - `status` (text) - pending, approved, rejected
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Users can view their own requests
    - Admins can manage all requests
*/

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount_requested numeric(10,2) NOT NULL CHECK (amount_requested > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Users can view and create their own requests
CREATE POLICY "Users can manage their own withdrawal requests"
  ON withdrawal_requests
  FOR ALL
  TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all requests
CREATE POLICY "Admins can manage all withdrawal requests"
  ON withdrawal_requests
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );