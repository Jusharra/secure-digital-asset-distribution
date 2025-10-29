/*
  # Channel Formats Schema

  1. New Tables
    - `channel_formats`
      - `id` (uuid, primary key)
      - `channel_id` (uuid, references distribution_channels)
      - `asset_type` (text)
      - `format` (text)
      - `requirements` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admins to manage formats
    - Add policies for creators to view formats
*/

-- Create channel_formats table
CREATE TABLE IF NOT EXISTS channel_formats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES distribution_channels(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  format text NOT NULL,
  requirements jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT channel_formats_asset_type_check CHECK (
    asset_type = ANY (ARRAY['ebook', 'audio', 'video', 'software', 'service'])
  )
);

-- Enable RLS
ALTER TABLE channel_formats ENABLE ROW LEVEL SECURITY;

-- Policies for channel_formats
CREATE POLICY "Admins can manage all formats"
  ON channel_formats
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Anyone can view formats"
  ON channel_formats
  FOR SELECT
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_channel_formats_updated_at
  BEFORE UPDATE ON channel_formats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default formats
INSERT INTO channel_formats (channel_id, asset_type, format, requirements) VALUES
  -- Ebook formats
  (NULL, 'ebook', 'epub', '{"version": "3.0", "drm": true}'),
  (NULL, 'ebook', 'pdf', '{"version": "1.7", "drm": true}'),
  -- Audio formats  
  (NULL, 'audio', 'mp3', '{"bitrate": "320kbps", "sample_rate": "44.1kHz"}'),
  (NULL, 'audio', 'wav', '{"bitrate": "1411kbps", "sample_rate": "44.1kHz"}'),
  -- Video formats
  (NULL, 'video', 'mp4', '{"codec": "h264", "resolution": "1080p"}'),
  (NULL, 'video', 'mov', '{"codec": "prores", "resolution": "4K"}'),
  -- Software formats
  (NULL, 'software', 'zip', '{"compression": "standard"}'),
  (NULL, 'software', 'dmg', '{"platform": "macos"}'),
  (NULL, 'software', 'exe', '{"platform": "windows"}');