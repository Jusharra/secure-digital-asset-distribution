/*
  # Add downloads_remaining column to encryption_keys table

  1. Changes
    - Add downloads_remaining column to encryption_keys table with default value of 5
    - Add check constraint to ensure downloads_remaining is between 0 and 5
    - Update existing rows to have 5 downloads remaining

  2. Notes
    - Default value of 5 matches the business logic requirement
    - Check constraint prevents invalid values
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'encryption_keys' 
    AND column_name = 'downloads_remaining'
  ) THEN
    ALTER TABLE encryption_keys 
    ADD COLUMN downloads_remaining integer DEFAULT 5 NOT NULL;

    ALTER TABLE encryption_keys
    ADD CONSTRAINT encryption_keys_downloads_remaining_check 
    CHECK (downloads_remaining >= 0 AND downloads_remaining <= 5);

    -- Update existing rows
    UPDATE encryption_keys 
    SET downloads_remaining = 5 
    WHERE downloads_remaining IS NULL;
  END IF;
END $$;