/*
  # Fix schema for user queries

  1. Changes
    - Add email column to users table if not exists
    - Update RLS policies for users table
    - Add RLS policies for encryption_keys table
*/

-- Add email column to users table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email text;
  END IF;
END $$;

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Enable admin access to all users" ON users;
CREATE POLICY "Enable admin access to all users" ON users
  TO public
  USING (is_admin());

DROP POLICY IF EXISTS "Enable users to read their own data" ON users;
CREATE POLICY "Enable users to read their own data" ON users
  TO public
  USING (auth.uid() = id);

-- Add RLS policies for encryption_keys table
DROP POLICY IF EXISTS "Enable admin access to encryption keys" ON encryption_keys;
CREATE POLICY "Enable admin access to encryption keys" ON encryption_keys
  TO public
  USING (is_admin());

DROP POLICY IF EXISTS "Users can view their assigned keys" ON encryption_keys;
CREATE POLICY "Users can view their assigned keys" ON encryption_keys
  TO public
  USING (assigned_to = auth.uid());