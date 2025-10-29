/*
  # Distribution Channels Schema

  1. New Tables
    - `distribution_channels`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text)
      - `config` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `asset_channel_assignments`
      - `id` (uuid, primary key) 
      - `asset_id` (uuid, references digital_assets)
      - `channel_id` (uuid, references distribution_channels)
      - `status` (text)
      - `price` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for creators to manage their own assignments
    - Add policies for admins to manage all channels
*/

-- Create distribution_channels table
CREATE TABLE IF NOT EXISTS distribution_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT distribution_channels_type_check CHECK (
    type = ANY (ARRAY['retail', 'online', 'affiliate', 'marketplace'])
  )
);

-- Create asset_channel_assignments table
CREATE TABLE IF NOT EXISTS asset_channel_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES digital_assets(id) ON DELETE CASCADE,
  channel_id uuid REFERENCES distribution_channels(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT asset_channel_assignments_status_check CHECK (
    status = ANY (ARRAY['pending', 'active', 'paused', 'completed'])
  ),
  CONSTRAINT asset_channel_assignments_price_check CHECK (price >= 0)
);

-- Enable RLS
ALTER TABLE distribution_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_channel_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for distribution_channels
CREATE POLICY "Admins can manage all channels"
  ON distribution_channels
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Anyone can view active channels"
  ON distribution_channels
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for asset_channel_assignments
CREATE POLICY "Creators can manage their assignments"
  ON asset_channel_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM digital_assets
      WHERE digital_assets.id = asset_channel_assignments.asset_id
      AND digital_assets.creator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all assignments"
  ON asset_channel_assignments
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Add updated_at triggers
CREATE TRIGGER update_distribution_channels_updated_at
  BEFORE UPDATE ON distribution_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_channel_assignments_updated_at
  BEFORE UPDATE ON asset_channel_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();