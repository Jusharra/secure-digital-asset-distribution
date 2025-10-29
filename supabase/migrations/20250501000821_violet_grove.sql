/*
  # Add cover image URL column to digital assets

  1. Changes
    - Add `cover_image_url` column to `digital_assets` table
      - Type: text
      - Nullable: true (some assets might not have a cover image)

  2. Notes
    - This change is backward compatible as the new column is nullable
    - No data migration needed as this is a new column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'digital_assets' 
    AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE digital_assets 
    ADD COLUMN cover_image_url text;
  END IF;
END $$;