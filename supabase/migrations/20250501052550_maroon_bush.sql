/*
  # Update encryption_keys table

  1. Changes
    - Add assigned_to column (uuid, nullable) to track key assignments
    - Add used column (boolean) with default false to track key usage status
    - Add foreign key constraint for assigned_to referencing users.id
    - Update RLS policies to reflect new columns

  2. Security
    - Maintain existing RLS policies
    - Add policy for assigned users to view their keys
*/

-- Add new columns
ALTER TABLE encryption_keys
ADD COLUMN assigned_to uuid REFERENCES users(id),
ADD COLUMN used boolean DEFAULT false;

-- Update policies to account for new columns
CREATE POLICY "Users can view their assigned keys"
ON encryption_keys
FOR SELECT
TO public
USING (assigned_to = auth.uid());

-- Update existing admin policy to include new columns
DROP POLICY IF EXISTS "admin_full_access_encryption_keys" ON encryption_keys;
CREATE POLICY "admin_full_access_encryption_keys"
ON encryption_keys
TO public
USING (is_admin())
WITH CHECK (is_admin());

COMMENT ON COLUMN encryption_keys.assigned_to IS 'User ID of the assigned key holder';
COMMENT ON COLUMN encryption_keys.used IS 'Indicates if the key has been used';