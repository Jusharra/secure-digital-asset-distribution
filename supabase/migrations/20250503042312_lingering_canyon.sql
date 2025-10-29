/*
  # Add display_id column to digital_assets table

  1. Changes
    - Add display_id column to digital_assets table
    - Add unique constraint on display_id
    - Add foreign key constraint to id_bank table
*/

ALTER TABLE digital_assets
ADD COLUMN display_id text REFERENCES id_bank(code);

-- Add unique constraint
ALTER TABLE digital_assets
ADD CONSTRAINT digital_assets_display_id_key UNIQUE (display_id);

-- Add comment
COMMENT ON COLUMN digital_assets.display_id IS 'Reference to id_bank code for asset identification';