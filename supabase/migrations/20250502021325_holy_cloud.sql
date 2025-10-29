/*
  # Add price column to encryption_keys table

  1. Changes
    - Add price column to encryption_keys table with default value of 0
    - Add claimed column if it doesn't exist yet for tracking key status

  2. Purpose
    - Enable tracking of key prices for sales and reporting
    - Ensure keys can be marked as claimed/unclaimed
*/

DO $$ 
BEGIN
  -- Add price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'encryption_keys' AND column_name = 'price'
  ) THEN
    ALTER TABLE encryption_keys 
    ADD COLUMN price numeric(10,2) DEFAULT 0;
  END IF;

  -- Add claimed column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'encryption_keys' AND column_name = 'claimed'
  ) THEN
    ALTER TABLE encryption_keys 
    ADD COLUMN claimed boolean DEFAULT false;
  END IF;
END $$;