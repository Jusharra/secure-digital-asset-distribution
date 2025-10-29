/*
  # Add demo data for current user

  1. Changes
    - Add demo assets for the current user
    - Create prepaid cards linked to those assets
    - Add access logs for redeemed cards
    - No new users are created, only data for existing user
*/

-- Create some demo digital assets
INSERT INTO public.digital_assets (id, title, type, creator_id, metadata)
VALUES
  (gen_random_uuid(), 'Sample E-Book', 'ebook', auth.uid(), '{"sourceSize": 1024000, "masterSize": 2048000}'::jsonb),
  (gen_random_uuid(), 'Sample Music Track', 'music', auth.uid(), '{"sourceSize": 3072000, "masterSize": 4096000}'::jsonb),
  (gen_random_uuid(), 'Sample Software', 'software', auth.uid(), '{"sourceSize": 5120000, "masterSize": 6144000}'::jsonb);

-- Create prepaid cards
INSERT INTO public.id_bank (code)
VALUES ('DEMO123'), ('DEMO456'), ('DEMO789');

-- Link prepaid cards to assets
WITH assets AS (
  SELECT id FROM public.digital_assets 
  WHERE creator_id = auth.uid() 
  ORDER BY created_at DESC 
  LIMIT 3
)
INSERT INTO public.prepaid_cards (asset_id, serial_code, redeemed, redeemed_by, redeemed_at)
SELECT 
  id,
  code,
  true,
  auth.uid(),
  now() - (INTERVAL '1 day' * generate_series(1, 3))
FROM (
  SELECT id, code
  FROM assets
  CROSS JOIN (VALUES ('DEMO123'), ('DEMO456'), ('DEMO789')) AS codes(code)
  LIMIT 3
) AS asset_codes;

-- Create asset access logs
WITH redeemed_cards AS (
  SELECT asset_id, redeemed_at
  FROM public.prepaid_cards
  WHERE redeemed_by = auth.uid()
)
INSERT INTO public.asset_access_logs (user_id, asset_id, method, timestamp)
SELECT 
  auth.uid(),
  asset_id,
  'card',
  redeemed_at
FROM redeemed_cards;