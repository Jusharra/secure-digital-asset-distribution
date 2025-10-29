/*
  # Create storage bucket for generated images

  1. New Storage Bucket
    - Creates 'generated-images' bucket for storing AI-generated images
  
  2. Security
    - Enable public access for viewing images
    - Allow authenticated users to upload images
    - Restrict file types to images only
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true);

-- Create policy to allow public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generated-images');

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-images' 
  AND (storage.extension(name) = 'png' OR 
       storage.extension(name) = 'jpg' OR 
       storage.extension(name) = 'jpeg' OR 
       storage.extension(name) = 'gif' OR 
       storage.extension(name) = 'webp')
);

-- Create policy to allow users to delete their own uploads
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'generated-images' AND auth.uid() = owner);