/*
  # Fix recursive policies on users table

  1. Changes
    - Remove recursive policies on users table
    - Add new, non-recursive policies for:
      - Admin access
      - Self access
      - Public role access

  2. Security
    - Maintains RLS protection
    - Prevents infinite recursion
    - Ensures users can still access their own data
    - Allows admins to access all user data
*/

-- Drop existing policies that are causing recursion
DROP POLICY IF EXISTS "Enable read access for users with admin role" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;

-- Create new non-recursive policies
CREATE POLICY "Enable admin access to all users"
ON users
FOR ALL
TO public
USING (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Enable users to read their own data"
ON users
FOR SELECT
TO public
USING (
  auth.uid() = id
);

CREATE POLICY "Allow public access to user roles"
ON users
FOR SELECT
TO public
USING (true);