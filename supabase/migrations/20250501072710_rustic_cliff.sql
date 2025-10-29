/*
  # Distribution System Schema

  1. New Tables
    - `distribution_bids`
      - Tracks distribution requests from creators
      - Includes bid type (profit share or flat fee) and terms
      - Links to assets and creators
    
    - `distribution_assignments` 
      - Manages retailer assignments for approved bids
      - Tracks assignment status and quantities
      - Links bids to retailers

  2. Security
    - Enable RLS on both tables
    - Add policies for creators, retailers and admins
*/

-- Create distribution_bids table
CREATE TABLE IF NOT EXISTS distribution_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES users(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES digital_assets(id) ON DELETE CASCADE,
  quantity int NOT NULL CHECK (quantity > 0),
  region text NOT NULL,
  status text NOT NULL CHECK (status IN ('open', 'accepted', 'fulfilled')),
  bid_type text NOT NULL CHECK (bid_type IN ('profit_share', 'flat_fee')),
  profit_percent decimal CHECK (profit_percent IS NULL OR (profit_percent > 0 AND profit_percent <= 100)),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE distribution_bids ENABLE ROW LEVEL SECURITY;

-- Create policies for distribution_bids
CREATE POLICY "Creators can manage their own bids"
  ON distribution_bids
  FOR ALL
  TO public
  USING (creator_id = auth.uid());

CREATE POLICY "Admins can manage all bids"
  ON distribution_bids
  FOR ALL
  TO public
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

-- Create distribution_assignments table
CREATE TABLE IF NOT EXISTS distribution_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  bid_id uuid REFERENCES distribution_bids(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES digital_assets(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('pending', 'active', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE distribution_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for distribution_assignments
CREATE POLICY "Retailers can view their assignments"
  ON distribution_assignments
  FOR SELECT
  TO public
  USING (retailer_id = auth.uid());

CREATE POLICY "Admins can manage all assignments"
  ON distribution_assignments
  FOR ALL
  TO public
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

-- Create updated_at triggers
CREATE TRIGGER update_distribution_bids_updated_at
  BEFORE UPDATE ON distribution_bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distribution_assignments_updated_at
  BEFORE UPDATE ON distribution_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();