/*
  # Orders Table Policies

  1. Security
    - Enable RLS on orders table
    - Add policies for user access and admin management
    - Ensure users can only view and create their own orders
    - Allow admins full access to all orders

  2. Changes
    - Add RLS policies for orders table
    - Set up user and admin access controls
*/

-- Enable RLS if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins have full access to orders" ON orders;

-- Create policies
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