/*
  # Update Digital Assets Schema for Services

  1. Changes
    - Add service type to digital_assets type check
    - Add service-specific metadata fields
    - Update existing constraints

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with constraints
*/

-- Update the type check constraint for digital_assets
ALTER TABLE digital_assets DROP CONSTRAINT IF EXISTS digital_assets_type_check;
ALTER TABLE digital_assets ADD CONSTRAINT digital_assets_type_check 
  CHECK (type IN ('ebook', 'audio', 'video', 'software', 'service'));

-- Add service-specific metadata validation
CREATE OR REPLACE FUNCTION validate_asset_metadata() RETURNS trigger AS $$
BEGIN
  IF NEW.type = 'service' THEN
    IF NOT (
      NEW.metadata ? 'service_category' AND
      NEW.metadata ? 'duration' AND
      NEW.metadata ? 'location' AND
      NEW.metadata ? 'availability'
    ) THEN
      RAISE EXCEPTION 'Service assets must include category, duration, location, and availability in metadata';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for metadata validation
DROP TRIGGER IF EXISTS validate_asset_metadata_trigger ON digital_assets;
CREATE TRIGGER validate_asset_metadata_trigger
  BEFORE INSERT OR UPDATE ON digital_assets
  FOR EACH ROW
  EXECUTE FUNCTION validate_asset_metadata();