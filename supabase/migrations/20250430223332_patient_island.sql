/*
  # Demo Data Setup

  1. Changes
    - Create demo user profile
    - Add sample digital assets
    - Generate prepaid cards
    - Create access logs
    - Add referral data

  2. Security
    - Maintain RLS policies
    - Ensure data consistency
*/

-- Create a function to get or create a demo user ID
CREATE OR REPLACE FUNCTION get_demo_user_id() 
RETURNS uuid AS $$
DECLARE
  demo_user_id uuid;
BEGIN
  -- Get first consumer user or create a placeholder ID
  SELECT id INTO demo_user_id
  FROM public.users
  WHERE role = 'consumer'
  LIMIT 1;

  IF demo_user_id IS NULL THEN
    demo_user_id := '00000000-0000-0000-0000-000000000000'::uuid;
  END IF;

  RETURN demo_user_id;
END;
$$ LANGUAGE plpgsql;

-- Clean up existing demo data
DO $$ 
DECLARE
  demo_user_id uuid;
BEGIN
  demo_user_id := get_demo_user_id();

  DELETE FROM public.user_profiles WHERE id = demo_user_id;
  DELETE FROM public.digital_assets WHERE creator_id = demo_user_id;
  DELETE FROM public.prepaid_cards WHERE redeemed_by = demo_user_id;
  DELETE FROM public.asset_access_logs WHERE user_id = demo_user_id;
  DELETE FROM public.referrals WHERE referrer_id = demo_user_id;
END $$;

-- Create user profile
DO $$ 
DECLARE
  demo_user_id uuid;
BEGIN
  demo_user_id := get_demo_user_id();

  INSERT INTO public.user_profiles (
    id,
    full_name,
    phone,
    avatar_url,
    notification_preferences,
    privacy_settings
  ) VALUES (
    demo_user_id,
    'Demo User',
    '+1234567890',
    'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
    jsonb_build_object(
      'email_notifications', true,
      'push_notifications', true,
      'marketing_emails', false,
      'security_alerts', true
    ),
    jsonb_build_object(
      'profile_visibility', 'public',
      'show_activity', true,
      'allow_messages', true,
      'show_email', false
    )
  );

  -- Create demo digital assets
  INSERT INTO public.digital_assets (id, title, description, type, creator_id, metadata)
  VALUES
    (
      'da1e0f9d-6390-4a9c-8267-21c7656e68a1',
      'Digital Photography Masterclass',
      'Learn professional photography techniques from industry experts',
      'video',
      demo_user_id,
      jsonb_build_object(
        'sourceSize', 2048576000,
        'masterSize', 4097152000,
        'duration', '2h 30m',
        'quality', '4K'
      )
    ),
    (
      'f721a9d6-5e5b-4f8e-a5cb-dd5d9427c4c8',
      'Web Development Guide 2025',
      'Complete guide to modern web development practices',
      'ebook',
      demo_user_id,
      jsonb_build_object(
        'sourceSize', 15728640,
        'masterSize', 20971520,
        'pages', 450,
        'format', 'PDF'
      )
    ),
    (
      '8b9e6f2c-d4a3-4b9d-9c5e-7f8d9e0a1b2c',
      'AI and Machine Learning Fundamentals',
      'Comprehensive introduction to AI and ML concepts',
      'ebook',
      demo_user_id,
      jsonb_build_object(
        'sourceSize', 12582912,
        'masterSize', 16777216,
        'pages', 380,
        'format', 'PDF'
      )
    );

  -- Create prepaid card codes
  INSERT INTO public.id_bank (code)
  VALUES 
    ('MASTERCLASS2025'),
    ('WEBDEV2025'),
    ('AIML2025');

  -- Link prepaid cards to assets
  INSERT INTO public.prepaid_cards (
    id,
    asset_id,
    serial_code,
    retailer_id,
    redeemed,
    redeemed_by,
    redeemed_at
  )
  SELECT
    gen_random_uuid(),
    id,
    code,
    demo_user_id,
    true,
    demo_user_id,
    now() - (interval '1 day' * generate_series(1, 3))
  FROM (
    SELECT 
      da.id,
      ib.code,
      ROW_NUMBER() OVER () as rn
    FROM public.digital_assets da
    CROSS JOIN public.id_bank ib
    WHERE da.creator_id = demo_user_id
    LIMIT 3
  ) subq;

  -- Create access logs
  INSERT INTO public.asset_access_logs (
    id,
    user_id,
    asset_id,
    method,
    timestamp
  )
  SELECT
    gen_random_uuid(),
    demo_user_id,
    asset_id,
    'card',
    redeemed_at
  FROM public.prepaid_cards
  WHERE redeemed_by = demo_user_id;

  -- Create referrals
  INSERT INTO public.referrals (
    id,
    referrer_id,
    referred_user_id,
    created_at
  )
  SELECT
    gen_random_uuid(),
    demo_user_id,
    demo_user_id,
    now() - (interval '1 day' * generate_series(1, 3))
  FROM generate_series(1, 3);
END $$;