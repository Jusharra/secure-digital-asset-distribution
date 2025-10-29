/*
  # Add user creation policy

  1. Changes
    - Add new RLS policy to allow users to create their own record
    
  2. Security
    - Policy ensures users can only create their own record
    - Role is restricted to valid values via existing check constraint
    - Maintains existing policies for other operations
*/

CREATE POLICY "Enable users to create their own record"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() = id AND
    role IN ('admin', 'creator', 'retailer', 'consumer', 'courier')
  );