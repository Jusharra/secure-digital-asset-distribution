/*
  # Update Schema for Digital Asset Management System

  1. Updates
    - Add updated_at column to users table
    - Add policies for user access control
    - Create digital assets and encryption keys tables
    - Set up RLS policies
    - Add updated_at trigger functionality

  2. Security
    - Enable RLS on new tables
    - Add role-based access policies
    - Implement admin override policies
*/

-- 1. Update existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default now();

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can access own data" ON public.users;
    DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Add policies for users table
CREATE POLICY "Users can access own data"
  ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. DIGITAL ASSETS
CREATE TABLE IF NOT EXISTS public.digital_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  source_file_url text,
  master_file_url text,
  type text CHECK (type IN ('ebook', 'music', 'software', 'video')),
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.digital_assets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Creator can access own digital assets" ON public.digital_assets;
    DROP POLICY IF EXISTS "Admins can access all digital assets" ON public.digital_assets;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Policy: Creator can only access their own assets
CREATE POLICY "Creator can access own digital assets"
  ON public.digital_assets
  FOR ALL
  USING (auth.uid() = creator_id);

-- Policy: Admins can access all assets
CREATE POLICY "Admins can access all digital assets"
  ON public.digital_assets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. ENCRYPTION KEYS
CREATE TABLE IF NOT EXISTS public.encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES public.digital_assets (id) ON DELETE CASCADE,
  public_key text NOT NULL,
  claimed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.encryption_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Creator can access their encryption keys" ON public.encryption_keys;
    DROP POLICY IF EXISTS "Admins can access all encryption keys" ON public.encryption_keys;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Policy: Creator can only access keys for their own assets
CREATE POLICY "Creator can access their encryption keys"
  ON public.encryption_keys
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.digital_assets
      WHERE id = encryption_keys.item_id AND creator_id = auth.uid()
    )
  );

-- Policy: Admins can access all encryption keys
CREATE POLICY "Admins can access all encryption keys"
  ON public.encryption_keys
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_digital_assets_updated_at'
  ) THEN
    CREATE TRIGGER update_digital_assets_updated_at
      BEFORE UPDATE ON digital_assets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_encryption_keys_updated_at'
  ) THEN
    CREATE TRIGGER update_encryption_keys_updated_at
      BEFORE UPDATE ON encryption_keys
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;