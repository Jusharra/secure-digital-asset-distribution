/*
  # Update ID Bank Code Generation

  1. Changes
    - Adds function to generate readable 8-character IDs
    - Adds trigger to automatically generate unique IDs
    - Uses only unambiguous characters (no I, O, 0, 1)
    
  2. Technical Details
    - Creates generate_readable_id() function
    - Creates set_id_bank_code() trigger function
    - Adds trigger to id_bank table
*/

-- Create function to generate readable IDs
CREATE OR REPLACE FUNCTION generate_readable_id() 
RETURNS text AS $$
DECLARE
  chars text[] := ARRAY['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','2','3','4','5','6','7','8','9'];
  result text := '';
  i integer := 0;
BEGIN
  -- Generate 8 character ID
  WHILE i < 8 LOOP
    result := result || chars[1 + floor(random() * array_length(chars, 1))::integer];
    i := i + 1;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle the trigger
CREATE OR REPLACE FUNCTION set_id_bank_code()
RETURNS trigger AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate new code
    new_code := generate_readable_id();
    
    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM id_bank WHERE code = new_code
    ) INTO code_exists;
    
    -- Exit loop if unique code found
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  -- Set the new code
  NEW.code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_id_bank_code ON id_bank;

-- Create trigger to set code before insert
CREATE TRIGGER set_id_bank_code
  BEFORE INSERT ON id_bank
  FOR EACH ROW
  EXECUTE FUNCTION set_id_bank_code();