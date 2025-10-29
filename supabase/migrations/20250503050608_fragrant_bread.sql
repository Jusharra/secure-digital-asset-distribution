/*
  # Add category column to digital_assets table

  1. Changes
    - Add category column to digital_assets table
    - Add check constraint for valid categories
    - Set default value to null

  2. Notes
    - Categories include: fiction, non-fiction, educational, technical, podcast, music, meditation, soundeffects
    - Column is nullable since not all assets require a category
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'digital_assets' AND column_name = 'category'
  ) THEN
    ALTER TABLE digital_assets 
    ADD COLUMN category text,
    ADD CONSTRAINT digital_assets_category_check 
    CHECK (category = ANY (ARRAY[
      'fiction',
      'non-fiction', 
      'educational',
      'technical',
      'podcast',
      'music',
      'meditation',
      'soundeffects'
    ]::text[]));
  END IF;
END $$;