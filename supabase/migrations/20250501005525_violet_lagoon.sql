/*
  # Add price column to digital_assets table

  1. Changes
    - Add `price` column to `digital_assets` table with numeric type
    - Set default value to 0
    - Make column nullable to maintain compatibility with existing records

  2. Notes
    - Uses numeric type to handle currency values accurately
    - Default value ensures data consistency
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'digital_assets' 
    AND column_name = 'price'
  ) THEN
    ALTER TABLE digital_assets 
    ADD COLUMN price numeric(10,2) DEFAULT 0;
  END IF;
END $$;