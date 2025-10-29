/*
  # Prepaid Card System Setup

  1. New Tables
    - `id_bank`: Stores unique codes for prepaid cards
    - `prepaid_cards`: Links codes to assets and tracks redemption
    - `asset_access_logs`: Tracks asset access methods and usage

  2. Security
    - Enable RLS on all tables
    - Add policies for admin, retailer, and consumer access
    - Ensure proper access control for card redemption

  3. Changes
    - Add foreign key constraints for data integrity
    - Set up default values for timestamps and flags
    - Configure cascading deletes where appropriate
*/

-- Create ID Bank table
CREATE TABLE IF NOT EXISTS public.id_bank (
  code text PRIMARY KEY,
  claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.id_bank ENABLE ROW LEVEL SECURITY;

-- Create Prepaid Cards table
CREATE TABLE IF NOT EXISTS public.prepaid_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES public.digital_assets(id) ON DELETE CASCADE,
  serial_code text REFERENCES public.id_bank(code),
  redeemed boolean DEFAULT false,
  redeemed_by uuid REFERENCES public.users(id),
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.prepaid_cards ENABLE ROW LEVEL SECURITY;

-- Create Asset Access Logs table
CREATE TABLE IF NOT EXISTS public.asset_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  asset_id uuid REFERENCES public.digital_assets(id),
  method text CHECK (method IN ('card', 'purchase', 'manual')),
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE public.asset_access_logs ENABLE ROW LEVEL SECURITY;

-- ID Bank Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'id_bank' 
    AND policyname = 'Admins can manage id_bank'
  ) THEN
    CREATE POLICY "Admins can manage id_bank"
      ON public.id_bank
      FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
      ));
  END IF;
END
$$;

-- Prepaid Cards Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'prepaid_cards' 
    AND policyname = 'Retailers can view their own cards'
  ) THEN
    CREATE POLICY "Retailers can view their own cards"
      ON public.prepaid_cards
      FOR SELECT
      USING (retailer_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'prepaid_cards' 
    AND policyname = 'Consumers can redeem prepaid cards'
  ) THEN
    CREATE POLICY "Consumers can redeem prepaid cards"
      ON public.prepaid_cards
      FOR UPDATE
      USING (
        NOT redeemed AND
        EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid()
          AND users.role = 'consumer'
        )
      );
  END IF;
END
$$;

-- Asset Access Logs Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'asset_access_logs' 
    AND policyname = 'Users can view their own access logs'
  ) THEN
    CREATE POLICY "Users can view their own access logs"
      ON public.asset_access_logs
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'asset_access_logs' 
    AND policyname = 'Admins can view all access logs'
  ) THEN
    CREATE POLICY "Admins can view all access logs"
      ON public.asset_access_logs
      FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
      ));
  END IF;
END
$$;