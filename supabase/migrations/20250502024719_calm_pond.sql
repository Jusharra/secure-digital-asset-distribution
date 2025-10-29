/*
  # Fix Stripe Orders Schema

  1. Changes
    - Add payment_intent_id column to orders table
    - Add metadata column for additional payment info
    - Update RLS policies to use auth.uid()

  2. Security
    - Enable RLS
    - Add policies for order management
*/

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE orders ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins have full access to orders" ON orders;

-- Create policies using auth.uid() instead of uid()
CREATE POLICY "Users can view own orders" 
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));