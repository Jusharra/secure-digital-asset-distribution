/*
  # Add price column to purchased_keys table

  1. Changes
    - Add price column to purchased_keys table with numeric(10,2) type
    - Set default value to 0
    - Allow NULL values for backward compatibility

  2. Notes
    - Using numeric(10,2) for precise decimal handling
    - Default value ensures backward compatibility
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchased_keys' 
    AND column_name = 'price'
  ) THEN
    ALTER TABLE purchased_keys 
    ADD COLUMN price numeric(10,2) DEFAULT 0;
  END IF;
END $$;