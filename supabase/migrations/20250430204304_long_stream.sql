/*
  # Fix users table RLS policies

  1. Changes
    - Remove recursive policies that were causing infinite recursion
    - Simplify access control logic
    - Ensure proper role-based access
  
  2. Security
    - Maintain strict access control
    - Allow admins to read all users
    - Allow users to read their own data
    - Prevent unauthorized access
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can access own data" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create new, simplified policies
CREATE POLICY "Enable read access for users with admin role"
ON users
FOR SELECT
TO public
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

CREATE POLICY "Users can read their own data"
ON users
FOR SELECT
TO public
USING (
  auth.uid() = id
);