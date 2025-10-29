/*
  # Create storage buckets for digital assets

  1. New Storage Buckets
    - `master_files`: For storing master copies of digital assets
    - `source_files`: For storing source files of digital assets
    - `cover_images`: For storing cover images of digital assets
    - `avatars`: For storing user profile avatars

  2. Security
    - Enable public access to cover images and avatars
    - Restrict access to master and source files
*/

-- Create the required storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('master_files', 'master_files', false),
  ('source_files', 'source_files', false),
  ('cover_images', 'cover_images', true),
  ('avatars', 'avatars', true);

-- Set up security policies for master_files bucket
CREATE POLICY "Creators can upload master files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'master_files' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
    AND role IN ('admin', 'creator')
  )
);

CREATE POLICY "Users can download their purchased master files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'master_files' AND
  EXISTS (
    SELECT 1 FROM public.asset_access_logs
    WHERE user_id = auth.uid()
    AND asset_id = (
      SELECT id FROM public.digital_assets
      WHERE master_file_url = name
    )
  )
);

-- Set up security policies for source_files bucket
CREATE POLICY "Creators can upload source files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'source_files' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
    AND role IN ('admin', 'creator')
  )
);

CREATE POLICY "Creators can access their source files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'source_files' AND
  EXISTS (
    SELECT 1 FROM public.digital_assets
    WHERE creator_id = auth.uid()
    AND source_file_url = name
  )
);

-- Set up security policies for cover_images bucket
CREATE POLICY "Anyone can view cover images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'cover_images');

CREATE POLICY "Creators can upload cover images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cover_images' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
    AND role IN ('admin', 'creator')
  )
);

-- Set up security policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  name LIKE auth.uid() || '/%'
);