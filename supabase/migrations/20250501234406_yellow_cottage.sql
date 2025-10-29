/*
  # Add download tracking and limits
  
  1. Changes
    - Add download_count column to asset_access_logs
    - Create function to get remaining downloads
    - Add policy to enforce download limits
    - Add function to check download limits

  2. Security
    - Functions marked as SECURITY DEFINER to bypass RLS
    - Policy ensures users can only update their own records
    - Download limit enforced at database level
*/

-- Add download count column
ALTER TABLE asset_access_logs 
ADD COLUMN download_count INTEGER DEFAULT 0;

-- Function to get remaining downloads
CREATE OR REPLACE FUNCTION get_remaining_downloads(user_id UUID, asset_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(5 - (
    SELECT COALESCE(download_count, 0) 
    FROM asset_access_logs 
    WHERE asset_id = get_remaining_downloads.asset_id 
    AND user_id = get_remaining_downloads.user_id
  ), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy to allow users to update their own download count if within limit
CREATE POLICY "Allow users to increment download count"
ON asset_access_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND get_remaining_downloads(user_id, asset_id) > 0)
WITH CHECK (auth.uid() = user_id AND get_remaining_downloads(user_id, asset_id) > 0);

-- Function to check if download is allowed
CREATE OR REPLACE FUNCTION check_download_limit(user_id UUID, asset_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_remaining_downloads(user_id, asset_id) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;