/*
  # Retailer Profile and Performance Schema

  1. New Tables
    - `retailer_profiles`
      - Stores additional retailer-specific information
      - Links to users table
      - Tracks business details, payment info, and preferences
    
    - `retailer_stats` 
      - Tracks performance metrics
      - Daily/monthly sales and redemption stats
      - Revenue and commission tracking

    - `retailer_regions`
      - Geographic regions where retailers operate
      - Used for distribution bid matching

  2. Security
    - Enable RLS on all tables
    - Policies for retailer access to own data
    - Admin access policies
    - Creator access for bid-related data

  3. Changes
    - Add retailer-specific columns to existing tables
    - Add foreign key relationships
*/

-- Create retailer_profiles table
CREATE TABLE IF NOT EXISTS retailer_profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name text,
  business_type text CHECK (business_type = ANY (ARRAY['store', 'online', 'event', 'hybrid'])),
  tax_id text,
  website text,
  phone text,
  address jsonb,
  payment_details jsonb DEFAULT jsonb_build_object(
    'type', NULL,
    'account_holder', NULL,
    'account_number', NULL,
    'routing_number', NULL,
    'bank_name', NULL,
    'paypal_email', NULL,
    'preferred_currency', 'USD'
  ),
  preferences jsonb DEFAULT jsonb_build_object(
    'auto_accept_bids', false,
    'minimum_profit_share', 10,
    'notification_preferences', jsonb_build_object(
      'email_notifications', true,
      'new_bid_alerts', true,
      'sales_reports', true
    )
  ),
  verification_status text DEFAULT 'pending' CHECK (verification_status = ANY (ARRAY['pending', 'verified', 'rejected'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create retailer_stats table
CREATE TABLE IF NOT EXISTS retailer_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  cards_activated integer DEFAULT 0,
  cards_redeemed integer DEFAULT 0,
  total_revenue numeric(10,2) DEFAULT 0,
  commission_earned numeric(10,2) DEFAULT 0,
  unique_assets integer DEFAULT 0,
  active_bids integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (retailer_id, date)
);

-- Create retailer_regions table
CREATE TABLE IF NOT EXISTS retailer_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  region text NOT NULL,
  is_primary boolean DEFAULT false,
  radius_km integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (retailer_id, region)
);

-- Enable RLS
ALTER TABLE retailer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_regions ENABLE ROW LEVEL SECURITY;

-- Retailer profile policies
CREATE POLICY "Retailers can view own profile"
  ON retailer_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Retailers can update own profile"
  ON retailer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Retailer stats policies
CREATE POLICY "Retailers can view own stats"
  ON retailer_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = retailer_id);

-- Retailer regions policies
CREATE POLICY "Retailers can manage own regions"
  ON retailer_regions
  FOR ALL
  TO authenticated
  USING (auth.uid() = retailer_id)
  WITH CHECK (auth.uid() = retailer_id);

-- Admin policies
CREATE POLICY "Admins have full access to retailer profiles"
  ON retailer_profiles
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

CREATE POLICY "Admins have full access to retailer stats"
  ON retailer_stats
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

CREATE POLICY "Admins have full access to retailer regions"
  ON retailer_regions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Creator access policies
CREATE POLICY "Creators can view retailer regions for bid matching"
  ON retailer_regions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'creator'
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_retailer_profiles_updated_at
  BEFORE UPDATE ON retailer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retailer_stats_updated_at
  BEFORE UPDATE ON retailer_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retailer_regions_updated_at
  BEFORE UPDATE ON retailer_regions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();