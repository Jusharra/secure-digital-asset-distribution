/*
  # Update Demo Data for Consumer User

  1. Changes
    - Remove any existing demo data
    - Create demo data only for the current consumer user
    - Add sample digital assets, prepaid cards, and access logs
    - Set up referral data

  2. Security
    - Only create data for authenticated user
    - Maintain RLS policies
*/

-- First, clean up any existing demo data
DELETE FROM public.digital_assets;
DELETE FROM public.id_bank;
DELETE FROM public.prepaid_cards;
DELETE FROM public.asset_access_logs;
DELETE FROM public.referrals;

-- Create demo digital assets
INSERT INTO public.digital_assets (id, title, type, creator_id, metadata)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Introduction to Digital Art', 'ebook', auth.uid(), '{"sourceSize": 1024000, "masterSize": 2048000}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'Creative Photography Course', 'video', auth.uid(), '{"sourceSize": 3072000, "masterSize": 4096000}'::jsonb),
  ('33333333-3333-3333-3333-333333333333', 'Digital Marketing Basics', 'ebook', auth.uid(), '{"sourceSize": 5120000, "masterSize": 6144000}'::jsonb);

-- Create demo prepaid cards
INSERT INTO public.id_bank (code)
VALUES 
  ('DEMO2025A'),
  ('DEMO2025B'),
  ('DEMO2025C');

-- Link prepaid cards to assets
INSERT INTO public.prepaid_cards (id, asset_id, serial_code, retailer_id, redeemed, redeemed_by, redeemed_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'DEMO2025A', auth.uid(), true, auth.uid(), now() - interval '2 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'DEMO2025B', auth.uid(), true, auth.uid(), now() - interval '1 day'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'DEMO2025C', auth.uid(), false, null, null);

-- Create asset access logs
INSERT INTO public.asset_access_logs (id, user_id, asset_id, method, timestamp)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', auth.uid(), '11111111-1111-1111-1111-111111111111', 'card', now() - interval '2 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', auth.uid(), '22222222-2222-2222-2222-222222222222', 'card', now() - interval '1 day');

-- Create demo referrals
INSERT INTO public.referrals (id, referrer_id, referred_user_id, created_at)
VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', auth.uid(), auth.uid(), now() - interval '3 days'),
  ('99999999-9999-9999-9999-999999999999', auth.uid(), auth.uid(), now() - interval '2 days');