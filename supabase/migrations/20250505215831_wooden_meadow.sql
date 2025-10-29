/*
  # Add flat fee support to distribution bids

  1. Changes
    - Add `flat_fee` column to `distribution_bids` table
    - Update status enum to include 'pending' state
    - Add check constraint for flat_fee amount
    - Add check constraint to ensure either profit_percent OR flat_fee is set, not both

  2. Notes
    - Flat fee must be non-negative when specified
    - Status now includes 'pending' as initial state
    - Distribution bids must specify either profit share or flat fee pricing
*/

-- Add flat_fee column
ALTER TABLE distribution_bids 
ADD COLUMN IF NOT EXISTS flat_fee numeric(10,2);

-- Add check constraint for flat_fee
ALTER TABLE distribution_bids 
ADD CONSTRAINT distribution_bids_flat_fee_check 
CHECK (flat_fee IS NULL OR flat_fee >= 0);

-- Update status enum to include 'pending'
ALTER TABLE distribution_bids 
DROP CONSTRAINT IF EXISTS distribution_bids_status_check;

ALTER TABLE distribution_bids 
ADD CONSTRAINT distribution_bids_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'open'::text, 'accepted'::text, 'fulfilled'::text]));

-- Add constraint to ensure either profit_percent OR flat_fee is set based on bid_type
ALTER TABLE distribution_bids 
ADD CONSTRAINT distribution_bids_pricing_check 
CHECK (
  (bid_type = 'profit_share' AND profit_percent IS NOT NULL AND flat_fee IS NULL) OR 
  (bid_type = 'flat_fee' AND flat_fee IS NOT NULL AND profit_percent IS NULL)
);