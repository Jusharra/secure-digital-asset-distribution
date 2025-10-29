/*
  # Prepaid Card System Setup

  1. New Tables
    - `id_bank`: Stores pre-generated claimable codes
      - `code` (text, primary key)
      - `claimed` (boolean)
      - `created_at` (timestamp)
    
    - `prepaid_cards`: Links retailers, assets, and codes
      - `id` (uuid, primary key)
      - `retailer_id` (uuid, references users)
      - `asset_id` (uuid, references digital_assets)
      - `serial_code` (text, references id_bank)
      - `redeemed` (boolean)
      - `redeemed_by` (uuid, references users)
      - `redeemed_at` (timestamp)
    
    - `asset_access_logs`: Tracks asset access
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `asset_id` (uuid, references digital_assets)
      - `method` (text, check constraint)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin, retailer, and consumer access
*/

-- 1. ID BANK (pre-generated claimable codes)
CREATE TABLE IF NOT EXISTS public.id_bank (
  code text PRIMARY KEY,
  claimed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.id_bank ENABLE ROW LEVEL SECURITY;

-- Admin can manage ID codes
CREATE POLICY "Admins can manage id_bank"
  ON public.id_bank
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. PREPAID CARDS
CREATE TABLE IF NOT EXISTS public.prepaid_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES public.digital_assets(id) ON DELETE CASCADE,
  serial_code text REFERENCES public.id_bank(code),
  redeemed boolean DEFAULT false,
  redeemed_by uuid REFERENCES public.users(id),
  redeemed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.prepaid_cards ENABLE ROW LEVEL SECURITY;

-- Retailers can view their own cards
CREATE POLICY "Retailers can view their own cards"
  ON public.prepaid_cards
  FOR SELECT
  TO public
  USING (retailer_id = auth.uid());

-- Consumers can redeem if not already claimed
CREATE POLICY "Consumers can redeem prepaid cards"
  ON public.prepaid_cards
  FOR UPDATE
  TO public
  USING (
    NOT redeemed AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'consumer'
    )
  );

-- 3. ASSET ACCESS LOGS
CREATE TABLE IF NOT EXISTS public.asset_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  asset_id uuid REFERENCES public.digital_assets(id),
  method text CHECK (method IN ('card', 'purchase', 'manual')),
  timestamp timestamp with time zone DEFAULT now()
);

ALTER TABLE public.asset_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own access logs
CREATE POLICY "Users can view their own access logs"
  ON public.asset_access_logs
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

-- Admins can view all access logs
CREATE POLICY "Admins can view all access logs"
  ON public.asset_access_logs
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );