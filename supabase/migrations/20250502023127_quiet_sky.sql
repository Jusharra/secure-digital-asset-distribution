/*
  # Create orders table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `asset_id` (uuid, references digital_assets)
      - `payment_intent_id` (text, unique)
      - `payment_status` (text)
      - `amount` (numeric)
      - `currency` (text, default 'usd')
      - `redeemed_card_id` (uuid, references prepaid_cards)
      - `is_gift` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `orders` table
    - Add policies for user access and admin management
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES digital_assets(id) ON DELETE SET NULL,
  payment_intent_id text UNIQUE,
  payment_status text CHECK (payment_status IN ('succeeded', 'failed', 'pending')),
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text DEFAULT 'usd',
  redeemed_card_id uuid REFERENCES prepaid_cards(id) ON DELETE SET NULL,
  is_gift boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "Admins have full access to orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );